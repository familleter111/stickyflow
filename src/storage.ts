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

export function readUsers(): string | null {
  if (bridge) return bridge.readUsers();
  try {
    return localStorage.getItem(USERS_KEY);
  } catch {
    return null;
  }
}

export function writeUsers(data: string): void {
  if (bridge) {
    bridge.writeUsers(data);
    return;
  }
  try {
    localStorage.setItem(USERS_KEY, data);
  } catch {
    /* ignore */
  }
}

export function readNotes(): string | null {
  if (bridge) return bridge.readAllNotes();
  try {
    return localStorage.getItem(NOTES_KEY);
  } catch {
    return null;
  }
}

export function writeNotes(data: string): void {
  if (bridge) {
    bridge.writeAllNotes(data);
    return;
  }
  try {
    localStorage.setItem(NOTES_KEY, data);
  } catch {
    /* ignore */
  }
}
