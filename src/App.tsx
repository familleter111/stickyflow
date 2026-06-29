import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import NotesApp from "./pages/NotesApp";
import UsersAdminPage from "./admin/UsersAdminPage";
import { ProtectedRoute, AdminRoute } from "./components/guards";
import Toasts from "./components/Toasts";
import { useCurrentUser } from "./auth";

/** Sends the landing route to the right place based on auth/role. */
function RootRedirect() {
  const user = useCurrentUser();
  if (!user) return <Navigate to="/login" replace />;
  return (
    <Navigate to={user.role === "admin" ? "/admin/users" : "/app"} replace />
  );
}

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <NotesApp />
            </ProtectedRoute>
          }
        />

        <Route path="/admin" element={<Navigate to="/admin/users" replace />} />
        <Route
          path="/admin/users"
          element={
            <AdminRoute>
              <UsersAdminPage />
            </AdminRoute>
          }
        />

        <Route path="/" element={<RootRedirect />} />
        <Route path="*" element={<RootRedirect />} />
      </Routes>

      {/* Global toast system (shared across notes & admin). */}
      <Toasts />
    </HashRouter>
  );
}
