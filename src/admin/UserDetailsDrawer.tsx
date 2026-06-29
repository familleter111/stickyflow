import { useEffect, useState } from "react";
import { X, Mail, User as UserIcon, Shield, FileText, Calendar } from "lucide-react";
import type { User } from "../types";
import { useEscape } from "../lib/hooks";
import UserStatusBadge from "./UserStatusBadge";

type Props = {
  user: User;
  noteCount: number;
  onClose: () => void;
  onEdit: () => void;
};

const fmt = (iso: string) =>
  new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export default function UserDetailsDrawer({
  user,
  noteCount,
  onClose,
  onEdit,
}: Props) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setOpen(true));
    return () => cancelAnimationFrame(id);
  }, []);
  useEscape(() => handleClose());

  const handleClose = () => {
    setOpen(false);
    setTimeout(onClose, 220);
  };

  const isAdmin = user.role === "admin";

  return (
    <div className="fixed inset-0 z-[100]">
      <div
        onClick={handleClose}
        className="absolute inset-0 bg-slate-900/30 backdrop-blur-[2px] transition-opacity duration-200"
        style={{ opacity: open ? 1 : 0 }}
      />
      <div
        className="absolute right-0 top-0 flex h-full w-full max-w-[420px] flex-col bg-white shadow-panel transition-transform duration-[240ms] ease-out"
        style={{ transform: open ? "translateX(0)" : "translateX(100%)" }}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <h2 className="text-lg font-extrabold text-slate-800">
            Détails de l'utilisateur
          </h2>
          <button
            onClick={handleClose}
            className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            aria-label="Fermer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          {/* Header */}
          <div className="flex flex-col items-center text-center">
            <span
              className={`grid h-16 w-16 place-items-center rounded-2xl text-xl font-bold text-white ${
                isAdmin ? "bg-slate-800" : "bg-blue-600"
              }`}
            >
              {(user.username[0] ?? "U").toUpperCase()}
            </span>
            <h3 className="mt-3 text-lg font-bold text-slate-800">
              {user.username}
            </h3>
            <div className="mt-2">
              <UserStatusBadge status={user.status} />
            </div>
          </div>

          <div className="mt-6 space-y-1">
            <Row icon={Mail} label="Email" value={user.email} />
            <Row icon={UserIcon} label="Username" value={user.username} />
            <Row
              icon={Shield}
              label="Rôle"
              value={isAdmin ? "Administrateur" : "Utilisateur"}
            />
            <Row
              icon={FileText}
              label="Notes possédées"
              value={String(noteCount)}
            />
            <Row icon={Calendar} label="Créé le" value={fmt(user.createdAt)} />
            <Row
              icon={Calendar}
              label="Modifié le"
              value={fmt(user.updatedAt)}
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-slate-100 px-6 py-4">
          <button
            onClick={handleClose}
            className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
          >
            Fermer
          </button>
          <button
            onClick={() => {
              handleClose();
              setTimeout(onEdit, 230);
            }}
            className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-blue-600/20 transition hover:bg-blue-700"
          >
            Modifier
          </button>
        </div>
      </div>
    </div>
  );
}

function Row({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Mail;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl px-2 py-2.5">
      <div className="grid h-9 w-9 flex-none place-items-center rounded-lg bg-slate-50 text-slate-400">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
          {label}
        </div>
        <div className="truncate text-sm font-medium text-slate-700">
          {value}
        </div>
      </div>
    </div>
  );
}
