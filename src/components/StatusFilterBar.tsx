import type { NoteStatus } from "../types";
import { STATUS_LABELS } from "../types";
import { useStore, counts } from "../store";

type Key = NoteStatus | "all";

export default function StatusFilterBar() {
  const statusFilter = useStore((s) => s.statusFilter);
  const setStatusFilter = useStore((s) => s.setStatusFilter);
  const notes = useStore((s) => s.notes);
  const c = counts(notes);

  const tabs: { key: Key; label: string; count: number }[] = [
    { key: "all", label: "Toutes", count: c.total },
    { key: "todo", label: STATUS_LABELS.todo, count: c.todo },
    { key: "in_progress", label: STATUS_LABELS.in_progress, count: c.in_progress },
    { key: "done", label: STATUS_LABELS.done, count: c.done },
  ];

  return (
    <div className="flex flex-wrap items-center gap-2">
      {tabs.map((t) => {
        const active = statusFilter === t.key;
        return (
          <button
            key={t.key}
            onClick={() => setStatusFilter(t.key)}
            className={[
              "flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-semibold transition",
              active
                ? "border-blue-600 bg-blue-600 text-white shadow-sm shadow-blue-600/20"
                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
            ].join(" ")}
          >
            {t.label}
            <span
              className={[
                "rounded-full px-1.5 text-[11px] font-bold",
                active ? "bg-white/20" : "bg-slate-100 text-slate-500",
              ].join(" ")}
            >
              {t.count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
