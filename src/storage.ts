/* ------------------------------------------------------------------ *
 * Storage layer — talks to the MDFlow backend (Node + SQLite).
 *
 * Data lives in a real SQLite database served over HTTP (see server/).
 * The frontend fetches users/notes on startup and pushes the full list
 * back whenever something changes.
 *
 * localStorage is used only as an offline cache: if the API is briefly
 * unreachable we fall back to the last data we saw so the UI still works.
 * ------------------------------------------------------------------ */
import type { User, Note } from "./types";

// Relative base: works behind the Vite dev proxy and when the API serves
// the built app from the same origin.
const API = "/api";

const USERS_CACHE = "mdflow_users";
const NOTES_CACHE = "mdflow_notes";

function cacheGet<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function cacheSet(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore quota/availability errors */
  }
}

/* ----------------------------- reads ----------------------------- */

export async function fetchUsers(): Promise<User[]> {
  try {
    const res = await fetch(`${API}/users`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const users = (await res.json()) as User[];
    cacheSet(USERS_CACHE, users);
    return users;
  } catch (err) {
    console.error("[mdflow] fetchUsers failed, using cached data:", err);
    return cacheGet<User[]>(USERS_CACHE) ?? [];
  }
}

export async function fetchNotes(): Promise<Note[]> {
  try {
    const res = await fetch(`${API}/notes`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const notes = (await res.json()) as Note[];
    cacheSet(NOTES_CACHE, notes);
    return notes;
  } catch (err) {
    console.error("[mdflow] fetchNotes failed, using cached data:", err);
    return cacheGet<Note[]>(NOTES_CACHE) ?? [];
  }
}

/* ----------------------------- writes ---------------------------- */
// Fire-and-forget: the in-memory store is updated immediately for a snappy
// UI; persistence to the database happens in the background.

export function saveUsers(users: User[]): void {
  cacheSet(USERS_CACHE, users);
  void put(`${API}/users`, users);
}

export function saveNotes(notes: Note[]): void {
  cacheSet(NOTES_CACHE, notes);
  void put(`${API}/notes`, notes);
}

async function put(url: string, body: unknown): Promise<void> {
  try {
    const res = await fetch(url, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  } catch (err) {
    console.error(`[mdflow] save failed (${url}):`, err);
  }
}

/* ----------------------------- login ----------------------------- */

export type ApiLoginResult =
  | { ok: true; user: User }
  | { ok: false; error: string };

/** Authenticate against the database. */
export async function apiLogin(
  email: string,
  password: string,
): Promise<ApiLoginResult> {
  try {
    const res = await fetch(`${API}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    return (await res.json()) as ApiLoginResult;
  } catch (err) {
    console.error("[mdflow] login request failed:", err);
    return { ok: false, error: "Serveur indisponible. Réessayez." };
  }
}
