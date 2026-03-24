export type DirectMode = 'video' | 'audio';

let requestedDirectMode: DirectMode | null = null;

export function requestDirectMode(mode: DirectMode) {
  requestedDirectMode = mode;
}

export function consumeRequestedDirectMode() {
  const mode = requestedDirectMode;
  requestedDirectMode = null;
  return mode;
}
