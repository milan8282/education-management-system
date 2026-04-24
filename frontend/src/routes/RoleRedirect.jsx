import { Navigate } from "react-router-dom";
import { ROLES } from "../constants/roles";
import { ROUTES } from "../constants/routes";
import { useAuth } from "../hooks/useAuth";

export default function RoleRedirect() {
  const { user, authLoading } = useAuth();

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-600">
        Loading...
      </div>
    );
  }

  if (!user) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  if (user.role === ROLES.ADMIN) {
    return <Navigate to={ROUTES.ADMIN} replace />;
  }

  if (user.role === ROLES.TEACHER) {
    return <Navigate to={ROUTES.TEACHER} replace />;
  }

  if (user.role === ROLES.STUDENT) {
    return <Navigate to={ROUTES.STUDENT} replace />;
  }

  return <Navigate to={ROUTES.UNAUTHORIZED} replace />;
}