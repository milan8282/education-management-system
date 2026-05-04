import express from "express";
import { uploadDocument } from "../controllers/uploadController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { allowRoles } from "../middlewares/roleMiddleware.js";
import { uploadFile } from "../middlewares/uploadMiddleware.js";

const router = express.Router();

router.post(
  "/document",
  protect,
  allowRoles("teacher", "student"),
  uploadFile.single("file"),
  uploadDocument
);

export default router;