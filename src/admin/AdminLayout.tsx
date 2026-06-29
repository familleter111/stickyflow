import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  StickyNote,
  Users,
  ShieldCheck,
  Settings,
} from "lucide-react";
import UserMenu from "../components/UserMenu";

type NavKey = "dashboard" | "notes" | "users" | "roles" | "settings";

type Props = {
  active: NavKey;
  children: React.ReactNode;
};

const NAV: { key: NavKey; label: string; icon: typeof Users }[] = [
  { key: "dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { key: "notes", label: "Notes", icon: StickyNote },
  { key: "users", label: "Utilisateurs", icon: Users },
  { key: "roles", label: "Rôles & Permissions", icon: ShieldCheck },
  { key: "settings", label: "Paramètres", icon: Settings },
];

export default function AdminLayout({ active, children }: Props) {
  const navigate = useNavigate();

  const go = (key: NavKey) => {
    if (key === "users") navigate("/admin/users");
    else if (key === "notes") navigate("/app");
    // Other sections are placeholders in this MVP.
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#f6f8fb]">
      {/* Sidebar */}
      <aside className="flex h-full w-[264px] flex-none flex-col border-r border-slate-200 bg-white px-4 py-5">
        <div className="mb-6 flex items-center gap-2.5 px-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-300 text-lg shadow-sm">
            📝
          </div>
          <div>
            <span className="block text-xl font-extrabold leading-none tracking-tight text-slate-800">
              StickyFlow
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-wide text-blue-500">
              Admin
            </span>
          </div>
        </div>

        <nav className="space-y-1">
          {NAV.map((item) => {
            const Icon = item.icon;
            const isActive = item.key === active;
            return (
              <button
                key={item.key}
                onClick={() => go(item.key)}
                className={[
                  "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                  isActive
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-600 hover:bg-slate-50",
                ].join(" ")}
              >
                <Icon className="h-[18px] w-[18px]" />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="flex-1" />

        <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-3.5 text-xs text-slate-500">
          <div className="mb-1 flex items-center gap-1.5 font-semibold text-slate-600">
            <ShieldCheck className="h-4 w-4 text-blue-400" />
            Espace administrateur
          </div>
          Gérez les comptes et les accès de votre équipe.
        </div>
      </aside>

      {/* Main */}
      <main className="flex min-w-0 flex-1 flex-col">{children}</main>
    </div>
  );
}

/** Shared admin top bar with search + user menu. */
export function AdminTopBar({
  search,
  onSearch,
  searchPlaceholder = "Rechercher...",
  children,
}: {
  search: string;
  onSearch: (v: string) => void;
  searchPlaceholder?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-none items-center gap-3 border-b border-slate-200 bg-[#f6f8fb]/80 px-6 py-4 backdrop-blur">
      <div className="relative max-w-md flex-1">
        <SearchInput
          value={search}
          onChange={onSearch}
          placeholder={searchPlaceholder}
        />
      </div>
      <div className="flex-1" />
      {children}
      <UserMenu />
    </div>
  );
}

function SearchInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div className="relative">
      <svg
        className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-400"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
      </svg>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-11 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-700 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
      />
    </div>
  );
}
