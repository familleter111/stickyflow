import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  Check,
  AlertCircle,
  Star,
} from "lucide-react";
import { useAuthStore, useCurrentUser } from "../auth";
import { useStore } from "../store";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const setCurrentUser = useStore((s) => s.setCurrentUser);
  const currentUser = useCurrentUser();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Already authenticated? Send to the right place.
  useEffect(() => {
    if (currentUser) {
      navigate(currentUser.role === "admin" ? "/admin/users" : "/app", {
        replace: true,
      });
    }
  }, [currentUser, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError("Veuillez renseigner votre email et votre mot de passe.");
      return;
    }
    if (!EMAIL_RE.test(email.trim())) {
      setError("Veuillez saisir une adresse email valide.");
      return;
    }

    setSubmitting(true);
    const result = login(email, password, remember);
    setSubmitting(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }
    setCurrentUser(useAuthStore.getState().session?.userId ?? null);
    navigate(result.role === "admin" ? "/admin/users" : "/app", {
      replace: true,
    });
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-[#eef2fb] via-[#eaf0fc] to-[#e6edfb] p-4 lg:p-8">
      <div className="grid w-full max-w-6xl items-center gap-8 lg:grid-cols-2">
        {/* Left — illustration / product preview */}
        <div className="relative hidden lg:block">
          <div className="absolute -left-6 top-10 h-40 w-40 rounded-full bg-blue-200/40 blur-2xl" />
          <div className="absolute right-10 top-0 h-32 w-32 rounded-full bg-indigo-200/40 blur-2xl" />

          <div className="relative">
            {/* App preview card */}
            <div className="rounded-3xl border border-white/70 bg-white/70 p-5 shadow-card backdrop-blur">
              <div className="mb-4 flex items-center gap-2">
                <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-amber-400 to-amber-300 text-sm">
                  📝
                </div>
                <div className="h-9 flex-1 rounded-xl bg-slate-100/80" />
              </div>
              <div className="mb-3 text-sm font-bold text-slate-700">
                Mes notes
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { t: "Plan de projet", b: "Important", c: "bg-blue-50 text-blue-600", star: true },
                  { t: "Idées produit", b: "En cours", c: "bg-amber-50 text-amber-600" },
                  { t: "Rétro équipe", b: "Terminé", c: "bg-emerald-50 text-emerald-600" },
                  { t: "Roadmap", b: "Planifié", c: "bg-purple-50 text-purple-600" },
                ].map((card) => (
                  <div
                    key={card.t}
                    className="rounded-2xl border border-slate-100 bg-white p-3 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">
                        {card.t}
                      </span>
                      {card.star && (
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      )}
                    </div>
                    <div className="my-2 space-y-1.5">
                      <div className="h-1.5 w-full rounded-full bg-slate-100" />
                      <div className="h-1.5 w-4/5 rounded-full bg-slate-100" />
                    </div>
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${card.c}`}
                    >
                      {card.b}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Floating sticky note */}
            <div className="absolute -right-4 -top-6 w-36 rotate-6 rounded-2xl bg-[#fbe58a] p-3 shadow-card">
              {["Acheter du lait", "Réunion 14h", "Appeler Marie"].map((t) => (
                <div key={t} className="mb-1.5 flex items-center gap-1.5">
                  <Check className="h-3 w-3 text-amber-700" strokeWidth={3} />
                  <span className="h-1.5 flex-1 rounded-full bg-amber-700/30" />
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 max-w-md">
            <h2 className="text-2xl font-extrabold text-slate-800">
              Organisez vos idées, sans effort.
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              MDFlow réunit vos notes, checklists et rappels dans un espace
              clair et rapide. Connectez-vous pour retrouver votre tableau.
            </p>
          </div>
        </div>

        {/* Right — login card */}
        <div className="mx-auto w-full max-w-md">
          <div className="rounded-[28px] border border-white/80 bg-white p-8 shadow-panel sm:p-10">
            {/* Logo */}
            <div className="mb-7 flex items-center justify-center gap-2.5">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-300 text-lg shadow-sm">
                📝
              </div>
              <span className="text-2xl font-extrabold tracking-tight text-slate-800">
                MD<span className="text-blue-600">Flow</span>
              </span>
            </div>

            <h1 className="text-center text-3xl font-extrabold text-slate-800">
              Connexion
            </h1>
            <p className="mt-1.5 text-center text-sm text-slate-500">
              Accédez à votre espace de notes
            </p>

            <form onSubmit={handleSubmit} className="mt-7 space-y-5" noValidate>
              {error && (
                <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-sm text-rose-700 animate-slideUp">
                  <AlertCircle className="mt-0.5 h-4 w-4 flex-none" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label
                  htmlFor="email"
                  className="mb-1.5 block text-sm font-semibold text-slate-700"
                >
                  Email
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-400" />
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="exemple@domaine.com"
                    className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-1.5 block text-sm font-semibold text-slate-700"
                >
                  Mot de passe
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-400" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-11 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    aria-label={
                      showPassword
                        ? "Masquer le mot de passe"
                        : "Afficher le mot de passe"
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                  >
                    {showPassword ? (
                      <EyeOff className="h-[18px] w-[18px]" />
                    ) : (
                      <Eye className="h-[18px] w-[18px]" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex cursor-pointer select-none items-center gap-2 text-sm text-slate-600">
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={remember}
                    onClick={() => setRemember((r) => !r)}
                    className={`flex h-[18px] w-[18px] items-center justify-center rounded-[6px] border transition ${
                      remember
                        ? "border-blue-600 bg-blue-600"
                        : "border-slate-300 bg-white"
                    }`}
                  >
                    {remember && (
                      <Check className="h-3 w-3 text-white" strokeWidth={3} />
                    )}
                  </button>
                  Se souvenir de moi
                </label>
                <button
                  type="button"
                  onClick={() =>
                    setError(
                      "Réinitialisation indisponible dans cette démo. Contactez l'administrateur.",
                    )
                  }
                  className="text-sm font-semibold text-blue-600 hover:underline"
                >
                  Mot de passe oublié ?
                </button>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="h-12 w-full rounded-xl bg-blue-600 text-sm font-bold text-white shadow-sm shadow-blue-600/25 transition hover:bg-blue-700 active:scale-[0.99] disabled:opacity-70"
              >
                {submitting ? "Connexion…" : "Se connecter"}
              </button>
            </form>

            {/* Demo credentials helper */}
            <div className="mt-6 rounded-xl border border-slate-100 bg-slate-50/70 p-3 text-xs text-slate-500">
              <div className="mb-1 font-semibold text-slate-600">
                Comptes de démonstration
              </div>
              <div>
                Admin : <span className="font-mono">admin@email.com</span> /{" "}
                <span className="font-mono">Admin1234?</span>
              </div>
              <div>
                Utilisateur : <span className="font-mono">marie@email.com</span>{" "}
                / <span className="font-mono">marie123</span>
              </div>
            </div>
          </div>

          <div className="mt-5 flex items-center justify-center gap-2 text-center text-xs text-slate-400">
            <ShieldCheck className="h-4 w-4 text-blue-400" />
            <span>
              Vos données sont chiffrées et sécurisées. MDFlow respecte votre
              confidentialité.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
