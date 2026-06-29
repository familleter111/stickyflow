import { ChevronDown } from "lucide-react";
import type { NoteStatus } from "../types";
import { STATUS_LABELS, STATUS_STYLES } from "../types";

type Props = {
  status: NoteStatus;
  onClick?: (e: React.MouseEvent) => void;
  interactive?: boolean;
  size?: "sm" | "md";
};

export default function StatusBadge({
  status,
  onClick,
  interactive = true,
  size = "md",
}: Props) {
  const s = STATUS_STYLES[status];
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!interactive}
      aria-label={`Statut : ${STATUS_LABELS[status]}. Cliquer pour changer`}
      className={[
        "inline-flex items-center gap-1.5 rounded-full border font-semibold transition",
        size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs",
        s.badge,
        interactive
          ? "cursor-pointer hover:brightness-[0.97] active:scale-[0.97]"
          : "cursor-default",
      ].join(" ")}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {STATUS_LABELS[status]}
      {interactive && <ChevronDown className="h-3 w-3 opacity-60" />}
    </button>
  );
}
