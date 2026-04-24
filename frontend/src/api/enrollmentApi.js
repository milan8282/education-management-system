import axiosInstance from "./axiosInstance";

export const enrollmentApi = {
  getEnrollments: (params = {}) => axiosInstance.get("/enrollments", { params }),
  getEnrollmentById: (id) => axiosInstance.get(`/enrollments/${id}`),
  enrollByAdmin: (payload) =>
    axiosInstance.post("/enrollments/admin/enroll", payload),
  selfEnroll: (payload) => axiosInstance.post("/enrollments/self-enroll", payload),
  updateStatus: (id, payload) =>
    axiosInstance.patch(`/enrollments/${id}/status`, payload),
  removeEnrollment: (id) => axiosInstance.delete(`/enrollments/${id}`),
};