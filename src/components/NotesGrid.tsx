import { StickyNote, Trash2 } from "lucide-react";
import type { Note } from "../types";
import { useStore } from "../store";
import NoteCard from "./NoteCard";

type Props = {
  notes: Note[];
  onEdit: (note: Note) => void;
  onRequestDelete: (note: Note) => void;
  onNewNote: () => void;
};

export default function NotesGrid({
  notes,
  onEdit,
  onRequestDelete,
  onNewNote,
}: Props) {
  const view = useStore((s) => s.view);
  const emptyTrash = useStore((s) => s.emptyTrash);

  if (notes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white/60 py-20 text-center">
        <div className="grid h-16 w-16 place-items-center rounded-2xl bg-slate-50 text-slate-300">
          <StickyNote className="h-8 w-8" />
        </div>
        <h3 className="mt-4 text-lg font-bold text-slate-700">
          Aucune note ici
        </h3>
        <p className="mt-1 max-w-xs text-sm text-slate-400">
          {view === "trash"
            ? "La corbeille est vide."
            : "Créez votre première note pour commencer à vous organiser."}
        </p>
        {view !== "trash" && (
          <button
            onClick={onNewNote}
            className="mt-5 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            + Nouvelle note
          </button>
        )}
      </div>
    );
  }

  return (
    <div>
      {view === "trash" && (
        <div className="mb-4 flex items-center justify-between rounded-2xl border border-rose-100 bg-rose-50/50 px-4 py-3">
          <span className="text-sm text-rose-700">
            Les notes supprimées peuvent être restaurées.
          </span>
          <button
            onClick={emptyTrash}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold text-rose-600 transition hover:bg-rose-100"
          >
            <Trash2 className="h-4 w-4" /> Vider la corbeille
          </button>
        </div>
      )}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {notes.map((note) => (
          <NoteCard
            key={note.id}
            note={note}
            onEdit={onEdit}
            onRequestDelete={onRequestDelete}
          />
        ))}
      </div>
    </div>
  );
}
