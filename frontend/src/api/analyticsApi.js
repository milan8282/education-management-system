import axiosInstance from "./axiosInstance";

export const analyticsApi = {
  dashboardStats: () => axiosInstance.get("/analytics/dashboard-stats"),
  averageGradesPerCourse: () =>
    axiosInstance.get("/analytics/average-grades-per-course"),
  studentsPerCourse: () => axiosInstance.get("/analytics/students-per-course"),
  studentsPerTeacher: () => axiosInstance.get("/analytics/students-per-teacher"),
  courseCompletionRates: () =>
    axiosInstance.get("/analytics/course-completion-rates"),
};