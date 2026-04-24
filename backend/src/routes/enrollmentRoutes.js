import express from "express";
import {
  enrollStudentByAdmin,
  selfEnrollStudent,
  getAllEnrollments,
  getEnrollmentById,
  removeEnrollment,
  updateEnrollmentStatus,
} from "../controllers/enrollmentController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { allowRoles } from "../middlewares/roleMiddleware.js";
import validateRequest from "../middlewares/validateMiddleware.js";
import {
  enrollStudentValidation,
  selfEnrollValidation,
} from "../validations/enrollmentValidation.js";

const router = express.Router();

router.use(protect);

router.post(
  "/admin/enroll",
  allowRoles("admin"),
  enrollStudentValidation,
  validateRequest,
  enrollStudentByAdmin
);

router.post(
  "/self-enroll",
  allowRoles("student"),
  selfEnrollValidation,
  validateRequest,
  selfEnrollStudent
);

router.get("/", allowRoles("admin", "teacher", "student"), getAllEnrollments);

router.get("/:id", allowRoles("admin", "teacher", "student"), getEnrollmentById);

router.patch(
  "/:id/status",
  allowRoles("admin"),
  updateEnrollmentStatus
);

router.delete("/:id", allowRoles("admin"), removeEnrollment);

export default router;