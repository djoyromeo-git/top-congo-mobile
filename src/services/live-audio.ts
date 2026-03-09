import { Asset } from 'expo-asset';
import * as React from 'react';
import {
  createAudioPlayer,
  setAudioModeAsync,
  useAudioPlayerStatus,
  type AudioMetadata,
  type AudioPlayer,
  type AudioStatus,
} from 'expo-audio';

const LIVE_STREAM_URL = process.env.EXPO_PUBLIC_LIVE_STREAM_URL?.trim() ?? '';
const LIVE_DEFAULT_ARTWORK_URL = Asset.fromModule(
  require('../../assets/images/icon.png')
).uri;
const LIVE_PROGRAM_TITLE = process.env.EXPO_PUBLIC_LIVE_PROGRAM_TITLE?.trim() || 'Top Congo Live';
const LIVE_PROGRAM_HOST = process.env.EXPO_PUBLIC_LIVE_PROGRAM_HOST?.trim() || 'Top Congo FM';
const LIVE_PROGRAM_SCHEDULE = process.env.EXPO_PUBLIC_LIVE_PROGRAM_SCHEDULE?.trim() || 'En direct';
const LIVE_NOW_PLAYING_URL = process.env.EXPO_PUBLIC_LIVE_NOW_PLAYING_URL?.trim() ?? '';
const LIVE_NOW_PLAYING_REFRESH_MS = Number(process.env.EXPO_PUBLIC_LIVE_NOW_PLAYING_REFRESH_MS ?? 15000);

const DEFAULT_METADATA: AudioMetadata = {
  title: LIVE_PROGRAM_TITLE,
  artist: LIVE_PROGRAM_HOST,
  albumTitle: LIVE_PROGRAM_SCHEDULE,
  artworkUrl: LIVE_DEFAULT_ARTWORK_URL,
};

let currentLiveMetadata: AudioMetadata = { ...DEFAULT_METADATA };
const liveMetadataListeners = new Set<() => void>();
let nowPlayingPollTimer: ReturnType<typeof setInterval> | null = null;
let isNowPlayingRequestInFlight = false;

function notifyLiveMetadataChanged() {
  for (const listener of liveMetadataListeners) {
    listener();
  }
}

function setCurrentLiveMetadata(metadata: AudioMetadata) {
  currentLiveMetadata = { ...metadata };

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

export function subscribeLiveProgramInfo(listener: () => void) {
  liveMetadataListeners.add(listener);
  return () => {
    liveMetadataListeners.delete(listener);
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

  React.useEffect(() => {
    if (!LIVE_NOW_PLAYING_URL) {
      return;
    }

    void refreshLiveNowPlayingInfo();

    const timer = setInterval(() => {
      void refreshLiveNowPlayingInfo();
    }, Number.isFinite(LIVE_NOW_PLAYING_REFRESH_MS) ? LIVE_NOW_PLAYING_REFRESH_MS : 15000);

    return () => clearInterval(timer);
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

  React.useEffect(() => {
    if (!LIVE_NOW_PLAYING_URL) {
      return;
    }

    void refreshLiveNowPlayingInfo();

    const timer = setInterval(() => {
      void refreshLiveNowPlayingInfo();
    }, Number.isFinite(LIVE_NOW_PLAYING_REFRESH_MS) ? LIVE_NOW_PLAYING_REFRESH_MS : 15000);

    return () => clearInterval(timer);
  }, []);

  return metadata;
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
      preferredForwardBufferDuration: 20,
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
        ...metadata,
      }
    : {
        ...currentLiveMetadata,
      };
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

function startNowPlayingPolling() {
  if (!LIVE_NOW_PLAYING_URL || nowPlayingPollTimer) {
    return;
  }

  nowPlayingPollTimer = setInterval(() => {
    void refreshLiveNowPlayingInfo();
  }, Number.isFinite(LIVE_NOW_PLAYING_REFRESH_MS) ? LIVE_NOW_PLAYING_REFRESH_MS : 15000);
}

function stopNowPlayingPolling() {
  if (!nowPlayingPollTimer) {
    return;
  }

  clearInterval(nowPlayingPollTimer);
  nowPlayingPollTimer = null;
}

export async function refreshLiveNowPlayingInfo() {
  if (!LIVE_NOW_PLAYING_URL || isNowPlayingRequestInFlight) {
    return null;
  }

  isNowPlayingRequestInFlight = true;

  try {
    const response = await fetch(LIVE_NOW_PLAYING_URL, {
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as unknown;
    const parsed = parseNowPlayingMetadata(payload);

    if (!parsed) {
      return null;
    }

    const merged = mergeLiveMetadata(parsed);

    if (!metadataEquals(currentLiveMetadata, merged)) {
      setCurrentLiveMetadata(merged);
    }

    return merged;
  } catch {
    return null;
  } finally {
    isNowPlayingRequestInFlight = false;
  }
}

export const isLiveStreamConfigured = LIVE_STREAM_URL.length > 0;

export async function playLiveAudio(metadata?: AudioMetadata) {
  if (!isLiveStreamConfigured) {
    return;
  }

  const player = getLiveAudioPlayer();
  await ensureAudioModeConfigured();
  ensureSourcePrepared(player);

  if (shouldReloadSourceBeforePlay(player.currentStatus)) {
    replaceSource(player);
  }

  applyLockScreenControls(player, metadata);
  void refreshLiveNowPlayingInfo();
  startNowPlayingPolling();
  player.play();
}

export function pauseLiveAudio() {
  const player = getLiveAudioPlayer();
  player.pause();
  stopNowPlayingPolling();
}

export async function toggleLiveAudio(metadata?: AudioMetadata) {
  const player = getLiveAudioPlayer();

  if (player.playing) {
    pauseLiveAudio();
    return;
  }

  await playLiveAudio(metadata);
}

export function useLiveAudioStatus() {
  const player = getLiveAudioPlayer();
  const status = useAudioPlayerStatus(player);

  return {
    status,
    isReady: isLiveStreamConfigured,
    isPlaying: status.playing,
    isBuffering: status.isBuffering,
  };
}
