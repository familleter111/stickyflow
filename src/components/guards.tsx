import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore, useCurrentUser } from "../auth";
import { useStore } from "../store";

/**
 * Requires an authenticated, active session. Redirects to /login otherwise.
 * Also re-validates the session (e.g. user deleted/deactivated → logout).
 */
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const user = useCurrentUser();
  const logout = useAuthStore((s) => s.logout);
  const session = useAuthStore((s) => s.session);
  const setCurrentUser = useStore((s) => s.setCurrentUser);

  // If there is a stale/invalid session, clear it.
  useEffect(() => {
    if (session && !user) {
      logout();
      setCurrentUser(null);
    }
  }, [session, user, logout, setCurrentUser]);

  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

/** Requires an admin. Non-admins are redirected to their notes board. */
export function AdminRoute({ children }: { children: React.ReactNode }) {
  const user = useCurrentUser();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "admin") return <Navigate to="/app" replace />;
  return <>{children}</>;
}
