import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Check } from "lucide-react";
import type { NoteStatus } from "../types";
import { STATUS_LABELS, STATUS_ORDER, STATUS_STYLES } from "../types";
import { useOnClickOutside, useEscape } from "../lib/hooks";

type Props = {
  current: NoteStatus;
  anchor: DOMRect; // viewport rect of the clicked badge
  onSelect: (s: NoteStatus) => void;
  onClose: () => void;
};

const POP_W = 200;

export default function StatusPopover({
  current,
  anchor,
  onSelect,
  onClose,
}: Props) {
  const ref = useOnClickOutside<HTMLDivElement>(onClose);
  useEscape(onClose);

  const [pos, setPos] = useState<{ top: number; left: number }>(() => ({
    top: anchor.bottom + 8,
    left: anchor.left,
  }));
  const boxRef = useRef<HTMLDivElement | null>(null);
  const btnRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useLayoutEffect(() => {
    const h = boxRef.current?.offsetHeight ?? 150;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    let left = anchor.left;
    if (left + POP_W > vw - 12) left = vw - POP_W - 12;
    let top = anchor.bottom + 8;
    if (top + h > vh - 12) top = anchor.top - h - 8; // flip above
    setPos({ top: Math.max(12, top), left: Math.max(12, left) });
  }, [anchor]);

  useEffect(() => {
    // focus current option for keyboard users
    const idx = STATUS_ORDER.indexOf(current);
    btnRefs.current[idx]?.focus();
  }, [current]);

  const onKeyDown = (e: React.KeyboardEvent, idx: number) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const dir = e.key === "ArrowDown" ? 1 : -1;
      const next = (idx + dir + STATUS_ORDER.length) % STATUS_ORDER.length;
      btnRefs.current[next]?.focus();
    }
  };

  return (
    <div
      ref={(el) => {
        ref.current = el;
        boxRef.current = el;
      }}
      role="listbox"
      aria-label="Changer le statut"
      style={{ top: pos.top, left: pos.left, width: POP_W }}
      className="fixed z-[120] origin-top animate-scaleIn rounded-2xl border border-slate-200/80 bg-white p-1.5 shadow-pop"
    >
      <div className="px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
        Statut
      </div>
      {STATUS_ORDER.map((s, i) => {
        const active = s === current;
        const st = STATUS_STYLES[s];
        return (
          <button
            key={s}
            ref={(el) => (btnRefs.current[i] = el)}
            role="option"
            aria-selected={active}
            onKeyDown={(e) => onKeyDown(e, i)}
            onClick={() => {
              onSelect(s);
              onClose();
            }}
            className={[
              "flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm font-medium outline-none transition",
              active
                ? "bg-slate-50 text-slate-900"
                : "text-slate-600 hover:bg-slate-50",
              "focus-visible:ring-2 focus-visible:ring-blue-400",
            ].join(" ")}
          >
            <span
              className={[
                "flex h-4 w-4 items-center justify-center rounded-full border-2",
                active ? `${st.dot} border-transparent` : "border-slate-300",
              ].join(" ")}
            >
              {active && <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />}
            </span>
            {STATUS_LABELS[s]}
          </button>
        );
      })}
    </div>
  );
}
