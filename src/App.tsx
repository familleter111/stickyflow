import { useMemo, useState } from "react";
import type { Note } from "./types";
import { useStore, visibleNotes } from "./store";
import Sidebar from "./components/Sidebar";
import TopBar from "./components/TopBar";
import StatsSummary from "./components/StatsSummary";
import StatusFilterBar from "./components/StatusFilterBar";
import NotesGrid from "./components/NotesGrid";
import NoteFormPanel from "./components/NoteFormPanel";
import DeleteNoteModal from "./components/DeleteNoteModal";
import FloatingWidget from "./components/FloatingWidget";
import Toasts from "./components/Toasts";

type Panel =
  | { type: "none" }
  | { type: "create" }
  | { type: "edit"; note: Note };

export default function App() {
  const state = useStore();
  const notes = useMemo(() => visibleNotes(state), [state]);

  const [panel, setPanel] = useState<Panel>({ type: "none" });
  const [deleting, setDeleting] = useState<Note | null>(null);
  const [widgetOpen, setWidgetOpen] = useState(false);

  const trashNote = useStore((s) => s.trashNote);
  const restoreNote = useStore((s) => s.restoreNote);
  const pushToast = useStore((s) => s.pushToast);

  const viewTitle = useMemo(() => {
    const v = state.view;
    if (v === "all") return "Toutes les notes";
    if (v === "favorites") return "Favoris";
    if (v === "archived") return "Archivées";
    if (v === "trash") return "Corbeille";
    if (typeof v === "object") return v.tag;
    return "Notes";
  }, [state.view]);

  const confirmDelete = () => {
    if (!deleting) return;
    const note = deleting;
    trashNote(note.id);
    setDeleting(null);
    pushToast({
      message: "Note déplacée vers la corbeille",
      actionLabel: "Annuler",
      action: () => restoreNote(note.id),
    });
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#f6f8fb]">
      <Sidebar onOpenWidget={() => setWidgetOpen(true)} />

      <main className="flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <div className="flex-none border-b border-slate-200 bg-[#f6f8fb]/80 px-6 py-4 backdrop-blur">
          <TopBar onNewNote={() => setPanel({ type: "create" })} />
        </div>

        {/* Scroll area */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="mx-auto max-w-[1400px] space-y-6">
            <StatsSummary />

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="text-xl font-extrabold text-slate-800">
                  {viewTitle}
                </h1>
                <p className="text-sm text-slate-400">
                  {notes.length} note{notes.length > 1 ? "s" : ""}
                </p>
              </div>
              {state.view !== "trash" && <StatusFilterBar />}
            </div>

            <NotesGrid
              notes={notes}
              onEdit={(note) => setPanel({ type: "edit", note })}
              onRequestDelete={(note) => setDeleting(note)}
              onNewNote={() => setPanel({ type: "create" })}
            />
          </div>
        </div>
      </main>

      {/* Slide-over panel */}
      {panel.type !== "none" && (
        <NoteFormPanel
          mode={panel.type === "edit" ? "edit" : "create"}
          note={panel.type === "edit" ? panel.note : null}
          onClose={() => setPanel({ type: "none" })}
        />
      )}

      {/* Delete modal */}
      {deleting && (
        <DeleteNoteModal
          note={deleting}
          onCancel={() => setDeleting(null)}
          onConfirm={confirmDelete}
        />
      )}

      {/* Floating widget */}
      {widgetOpen && (
        <FloatingWidget
          onClose={() => setWidgetOpen(false)}
          onNewNote={() => setPanel({ type: "create" })}
        />
      )}

      <Toasts />
    </div>
  );
}
