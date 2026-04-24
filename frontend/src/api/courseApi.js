import axiosInstance from "./axiosInstance";

export const courseApi = {
  getCourses: (params = {}) => axiosInstance.get("/courses", { params }),
  getCourseById: (id) => axiosInstance.get(`/courses/${id}`),
  createCourse: (payload) => axiosInstance.post("/courses", payload),
  updateCourse: (id, payload) => axiosInstance.patch(`/courses/${id}`, payload),
  deleteCourse: (id) => axiosInstance.delete(`/courses/${id}`),
};