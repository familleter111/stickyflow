import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import type { User } from "../types";
import { useEscape } from "../lib/hooks";

type Props = {
  user: User;
  noteCount: number;
  onCancel: () => void;
  onConfirm: () => void;
};

export default function DeleteUserModal({
  user,
  noteCount,
  onCancel,
  onConfirm,
}: Props) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setOpen(true));
    return () => cancelAnimationFrame(id);
  }, []);
  useEscape(onCancel);

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div
        onClick={onCancel}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] transition-opacity duration-200"
        style={{ opacity: open ? 1 : 0 }}
      />
      <div
        role="alertdialog"
        aria-modal="true"
        className="relative w-full max-w-[420px] rounded-3xl bg-white p-6 shadow-pop transition-all duration-200"
        style={{
          opacity: open ? 1 : 0,
          transform: open ? "scale(1)" : "scale(0.95)",
        }}
      >
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-rose-50">
          <Trash2 className="h-7 w-7 text-rose-500" />
        </div>
        <h2 className="mt-4 text-center text-lg font-extrabold text-slate-800">
          Supprimer cet utilisateur ?
        </h2>
        <p className="mt-1.5 text-center text-sm text-slate-500">
          Cette action supprimera l'utilisateur{" "}
          <span className="font-semibold text-slate-700">{user.email}</span> et
          ses données associées
          {noteCount > 0 ? (
            <>
              {" "}
              ({noteCount} note{noteCount > 1 ? "s" : ""})
            </>
          ) : null}
          . Cette opération est irréversible.
        </p>
        <div className="mt-6 flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-rose-600/20 transition hover:bg-rose-700 active:scale-[0.98]"
          >
            Supprimer
          </button>
        </div>
      </div>
    </div>
  );
}
