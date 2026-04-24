import axiosInstance from "./axiosInstance";

export const assignmentApi = {
  getAssignments: (params = {}) => axiosInstance.get("/assignments", { params }),
  getAssignmentById: (id) => axiosInstance.get(`/assignments/${id}`),
  createAssignment: (payload) => axiosInstance.post("/assignments", payload),
  updateAssignment: (id, payload) =>
    axiosInstance.patch(`/assignments/${id}`, payload),
  deleteAssignment: (id) => axiosInstance.delete(`/assignments/${id}`),
  submitAssignment: (id, payload) =>
    axiosInstance.post(`/assignments/${id}/submit`, payload),
};