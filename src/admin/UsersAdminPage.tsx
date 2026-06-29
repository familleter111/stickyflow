import { useMemo, useState } from "react";
import {
  Plus,
  Eye,
  EyeOff,
  Pencil,
  Trash2,
  Power,
  Users as UsersIcon,
  ChevronDown,
  Check,
} from "lucide-react";
import type { User, UserStatus } from "../types";
import { PRIMARY_ADMIN_EMAIL } from "../types";
import { useUsersStore } from "../auth";
import { useStore } from "../store";
import { useOnClickOutside } from "../lib/hooks";
import AdminLayout, { AdminTopBar } from "./AdminLayout";
import UserStatusBadge from "./UserStatusBadge";
import UserFormDrawer from "./UserFormDrawer";
import UserDetailsDrawer from "./UserDetailsDrawer";
import DeleteUserModal from "./DeleteUserModal";

type Drawer =
  | { type: "none" }
  | { type: "create" }
  | { type: "edit"; user: User }
  | { type: "view"; user: User };

type StatusFilter = "all" | UserStatus;
type AgeSort = "newest" | "oldest";

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

export default function UsersAdminPage() {
  const users = useUsersStore((s) => s.users);
  const deleteUser = useUsersStore((s) => s.deleteUser);
  const toggleStatus = useUsersStore((s) => s.toggleStatus);
  const getNotesByUser = useStore((s) => s.getNotesByUser);
  const deleteUserNotes = useStore((s) => s.deleteUserNotes);
  const pushToast = useStore((s) => s.pushToast);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [ageSort, setAgeSort] = useState<AgeSort>("newest");
  const [revealed, setRevealed] = useState<Set<string>>(new Set());

  const [drawer, setDrawer] = useState<Drawer>({ type: "none" });
  const [deleting, setDeleting] = useState<User | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const filterRef = useOnClickOutside<HTMLDivElement>(
    () => setFilterOpen(false),
    filterOpen,
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = users.filter((u) => {
      if (statusFilter !== "all" && u.status !== statusFilter) return false;
      if (!q) return true;
      return (
        u.email.toLowerCase().includes(q) ||
        u.username.toLowerCase().includes(q)
      );
    });
    list = list.slice().sort((a, b) => {
      const cmp = a.createdAt.localeCompare(b.createdAt);
      return ageSort === "newest" ? -cmp : cmp;
    });
    return list;
  }, [users, search, statusFilter, ageSort]);

  const toggleReveal = (id: string) =>
    setRevealed((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const handleDelete = (user: User) => {
    // The primary admin account can never be deleted.
    if (user.email === PRIMARY_ADMIN_EMAIL) {
      pushToast({
        message: "Le compte administrateur principal ne peut pas être supprimé.",
      });
      return;
    }
    setDeleting(user);
  };

  const confirmDelete = () => {
    if (!deleting) return;
    const result = deleteUser(deleting.id);
    if (!result.ok) {
      pushToast({ message: result.error ?? "Suppression impossible." });
      setDeleting(null);
      return;
    }
    // MVP: cascade delete the user's notes (made clear in the modal text).
    deleteUserNotes(deleting.id);
    setDeleting(null);
    pushToast({ message: "Utilisateur supprimé avec succès." });
  };

  const stats = {
    total: users.length,
    active: users.filter((u) => u.status === "active").length,
    inactive: users.filter((u) => u.status === "inactive").length,
  };

  return (
    <AdminLayout active="users">
      <AdminTopBar
        search={search}
        onSearch={setSearch}
        searchPlaceholder="Rechercher un utilisateur..."
      />

      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="mx-auto max-w-[1200px] space-y-6">
          {/* Header */}
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-800">
                Administration des utilisateurs
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Gérez les accès et les informations de vos utilisateurs.
              </p>
            </div>
            <button
              onClick={() => setDrawer({ type: "create" })}
              className="flex h-11 items-center gap-2 rounded-2xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm shadow-blue-600/20 transition hover:bg-blue-700 active:scale-[0.98]"
            >
              <Plus className="h-[18px] w-[18px]" />
              Ajouter un utilisateur
            </button>
          </div>

          {/* Stat chips */}
          <div className="grid grid-cols-3 gap-3">
            <Stat label="Total" value={stats.total} tint="bg-blue-50 text-blue-600" />
            <Stat
              label="Activés"
              value={stats.active}
              tint="bg-emerald-50 text-emerald-600"
            />
            <Stat
              label="Désactivés"
              value={stats.inactive}
              tint="bg-rose-50 text-rose-600"
            />
          </div>

          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 rounded-2xl border border-slate-200 bg-white p-1 shadow-sm">
              {(
                [
                  ["all", "Tous"],
                  ["active", "Activés"],
                  ["inactive", "Désactivés"],
                ] as [StatusFilter, string][]
              ).map(([val, label]) => (
                <button
                  key={val}
                  onClick={() => setStatusFilter(val)}
                  className={[
                    "rounded-xl px-3 py-1.5 text-sm font-semibold transition",
                    statusFilter === val
                      ? "bg-blue-600 text-white"
                      : "text-slate-500 hover:bg-slate-50",
                  ].join(" ")}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Age filter */}
            <div className="relative" ref={filterRef}>
              <button
                onClick={() => setFilterOpen((o) => !o)}
                className="flex h-10 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-600 shadow-sm transition hover:bg-slate-50"
              >
                {ageSort === "newest" ? "Plus récents" : "Plus anciens"}
                <ChevronDown className="h-4 w-4 text-slate-400" />
              </button>
              {filterOpen && (
                <div className="absolute left-0 top-full z-50 mt-2 w-44 rounded-2xl border border-slate-200 bg-white p-2 shadow-pop animate-scaleIn">
                  {(
                    [
                      ["newest", "Plus récents"],
                      ["oldest", "Plus anciens"],
                    ] as [AgeSort, string][]
                  ).map(([val, label]) => (
                    <button
                      key={val}
                      onClick={() => {
                        setAgeSort(val);
                        setFilterOpen(false);
                      }}
                      className="flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                    >
                      {label}
                      {ageSort === val && (
                        <Check className="h-4 w-4 text-blue-600" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <span className="ml-auto text-sm text-slate-400">
              {filtered.length} utilisateur{filtered.length > 1 ? "s" : ""}
            </span>
          </div>

          {/* Table */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="grid h-14 w-14 place-items-center rounded-2xl bg-slate-50 text-slate-300">
                  <UsersIcon className="h-7 w-7" />
                </div>
                <h3 className="mt-3 text-base font-bold text-slate-700">
                  Aucun utilisateur trouvé
                </h3>
                <p className="mt-1 text-sm text-slate-400">
                  Ajustez votre recherche ou ajoutez un nouvel utilisateur.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[860px] text-left">
                  <thead>
                    <tr className="border-b border-slate-100 text-[11px] font-bold uppercase tracking-wide text-slate-400">
                      <th className="px-5 py-3.5">Utilisateur</th>
                      <th className="px-5 py-3.5">Email</th>
                      <th className="px-5 py-3.5">Username</th>
                      <th className="px-5 py-3.5">Mot de passe</th>
                      <th className="px-5 py-3.5">Statut</th>
                      <th className="px-5 py-3.5">Création</th>
                      <th className="px-5 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((u) => {
                      const isPrimaryAdmin = u.email === PRIMARY_ADMIN_EMAIL;
                      const show = revealed.has(u.id);
                      return (
                        <tr
                          key={u.id}
                          className="border-b border-slate-50 text-sm transition last:border-0 hover:bg-slate-50/60"
                        >
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <span
                                className={`grid h-9 w-9 flex-none place-items-center rounded-xl text-sm font-bold text-white ${
                                  u.role === "admin"
                                    ? "bg-slate-800"
                                    : "bg-blue-600"
                                }`}
                              >
                                {(u.username[0] ?? "U").toUpperCase()}
                              </span>
                              <div>
                                <div className="font-semibold text-slate-700">
                                  {u.username}
                                </div>
                                <div className="text-[11px] font-medium text-slate-400">
                                  {u.role === "admin"
                                    ? "Administrateur"
                                    : "Utilisateur"}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-3.5 text-slate-600">
                            {u.email}
                          </td>
                          <td className="px-5 py-3.5 text-slate-600">
                            {u.username}
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-slate-600">
                                {show ? u.password : "••••••••"}
                              </span>
                              <button
                                onClick={() => toggleReveal(u.id)}
                                className="rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                                aria-label={
                                  show
                                    ? "Masquer le mot de passe"
                                    : "Afficher le mot de passe"
                                }
                              >
                                {show ? (
                                  <EyeOff className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </button>
                            </div>
                          </td>
                          <td className="px-5 py-3.5">
                            <UserStatusBadge status={u.status} />
                          </td>
                          <td className="px-5 py-3.5 text-slate-500">
                            {fmtDate(u.createdAt)}
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center justify-end gap-0.5">
                              <IconAction
                                label="Voir"
                                onClick={() =>
                                  setDrawer({ type: "view", user: u })
                                }
                              >
                                <Eye className="h-4 w-4" />
                              </IconAction>
                              <IconAction
                                label="Modifier"
                                onClick={() =>
                                  setDrawer({ type: "edit", user: u })
                                }
                              >
                                <Pencil className="h-4 w-4" />
                              </IconAction>
                              <IconAction
                                label={
                                  u.status === "active"
                                    ? "Désactiver"
                                    : "Activer"
                                }
                                onClick={() => toggleStatus(u.id)}
                                className={
                                  u.status === "active"
                                    ? "hover:bg-amber-50 hover:text-amber-600"
                                    : "hover:bg-emerald-50 hover:text-emerald-600"
                                }
                              >
                                <Power className="h-4 w-4" />
                              </IconAction>
                              <IconAction
                                label={
                                  isPrimaryAdmin
                                    ? "Compte admin protégé"
                                    : "Supprimer"
                                }
                                onClick={() => handleDelete(u)}
                                disabled={isPrimaryAdmin}
                                className="hover:bg-rose-50 hover:text-rose-600"
                              >
                                <Trash2 className="h-4 w-4" />
                              </IconAction>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Drawers */}
      {(drawer.type === "create" || drawer.type === "edit") && (
        <UserFormDrawer
          mode={drawer.type}
          user={drawer.type === "edit" ? drawer.user : null}
          onClose={() => setDrawer({ type: "none" })}
        />
      )}
      {drawer.type === "view" && (
        <UserDetailsDrawer
          user={drawer.user}
          noteCount={getNotesByUser(drawer.user.id).length}
          onClose={() => setDrawer({ type: "none" })}
          onEdit={() => setDrawer({ type: "edit", user: drawer.user })}
        />
      )}

      {/* Delete confirmation */}
      {deleting && (
        <DeleteUserModal
          user={deleting}
          noteCount={getNotesByUser(deleting.id).length}
          onCancel={() => setDeleting(null)}
          onConfirm={confirmDelete}
        />
      )}
    </AdminLayout>
  );
}

function Stat({
  label,
  value,
  tint,
}: {
  label: string;
  value: number;
  tint: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div
        className={`grid h-10 w-10 flex-none place-items-center rounded-xl font-bold ${tint}`}
      >
        {value}
      </div>
      <span className="text-sm font-medium text-slate-500">{label}</span>
    </div>
  );
}

function IconAction({
  children,
  label,
  onClick,
  disabled,
  className = "hover:bg-slate-100 hover:text-slate-700",
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={[
        "rounded-lg p-2 text-slate-400 transition",
        disabled ? "cursor-not-allowed opacity-30" : className,
      ].join(" ")}
    >
      {children}
    </button>
  );
}
