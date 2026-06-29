/* ------------------------------------------------------------------ *
 * Storage layer.
 *
 * In the Electron build the renderer talks to the main process (see
 * electron/preload.cjs) and data is persisted as plain .txt files:
 *   <userData>/data/users.txt          -> the account list
 *   <userData>/data/notes_<userId>.txt -> one file per user's notes
 *
 * In a plain browser (e.g. `npm run dev` without Electron) there is no
 * disk access, so we transparently fall back to localStorage.
 *
 * Migration: the app used to be called "StickyFlow" and stored data under
 * `stickyflow_*` keys. When the current storage is empty we transparently
 * recover any data left under those legacy keys so accounts/notes created
 * before the rename are not lost.
 * ------------------------------------------------------------------ */

type StoreBridge = {
  readUsers: () => string | null;
  writeUsers: (data: string) => void;
  readAllNotes: () => string | null;
  writeAllNotes: (data: string) => void;
};

const bridge: StoreBridge | undefined =
  typeof window !== "undefined"
    ? (window as unknown as { mdflowStore?: StoreBridge }).mdflowStore
    : undefined;

/** True when notes/users are persisted to real .txt files (Electron). */
export const usesFileStorage = !!bridge;

const USERS_KEY = "mdflow_users";
const NOTES_KEY = "mdflow_notes";

// Legacy localStorage keys, newest first, checked when migrating.
const LEGACY_USERS = ["mdflow_users", "stickyflow_users"];
const LEGACY_NOTES = ["mdflow_notes", "stickyflow_notes"];

function localGet(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function localSet(key: string, data: string): void {
  try {
    localStorage.setItem(key, data);
  } catch {
    /* ignore */
  }
}

/** First non-empty value among the given localStorage keys. */
function firstLegacy(keys: string[]): string | null {
  for (const k of keys) {
    const v = localGet(k);
    if (v) return v;
  }
  return null;
}

export function readUsers(): string | null {
  if (bridge) {
    const current = bridge.readUsers();
    if (current) return current;
    // Recover data from a pre-file-storage / pre-rename localStorage.
    const legacy = firstLegacy(LEGACY_USERS);
    if (legacy) {
      bridge.writeUsers(legacy);
      return legacy;
    }
    return null;
  }
  const current = localGet(USERS_KEY);
  if (current) return current;
  const legacy = firstLegacy(LEGACY_USERS);
  if (legacy) {
    localSet(USERS_KEY, legacy);
    return legacy;
  }
  return null;
}

export function writeUsers(data: string): void {
  if (bridge) {
    bridge.writeUsers(data);
    return;
  }
  localSet(USERS_KEY, data);
}

export function readNotes(): string | null {
  if (bridge) {
    const current = bridge.readAllNotes();
    if (current) return current;
    const legacy = firstLegacy(LEGACY_NOTES);
    if (legacy) {
      bridge.writeAllNotes(legacy);
      return legacy;
    }
    return null;
  }
  const current = localGet(NOTES_KEY);
  if (current) return current;
  const legacy = firstLegacy(LEGACY_NOTES);
  if (legacy) {
    localSet(NOTES_KEY, legacy);
    return legacy;
  }
  return null;
}

export function writeNotes(data: string): void {
  if (bridge) {
    bridge.writeAllNotes(data);
    return;
  }
  localSet(NOTES_KEY, data);
}
