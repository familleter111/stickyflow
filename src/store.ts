import { useMemo } from "react";
import { create } from "zustand";
import type {
  Note,
  NoteStatus,
  ChecklistItem,
  SortKey,
  ViewKey,
} from "./types";
import { STATUS_ORDER } from "./types";
import { saveNotes } from "./storage";

const uid = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

// Persist the whole collection to the database (fire-and-forget).
function persist(notes: Note[]) {
  saveNotes(notes);
}

export type NoteDraft = Omit<Note, "id" | "createdAt" | "updatedAt">;

export type Toast = {
  id: string;
  message: string;
  actionLabel?: string;
  action?: () => void;
};

type StatusFilter = NoteStatus | "all";

type State = {
  notes: Note[];
  /** Id of the user whose board is currently displayed (data isolation). */
  currentUserId: string | null;
  view: ViewKey;
  search: string;
  statusFilter: StatusFilter;
  sort: SortKey;
  sortDir: "asc" | "desc";
  toasts: Toast[];

  /** Replace all notes with data fetched from the server (startup hydration). */
  setNotes: (notes: Note[]) => void;
  setCurrentUser: (userId: string | null) => void;
  getNotesByUser: (userId: string) => Note[];
  deleteUserNotes: (userId: string) => void;

  setView: (v: ViewKey) => void;
  setSearch: (s: string) => void;
  setStatusFilter: (s: StatusFilter) => void;
  setSort: (s: SortKey) => void;
  toggleSortDir: () => void;

  addNote: (draft: NoteDraft) => Note;
  updateNote: (id: string, patch: Partial<Note>) => void;
  setStatus: (id: string, status: NoteStatus) => void;
  toggleFavorite: (id: string) => void;
  togglePin: (id: string) => void;
  toggleArchive: (id: string) => void;
  setColor: (id: string, color: Note["color"]) => void;

  toggleChecklistItem: (noteId: string, itemId: string) => void;
  addChecklistItem: (noteId: string, label: string) => void;

  trashNote: (id: string) => void;
  restoreNote: (id: string) => void;
  deleteForever: (id: string) => void;
  emptyTrash: () => void;

  pushToast: (t: Omit<Toast, "id">) => void;
  dismissToast: (id: string) => void;
};

function touch(notes: Note[], id: string, patch: Partial<Note>): Note[] {
  return notes.map((n) =>
    n.id === id ? { ...n, ...patch, updatedAt: new Date().toISOString() } : n,
  );
}

export const useStore = create<State>((set, get) => ({
  // Empty until hydrated from the database (see src/bootstrap.ts).
  notes: [],
  currentUserId: null,
  view: "all",
  search: "",
  statusFilter: "all",
  sort: "updated",
  sortDir: "desc",
  toasts: [],

  setNotes: (notes) => set({ notes }),
  setCurrentUser: (userId) => set({ currentUserId: userId }),

  getNotesByUser: (userId) =>
    get().notes.filter((n) => n.userId === userId),

  deleteUserNotes: (userId) =>
    set((st) => {
      const notes = st.notes.filter((n) => n.userId !== userId);
      persist(notes);
      return { notes };
    }),

  setView: (v) => set({ view: v }),
  setSearch: (s) => set({ search: s }),
  setStatusFilter: (s) => set({ statusFilter: s }),
  setSort: (s) => set({ sort: s }),
  toggleSortDir: () =>
    set((st) => ({ sortDir: st.sortDir === "asc" ? "desc" : "asc" })),

  addNote: (draft) => {
    const note: Note = {
      ...draft,
      id: uid(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    set((st) => {
      const notes = [note, ...st.notes];
      persist(notes);
      return { notes };
    });
    return note;
  },

  updateNote: (id, patch) =>
    set((st) => {
      const notes = touch(st.notes, id, patch);
      persist(notes);
      return { notes };
    }),

  setStatus: (id, status) =>
    set((st) => {
      const notes = touch(st.notes, id, { status });
      persist(notes);
      return { notes };
    }),

  toggleFavorite: (id) =>
    set((st) => {
      const cur = st.notes.find((n) => n.id === id);
      const notes = touch(st.notes, id, { isFavorite: !cur?.isFavorite });
      persist(notes);
      return { notes };
    }),

  togglePin: (id) =>
    set((st) => {
      const cur = st.notes.find((n) => n.id === id);
      const notes = touch(st.notes, id, { isPinned: !cur?.isPinned });
      persist(notes);
      return { notes };
    }),

  toggleArchive: (id) =>
    set((st) => {
      const cur = st.notes.find((n) => n.id === id);
      const notes = touch(st.notes, id, { isArchived: !cur?.isArchived });
      persist(notes);
      return { notes };
    }),

  setColor: (id, color) =>
    set((st) => {
      const notes = touch(st.notes, id, { color });
      persist(notes);
      return { notes };
    }),

  toggleChecklistItem: (noteId, itemId) =>
    set((st) => {
      const notes = st.notes.map((n) => {
        if (n.id !== noteId) return n;
        return {
          ...n,
          checklist: n.checklist.map((it) =>
            it.id === itemId ? { ...it, checked: !it.checked } : it,
          ),
          updatedAt: new Date().toISOString(),
        };
      });
      persist(notes);
      return { notes };
    }),

  addChecklistItem: (noteId, label) =>
    set((st) => {
      const notes = st.notes.map((n) => {
        if (n.id !== noteId) return n;
        const item: ChecklistItem = {
          id: uid(),
          label,
          checked: false,
          order: n.checklist.length,
        };
        return {
          ...n,
          checklist: [...n.checklist, item],
          updatedAt: new Date().toISOString(),
        };
      });
      persist(notes);
      return { notes };
    }),

  trashNote: (id) =>
    set((st) => {
      const notes = touch(st.notes, id, { isDeleted: true, isPinned: false });
      persist(notes);
      return { notes };
    }),

  restoreNote: (id) =>
    set((st) => {
      const notes = touch(st.notes, id, { isDeleted: false });
      persist(notes);
      return { notes };
    }),

  deleteForever: (id) =>
    set((st) => {
      const notes = st.notes.filter((n) => n.id !== id);
      persist(notes);
      return { notes };
    }),

  emptyTrash: () =>
    set((st) => {
      const notes = st.notes.filter((n) => !n.isDeleted);
      persist(notes);
      return { notes };
    }),

  pushToast: (t) => {
    const id = uid();
    set((st) => ({ toasts: [...st.toasts, { ...t, id }] }));
    setTimeout(() => get().dismissToast(id), 5000);
  },

  dismissToast: (id) =>
    set((st) => ({ toasts: st.toasts.filter((t) => t.id !== id) })),
}));

/** Derived selectors (pure helpers). */
export function visibleNotes(st: State): Note[] {
  const { notes, currentUserId, view, search, statusFilter, sort, sortDir } =
    st;
  // Data isolation: only ever operate on the current user's notes.
  let list = currentUserId
    ? notes.filter((n) => n.userId === currentUserId)
    : [];

  // view scope
  if (view === "trash") {
    list = list.filter((n) => n.isDeleted);
  } else if (view === "archived") {
    list = list.filter((n) => n.isArchived && !n.isDeleted);
  } else if (view === "favorites") {
    list = list.filter((n) => n.isFavorite && !n.isDeleted && !n.isArchived);
  } else if (typeof view === "object" && "tag" in view) {
    list = list.filter(
      (n) => n.tag === view.tag && !n.isDeleted && !n.isArchived,
    );
  } else {
    // all
    list = list.filter((n) => !n.isDeleted && !n.isArchived);
  }

  if (statusFilter !== "all") {
    list = list.filter((n) => n.status === statusFilter);
  }

  const q = search.trim().toLowerCase();
  if (q) {
    list = list.filter((n) => {
      const inText = (n.title + " " + n.content).toLowerCase().includes(q);
      const inCheck = n.checklist.some((c) =>
        c.label.toLowerCase().includes(q),
      );
      const inTag = n.tag.toLowerCase().includes(q);
      return inText || inCheck || inTag;
    });
  }

  const dir = sortDir === "asc" ? 1 : -1;
  list.sort((a, b) => {
    // pinned always float to top (only in board-like views)
    if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
    let cmp = 0;
    if (sort === "title") cmp = a.title.localeCompare(b.title);
    else if (sort === "status")
      cmp =
        STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status);
    else if (sort === "created")
      cmp = a.createdAt.localeCompare(b.createdAt);
    else cmp = a.updatedAt.localeCompare(b.updatedAt);
    return cmp * dir;
  });

  return list;
}

/** Stable empty reference so the "no user" case never returns a fresh array. */
const NO_NOTES: Note[] = [];

/** Hook: the current user's notes (already isolated by userId). */
export function useMyNotes(): Note[] {
  // Select stable values (the notes array ref + a primitive) and derive with
  // useMemo. Returning a freshly-built array straight from the selector would
  // make zustand's useSyncExternalStore see a new snapshot on every render and
  // throw "Maximum update depth exceeded".
  const notes = useStore((s) => s.notes);
  const currentUserId = useStore((s) => s.currentUserId);
  return useMemo(
    () =>
      currentUserId ? notes.filter((n) => n.userId === currentUserId) : NO_NOTES,
    [notes, currentUserId],
  );
}

export function counts(notes: Note[]) {
  const active = notes.filter((n) => !n.isDeleted && !n.isArchived);
  return {
    total: active.length,
    todo: active.filter((n) => n.status === "todo").length,
    in_progress: active.filter((n) => n.status === "in_progress").length,
    done: active.filter((n) => n.status === "done").length,
    favorites: notes.filter((n) => n.isFavorite && !n.isDeleted).length,
    archived: notes.filter((n) => n.isArchived && !n.isDeleted).length,
    trash: notes.filter((n) => n.isDeleted).length,
    byTag: (tag: string) =>
      active.filter((n) => n.tag === tag).length,
  };
}
