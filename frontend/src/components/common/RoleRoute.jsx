import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getRoleDashboardPath } from "../../utils/roleRedirect";

const RoleRoute = ({ allowedRoles = [] }) => {
  const { user } = useAuth();

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to={getRoleDashboardPath(user?.role)} replace />;
  }

  return <Outlet />;
};

export default RoleRoute;