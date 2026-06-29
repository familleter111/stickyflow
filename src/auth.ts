import { create } from "zustand";
import type { User, AuthSession, UserStatus, UserRole } from "./types";
import { PRIMARY_ADMIN_EMAIL } from "./types";

/* ------------------------------------------------------------------ *
 * SECURITY NOTE — read before shipping
 * ------------------------------------------------------------------ *
 * This is a frontend / localStorage MVP. It is NOT secure for
 * production:
 *  - Auth state lives in localStorage/sessionStorage and can be read or
 *    tampered with by anyone on the device.
 *  - Passwords are stored in PLAIN TEXT. In a real app they must be
 *    hashed (bcrypt/argon2) server-side and never sent back to the client.
 *  - Real authentication should use a backend with JWT or HTTP-only
 *    session cookies, password hashing, and access-control middleware.
 * ------------------------------------------------------------------ */

const USERS_KEY = "stickyflow_users";
const SESSION_KEY = "stickyflow_auth_session";

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
const daysAgo = (d: number) =>
  new Date(Date.now() - d * 86400000).toISOString();

function buildSeedUsers(): User[] {
  return [
    {
      id: SEED_IDS.admin,
      email: PRIMARY_ADMIN_EMAIL,
      username: "Admin",
      password: "Admin1234?",
      status: "active",
      role: "admin",
      createdAt: daysAgo(120),
      updatedAt: daysAgo(120),
    },
    {
      id: SEED_IDS.marie,
      email: "marie@email.com",
      username: "marie",
      password: "marie123",
      status: "active",
      role: "user",
      createdAt: daysAgo(60),
      updatedAt: daysAgo(12),
    },
    {
      id: SEED_IDS.lucas,
      email: "lucas@email.com",
      username: "lucas",
      password: "lucas123",
      status: "active",
      role: "user",
      createdAt: daysAgo(30),
      updatedAt: daysAgo(5),
    },
    {
      id: SEED_IDS.sophie,
      email: "sophie@email.com",
      username: "sophie",
      password: "sophie123",
      status: "inactive",
      role: "user",
      createdAt: daysAgo(8),
      updatedAt: daysAgo(2),
    },
  ];
}

function loadUsers(): User[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length) {
        // Ensure the primary admin always exists (don't reset other data).
        const hasAdmin = parsed.some(
          (u: User) => u.email === PRIMARY_ADMIN_EMAIL,
        );
        if (!hasAdmin) {
          parsed.unshift(buildSeedUsers()[0]);
          saveUsers(parsed);
        }
        return parsed as User[];
      }
    }
  } catch {
    /* ignore corrupt storage */
  }
  const seed = buildSeedUsers();
  saveUsers(seed);
  return seed;
}

function saveUsers(users: User[]) {
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  } catch {
    /* ignore */
  }
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
  emailExists: (email: string, exceptId?: string) => boolean;
  getById: (id: string) => User | undefined;
  createUser: (draft: UserDraft) => CreateResult;
  updateUser: (id: string, patch: Partial<UserDraft>) => CreateResult;
  deleteUser: (id: string) => { ok: boolean; error?: string };
  toggleStatus: (id: string) => void;
};

export const useUsersStore = create<UsersState>((set, get) => ({
  users: loadUsers(),

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
      password: draft.password,
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
  login: (email: string, password: string, rememberMe: boolean) => LoginResult;
  logout: () => void;
  /** Returns the current valid user, or null (also logs out if invalid). */
  refreshSession: () => User | null;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  session: loadSession(),

  login: (email, password, rememberMe) => {
    const users = useUsersStore.getState().users;
    const user = users.find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase(),
    );
    // Generic message so we don't reveal which field was wrong.
    if (!user || user.password !== password) {
      return { ok: false, error: "Email ou mot de passe incorrect." };
    }
    if (user.status === "inactive") {
      return {
        ok: false,
        error:
          "Votre compte est désactivé. Veuillez contacter l'administrateur.",
      };
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
