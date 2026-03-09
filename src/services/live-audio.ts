import { Asset } from 'expo-asset';
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

const DEFAULT_METADATA: AudioMetadata = {
  title: 'Top Congo Live',
  artist: 'Top Congo FM',
  albumTitle: 'Direct',
  artworkUrl: LIVE_DEFAULT_ARTWORK_URL,
};

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
    name: 'Top Congo Live',
  });
  sourcePrepared = true;
}

function replaceSource(player: AudioPlayer) {
  if (LIVE_STREAM_URL.length === 0) {
    return;
  }

  player.replace({
    uri: LIVE_STREAM_URL,
    name: 'Top Congo Live',
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
  const lockScreenMetadata: AudioMetadata = {
    ...DEFAULT_METADATA,
    ...(metadata ?? {}),
  };

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
  player.play();
}

export function pauseLiveAudio() {
  const player = getLiveAudioPlayer();
  player.pause();
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
