import { Navigate, Outlet } from "react-router-dom";
import { ROUTES } from "../constants/routes";
import { useAuth } from "../hooks/useAuth";

export default function ProtectedRoute({ allowedRoles = [] }) {
  const { user, authLoading } = useAuth();

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="rounded-2xl bg-white px-6 py-4 shadow-sm border border-slate-200 text-slate-600">
          Checking authentication...
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to={ROUTES.UNAUTHORIZED} replace />;
  }

  return <Outlet />;
}