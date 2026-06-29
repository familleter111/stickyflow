import {
  FileText,
  Star,
  Archive,
  Trash2,
  Plus,
  Crown,
  Cloud,
  PanelsTopLeft,
} from "lucide-react";
import type { ViewKey } from "../types";
import { TAGS } from "../types";
import { useStore, useMyNotes, counts } from "../store";

type Props = {
  onOpenWidget: () => void;
};

function sameView(a: ViewKey, b: ViewKey) {
  if (typeof a === "object" && typeof b === "object")
    return a.tag === b.tag;
  return a === b;
}

export default function Sidebar({ onOpenWidget }: Props) {
  const view = useStore((s) => s.view);
  const setView = useStore((s) => s.setView);
  const notes = useMyNotes();
  const c = counts(notes);

  const nav: { key: ViewKey; label: string; icon: typeof FileText; count: number }[] =
    [
      { key: "all", label: "Toutes les notes", icon: FileText, count: c.total },
      { key: "favorites", label: "Favoris", icon: Star, count: c.favorites },
      { key: "archived", label: "Archivées", icon: Archive, count: c.archived },
      { key: "trash", label: "Corbeille", icon: Trash2, count: c.trash },
    ];

  return (
    <aside className="flex h-full w-[264px] flex-none flex-col border-r border-slate-200 bg-white px-4 py-5">
      {/* Logo */}
      <div className="mb-6 flex items-center gap-2.5 px-2">
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-300 shadow-sm">
          <span className="text-lg">📝</span>
        </div>
        <span className="text-xl font-extrabold tracking-tight text-slate-800">
          StickyFlow
        </span>
      </div>

      <nav className="space-y-1">
        {nav.map((item) => {
          const active = sameView(view, item.key);
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              onClick={() => setView(item.key)}
              className={[
                "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                active
                  ? "bg-blue-50 text-blue-700"
                  : "text-slate-600 hover:bg-slate-50",
              ].join(" ")}
            >
              <Icon className="h-[18px] w-[18px]" />
              <span className="flex-1 text-left">{item.label}</span>
              <span
                className={[
                  "min-w-[22px] rounded-full px-1.5 py-0.5 text-center text-[11px] font-semibold",
                  active ? "bg-blue-100 text-blue-700" : "text-slate-400",
                ].join(" ")}
              >
                {item.count}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Tags */}
      <div className="mt-6">
        <div className="mb-1 flex items-center justify-between px-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Tags
          </span>
          <button
            className="rounded-md p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="Ajouter un tag"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <div className="space-y-0.5">
          {TAGS.map((tag) => {
            const active =
              typeof view === "object" && view.tag === tag.name;
            return (
              <button
                key={tag.name}
                onClick={() => setView({ tag: tag.name })}
                className={[
                  "flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition",
                  active
                    ? "bg-slate-100 text-slate-800"
                    : "text-slate-600 hover:bg-slate-50",
                ].join(" ")}
              >
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ background: tag.color }}
                />
                <span className="flex-1 text-left">{tag.name}</span>
                <span className="text-[11px] font-semibold text-slate-400">
                  {c.byTag(tag.name)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1" />

      {/* Widget launcher */}
      <button
        onClick={onOpenWidget}
        className="mb-3 flex items-center gap-2.5 rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:border-blue-200 hover:bg-blue-50/50 hover:text-blue-700"
      >
        <PanelsTopLeft className="h-[18px] w-[18px]" />
        Widget flottant
      </button>

      {/* Storage */}
      <div className="mb-3 rounded-2xl border border-slate-200 p-3.5">
        <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
          <Cloud className="h-4 w-4 text-slate-400" /> Stockage
        </div>
        <div className="text-[11px] text-slate-400">
          2,4 Go utilisés sur 10 Go
        </div>
        <div className="mt-2 flex items-center gap-2">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full w-[24%] rounded-full bg-blue-500" />
          </div>
          <span className="text-[11px] font-semibold text-slate-500">24%</span>
        </div>
      </div>

      {/* Pro */}
      <button className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-3.5 text-left transition hover:shadow-sm">
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-amber-100">
          <Crown className="h-5 w-5 text-amber-500" />
        </div>
        <div className="flex-1">
          <div className="text-sm font-bold text-slate-800">Passer à Pro</div>
          <div className="text-[11px] text-slate-500">
            Débloquez plus de fonctionnalités
          </div>
        </div>
      </button>
    </aside>
  );
}
