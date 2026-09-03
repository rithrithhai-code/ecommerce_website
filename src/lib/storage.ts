import { createJSONStorage, type StateStorage } from "zustand/middleware";

/**
 * Storage adapter used by every persisted store.
 *
 * `localStorage.setItem` throws in Safari private mode and is unavailable in some embedded
 * webviews, which would crash checkout on the first cart write. Reads and writes therefore fall
 * back to an in-memory map: the app degrades to a non-persisting session instead of breaking.
 */
const memory = new Map<string, string>();

const safeStorage: StateStorage = {
  getItem(name) {
    try {
      const value = window.localStorage.getItem(name);
      if (value !== null) return value;
    } catch {
      /* storage blocked — fall through to memory */
    }
    return memory.get(name) ?? null;
  },
  setItem(name, value) {
    memory.set(name, value);
    try {
      window.localStorage.setItem(name, value);
    } catch {
      /* quota exceeded or blocked — the memory copy already holds this session */
    }
  },
  removeItem(name) {
    memory.delete(name);
    try {
      window.localStorage.removeItem(name);
    } catch {
      /* nothing further to do */
    }
  },
};

export const persistStorage = createJSONStorage(() => safeStorage);
