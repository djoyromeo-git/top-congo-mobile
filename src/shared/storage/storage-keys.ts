const STORAGE_PREFIX = 'topcongo';

export function createVersionedStorageKey(namespace: string, name: string, version: number) {
  return `${STORAGE_PREFIX}.${namespace}.${name}.v${version}`;
}
