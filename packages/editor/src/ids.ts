export const newId = (): string =>
  globalThis.crypto?.randomUUID?.().slice(0, 12) ?? Math.random().toString(36).slice(2, 14);
