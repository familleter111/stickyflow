import { X } from "lucide-react";
import { useStore } from "../store";

export default function Toasts() {
  const toasts = useStore((s) => s.toasts);
  const dismiss = useStore((s) => s.dismissToast);

  return (
    <div className="pointer-events-none fixed bottom-6 left-1/2 z-[200] flex -translate-x-1/2 flex-col items-center gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="pointer-events-auto flex items-center gap-3 rounded-2xl bg-slate-900 px-4 py-3 text-sm text-white shadow-pop animate-slideUp"
        >
          <span className="font-medium">{t.message}</span>
          {t.action && t.actionLabel && (
            <button
              onClick={() => {
                t.action?.();
                dismiss(t.id);
              }}
              className="rounded-lg bg-white/10 px-2.5 py-1 text-xs font-bold text-blue-300 transition hover:bg-white/20"
            >
              {t.actionLabel}
            </button>
          )}
          <button
            onClick={() => dismiss(t.id)}
            className="rounded-lg p-1 text-white/50 transition hover:bg-white/10 hover:text-white"
            aria-label="Fermer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
