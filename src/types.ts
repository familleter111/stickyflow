export type NoteStatus = "todo" | "in_progress" | "done";

export type NoteColor =
  | "yellow"
  | "pink"
  | "blue"
  | "green"
  | "purple"
  | "mint";

export type ChecklistItem = {
  id: string;
  label: string;
  checked: boolean;
  order: number;
};

export type Note = {
  id: string;
  /** Owner of the note. A normal user only ever sees notes with their own id. */
  userId: string;
  title: string;
  content: string;
  status: NoteStatus;
  color: NoteColor;
  tag: string;
  isFavorite: boolean;
  isPinned: boolean;
  isArchived: boolean;
  isDeleted: boolean;
  reminderAt?: string | null;
  checklist: ChecklistItem[];
  createdAt: string;
  updatedAt: string;
};

export const STATUS_LABELS: Record<NoteStatus, string> = {
  todo: "À faire",
  in_progress: "En cours",
  done: "Terminée",
};

export const STATUS_ORDER: NoteStatus[] = ["todo", "in_progress", "done"];

/** Tailwind classes for status badges (text + bg + dot). */
export const STATUS_STYLES: Record<
  NoteStatus,
  { badge: string; dot: string; ring: string }
> = {
  todo: {
    badge: "bg-blue-50 text-blue-700 border-blue-200",
    dot: "bg-blue-500",
    ring: "ring-blue-400",
  },
  in_progress: {
    badge: "bg-amber-50 text-amber-700 border-amber-200",
    dot: "bg-amber-500",
    ring: "ring-amber-400",
  },
  done: {
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
    ring: "ring-emerald-400",
  },
};

/** Pastel note surfaces — background, border, folded-corner color, accent. */
export const NOTE_COLOR_STYLES: Record<
  NoteColor,
  { bg: string; border: string; fold: string; label: string; swatch: string }
> = {
  yellow: {
    bg: "bg-[#fdf6d8]",
    border: "border-[#f3e6a8]",
    fold: "#f3e3a0",
    label: "Jaune",
    swatch: "#fbe58a",
  },
  pink: {
    bg: "bg-[#fde4ea]",
    border: "border-[#f6c6d3]",
    fold: "#f6bccb",
    label: "Rose",
    swatch: "#f7aac0",
  },
  blue: {
    bg: "bg-[#e3eefe]",
    border: "border-[#c4d9fb]",
    fold: "#bcd2fa",
    label: "Bleu",
    swatch: "#9cc0fb",
  },
  green: {
    bg: "bg-[#e1f6e8]",
    border: "border-[#bfe9cd]",
    fold: "#b6e6c5",
    label: "Vert",
    swatch: "#93e0b0",
  },
  purple: {
    bg: "bg-[#ede4fb]",
    border: "border-[#d6c4f6]",
    fold: "#d0bbf5",
    label: "Violet",
    swatch: "#c4a8f5",
  },
  mint: {
    bg: "bg-[#def7f1]",
    border: "border-[#bbece0]",
    fold: "#b2eadd",
    label: "Menthe",
    swatch: "#9ce4d5",
  },
};

export const NOTE_COLORS: NoteColor[] = [
  "yellow",
  "pink",
  "blue",
  "green",
  "purple",
  "mint",
];

export type Tag = {
  name: string;
  color: string;
};

export const TAGS: Tag[] = [
  { name: "Travail", color: "#3b82f6" },
  { name: "Personnel", color: "#22c55e" },
  { name: "Idées", color: "#a855f7" },
  { name: "Courses", color: "#ec4899" },
  { name: "Rappels", color: "#f59e0b" },
  { name: "Finance", color: "#14b8a6" },
];

export const TAG_COLOR: Record<string, string> = TAGS.reduce(
  (acc, t) => {
    acc[t.name] = t.color;
    return acc;
  },
  {} as Record<string, string>,
);

export type SortKey = "updated" | "created" | "status" | "title";

export const SORT_LABELS: Record<SortKey, string> = {
  updated: "Date de modification",
  created: "Date de création",
  status: "Statut",
  title: "Titre",
};

export type ViewKey =
  | "all"
  | "favorites"
  | "archived"
  | "trash"
  | { tag: string };

/* ------------------------------------------------------------------ */
/* Authentication & users                                              */
/* ------------------------------------------------------------------ */

export type UserStatus = "active" | "inactive";
export type UserRole = "admin" | "user";

export type User = {
  id: string;
  email: string;
  username: string;
  // Demo only. Passwords must be hashed server-side in production —
  // never store plain-text passwords in a real application.
  password: string;
  status: UserStatus;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
};

export type AuthSession = {
  userId: string;
  email: string;
  role: UserRole;
  rememberMe: boolean;
  loggedInAt: string;
};

/** Email of the built-in primary admin account (cannot be deleted). */
export const PRIMARY_ADMIN_EMAIL = "admin@email.com";
