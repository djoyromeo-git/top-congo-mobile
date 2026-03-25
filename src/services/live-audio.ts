import * as Sentry from '@sentry/react-native';
import { Asset } from 'expo-asset';
import {
  createAudioPlayer,
  setAudioModeAsync,
  useAudioPlayerStatus,
  type AudioMetadata,
  type AudioPlayer,
  type AudioStatus,
} from 'expo-audio';
import * as React from 'react';

const LIVE_STREAM_URL = process.env.EXPO_PUBLIC_LIVE_STREAM_URL?.trim() ?? '';
const LIVE_DEFAULT_ARTWORK_URL = Asset.fromModule(
  require('../../assets/images/icon.png')
).uri;
const LIVE_PROGRAM_TITLE = process.env.EXPO_PUBLIC_LIVE_PROGRAM_TITLE?.trim() || 'Top Congo Live';
const LIVE_PROGRAM_HOST = process.env.EXPO_PUBLIC_LIVE_PROGRAM_HOST?.trim() || '';
const LIVE_PROGRAM_SCHEDULE = process.env.EXPO_PUBLIC_LIVE_PROGRAM_SCHEDULE?.trim() || '';
const LIVE_NOW_PLAYING_URL = process.env.EXPO_PUBLIC_LIVE_NOW_PLAYING_URL?.trim() ?? '';
const LIVE_NOW_PLAYING_REFRESH_MS = Number(process.env.EXPO_PUBLIC_LIVE_NOW_PLAYING_REFRESH_MS ?? 15000);
const LIVE_NOW_PLAYING_TIMEOUT_MS = Number(process.env.EXPO_PUBLIC_LIVE_NOW_PLAYING_TIMEOUT_MS ?? 7000);
const LIVE_NOW_PLAYING_RETRY_COUNT = Number(process.env.EXPO_PUBLIC_LIVE_NOW_PLAYING_RETRY_COUNT ?? 2);
const LIVE_NOW_PLAYING_RETRY_BASE_DELAY_MS = Number(
  process.env.EXPO_PUBLIC_LIVE_NOW_PLAYING_RETRY_BASE_DELAY_MS ?? 750
);
const LIVE_NOW_PLAYING_ERROR_REPORT_INTERVAL_MS = Number(
  process.env.EXPO_PUBLIC_LIVE_NOW_PLAYING_ERROR_REPORT_INTERVAL_MS ?? 300000
);
const LIVE_RECONNECT_BASE_DELAY_MS = Number(process.env.EXPO_PUBLIC_LIVE_RECONNECT_BASE_DELAY_MS ?? 4000);
const LIVE_RECONNECT_MAX_DELAY_MS = Number(process.env.EXPO_PUBLIC_LIVE_RECONNECT_MAX_DELAY_MS ?? 30000);
const LIVE_RECONNECT_CHECK_INTERVAL_MS = Number(process.env.EXPO_PUBLIC_LIVE_RECONNECT_CHECK_INTERVAL_MS ?? 4000);
const LIVE_RECONNECT_BUFFERING_TIMEOUT_MS = Number(
  process.env.EXPO_PUBLIC_LIVE_RECONNECT_BUFFERING_TIMEOUT_MS ?? 15000
);
const LIVE_PREFERRED_FORWARD_BUFFER_DURATION = Number(
  process.env.EXPO_PUBLIC_LIVE_PREFERRED_FORWARD_BUFFER_DURATION ?? 4
);

const DEFAULT_METADATA: AudioMetadata = {
  title: LIVE_PROGRAM_TITLE,
  ...(LIVE_PROGRAM_HOST ? { artist: LIVE_PROGRAM_HOST } : {}),
  ...(LIVE_PROGRAM_SCHEDULE ? { albumTitle: LIVE_PROGRAM_SCHEDULE } : {}),
  artworkUrl: LIVE_DEFAULT_ARTWORK_URL,
};

export type LiveReconnectState = {
  isReconnecting: boolean;
  attempt: number;
  reason: string | null;
};

type LivePlaybackRequestState = {
  wantsPlayback: boolean;
};

let currentLiveMetadata: AudioMetadata = { ...DEFAULT_METADATA };
const liveMetadataListeners = new Set<() => void>();
const reconnectStateListeners = new Set<() => void>();
const playbackRequestListeners = new Set<() => void>();
let nowPlayingPollTimer: ReturnType<typeof setInterval> | null = null;
let isNowPlayingRequestInFlight = false;
let metadataConsumersCount = 0;
let lastSuccessfulNowPlayingAt = 0;
let lastNowPlayingErrorReportAt = 0;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
let reconnectWatchdogTimer: ReturnType<typeof setInterval> | null = null;
let reconnectAttemptCount = 0;
let shouldMaintainPlayback = false;
let isReconnectInFlight = false;
let bufferingSinceAt = 0;
let reconnectState: LiveReconnectState = {
  isReconnecting: false,
  attempt: 0,
  reason: null,
};
let playbackRequestState: LivePlaybackRequestState = {
  wantsPlayback: false,
};

function addLiveBreadcrumb(
  message: string,
  data?: Record<string, unknown>,
  level: 'debug' | 'info' | 'warning' | 'error' = 'info'
) {
  if (!Sentry.getClient()) {
    return;
  }

  Sentry.addBreadcrumb({
    category: 'live-audio',
    level,
    message,
    data,
  });
}

function asError(error: unknown) {
  if (error instanceof Error) {
    return error;
  }

  return new Error(typeof error === 'string' ? error : 'Unknown live-audio error');
}

function captureLiveException(error: unknown, context: Record<string, unknown>) {
  if (!Sentry.getClient()) {
    return;
  }

  const normalizedError = asError(error);

  Sentry.withScope(scope => {
    scope.setTag('feature', 'live-audio');
    scope.setTag('live_stream_configured', String(isLiveStreamConfigured));
    scope.setContext('liveAudio', {
      streamUrlConfigured: isLiveStreamConfigured,
      nowPlayingUrlConfigured: LIVE_NOW_PLAYING_URL.length > 0,
      metadataTitle: currentLiveMetadata.title ?? null,
      metadataArtist: currentLiveMetadata.artist ?? null,
      ...context,
    });

    Sentry.captureException(normalizedError);
  });
}

function notifyLiveMetadataChanged() {
  for (const listener of liveMetadataListeners) {
    listener();
  }
}

function notifyReconnectStateChanged() {
  for (const listener of reconnectStateListeners) {
    listener();
  }
}

function notifyPlaybackRequestStateChanged() {
  for (const listener of playbackRequestListeners) {
    listener();
  }
}

function setReconnectState(next: LiveReconnectState) {
  if (
    reconnectState.isReconnecting === next.isReconnecting &&
    reconnectState.attempt === next.attempt &&
    reconnectState.reason === next.reason
  ) {
    return;
  }

  reconnectState = next;
  notifyReconnectStateChanged();
}

function setPlaybackRequestState(next: LivePlaybackRequestState) {
  if (playbackRequestState.wantsPlayback === next.wantsPlayback) {
    return;
  }

  playbackRequestState = next;
  notifyPlaybackRequestStateChanged();
}

function setCurrentLiveMetadata(metadata: AudioMetadata) {
  currentLiveMetadata = { ...metadata };
  addLiveBreadcrumb('metadata.updated', {
    title: currentLiveMetadata.title,
    artist: currentLiveMetadata.artist,
    albumTitle: currentLiveMetadata.albumTitle,
  });

  if (lockScreenActive && livePlayerInstance) {
    livePlayerInstance.updateLockScreenMetadata(currentLiveMetadata);
  }

  notifyLiveMetadataChanged();
}

function metadataEquals(a: AudioMetadata, b: AudioMetadata) {
  return (
    (a.title ?? '') === (b.title ?? '') &&
    (a.artist ?? '') === (b.artist ?? '') &&
    (a.albumTitle ?? '') === (b.albumTitle ?? '') &&
    (a.artworkUrl ?? '') === (b.artworkUrl ?? '')
  );
}

function asNonEmptyString(value: unknown) {
  if (typeof value !== 'string') {
    return undefined;
  }

  const normalized = value.trim();
  return normalized.length > 0 ? normalized : undefined;
}

function parseNowPlayingMetadata(payload: unknown): Partial<AudioMetadata> | null {
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  const root = payload as Record<string, unknown>;

  const directTitle = asNonEmptyString(root.title);
  const directArtist =
    asNonEmptyString(root.artist) ||
    asNonEmptyString(root.host) ||
    asNonEmptyString(root.presenter);
  const directSchedule =
    asNonEmptyString(root.schedule) ||
    asNonEmptyString(root.program) ||
    asNonEmptyString(root.programme);
  const directArtwork =
    asNonEmptyString(root.artworkUrl) ||
    asNonEmptyString(root.artwork) ||
    asNonEmptyString(root.image) ||
    asNonEmptyString(root.cover);

  const nowPlaying = (root.now_playing ?? root.nowPlaying) as Record<string, unknown> | undefined;
  const song = (nowPlaying?.song ?? root.song) as Record<string, unknown> | undefined;

  const nestedTitle =
    asNonEmptyString(song?.title) ||
    asNonEmptyString(nowPlaying?.title) ||
    asNonEmptyString((root.current as Record<string, unknown> | undefined)?.title);

  const nestedArtist =
    asNonEmptyString(song?.artist) ||
    asNonEmptyString(nowPlaying?.artist) ||
    asNonEmptyString((root.current as Record<string, unknown> | undefined)?.artist);

  const nestedArtwork =
    asNonEmptyString(song?.artwork) ||
    asNonEmptyString(song?.artwork_url) ||
    asNonEmptyString(nowPlaying?.artwork_url) ||
    asNonEmptyString(nowPlaying?.artwork);

  const title = nestedTitle || directTitle;
  const artist = nestedArtist || directArtist;
  const albumTitle = directSchedule;
  const artworkUrl = nestedArtwork || directArtwork;

  if (!title && !artist && !albumTitle && !artworkUrl) {
    return null;
  }

  return {
    ...(title ? { title } : {}),
    ...(artist ? { artist } : {}),
    ...(albumTitle ? { albumTitle } : {}),
    ...(artworkUrl ? { artworkUrl } : {}),
  };
}

function mergeLiveMetadata(partial: Partial<AudioMetadata>) {
  return {
    ...currentLiveMetadata,
    ...partial,
  } as AudioMetadata;
}

export function getLiveProgramInfo() {
  const title = currentLiveMetadata.title?.trim() || LIVE_PROGRAM_TITLE;
  const host = currentLiveMetadata.artist?.trim() || LIVE_PROGRAM_HOST;
  const schedule = currentLiveMetadata.albumTitle?.trim() || LIVE_PROGRAM_SCHEDULE;

  return {
    title,
    host,
    schedule,
  };
}

export function getCurrentLiveMetadata() {
  return { ...currentLiveMetadata };
}

export function getLiveReconnectState() {
  return { ...reconnectState };
}

export function getLivePlaybackRequestState() {
  return { ...playbackRequestState };
}

export function subscribeLiveProgramInfo(listener: () => void) {
  liveMetadataListeners.add(listener);
  metadataConsumersCount += 1;
  syncNowPlayingPolling();
  void refreshLiveNowPlayingInfo({ reason: 'consumer-mount' });

  return () => {
    liveMetadataListeners.delete(listener);
    metadataConsumersCount = Math.max(0, metadataConsumersCount - 1);
    syncNowPlayingPolling();
  };
}

export function subscribeLiveReconnectState(listener: () => void) {
  reconnectStateListeners.add(listener);

  return () => {
    reconnectStateListeners.delete(listener);
  };
}

export function subscribeLivePlaybackRequestState(listener: () => void) {
  playbackRequestListeners.add(listener);

  return () => {
    playbackRequestListeners.delete(listener);
  };
}

export function useLiveProgramInfo() {
  const [programInfo, setProgramInfo] = React.useState(() => getLiveProgramInfo());

  React.useEffect(() => {
    const unsubscribe = subscribeLiveProgramInfo(() => {
      setProgramInfo(getLiveProgramInfo());
    });

    return unsubscribe;
  }, []);

  return programInfo;
}

export function useLiveMetadata() {
  const [metadata, setMetadata] = React.useState<AudioMetadata>(() => getCurrentLiveMetadata());

  React.useEffect(() => {
    const unsubscribe = subscribeLiveProgramInfo(() => {
      setMetadata(getCurrentLiveMetadata());
    });

    return unsubscribe;
  }, []);

  return metadata;
}

export function useLiveReconnectState() {
  const [state, setState] = React.useState<LiveReconnectState>(() => getLiveReconnectState());

  React.useEffect(() => {
    const unsubscribe = subscribeLiveReconnectState(() => {
      setState(getLiveReconnectState());
    });

    return unsubscribe;
  }, []);

  return state;
}

export function useLivePlaybackRequestState() {
  const [state, setState] = React.useState<LivePlaybackRequestState>(() => getLivePlaybackRequestState());

  React.useEffect(() => {
    const unsubscribe = subscribeLivePlaybackRequestState(() => {
      setState(getLivePlaybackRequestState());
    });

    return unsubscribe;
  }, []);

  return state;
}

let livePlayerInstance: AudioPlayer | null = null;
let audioModeConfigured = false;
let sourcePrepared = false;
let lockScreenActive = false;

function getLiveAudioPlayer(): AudioPlayer {
  if (!livePlayerInstance) {
    livePlayerInstance = createAudioPlayer(null, {
      updateInterval: 500,
      keepAudioSessionActive: true,
      preferredForwardBufferDuration: Number.isFinite(LIVE_PREFERRED_FORWARD_BUFFER_DURATION)
        ? Math.max(0, LIVE_PREFERRED_FORWARD_BUFFER_DURATION)
        : 4,
    });
  }

  return livePlayerInstance;
}

async function ensureAudioModeConfigured() {
  if (audioModeConfigured) {
    return;
  }

  await setAudioModeAsync({
    playsInSilentMode: true,
    shouldPlayInBackground: true,
    interruptionMode: 'doNotMix',
    shouldRouteThroughEarpiece: false,
  });

  audioModeConfigured = true;
}

function ensureSourcePrepared(player: AudioPlayer) {
  if (sourcePrepared || LIVE_STREAM_URL.length === 0) {
    return;
  }

  player.replace({
    uri: LIVE_STREAM_URL,
    name: currentLiveMetadata.title?.trim() || LIVE_PROGRAM_TITLE,
  });
  sourcePrepared = true;
}

export function warmLiveAudio() {
  if (!isLiveStreamConfigured) {
    return;
  }

  try {
    const player = getLiveAudioPlayer();
    ensureSourcePrepared(player);
    addLiveBreadcrumb('warm.success', {
      playbackState: player.currentStatus.playbackState,
      isLoaded: player.currentStatus.isLoaded,
    });
  } catch (error) {
    addLiveBreadcrumb('warm.error', { message: asError(error).message }, 'warning');
  }
}

function replaceSource(player: AudioPlayer) {
  if (LIVE_STREAM_URL.length === 0) {
    return;
  }

  player.replace({
    uri: LIVE_STREAM_URL,
    name: currentLiveMetadata.title?.trim() || LIVE_PROGRAM_TITLE,
  });
  sourcePrepared = true;
}

function shouldReloadSourceBeforePlay(status: AudioStatus) {
  const playbackState = status.playbackState.toLowerCase();

  return (
    !status.isLoaded ||
    status.didJustFinish ||
    status.mediaServicesDidReset === true ||
    playbackState === 'idle' ||
    playbackState === 'ended' ||
    playbackState === 'failed'
  );
}

function applyLockScreenControls(player: AudioPlayer, metadata?: AudioMetadata) {
  const lockScreenMetadata: AudioMetadata = metadata
    ? {
        ...DEFAULT_METADATA,
        ...currentLiveMetadata,
        ...metadata,
      }
    : { ...currentLiveMetadata };
  setCurrentLiveMetadata(lockScreenMetadata);

  if (!lockScreenActive) {
    player.setActiveForLockScreen(
      true,
      lockScreenMetadata,
      {
        showSeekBackward: false,
        showSeekForward: false,
      }
    );
    lockScreenActive = true;
    return;
  }

  player.updateLockScreenMetadata(lockScreenMetadata);
}

function syncNowPlayingPolling() {
  const shouldPoll =
    LIVE_NOW_PLAYING_URL.length > 0 && (metadataConsumersCount > 0 || Boolean(livePlayerInstance?.playing));

  if (shouldPoll && !nowPlayingPollTimer) {
    nowPlayingPollTimer = setInterval(() => {
      void refreshLiveNowPlayingInfo({ reason: 'poll' });
    }, Number.isFinite(LIVE_NOW_PLAYING_REFRESH_MS) ? LIVE_NOW_PLAYING_REFRESH_MS : 15000);
    addLiveBreadcrumb('nowPlaying.polling.started', { consumers: metadataConsumersCount });
  }

  if (!shouldPoll && nowPlayingPollTimer) {
    clearInterval(nowPlayingPollTimer);
    nowPlayingPollTimer = null;
    addLiveBreadcrumb('nowPlaying.polling.stopped', { consumers: metadataConsumersCount });
  }
}

function clearReconnectTimer() {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
}

function stopReconnectWatchdog() {
  if (reconnectWatchdogTimer) {
    clearInterval(reconnectWatchdogTimer);
    reconnectWatchdogTimer = null;
  }
}

async function attemptAutoReconnect(reason: string) {
  if (!shouldMaintainPlayback || isReconnectInFlight || !isLiveStreamConfigured) {
    return;
  }

  const player = getLiveAudioPlayer();
  isReconnectInFlight = true;

  try {
    addLiveBreadcrumb('reconnect.attempt', {
      reason,
      attempt: reconnectAttemptCount + 1,
      playbackState: player.currentStatus.playbackState,
    });

    if (shouldReloadSourceBeforePlay(player.currentStatus)) {
      replaceSource(player);
    }

    player.play();
    syncNowPlayingPolling();

    if (player.playing) {
      reconnectAttemptCount = 0;
      setReconnectState({
        isReconnecting: false,
        attempt: 0,
        reason: null,
      });
      addLiveBreadcrumb('reconnect.success', { reason });
    } else {
      scheduleAutoReconnect(`retry:${reason}`);
    }
  } catch (error) {
    addLiveBreadcrumb('reconnect.error', { reason, message: asError(error).message }, 'error');
    captureLiveException(error, {
      action: 'attemptAutoReconnect',
      reason,
      attempt: reconnectAttemptCount + 1,
      playbackState: player.currentStatus.playbackState,
    });
    scheduleAutoReconnect(`error:${reason}`);
  } finally {
    isReconnectInFlight = false;
  }
}

function scheduleAutoReconnect(reason: string) {
  if (!shouldMaintainPlayback || reconnectTimer || !isLiveStreamConfigured) {
    return;
  }

  reconnectAttemptCount += 1;
  setReconnectState({
    isReconnecting: true,
    attempt: reconnectAttemptCount,
    reason,
  });
  const baseDelay = Number.isFinite(LIVE_RECONNECT_BASE_DELAY_MS) ? LIVE_RECONNECT_BASE_DELAY_MS : 4000;
  const maxDelay = Number.isFinite(LIVE_RECONNECT_MAX_DELAY_MS) ? LIVE_RECONNECT_MAX_DELAY_MS : 30000;
  const delayMs = Math.min(maxDelay, Math.max(1000, baseDelay * reconnectAttemptCount));

  addLiveBreadcrumb('reconnect.scheduled', {
    reason,
    attempt: reconnectAttemptCount,
    delayMs,
  });

  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;
    void attemptAutoReconnect(reason);
  }, delayMs);
}

function startReconnectWatchdog() {
  if (reconnectWatchdogTimer || !isLiveStreamConfigured) {
    return;
  }

  const intervalMs = Number.isFinite(LIVE_RECONNECT_CHECK_INTERVAL_MS) ? LIVE_RECONNECT_CHECK_INTERVAL_MS : 4000;

  reconnectWatchdogTimer = setInterval(() => {
    if (!shouldMaintainPlayback || !livePlayerInstance) {
      return;
    }

    const status = livePlayerInstance.currentStatus;
    const playbackState = status.playbackState.toLowerCase();
    const failedState =
      playbackState === 'failed' ||
      playbackState === 'ended' ||
      playbackState === 'idle' ||
      status.mediaServicesDidReset === true ||
      status.didJustFinish;
    const pausedUnexpectedly =
      status.isLoaded &&
      playbackState === 'ready' &&
      status.timeControlStatus.toLowerCase() === 'paused' &&
      !livePlayerInstance.playing;
    const bufferingTimeoutMs = Number.isFinite(LIVE_RECONNECT_BUFFERING_TIMEOUT_MS)
      ? LIVE_RECONNECT_BUFFERING_TIMEOUT_MS
      : 15000;

    if (status.isBuffering) {
      if (bufferingSinceAt === 0) {
        bufferingSinceAt = Date.now();
      } else if (Date.now() - bufferingSinceAt >= Math.max(5000, bufferingTimeoutMs)) {
        scheduleAutoReconnect('watchdog:buffering-timeout');
      }
      return;
    }
    bufferingSinceAt = 0;

    if (!livePlayerInstance.playing && !status.isBuffering && failedState) {
      scheduleAutoReconnect(`watchdog:${playbackState}`);
      return;
    }

    if (pausedUnexpectedly) {
      scheduleAutoReconnect('watchdog:interruption');
    }
  }, Math.max(2000, intervalMs));

  addLiveBreadcrumb('reconnect.watchdog.started', {
    intervalMs: Math.max(2000, intervalMs),
  });
}

function delay(ms: number) {
  return new Promise<void>(resolve => {
    setTimeout(resolve, ms);
  });
}

async function fetchNowPlayingPayload() {
  const timeoutMs = Number.isFinite(LIVE_NOW_PLAYING_TIMEOUT_MS) ? LIVE_NOW_PLAYING_TIMEOUT_MS : 7000;
  const controller = new AbortController();
  const timeout = setTimeout(() => {
    controller.abort();
  }, timeoutMs);

  try {
    const response = await fetch(LIVE_NOW_PLAYING_URL, {
      headers: {
        Accept: 'application/json',
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Now playing HTTP ${response.status}`);
    }

    return (await response.json()) as unknown;
  } finally {
    clearTimeout(timeout);
  }
}

export async function refreshLiveNowPlayingInfo(options?: { reason?: string }) {
  if (!LIVE_NOW_PLAYING_URL || isNowPlayingRequestInFlight) {
    return getCurrentLiveMetadata();
  }

  isNowPlayingRequestInFlight = true;
  const reason = options?.reason ?? 'manual';
  const maxAttempts = Math.max(1, Number.isFinite(LIVE_NOW_PLAYING_RETRY_COUNT) ? LIVE_NOW_PLAYING_RETRY_COUNT + 1 : 1);
  let lastError: Error | null = null;

  try {
    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      try {
        addLiveBreadcrumb('nowPlaying.fetch.start', { reason, attempt, maxAttempts }, 'debug');

        const payload = await fetchNowPlayingPayload();
        const parsed = parseNowPlayingMetadata(payload);

        if (!parsed) {
          throw new Error('Now playing payload missing metadata');
        }

        const merged = mergeLiveMetadata(parsed);

        if (!metadataEquals(currentLiveMetadata, merged)) {
          setCurrentLiveMetadata(merged);
        }

        lastSuccessfulNowPlayingAt = Date.now();
        addLiveBreadcrumb('nowPlaying.fetch.success', { reason, attempt }, 'info');
        return merged;
      } catch (error) {
        lastError = asError(error);

        addLiveBreadcrumb(
          'nowPlaying.fetch.error',
          {
            reason,
            attempt,
            maxAttempts,
            message: lastError.message,
          },
          'warning'
        );

        if (attempt < maxAttempts) {
          const retryDelayMs = Math.max(
            250,
            (Number.isFinite(LIVE_NOW_PLAYING_RETRY_BASE_DELAY_MS) ? LIVE_NOW_PLAYING_RETRY_BASE_DELAY_MS : 750) *
              attempt
          );
          await delay(retryDelayMs);
        }
      }
    }

    if (lastError) {
      const now = Date.now();
      if (now - lastNowPlayingErrorReportAt >= LIVE_NOW_PLAYING_ERROR_REPORT_INTERVAL_MS) {
        lastNowPlayingErrorReportAt = now;
        captureLiveException(lastError, {
          reason,
          maxAttempts,
          lastSuccessfulNowPlayingAt,
        });
      }
    }

    return getCurrentLiveMetadata();
  } finally {
    isNowPlayingRequestInFlight = false;
  }
}

export const isLiveStreamConfigured = LIVE_STREAM_URL.length > 0;

export async function playLiveAudio(metadata?: AudioMetadata) {
  if (!isLiveStreamConfigured) {
    addLiveBreadcrumb('play.skipped.stream_missing', undefined, 'warning');
    return;
  }

  const player = getLiveAudioPlayer();

  try {
    shouldMaintainPlayback = true;
    setPlaybackRequestState({ wantsPlayback: true });
    reconnectAttemptCount = 0;
    bufferingSinceAt = 0;
    setReconnectState({
      isReconnecting: false,
      attempt: 0,
      reason: null,
    });
    clearReconnectTimer();
    startReconnectWatchdog();

    addLiveBreadcrumb('play.start', {
      playbackState: player.currentStatus.playbackState,
      isLoaded: player.currentStatus.isLoaded,
    });

    await ensureAudioModeConfigured();
    ensureSourcePrepared(player);

    if (shouldReloadSourceBeforePlay(player.currentStatus)) {
      addLiveBreadcrumb('play.reload_source', { playbackState: player.currentStatus.playbackState }, 'debug');
      replaceSource(player);
    }

    applyLockScreenControls(player, metadata);
    void refreshLiveNowPlayingInfo({ reason: 'play' });
    player.play();
    syncNowPlayingPolling();
    addLiveBreadcrumb('play.success');
  } catch (error) {
    setPlaybackRequestState({ wantsPlayback: false });
    addLiveBreadcrumb('play.error', { message: asError(error).message }, 'error');
    captureLiveException(error, {
      action: 'playLiveAudio',
      playbackState: player.currentStatus.playbackState,
    });
    throw error;
  }
}

export function pauseLiveAudio() {
  const player = getLiveAudioPlayer();
  shouldMaintainPlayback = false;
  setPlaybackRequestState({ wantsPlayback: false });
  reconnectAttemptCount = 0;
  bufferingSinceAt = 0;
  setReconnectState({
    isReconnecting: false,
    attempt: 0,
    reason: null,
  });
  clearReconnectTimer();
  stopReconnectWatchdog();
  addLiveBreadcrumb('pause.start', { playbackState: player.currentStatus.playbackState });
  player.pause();
  syncNowPlayingPolling();
  addLiveBreadcrumb('pause.success');
}

export async function toggleLiveAudio(metadata?: AudioMetadata) {
  const player = getLiveAudioPlayer();

  if (player.playing) {
    addLiveBreadcrumb('toggle.pause');
    pauseLiveAudio();
    return;
  }

  addLiveBreadcrumb('toggle.play');
  await playLiveAudio(metadata);
}

export function useLiveAudioStatus() {
  const player = getLiveAudioPlayer();
  const status = useAudioPlayerStatus(player);
  const playbackRequest = useLivePlaybackRequestState();
  const playbackState = String(status.playbackState ?? '').toLowerCase();
  const timeControlStatus = String(status.timeControlStatus ?? '').toLowerCase();
  const isPlaybackConfirmed =
    playbackRequest.wantsPlayback &&
    status.isLoaded &&
    !status.isBuffering &&
    playbackState === 'ready' &&
    timeControlStatus === 'playing';
  const isStarting =
    playbackRequest.wantsPlayback &&
    !isPlaybackConfirmed &&
    playbackState !== 'failed' &&
    playbackState !== 'ended';

  return {
    status,
    isReady: isLiveStreamConfigured,
    isPlaying: isPlaybackConfirmed,
    isBuffering: status.isBuffering,
    isStarting,
  };
}
