import { useState } from "react";
import {
  Search,
  SlidersHorizontal,
  ArrowDownUp,
  Plus,
  ArrowUp,
  ArrowDown,
  Check,
} from "lucide-react";
import type { SortKey } from "../types";
import { SORT_LABELS } from "../types";
import { useStore } from "../store";
import { useOnClickOutside } from "../lib/hooks";
import UserMenu from "./UserMenu";

type Props = {
  onNewNote: () => void;
};

export default function TopBar({ onNewNote }: Props) {
  const search = useStore((s) => s.search);
  const setSearch = useStore((s) => s.setSearch);
  const sort = useStore((s) => s.sort);
  const setSort = useStore((s) => s.setSort);
  const sortDir = useStore((s) => s.sortDir);
  const toggleSortDir = useStore((s) => s.toggleSortDir);

  const [sortOpen, setSortOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const sortRef = useOnClickOutside<HTMLDivElement>(
    () => setSortOpen(false),
    sortOpen,
  );
  const filterRef = useOnClickOutside<HTMLDivElement>(
    () => setFilterOpen(false),
    filterOpen,
  );

  const statusFilter = useStore((s) => s.statusFilter);
  const setStatusFilter = useStore((s) => s.setStatusFilter);

  const sortKeys: SortKey[] = ["updated", "created", "status", "title"];

  return (
    <div className="flex items-center gap-3">
      {/* Search */}
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher une note..."
          className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-700 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
        />
      </div>

      {/* Filter */}
      <div className="relative" ref={filterRef}>
        <button
          onClick={() => setFilterOpen((o) => !o)}
          className={[
            "flex h-12 items-center gap-2 rounded-2xl border bg-white px-4 text-sm font-medium shadow-sm transition",
            statusFilter !== "all"
              ? "border-blue-300 text-blue-700"
              : "border-slate-200 text-slate-600 hover:bg-slate-50",
          ].join(" ")}
        >
          <SlidersHorizontal className="h-[18px] w-[18px]" />
          Filtrer
          {statusFilter !== "all" && (
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
          )}
        </button>
        {filterOpen && (
          <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-pop animate-scaleIn">
            <div className="px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              Statut
            </div>
            {(
              [
                ["all", "Tous les statuts"],
                ["todo", "À faire"],
                ["in_progress", "En cours"],
                ["done", "Terminée"],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                onClick={() => {
                  setStatusFilter(key);
                  setFilterOpen(false);
                }}
                className="flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
              >
                {label}
                {statusFilter === key && (
                  <Check className="h-4 w-4 text-blue-600" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Sort */}
      <div className="relative" ref={sortRef}>
        <button
          onClick={() => setSortOpen((o) => !o)}
          className="flex h-12 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-600 shadow-sm transition hover:bg-slate-50"
        >
          <ArrowDownUp className="h-[18px] w-[18px]" />
          Trier
        </button>
        {sortOpen && (
          <div className="absolute right-0 top-full z-50 mt-2 w-60 rounded-2xl border border-slate-200 bg-white p-2 shadow-pop animate-scaleIn">
            <div className="px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              Trier par
            </div>
            {sortKeys.map((key) => (
              <button
                key={key}
                onClick={() => setSort(key)}
                className="flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
              >
                {SORT_LABELS[key]}
                {sort === key && <Check className="h-4 w-4 text-blue-600" />}
              </button>
            ))}
            <div className="my-1 h-px bg-slate-100" />
            <button
              onClick={toggleSortDir}
              className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
            >
              {sortDir === "asc" ? (
                <ArrowUp className="h-4 w-4" />
              ) : (
                <ArrowDown className="h-4 w-4" />
              )}
              {sortDir === "asc" ? "Croissant" : "Décroissant"}
            </button>
          </div>
        )}
      </div>

      {/* New note */}
      <button
        onClick={onNewNote}
        className="flex h-12 items-center gap-2 rounded-2xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm shadow-blue-600/20 transition hover:bg-blue-700 active:scale-[0.98]"
      >
        <Plus className="h-[18px] w-[18px]" />
        Nouvelle note
      </button>

      <div className="ml-1">
        <UserMenu />
      </div>
    </div>
  );
}
