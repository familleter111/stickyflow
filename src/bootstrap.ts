// Startup hydration: pull the canonical data out of the database (via the
// API) and load it into the in-memory stores before the app renders.
import { useUsersStore } from "./auth";
import { useStore } from "./store";
import { fetchUsers, fetchNotes } from "./storage";

export async function hydrate(): Promise<void> {
  const [users, notes] = await Promise.all([fetchUsers(), fetchNotes()]);
  useUsersStore.getState().setUsers(users);
  useStore.getState().setNotes(notes);
}
