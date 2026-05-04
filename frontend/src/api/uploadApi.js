import axiosInstance from "./axiosInstance";

export const uploadApi = {
  uploadDocument: (file) => {
    const formData = new FormData();
    formData.append("file", file);

    return axiosInstance.post("/uploads/document", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
};