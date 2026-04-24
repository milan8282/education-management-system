import { useMemo, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import {
  BarChart3,
  BookOpen,
  ClipboardCheck,
  FileText,
  GraduationCap,
  Home,
  LogOut,
  Menu,
  School,
  Users,
  X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const menuByRole = {
  admin: [
    { label: "Dashboard", path: "/admin", icon: Home },
    { label: "Users", path: "/admin/users", icon: Users },
    { label: "Courses", path: "/admin/courses", icon: BookOpen },
    { label: "Enrollments", path: "/admin/enrollments", icon: School },
    { label: "Analytics", path: "/admin/analytics", icon: BarChart3 },
  ],
  teacher: [
    { label: "Dashboard", path: "/teacher", icon: Home },
    { label: "My Courses", path: "/teacher/courses", icon: BookOpen },
    { label: "Assignments", path: "/teacher/assignments", icon: FileText },
    { label: "Submissions", path: "/teacher/submissions", icon: ClipboardCheck },
    { label: "Grades", path: "/teacher/grades", icon: GraduationCap },
  ],
  student: [
    { label: "Dashboard", path: "/student", icon: Home },
    { label: "My Courses", path: "/student/courses", icon: BookOpen },
    { label: "Assignments", path: "/student/assignments", icon: FileText },
    { label: "My Grades", path: "/student/grades", icon: GraduationCap },
  ],
};

const titleMap = {
  "/admin": "Admin Dashboard",
  "/admin/users": "Users Management",
  "/admin/courses": "Courses Management",
  "/admin/enrollments": "Enrollments",
  "/admin/analytics": "Analytics",

  "/teacher": "Teacher Dashboard",
  "/teacher/courses": "My Courses",
  "/teacher/assignments": "Assignments",
  "/teacher/submissions": "Student Submissions",
  "/teacher/grades": "Grades",

  "/student": "Student Dashboard",
  "/student/courses": "My Courses",
  "/student/assignments": "Assignments",
  "/student/grades": "My Grades",
};

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const menuItems = useMemo(() => menuByRole[user?.role] || [], [user?.role]);

  const pageTitle = titleMap[location.pathname] || "Dashboard";

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      <div className="flex h-20 items-center gap-3 border-b border-slate-200 px-6">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-200">
          <GraduationCap size={24} />
        </div>
        <div>
          <h1 className="text-lg font-bold text-slate-950">EMS Portal</h1>
          <p className="text-xs font-medium text-slate-500">Education SaaS</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-4 py-6">
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === `/${user?.role}`}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                [
                  "group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition",
                  isActive
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-950",
                ].join(" ")
              }
            >
              <Icon size={19} />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      <div className="border-t border-slate-200 p-4">
        <div className="mb-4 rounded-2xl bg-slate-50 p-4">
          <p className="text-sm font-bold text-slate-950">{user?.name}</p>
          <p className="mt-1 truncate text-xs text-slate-500">{user?.email}</p>
          <span className="mt-3 inline-flex rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold capitalize text-indigo-700">
            {user?.role}
          </span>
        </div>

        <button
          onClick={logout}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <aside className="fixed left-0 top-0 z-30 hidden h-screen w-72 border-r border-slate-200 bg-white lg:block">
        <SidebarContent />
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute left-0 top-0 h-full w-80 max-w-[85vw] bg-white shadow-2xl">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute right-4 top-4 rounded-xl p-2 text-slate-500 hover:bg-slate-100"
            >
              <X size={22} />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      <main className="lg:pl-72">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
          <div className="flex h-20 items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setMobileOpen(true)}
                className="rounded-2xl border border-slate-200 bg-white p-2.5 text-slate-700 shadow-sm lg:hidden"
              >
                <Menu size={22} />
              </button>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  {user?.role} panel
                </p>
                <h2 className="text-xl font-bold text-slate-950 sm:text-2xl">
                  {pageTitle}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-500 md:block">
                Welcome, <span className="font-semibold text-slate-900">{user?.name}</span>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600 text-sm font-bold uppercase text-white shadow-lg shadow-indigo-100">
                {user?.name?.charAt(0) || "U"}
              </div>
            </div>
          </div>
        </header>

        <section className="px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </section>
      </main>
    </div>
  );
};

export default DashboardLayout;