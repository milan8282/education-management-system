import { Link } from "react-router-dom";
import { Home } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getRoleDashboardPath } from "../utils/roleRedirect";

const NotFound = () => {
  const { user } = useAuth();

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <div className="max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl shadow-slate-200/70">
        <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">404 Error</p>
        <h1 className="mt-3 text-4xl font-bold text-slate-950">Page not found</h1>
        <p className="mt-3 text-slate-500">
          The page you are looking for does not exist or has been moved.
        </p>

        <Link
          to={getRoleDashboardPath(user?.role)}
          className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3 font-semibold text-white transition hover:bg-indigo-700"
        >
          <Home size={18} />
          Back to dashboard
        </Link>
      </div>
    </div>
  );
};

export default NotFound;