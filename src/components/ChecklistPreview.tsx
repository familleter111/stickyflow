import { Check } from "lucide-react";
import type { ChecklistItem } from "../types";

type Props = {
  items: ChecklistItem[];
  onToggle: (itemId: string) => void;
  max?: number;
};

export default function ChecklistPreview({ items, onToggle, max = 6 }: Props) {
  if (items.length === 0) return null;
  const sorted = [...items].sort((a, b) => a.order - b.order);
  const shown = sorted.slice(0, max);
  const remaining = sorted.length - shown.length;

  return (
    <ul className="space-y-1.5">
      {shown.map((it) => (
        <li key={it.id}>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggle(it.id);
            }}
            className="group flex w-full items-start gap-2 text-left"
          >
            <span
              className={[
                "mt-0.5 flex h-[18px] w-[18px] flex-none items-center justify-center rounded-[6px] border transition",
                it.checked
                  ? "border-blue-500 bg-blue-500"
                  : "border-slate-300 bg-white/70 group-hover:border-slate-400",
              ].join(" ")}
            >
              {it.checked && (
                <Check className="h-3 w-3 text-white" strokeWidth={3} />
              )}
            </span>
            <span
              className={[
                "text-[13px] leading-snug transition",
                it.checked
                  ? "text-slate-400 line-through"
                  : "text-slate-700",
              ].join(" ")}
            >
              {it.label}
            </span>
          </button>
        </li>
      ))}
      {remaining > 0 && (
        <li className="pl-[26px] text-[12px] font-medium text-slate-400">
          +{remaining} autre{remaining > 1 ? "s" : ""}
        </li>
      )}
    </ul>
  );
}
