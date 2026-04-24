import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { GraduationCap, Loader2, Lock, Mail } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import { getRoleDashboardPath } from "../../utils/roleRedirect";

const Login = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, user } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [submitting, setSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate to={getRoleDashboardPath(user?.role)} replace />;
  }

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.email || !form.password) {
      toast.error("Email and password are required");
      return;
    }

    try {
      setSubmitting(true);
      const loggedInUser = await login(form);
      navigate(getRoleDashboardPath(loggedInUser.role), { replace: true });
    } catch (error) {
      toast.error(error?.response?.data?.message || "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-indigo-700 via-indigo-800 to-slate-950 p-12">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_left,#ffffff,transparent_30%),radial-gradient(circle_at_bottom_right,#818cf8,transparent_35%)]" />

        <div className="relative z-10 flex flex-col justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-white/15 flex items-center justify-center backdrop-blur">
              <GraduationCap size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-bold">EMS Portal</h1>
              <p className="text-indigo-100 text-sm">Education Management System</p>
            </div>
          </div>

          <div className="max-w-xl">
            <p className="mb-5 inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-indigo-100 backdrop-blur">
              Built for Admins, Teachers and Students
            </p>
            <h2 className="text-5xl font-bold leading-tight">
              Manage learning operations from one powerful dashboard.
            </h2>
            <p className="mt-6 text-lg text-indigo-100 leading-8">
              Courses, enrollments, assignments, submissions, grades and analytics —
              all connected in a clean SaaS experience.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 max-w-xl">
            {["Courses", "Grades", "Analytics"].map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur"
              >
                <p className="text-sm text-indigo-100">{item}</p>
                <p className="mt-2 text-2xl font-bold">Smart</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex min-h-screen w-full lg:w-1/2 items-center justify-center bg-slate-50 px-6">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center">
              <GraduationCap size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">EMS Portal</h1>
              <p className="text-sm text-slate-500">Education Management System</p>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/70">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-slate-950">Welcome back</h2>
              <p className="mt-2 text-slate-500">
                Login to continue to your dashboard.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="admin@example.com"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-slate-900 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-slate-900 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3.5 font-semibold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {submitting && <Loader2 className="animate-spin" size={18} />}
                Login
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-500">
              Don’t have an account?{" "}
              <Link to="/signup" className="font-semibold text-indigo-600 hover:text-indigo-700">
                Create account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;