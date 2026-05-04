import path from "path";
import cloudinary from "../config/cloudinary.js";
import asyncHandler from "../utils/asyncHandler.js";
import { successResponse } from "../utils/apiResponse.js";

const sanitizeFileName = (name = "document") => {
  const ext = path.extname(name);
  const base = path
    .basename(name, ext)
    .replace(/[^a-zA-Z0-9-_]/g, "-")
    .toLowerCase();

  return `${Date.now()}-${base}${ext}`;
};

const uploadToCloudinary = (buffer, folder, originalName) => {
  return new Promise((resolve, reject) => {
    const safeFileName = sanitizeFileName(originalName);

    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "raw",
        public_id: safeFileName,
        use_filename: false,
        unique_filename: false,
        overwrite: false,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    stream.end(buffer);
  });
};

export const uploadDocument = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error("File is required");
  }

  const result = await uploadToCloudinary(
    req.file.buffer,
    "ems-documents",
    req.file.originalname
  );

  return successResponse(res, "File uploaded successfully", {
    url: result.secure_url,
    publicId: result.public_id,
    originalName: req.file.originalname,
    mimeType: req.file.mimetype,
    size: req.file.size,
  });
});