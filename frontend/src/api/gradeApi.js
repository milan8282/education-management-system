import axiosInstance from "./axiosInstance";

export const gradeApi = {
  getGrades: (params = {}) => axiosInstance.get("/grades", { params }),
  getGradeById: (id) => axiosInstance.get(`/grades/${id}`),
  assignGrade: (payload) => axiosInstance.post("/grades", payload),
  updateGrade: (id, payload) => axiosInstance.patch(`/grades/${id}`, payload),
  deleteGrade: (id) => axiosInstance.delete(`/grades/${id}`),
};