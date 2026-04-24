import axiosInstance from "./axiosInstance";

export const userApi = {
  getUsers: (params = {}) => axiosInstance.get("/users", { params }),
  getUserById: (id) => axiosInstance.get(`/users/${id}`),
  updateStatus: (id, payload) => axiosInstance.patch(`/users/${id}/status`, payload),
  updateRole: (id, payload) => axiosInstance.patch(`/users/${id}/role`, payload),
  deleteUser: (id) => axiosInstance.delete(`/users/${id}`),
};