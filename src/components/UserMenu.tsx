import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, ChevronDown, Shield, User as UserIcon } from "lucide-react";
import { useAuthStore, useCurrentUser } from "../auth";
import { useStore } from "../store";
import { useOnClickOutside } from "../lib/hooks";

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  return (parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "");
}

export default function UserMenu() {
  const user = useCurrentUser();
  const logout = useAuthStore((s) => s.logout);
  const setCurrentUser = useStore((s) => s.setCurrentUser);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useOnClickOutside<HTMLDivElement>(() => setOpen(false), open);

  if (!user) return null;

  const handleLogout = () => {
    logout();
    setCurrentUser(null);
    navigate("/login", { replace: true });
  };

  const isAdmin = user.role === "admin";

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white py-1.5 pl-1.5 pr-2.5 shadow-sm transition hover:bg-slate-50"
      >
        <span
          className={`grid h-8 w-8 place-items-center rounded-xl text-sm font-bold text-white ${
            isAdmin ? "bg-slate-800" : "bg-blue-600"
          }`}
        >
          {initials(user.username).toUpperCase() || "U"}
        </span>
        <span className="hidden text-left sm:block">
          <span className="block max-w-[140px] truncate text-sm font-semibold leading-tight text-slate-700">
            {user.username}
          </span>
          <span className="block text-[11px] leading-tight text-slate-400">
            {isAdmin ? "Administrateur" : "Utilisateur"}
          </span>
        </span>
        <ChevronDown className="h-4 w-4 text-slate-400" />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-60 rounded-2xl border border-slate-200 bg-white p-2 shadow-pop animate-scaleIn">
          <div className="flex items-center gap-3 px-2.5 py-2">
            <span
              className={`grid h-10 w-10 place-items-center rounded-xl text-sm font-bold text-white ${
                isAdmin ? "bg-slate-800" : "bg-blue-600"
              }`}
            >
              {initials(user.username).toUpperCase() || "U"}
            </span>
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-slate-800">
                {user.username}
              </div>
              <div className="truncate text-xs text-slate-400">
                {user.email}
              </div>
            </div>
          </div>
          <div className="my-1 h-px bg-slate-100" />
          <div className="flex items-center gap-2 px-2.5 py-1.5 text-xs font-medium text-slate-500">
            {isAdmin ? (
              <Shield className="h-3.5 w-3.5" />
            ) : (
              <UserIcon className="h-3.5 w-3.5" />
            )}
            {isAdmin ? "Accès administrateur" : "Compte utilisateur"}
          </div>
          <div className="my-1 h-px bg-slate-100" />
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
          >
            <LogOut className="h-4 w-4" />
            Se déconnecter
          </button>
        </div>
      )}
    </div>
  );
}
