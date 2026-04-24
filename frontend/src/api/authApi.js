import axiosInstance from "./axiosInstance";

export const authApi = {
  signup: (payload) => axiosInstance.post("/auth/signup", payload),
  login: (payload) => axiosInstance.post("/auth/login", payload),
  me: () => axiosInstance.get("/auth/me"),
};