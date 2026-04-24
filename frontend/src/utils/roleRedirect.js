export const getRoleDashboardPath = (role) => {
  if (role === "admin") return "/admin";
  if (role === "teacher") return "/teacher";
  if (role === "student") return "/student";
  return "/login";
};