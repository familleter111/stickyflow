import { useEffect, useState } from "react";
import { X, Eye, EyeOff, Check } from "lucide-react";
import type { User, UserRole, UserStatus } from "../types";
import { useUsersStore, type UserDraft } from "../auth";
import { useStore } from "../store";
import { useEscape } from "../lib/hooks";

type Props = {
  mode: "create" | "edit";
  user?: User | null;
  onClose: () => void;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Errors = Partial<Record<keyof UserDraft, string>>;

export default function UserFormDrawer({ mode, user, onClose }: Props) {
  const createUser = useUsersStore((s) => s.createUser);
  const updateUser = useUsersStore((s) => s.updateUser);
  const pushToast = useStore((s) => s.pushToast);

  const [open, setOpen] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [form, setForm] = useState<UserDraft>({
    email: "",
    username: "",
    password: "",
    status: "active",
    role: "user",
  });

  useEffect(() => {
    const id = requestAnimationFrame(() => setOpen(true));
    return () => cancelAnimationFrame(id);
  }, []);
  useEscape(() => handleClose());

  useEffect(() => {
    if (mode === "edit" && user) {
      setForm({
        email: user.email,
        username: user.username,
        password: user.password,
        status: user.status,
        role: user.role,
      });
    }
  }, [mode, user]);

  const set = <K extends keyof UserDraft>(key: K, val: UserDraft[K]) => {
    setForm((f) => ({ ...f, [key]: val }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const handleClose = () => {
    setOpen(false);
    setTimeout(onClose, 220);
  };

  const validate = (): boolean => {
    const e: Errors = {};
    if (!form.email.trim()) e.email = "L'email est requis.";
    else if (!EMAIL_RE.test(form.email.trim()))
      e.email = "Adresse email invalide.";
    if (!form.username.trim()) e.username = "Le nom d'utilisateur est requis.";
    if (!form.password) e.password = "Le mot de passe est requis.";
    else if (form.password.length < 6)
      e.password = "Au moins 6 caractères requis.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = () => {
    if (!validate()) return;
    const result =
      mode === "edit" && user
        ? updateUser(user.id, form)
        : createUser(form);

    if (!result.ok) {
      // Surface a unique-email (or other) backend-style error on the field.
      setErrors((prev) => ({ ...prev, email: result.error }));
      return;
    }
    pushToast({
      message:
        mode === "edit"
          ? "Utilisateur mis à jour."
          : "Utilisateur créé avec succès.",
    });
    handleClose();
  };

  return (
    <div className="fixed inset-0 z-[100]">
      <div
        onClick={handleClose}
        className="absolute inset-0 bg-slate-900/30 backdrop-blur-[2px] transition-opacity duration-200"
        style={{ opacity: open ? 1 : 0 }}
      />
      <div
        className="absolute right-0 top-0 flex h-full w-full max-w-[440px] flex-col bg-white shadow-panel transition-transform duration-[240ms] ease-out"
        style={{ transform: open ? "translateX(0)" : "translateX(100%)" }}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <h2 className="text-lg font-extrabold text-slate-800">
              {mode === "edit"
                ? "Modifier l'utilisateur"
                : "Ajouter un utilisateur"}
            </h2>
            <p className="text-xs text-slate-400">
              {mode === "edit"
                ? "Mettez à jour les informations du compte"
                : "Créez un nouveau compte utilisateur"}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            aria-label="Fermer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
          <Field label="Email" error={errors.email} required>
            <input
              type="email"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              placeholder="exemple@domaine.com"
              className="input"
              autoFocus
            />
          </Field>

          <Field label="Username" error={errors.username} required>
            <input
              value={form.username}
              onChange={(e) => set("username", e.target.value)}
              placeholder="nom_utilisateur"
              className="input"
            />
          </Field>

          <Field label="Mot de passe" error={errors.password} required>
            <div className="relative">
              <input
                type={showPwd ? "text" : "password"}
                value={form.password}
                onChange={(e) => set("password", e.target.value)}
                placeholder="Au moins 6 caractères"
                className="input pr-11"
              />
              <button
                type="button"
                onClick={() => setShowPwd((s) => !s)}
                aria-label={
                  showPwd ? "Masquer le mot de passe" : "Afficher le mot de passe"
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              >
                {showPwd ? (
                  <EyeOff className="h-[18px] w-[18px]" />
                ) : (
                  <Eye className="h-[18px] w-[18px]" />
                )}
              </button>
            </div>
          </Field>

          <Field label="Statut" required>
            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  ["active", "Activé"],
                  ["inactive", "Désactivé"],
                ] as [UserStatus, string][]
              ).map(([val, label]) => {
                const active = form.status === val;
                return (
                  <button
                    key={val}
                    type="button"
                    onClick={() => set("status", val)}
                    className={[
                      "flex items-center justify-center gap-1.5 rounded-xl border px-2 py-2.5 text-sm font-semibold transition",
                      active
                        ? val === "active"
                          ? "border-emerald-300 bg-emerald-50 text-emerald-700 ring-2 ring-emerald-200"
                          : "border-rose-300 bg-rose-50 text-rose-700 ring-2 ring-rose-200"
                        : "border-slate-200 text-slate-500 hover:bg-slate-50",
                    ].join(" ")}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        val === "active" ? "bg-emerald-500" : "bg-rose-500"
                      }`}
                    />
                    {label}
                  </button>
                );
              })}
            </div>
          </Field>

          <Field label="Rôle">
            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  ["user", "Utilisateur"],
                  ["admin", "Administrateur"],
                ] as [UserRole, string][]
              ).map(([val, label]) => {
                const active = form.role === val;
                return (
                  <button
                    key={val}
                    type="button"
                    onClick={() => set("role", val)}
                    className={[
                      "flex items-center justify-center gap-1.5 rounded-xl border px-2 py-2.5 text-sm font-semibold transition",
                      active
                        ? "border-slate-800 bg-slate-800 text-white"
                        : "border-slate-200 text-slate-500 hover:bg-slate-50",
                    ].join(" ")}
                  >
                    {active && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
                    {label}
                  </button>
                );
              })}
            </div>
          </Field>

          <p className="rounded-xl bg-slate-50 px-3 py-2 text-[11px] text-slate-400">
            Démo uniquement. En production, les mots de passe doivent être
            hachés côté serveur (jamais stockés en clair).
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-slate-100 px-6 py-4">
          <button
            onClick={handleClose}
            className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
          >
            Annuler
          </button>
          <button
            onClick={submit}
            className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-blue-600/20 transition hover:bg-blue-700 active:scale-[0.98]"
          >
            {mode === "edit" ? "Mettre à jour" : "Enregistrer"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  error,
  required,
  children,
}: {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-400">
        {label} {required && <span className="text-rose-400">*</span>}
      </span>
      {children}
      {error && <span className="mt-1 block text-xs text-rose-500">{error}</span>}
    </label>
  );
}
