import { create } from "zustand";
import type { User, AuthSession, UserStatus, UserRole } from "./types";
import { PRIMARY_ADMIN_EMAIL } from "./types";
import { apiLogin, saveUsers as persistUsers } from "./storage";

/* ------------------------------------------------------------------ *
 * SECURITY NOTE — read before shipping
 * ------------------------------------------------------------------ *
 * Users now live in a real SQLite database behind the API (see server/),
 * but this is still a demo:
 *  - Passwords are stored in PLAIN TEXT. In a real app they must be
 *    hashed (bcrypt/argon2) server-side and never sent back to the client.
 *  - The session lives in localStorage/sessionStorage and is not a signed
 *    token. Real auth should use JWT or HTTP-only session cookies plus
 *    access-control middleware on every endpoint.
 * ------------------------------------------------------------------ */

const SESSION_KEY = "mdflow_auth_session";

// Stable ids so seeded demo notes can reference their owners.
export const SEED_IDS = {
  admin: "u_admin",
  marie: "u_marie",
  lucas: "u_lucas",
  sophie: "u_sophie",
} as const;

const uid = () =>
  "u_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

const nowISO = () => new Date().toISOString();

// Persist the whole list to the database (fire-and-forget).
function saveUsers(users: User[]) {
  persistUsers(users);
}

function loadSession(): AuthSession | null {
  try {
    // rememberMe -> localStorage (survives restart); otherwise sessionStorage.
    const raw =
      localStorage.getItem(SESSION_KEY) ?? sessionStorage.getItem(SESSION_KEY);
    if (raw) return JSON.parse(raw) as AuthSession;
  } catch {
    /* ignore */
  }
  return null;
}

function saveSession(session: AuthSession | null) {
  try {
    localStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(SESSION_KEY);
    if (session) {
      const store = session.rememberMe ? localStorage : sessionStorage;
      store.setItem(SESSION_KEY, JSON.stringify(session));
    }
  } catch {
    /* ignore */
  }
}

export type UserDraft = {
  email: string;
  username: string;
  password: string;
  status: UserStatus;
  role: UserRole;
};

export type CreateResult = { ok: true; user: User } | { ok: false; error: string };

type UsersState = {
  users: User[];
  /** Replace the list with data fetched from the server (startup hydration). */
  setUsers: (users: User[]) => void;
  emailExists: (email: string, exceptId?: string) => boolean;
  getById: (id: string) => User | undefined;
  createUser: (draft: UserDraft) => CreateResult;
  updateUser: (id: string, patch: Partial<UserDraft>) => CreateResult;
  deleteUser: (id: string) => { ok: boolean; error?: string };
  toggleStatus: (id: string) => void;
};

export const useUsersStore = create<UsersState>((set, get) => ({
  // Empty until hydrated from the database (see src/bootstrap.ts).
  users: [],

  setUsers: (users) => set({ users }),

  emailExists: (email, exceptId) =>
    get().users.some(
      (u) =>
        u.email.toLowerCase() === email.trim().toLowerCase() &&
        u.id !== exceptId,
    ),

  getById: (id) => get().users.find((u) => u.id === id),

  createUser: (draft) => {
    const email = draft.email.trim().toLowerCase();
    if (get().emailExists(email)) {
      return { ok: false, error: "Cet email est déjà utilisé." };
    }
    const user: User = {
      id: uid(),
      email,
      username: draft.username.trim(),
      password: draft.password.trim(),
      status: draft.status,
      role: draft.role,
      createdAt: nowISO(),
      updatedAt: nowISO(),
    };
    set((st) => {
      const users = [...st.users, user];
      saveUsers(users);
      return { users };
    });
    return { ok: true, user };
  },

  updateUser: (id, patch) => {
    if (patch.email && get().emailExists(patch.email, id)) {
      return { ok: false, error: "Cet email est déjà utilisé." };
    }
    let updated: User | undefined;
    set((st) => {
      const users = st.users.map((u) => {
        if (u.id !== id) return u;
        updated = {
          ...u,
          ...patch,
          email: patch.email ? patch.email.trim().toLowerCase() : u.email,
          username: patch.username?.trim() ?? u.username,
          password: patch.password?.trim() ?? u.password,
          updatedAt: nowISO(),
        };
        return updated;
      });
      saveUsers(users);
      return { users };
    });
    return updated
      ? { ok: true, user: updated }
      : { ok: false, error: "Utilisateur introuvable." };
  },

  deleteUser: (id) => {
    const user = get().getById(id);
    if (!user) return { ok: false, error: "Utilisateur introuvable." };
    if (user.email === PRIMARY_ADMIN_EMAIL) {
      return {
        ok: false,
        error: "Le compte administrateur principal ne peut pas être supprimé.",
      };
    }
    set((st) => {
      const users = st.users.filter((u) => u.id !== id);
      saveUsers(users);
      return { users };
    });
    return { ok: true };
  },

  toggleStatus: (id) =>
    set((st) => {
      const users = st.users.map((u) =>
        u.id === id
          ? {
              ...u,
              status: (u.status === "active"
                ? "inactive"
                : "active") as UserStatus,
              updatedAt: nowISO(),
            }
          : u,
      );
      saveUsers(users);
      return { users };
    }),
}));

export type LoginResult =
  | { ok: true; role: UserRole }
  | { ok: false; error: string };

type AuthState = {
  session: AuthSession | null;
  login: (
    email: string,
    password: string,
    rememberMe: boolean,
  ) => Promise<LoginResult>;
  logout: () => void;
  /** Returns the current valid user, or null (also logs out if invalid). */
  refreshSession: () => User | null;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  session: loadSession(),

  // Authoritative check against the database, so newly created accounts
  // always work regardless of what this client has cached in memory.
  login: async (email, password, rememberMe) => {
    const result = await apiLogin(email, password);
    if (!result.ok) return { ok: false, error: result.error };

    const user = result.user;
    // Make sure the logged-in user is available to guards/useCurrentUser
    // even if it was created after this client last hydrated.
    const store = useUsersStore.getState();
    if (!store.users.some((u) => u.id === user.id)) {
      store.setUsers([...store.users, user]);
    }

    const session: AuthSession = {
      userId: user.id,
      email: user.email,
      role: user.role,
      rememberMe,
      loggedInAt: nowISO(),
    };
    saveSession(session);
    set({ session });
    return { ok: true, role: user.role };
  },

  logout: () => {
    saveSession(null);
    set({ session: null });
  },

  refreshSession: () => {
    const { session } = get();
    if (!session) return null;
    const user = useUsersStore.getState().getById(session.userId);
    // Session is invalid if the user was deleted or deactivated.
    if (!user || user.status === "inactive") {
      saveSession(null);
      set({ session: null });
      return null;
    }
    return user;
  },
}));

/** Hook: the currently authenticated user object (or null). */
export function useCurrentUser(): User | null {
  const session = useAuthStore((s) => s.session);
  const users = useUsersStore((s) => s.users);
  if (!session) return null;
  const user = users.find((u) => u.id === session.userId);
  if (!user || user.status === "inactive") return null;
  return user;
}
