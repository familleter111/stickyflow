import { useRef, useState } from "react";
import {
  Plus,
  Camera,
  Search,
  Minus,
  X,
  MoreHorizontal,
  FileText,
  Check,
} from "lucide-react";
import { useStore } from "../store";
import { STATUS_STYLES } from "../types";

type Props = {
  onClose: () => void;
  onNewNote: () => void;
};

export default function FloatingWidget({ onClose, onNewNote }: Props) {
  const notes = useStore((s) => s.notes);
  const toggleChecklistItem = useStore((s) => s.toggleChecklistItem);
  const [minimized, setMinimized] = useState(false);
  const [query, setQuery] = useState("");

  const dragRef = useRef<HTMLDivElement | null>(null);
  const [pos, setPos] = useState({ x: 120, y: 90 });
  const drag = useRef<{ dx: number; dy: number } | null>(null);

  const onPointerDown = (e: React.PointerEvent) => {
    drag.current = { dx: e.clientX - pos.x, dy: e.clientY - pos.y };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current) return;
    setPos({
      x: Math.max(0, Math.min(window.innerWidth - 200, e.clientX - drag.current.dx)),
      y: Math.max(0, Math.min(window.innerHeight - 80, e.clientY - drag.current.dy)),
    });
  };
  const onPointerUp = () => {
    drag.current = null;
  };

  const recent = notes
    .filter((n) => !n.isDeleted)
    .filter((n) =>
      query.trim()
        ? (n.title + n.content).toLowerCase().includes(query.toLowerCase())
        : true,
    )
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  return (
    <div
      ref={dragRef}
      className="resizable fixed z-[150] flex min-h-[280px] min-w-[300px] max-w-[640px] flex-col rounded-2xl border border-slate-200 bg-white shadow-pop"
      style={{
        left: pos.x,
        top: pos.y,
        width: 360,
        height: minimized ? undefined : 460,
      }}
    >
      {/* Title bar */}
      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        className="flex flex-none cursor-grab items-center justify-between rounded-t-2xl border-b border-slate-100 px-4 py-3 active:cursor-grabbing"
      >
        <div className="flex items-center gap-2.5">
          <div className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-amber-400 to-amber-300 text-sm">
            📝
          </div>
          <span className="text-sm font-bold text-slate-800">
            StickyFlow Notes
          </span>
        </div>
        <div className="flex items-center gap-1 text-slate-400">
          <button className="rounded-md p-1 hover:bg-slate-100" aria-label="Menu">
            <MoreHorizontal className="h-4 w-4" />
          </button>
          <div className="mx-1 h-4 w-px bg-slate-200" />
          <button
            onClick={() => setMinimized((m) => !m)}
            className="rounded-md p-1 hover:bg-slate-100"
            aria-label="Réduire"
          >
            <Minus className="h-4 w-4" />
          </button>
          <button
            onClick={onClose}
            className="rounded-md p-1 hover:bg-rose-50 hover:text-rose-500"
            aria-label="Fermer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {!minimized && (
        <>
          {/* Actions */}
          <div className="flex flex-none gap-2.5 px-4 pt-4">
            <button
              onClick={onNewNote}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 py-3 text-sm font-semibold text-blue-600 transition hover:bg-blue-50"
            >
              <Plus className="h-4 w-4" /> Note
            </button>
            <button className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 py-3 text-sm font-semibold text-blue-600 transition hover:bg-blue-50">
              <Camera className="h-4 w-4" /> Screenshot
            </button>
          </div>

          {/* Recent header */}
          <div className="flex flex-none items-center justify-between px-4 pb-2 pt-4">
            <span className="text-sm font-bold text-slate-700">
              Recent notes
            </span>
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <div className="flex-none px-4 pb-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher..."
              className="h-8 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs outline-none focus:border-blue-300"
            />
          </div>

          {/* List */}
          <div className="flex-1 space-y-2.5 overflow-y-auto px-4 pb-4">
            {recent.length === 0 && (
              <div className="py-8 text-center text-xs text-slate-400">
                Aucune note récente
              </div>
            )}
            {recent.map((n) => {
              const st = STATUS_STYLES[n.status];
              return (
                <div
                  key={n.id}
                  className="rounded-xl border border-slate-100 bg-slate-50/60 p-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-blue-500" />
                      <span className="text-sm font-semibold text-slate-700 underline-offset-2 hover:underline">
                        {n.title || "Sans titre"}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400">
                      {new Date(n.updatedAt).toLocaleTimeString("fr-FR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  {n.content && (
                    <p className="mt-1.5 line-clamp-2 text-xs text-slate-500">
                      {n.content}
                    </p>
                  )}

                  {n.checklist.length > 0 && (
                    <ul className="mt-2 space-y-1.5">
                      {n.checklist.slice(0, 4).map((it) => (
                        <li key={it.id}>
                          <button
                            onClick={() => toggleChecklistItem(n.id, it.id)}
                            className="flex w-full items-center gap-2 text-left"
                          >
                            <span
                              className={[
                                "flex h-4 w-4 flex-none items-center justify-center rounded border transition",
                                it.checked
                                  ? "border-blue-500 bg-blue-500"
                                  : "border-slate-300 bg-white",
                              ].join(" ")}
                            >
                              {it.checked && (
                                <Check
                                  className="h-2.5 w-2.5 text-white"
                                  strokeWidth={3}
                                />
                              )}
                            </span>
                            <span
                              className={`text-xs ${
                                it.checked
                                  ? "text-slate-400 line-through"
                                  : "text-slate-600"
                              }`}
                            >
                              {it.label}
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}

                  <div className="mt-2">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${st.badge}`}
                    >
                      <span className={`h-1 w-1 rounded-full ${st.dot}`} />
                      {n.tag}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Resize handle hint */}
          <div className="pointer-events-none absolute bottom-1 right-1 text-slate-300">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M13 5L5 13M13 9L9 13M13 1L1 13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
          </div>
        </>
      )}
    </div>
  );
}
