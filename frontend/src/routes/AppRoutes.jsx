import { Navigate, Route, Routes } from "react-router-dom";

import ProtectedRoute from "../components/common/ProtectedRoute";
import RoleRoute from "../components/common/RoleRoute";
import DashboardLayout from "../layouts/DashboardLayout";

import Login from "../pages/auth/Login";
import Signup from "../pages/auth/Signup";
import NotFound from "../pages/NotFound";

import AdminDashboard from "../pages/admin/AdminDashboard";
import ManageUsers from "../pages/admin/ManageUsers";
import ManageCourses from "../pages/admin/ManageCourses";
import ManageEnrollments from "../pages/admin/ManageEnrollments";
import AdminAnalytics from "../pages/admin/AdminAnalytics";

import TeacherDashboard from "../pages/teacher/TeacherDashboard";
import TeacherCourses from "../pages/teacher/TeacherCourses";
import TeacherAssignments from "../pages/teacher/TeacherAssignments";
import TeacherSubmissions from "../pages/teacher/TeacherSubmissions";
import TeacherGrades from "../pages/teacher/TeacherGrades";

import StudentDashboard from "../pages/student/StudentDashboard";
import StudentCourses from "../pages/student/StudentCourses";
import StudentAssignments from "../pages/student/StudentAssignments";
import StudentGrades from "../pages/student/StudentGrades";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />

      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route element={<RoleRoute allowedRoles={["admin"]} />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<ManageUsers />} />
            <Route path="/admin/courses" element={<ManageCourses />} />
            <Route path="/admin/enrollments" element={<ManageEnrollments />} />
            <Route path="/admin/analytics" element={<AdminAnalytics />} />
          </Route>

          <Route element={<RoleRoute allowedRoles={["teacher"]} />}>
            <Route path="/teacher" element={<TeacherDashboard />} />
            <Route path="/teacher/courses" element={<TeacherCourses />} />
            <Route path="/teacher/assignments" element={<TeacherAssignments />} />
            <Route path="/teacher/submissions" element={<TeacherSubmissions />} />
            <Route path="/teacher/grades" element={<TeacherGrades />} />
          </Route>

          <Route element={<RoleRoute allowedRoles={["student"]} />}>
            <Route path="/student" element={<StudentDashboard />} />
            <Route path="/student/courses" element={<StudentCourses />} />
            <Route path="/student/assignments" element={<StudentAssignments />} />
            <Route path="/student/grades" element={<StudentGrades />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;