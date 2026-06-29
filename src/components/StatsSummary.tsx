import { FileText, Star, Trash2, Circle, Loader, CheckCircle2 } from "lucide-react";
import { useStore, counts } from "../store";

export default function StatsSummary() {
  const notes = useStore((s) => s.notes);
  const setStatusFilter = useStore((s) => s.setStatusFilter);
  const setView = useStore((s) => s.setView);
  const c = counts(notes);

  const cards = [
    {
      label: "Total notes",
      value: c.total,
      icon: FileText,
      tint: "bg-blue-50 text-blue-600",
      onClick: () => {
        setView("all");
        setStatusFilter("all");
      },
    },
    {
      label: "À faire",
      value: c.todo,
      icon: Circle,
      tint: "bg-sky-50 text-sky-600",
      onClick: () => {
        setView("all");
        setStatusFilter("todo");
      },
    },
    {
      label: "En cours",
      value: c.in_progress,
      icon: Loader,
      tint: "bg-amber-50 text-amber-600",
      onClick: () => {
        setView("all");
        setStatusFilter("in_progress");
      },
    },
    {
      label: "Terminée",
      value: c.done,
      icon: CheckCircle2,
      tint: "bg-emerald-50 text-emerald-600",
      onClick: () => {
        setView("all");
        setStatusFilter("done");
      },
    },
    {
      label: "Favoris",
      value: c.favorites,
      icon: Star,
      tint: "bg-yellow-50 text-yellow-600",
      onClick: () => setView("favorites"),
    },
    {
      label: "Corbeille",
      value: c.trash,
      icon: Trash2,
      tint: "bg-rose-50 text-rose-600",
      onClick: () => setView("trash"),
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <button
            key={card.label}
            onClick={card.onClick}
            className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-card"
          >
            <div
              className={`grid h-11 w-11 flex-none place-items-center rounded-xl ${card.tint}`}
            >
              <Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="text-xl font-extrabold leading-none text-slate-800">
                {card.value}
              </div>
              <div className="mt-1 truncate text-xs font-medium text-slate-500">
                {card.label}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
