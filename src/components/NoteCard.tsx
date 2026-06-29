import { useRef, useState } from "react";
import {
  Pin,
  Star,
  Palette,
  Pencil,
  Trash2,
  MoreVertical,
  RotateCcw,
  Archive,
  ArchiveRestore,
  Bell,
  Check,
} from "lucide-react";
import type { Note, NoteColor } from "../types";
import {
  NOTE_COLORS,
  NOTE_COLOR_STYLES,
  TAG_COLOR,
} from "../types";
import { useStore } from "../store";
import StatusBadge from "./StatusBadge";
import StatusPopover from "./StatusPopover";
import ChecklistPreview from "./ChecklistPreview";
import { useOnClickOutside } from "../lib/hooks";

type Props = {
  note: Note;
  onEdit: (note: Note) => void;
  onRequestDelete: (note: Note) => void;
};

export default function NoteCard({ note, onEdit, onRequestDelete }: Props) {
  const setStatus = useStore((s) => s.setStatus);
  const toggleFavorite = useStore((s) => s.toggleFavorite);
  const togglePin = useStore((s) => s.togglePin);
  const toggleArchive = useStore((s) => s.toggleArchive);
  const setColor = useStore((s) => s.setColor);
  const toggleChecklistItem = useStore((s) => s.toggleChecklistItem);
  const restoreNote = useStore((s) => s.restoreNote);
  const deleteForever = useStore((s) => s.deleteForever);

  const [statusAnchor, setStatusAnchor] = useState<DOMRect | null>(null);
  const [colorOpen, setColorOpen] = useState(false);
  const colorRef = useOnClickOutside<HTMLDivElement>(
    () => setColorOpen(false),
    colorOpen,
  );
  const badgeWrapRef = useRef<HTMLDivElement | null>(null);

  const c = NOTE_COLOR_STYLES[note.color];
  const inTrash = note.isDeleted;

  const openStatus = () => {
    const el = badgeWrapRef.current?.querySelector("button");
    if (el) setStatusAnchor(el.getBoundingClientRect());
  };

  const doneCount = note.checklist.filter((i) => i.checked).length;
  const total = note.checklist.length;

  return (
    <div
      className={[
        "sticky-fold group relative flex flex-col rounded-2xl border p-4 shadow-card transition-all duration-200",
        "hover:-translate-y-0.5 hover:shadow-cardHover",
        c.bg,
        c.border,
        note.isPinned ? "ring-1 ring-slate-900/5" : "",
      ].join(" ")}
      style={{ ["--fold" as string]: c.fold }}
    >
      {note.isPinned && (
        <Pin
          className="absolute -left-1 -top-1 h-4 w-4 rotate-[-20deg] fill-rose-400 text-rose-500 drop-shadow"
          aria-hidden
        />
      )}

      {/* Header: status badge + menu */}
      <div className="mb-2 flex items-start justify-between gap-2">
        <div ref={badgeWrapRef}>
          <StatusBadge
            status={note.status}
            interactive={!inTrash}
            onClick={(e) => {
              e.stopPropagation();
              if (!inTrash) openStatus();
            }}
          />
        </div>
        {!inTrash && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(note);
            }}
            className="rounded-lg p-1 text-slate-400 opacity-0 transition hover:bg-black/5 hover:text-slate-600 group-hover:opacity-100"
            aria-label="Modifier la note"
          >
            <MoreVertical className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Title */}
      <h3
        className="cursor-pointer text-[15px] font-bold leading-snug text-slate-800"
        onClick={() => !inTrash && openStatus()}
      >
        {note.title || "Sans titre"}
      </h3>

      {/* Content */}
      {note.content && (
        <p className="mt-1.5 whitespace-pre-line text-[13px] leading-relaxed text-slate-600">
          {note.content}
        </p>
      )}

      {/* Checklist */}
      {total > 0 && (
        <div className="mt-3">
          <ChecklistPreview
            items={note.checklist}
            onToggle={(itemId) =>
              !inTrash && toggleChecklistItem(note.id, itemId)
            }
          />
          <div className="mt-2.5 flex items-center gap-2">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-black/5">
              <div
                className="h-full rounded-full bg-slate-500/70 transition-all"
                style={{ width: `${total ? (doneCount / total) * 100 : 0}%` }}
              />
            </div>
            <span className="text-[11px] font-semibold text-slate-500">
              {doneCount}/{total}
            </span>
          </div>
        </div>
      )}

      {note.reminderAt && (
        <div className="mt-3 inline-flex w-fit items-center gap-1.5 rounded-lg bg-black/5 px-2 py-1 text-[11px] font-medium text-slate-600">
          <Bell className="h-3 w-3" />
          {new Date(note.reminderAt).toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "short",
          })}
        </div>
      )}

      {/* Tag */}
      <div className="mt-3">
        <span
          className="inline-flex items-center gap-1.5 rounded-full bg-white/70 px-2.5 py-1 text-[11px] font-semibold text-slate-600"
        >
          <span
            className="h-2 w-2 rounded-full"
            style={{ background: TAG_COLOR[note.tag] ?? "#94a3b8" }}
          />
          {note.tag}
        </span>
      </div>

      {/* Divider + actions */}
      <div className="mt-3.5 flex items-center justify-between border-t border-black/[0.06] pt-2.5">
        {inTrash ? (
          <div className="flex w-full items-center justify-between">
            <button
              onClick={() => restoreNote(note.id)}
              className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-semibold text-slate-600 hover:bg-black/5"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Restaurer
            </button>
            <button
              onClick={() => deleteForever(note.id)}
              className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50"
            >
              <Trash2 className="h-3.5 w-3.5" /> Supprimer
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-0.5 text-slate-400">
            <IconBtn
              label={note.isPinned ? "Détacher" : "Épingler"}
              active={note.isPinned}
              onClick={() => togglePin(note.id)}
            >
              <Pin className="h-4 w-4" />
            </IconBtn>
            <IconBtn
              label="Favori"
              active={note.isFavorite}
              activeClass="text-amber-500"
              onClick={() => toggleFavorite(note.id)}
            >
              <Star
                className={`h-4 w-4 ${note.isFavorite ? "fill-amber-400" : ""}`}
              />
            </IconBtn>

            {/* Color picker */}
            <div className="relative">
              <IconBtn
                label="Couleur"
                active={colorOpen}
                onClick={() => setColorOpen((o) => !o)}
              >
                <Palette className="h-4 w-4" />
              </IconBtn>
              {colorOpen && (
                <div
                  ref={colorRef}
                  className="absolute bottom-full left-0 z-30 mb-2 grid grid-cols-3 gap-2 rounded-2xl border border-slate-200 bg-white p-2.5 shadow-pop animate-scaleIn"
                >
                  {NOTE_COLORS.map((col) => (
                    <ColorDot
                      key={col}
                      color={col}
                      selected={note.color === col}
                      onClick={() => {
                        setColor(note.id, col);
                        setColorOpen(false);
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            <IconBtn label="Modifier" onClick={() => onEdit(note)}>
              <Pencil className="h-4 w-4" />
            </IconBtn>
            <IconBtn
              label={note.isArchived ? "Désarchiver" : "Archiver"}
              onClick={() => toggleArchive(note.id)}
            >
              {note.isArchived ? (
                <ArchiveRestore className="h-4 w-4" />
              ) : (
                <Archive className="h-4 w-4" />
              )}
            </IconBtn>
            <IconBtn
              label="Supprimer"
              hoverClass="hover:text-rose-500 hover:bg-rose-50"
              onClick={() => onRequestDelete(note)}
            >
              <Trash2 className="h-4 w-4" />
            </IconBtn>
          </div>
        )}
      </div>

      {statusAnchor && (
        <StatusPopover
          current={note.status}
          anchor={statusAnchor}
          onSelect={(s) => setStatus(note.id, s)}
          onClose={() => setStatusAnchor(null)}
        />
      )}
    </div>
  );
}

function IconBtn({
  children,
  label,
  onClick,
  active,
  activeClass = "text-blue-600",
  hoverClass = "hover:text-slate-700 hover:bg-black/5",
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  active?: boolean;
  activeClass?: string;
  hoverClass?: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={[
        "rounded-lg p-1.5 transition",
        active ? activeClass : "",
        hoverClass,
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function ColorDot({
  color,
  selected,
  onClick,
}: {
  color: NoteColor;
  selected: boolean;
  onClick: () => void;
}) {
  const c = NOTE_COLOR_STYLES[color];
  return (
    <button
      type="button"
      title={c.label}
      aria-label={c.label}
      onClick={onClick}
      className={[
        "flex h-7 w-7 items-center justify-center rounded-full border transition hover:scale-110",
        selected ? "ring-2 ring-slate-900 ring-offset-1" : "border-black/10",
      ].join(" ")}
      style={{ background: c.swatch }}
    >
      {selected && <Check className="h-3.5 w-3.5 text-slate-800" strokeWidth={3} />}
    </button>
  );
}
