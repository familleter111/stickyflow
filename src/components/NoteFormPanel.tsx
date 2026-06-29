import { useEffect, useState } from "react";
import {
  X,
  Plus,
  Trash2,
  GripVertical,
  ChevronUp,
  ChevronDown,
  Star,
  Check,
} from "lucide-react";
import type {
  Note,
  NoteColor,
  NoteStatus,
  ChecklistItem,
} from "../types";
import {
  NOTE_COLORS,
  NOTE_COLOR_STYLES,
  STATUS_LABELS,
  STATUS_ORDER,
  STATUS_STYLES,
  TAGS,
} from "../types";
import { useStore, type NoteDraft } from "../store";
import { useCurrentUser } from "../auth";
import { useEscape } from "../lib/hooks";

type Props = {
  mode: "create" | "edit";
  note?: Note | null;
  onClose: () => void;
};

const uid = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

function emptyDraft(): NoteDraft {
  return {
    userId: "", // filled in from the current user on save
    title: "",
    content: "",
    status: "todo",
    color: "yellow",
    tag: TAGS[0].name,
    isFavorite: false,
    isPinned: false,
    isArchived: false,
    isDeleted: false,
    reminderAt: null,
    checklist: [],
  };
}

export default function NoteFormPanel({ mode, note, onClose }: Props) {
  const addNote = useStore((s) => s.addNote);
  const updateNote = useStore((s) => s.updateNote);
  const pushToast = useStore((s) => s.pushToast);
  const currentUser = useCurrentUser();

  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<NoteDraft>(emptyDraft);
  const [newItem, setNewItem] = useState("");

  useEffect(() => {
    const id = requestAnimationFrame(() => setOpen(true));
    return () => cancelAnimationFrame(id);
  }, []);

  useEscape(() => handleClose());

  useEffect(() => {
    if (mode === "edit" && note) {
      const { ...rest } = note;
      setDraft({
        userId: rest.userId,
        title: rest.title,
        content: rest.content,
        status: rest.status,
        color: rest.color,
        tag: rest.tag,
        isFavorite: rest.isFavorite,
        isPinned: rest.isPinned,
        isArchived: rest.isArchived,
        isDeleted: rest.isDeleted,
        reminderAt: rest.reminderAt ?? null,
        checklist: rest.checklist.map((c) => ({ ...c })),
      });
    } else {
      setDraft(emptyDraft());
    }
  }, [mode, note]);

  const set = <K extends keyof NoteDraft>(key: K, val: NoteDraft[K]) =>
    setDraft((d) => ({ ...d, [key]: val }));

  const handleClose = () => {
    setOpen(false);
    setTimeout(onClose, 220);
  };

  const save = () => {
    const cleaned: NoteDraft = {
      ...draft,
      // Data isolation: new notes always belong to the current user.
      userId: mode === "edit" ? draft.userId : currentUser?.id ?? draft.userId,
      title: draft.title.trim() || "Sans titre",
      checklist: draft.checklist
        .filter((c) => c.label.trim())
        .map((c, i) => ({ ...c, order: i })),
    };
    if (mode === "edit" && note) {
      updateNote(note.id, cleaned);
      pushToast({ message: "Note mise à jour" });
    } else {
      addNote(cleaned);
      pushToast({ message: "Note créée" });
    }
    handleClose();
  };

  // checklist ops
  const addItem = (label: string) => {
    const text = label.trim();
    if (!text) return;
    const item: ChecklistItem = {
      id: uid(),
      label: text,
      checked: false,
      order: draft.checklist.length,
    };
    set("checklist", [...draft.checklist, item]);
    setNewItem("");
  };
  const updateItem = (id: string, patch: Partial<ChecklistItem>) =>
    set(
      "checklist",
      draft.checklist.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    );
  const removeItem = (id: string) =>
    set(
      "checklist",
      draft.checklist.filter((c) => c.id !== id),
    );
  const move = (id: string, dir: -1 | 1) => {
    const list = [...draft.checklist];
    const idx = list.findIndex((c) => c.id === id);
    const next = idx + dir;
    if (next < 0 || next >= list.length) return;
    [list[idx], list[next]] = [list[next], list[idx]];
    set(
      "checklist",
      list.map((c, i) => ({ ...c, order: i })),
    );
  };

  return (
    <div className="fixed inset-0 z-[100]">
      <div
        onClick={handleClose}
        className="absolute inset-0 bg-slate-900/30 backdrop-blur-[2px] transition-opacity duration-200"
        style={{ opacity: open ? 1 : 0 }}
      />
      <div
        className="absolute right-0 top-0 flex h-full w-full max-w-[460px] flex-col bg-white shadow-panel transition-transform duration-[240ms] ease-out"
        style={{ transform: open ? "translateX(0)" : "translateX(100%)" }}
      >
        <FormInner
          mode={mode}
          draft={draft}
          set={set}
          newItem={newItem}
          setNewItem={setNewItem}
          addItem={addItem}
          updateItem={updateItem}
          removeItem={removeItem}
          move={move}
          onClose={handleClose}
          save={save}
        />
      </div>
    </div>
  );
}

type InnerProps = {
  mode: "create" | "edit";
  draft: NoteDraft;
  set: <K extends keyof NoteDraft>(key: K, val: NoteDraft[K]) => void;
  newItem: string;
  setNewItem: (s: string) => void;
  addItem: (label: string) => void;
  updateItem: (id: string, patch: Partial<ChecklistItem>) => void;
  removeItem: (id: string) => void;
  move: (id: string, dir: -1 | 1) => void;
  onClose: () => void;
  save: () => void;
};

function FormInner({
  mode,
  draft,
  set,
  newItem,
  setNewItem,
  addItem,
  updateItem,
  removeItem,
  move,
  onClose,
  save,
}: InnerProps) {
  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
        <div>
          <h2 className="text-lg font-extrabold text-slate-800">
            {mode === "edit" ? "Modifier la note" : "Nouvelle note"}
          </h2>
          <p className="text-xs text-slate-400">
            {mode === "edit"
              ? "Mettez à jour les détails de votre note"
              : "Ajoutez les détails de votre nouvelle note"}
          </p>
        </div>
        <button
          onClick={onClose}
          className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          aria-label="Fermer"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
        <Field label="Titre de la note">
          <input
            autoFocus
            value={draft.title}
            onChange={(e) => set("title", e.target.value)}
            placeholder="Ex : Réunion de lancement"
            className="input"
          />
        </Field>

        <Field label="Description">
          <textarea
            value={draft.content}
            onChange={(e) => set("content", e.target.value)}
            rows={3}
            placeholder="Écrivez le contenu de votre note..."
            className="input resize-none"
          />
        </Field>

        {/* Status */}
        <Field label="Statut">
          <div className="grid grid-cols-3 gap-2">
            {STATUS_ORDER.map((s) => {
              const active = draft.status === s;
              const st = STATUS_STYLES[s];
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => set("status", s as NoteStatus)}
                  className={[
                    "flex items-center justify-center gap-1.5 rounded-xl border px-2 py-2.5 text-xs font-semibold transition",
                    active
                      ? `${st.badge} ring-2 ${st.ring} ring-offset-1`
                      : "border-slate-200 text-slate-500 hover:bg-slate-50",
                  ].join(" ")}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${st.dot}`} />
                  {STATUS_LABELS[s]}
                </button>
              );
            })}
          </div>
        </Field>

        {/* Tag */}
        <Field label="Tag / Catégorie">
          <div className="flex flex-wrap gap-2">
            {TAGS.map((tag) => {
              const active = draft.tag === tag.name;
              return (
                <button
                  key={tag.name}
                  type="button"
                  onClick={() => set("tag", tag.name)}
                  className={[
                    "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition",
                    active
                      ? "border-slate-800 bg-slate-800 text-white"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50",
                  ].join(" ")}
                >
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ background: tag.color }}
                  />
                  {tag.name}
                </button>
              );
            })}
          </div>
        </Field>

        {/* Checklist builder */}
        <Field label="Liste de tâches">
          <div className="space-y-2">
            {draft.checklist.map((it, idx) => (
              <div
                key={it.id}
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/50 px-2 py-1.5"
              >
                <div className="flex flex-col text-slate-300">
                  <button
                    type="button"
                    onClick={() => move(it.id, -1)}
                    disabled={idx === 0}
                    className="hover:text-slate-500 disabled:opacity-30"
                    aria-label="Monter"
                  >
                    <ChevronUp className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => move(it.id, 1)}
                    disabled={idx === draft.checklist.length - 1}
                    className="hover:text-slate-500 disabled:opacity-30"
                    aria-label="Descendre"
                  >
                    <ChevronDown className="h-3.5 w-3.5" />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => updateItem(it.id, { checked: !it.checked })}
                  className={[
                    "flex h-[18px] w-[18px] flex-none items-center justify-center rounded-[6px] border transition",
                    it.checked
                      ? "border-blue-500 bg-blue-500"
                      : "border-slate-300 bg-white",
                  ].join(" ")}
                  aria-label="Cocher"
                >
                  {it.checked && (
                    <Check className="h-3 w-3 text-white" strokeWidth={3} />
                  )}
                </button>
                <input
                  value={it.label}
                  onChange={(e) =>
                    updateItem(it.id, { label: e.target.value })
                  }
                  placeholder="Élément..."
                  className={[
                    "flex-1 bg-transparent text-sm outline-none",
                    it.checked
                      ? "text-slate-400 line-through"
                      : "text-slate-700",
                  ].join(" ")}
                />
                <button
                  type="button"
                  onClick={() => removeItem(it.id)}
                  className="rounded-lg p-1 text-slate-300 transition hover:bg-rose-50 hover:text-rose-500"
                  aria-label="Supprimer l'élément"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}

            <div className="flex items-center gap-2 rounded-xl border border-dashed border-slate-300 px-2.5 py-1.5">
              <GripVertical className="h-4 w-4 text-slate-300" />
              <input
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addItem(newItem);
                  }
                }}
                placeholder="Nouvel élément..."
                className="flex-1 bg-transparent text-sm text-slate-700 outline-none"
              />
              <button
                type="button"
                onClick={() => addItem(newItem)}
                className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600 transition hover:bg-slate-200"
              >
                <Plus className="h-3.5 w-3.5" /> Ajouter
              </button>
            </div>
            <p className="text-[11px] text-slate-400">
              Appuyez sur Entrée pour ajouter rapidement un élément.
            </p>
          </div>
        </Field>

        {/* Color */}
        <Field label="Couleur de la note">
          <div className="flex flex-wrap gap-2.5">
            {NOTE_COLORS.map((col) => {
              const c = NOTE_COLOR_STYLES[col];
              const active = draft.color === col;
              return (
                <button
                  key={col}
                  type="button"
                  onClick={() => set("color", col as NoteColor)}
                  title={c.label}
                  aria-label={c.label}
                  className={[
                    "flex h-9 w-9 items-center justify-center rounded-full border transition hover:scale-110",
                    active
                      ? "ring-2 ring-slate-900 ring-offset-2"
                      : "border-black/10",
                  ].join(" ")}
                  style={{ background: c.swatch }}
                >
                  {active && (
                    <Check
                      className="h-4 w-4 text-slate-800"
                      strokeWidth={3}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </Field>

        {/* Reminder + Favorite */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Rappel">
            <input
              type="datetime-local"
              value={toLocalInput(draft.reminderAt ?? null)}
              onChange={(e) =>
                set(
                  "reminderAt",
                  e.target.value
                    ? new Date(e.target.value).toISOString()
                    : null,
                )
              }
              className="input"
            />
          </Field>
          <Field label="Favori">
            <button
              type="button"
              onClick={() => set("isFavorite", !draft.isFavorite)}
              className={[
                "flex h-[42px] w-full items-center justify-center gap-2 rounded-xl border text-sm font-semibold transition",
                draft.isFavorite
                  ? "border-amber-200 bg-amber-50 text-amber-700"
                  : "border-slate-200 text-slate-500 hover:bg-slate-50",
              ].join(" ")}
            >
              <Star
                className={`h-4 w-4 ${
                  draft.isFavorite ? "fill-amber-400 text-amber-500" : ""
                }`}
              />
              {draft.isFavorite ? "Dans les favoris" : "Ajouter aux favoris"}
            </button>
          </Field>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-3 border-t border-slate-100 px-6 py-4">
        <button
          onClick={onClose}
          className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
        >
          Annuler
        </button>
        <button
          onClick={save}
          className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-blue-600/20 transition hover:bg-blue-700 active:scale-[0.98]"
        >
          {mode === "edit" ? "Mettre à jour" : "Enregistrer la note"}
        </button>
      </div>
    </>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-400">
        {label}
      </span>
      {children}
    </label>
  );
}

function toLocalInput(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`;
}
