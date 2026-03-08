export const ExpoKeepAwakeTag = 'ExpoKeepAwakeDefaultTag';

export function useKeepAwake() {
  // no-op shim for dev sessions where Android activity may be unavailable
}

export async function activateKeepAwakeAsync() {}

export async function deactivateKeepAwake() {}

export function addListener() {
  return {
    remove() {},
  };
}
