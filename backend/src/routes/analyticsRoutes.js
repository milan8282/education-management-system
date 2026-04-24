import express from "express";
import {
  getDashboardStats,
  getAverageGradesPerCourse,
  getStudentsPerCourse,
  getStudentsPerTeacher,
  getCourseCompletionRates,
} from "../controllers/analyticsController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { allowRoles } from "../middlewares/roleMiddleware.js";

const router = express.Router();

router.use(protect);

router.get(
  "/dashboard-stats",
  allowRoles("admin", "teacher"),
  getDashboardStats
);

router.get(
  "/average-grades-per-course",
  allowRoles("admin", "teacher", "student"),
  getAverageGradesPerCourse
);

router.get(
  "/students-per-course",
  allowRoles("admin", "teacher", "student"),
  getStudentsPerCourse
);

router.get(
  "/students-per-teacher",
  allowRoles("admin", "teacher"),
  getStudentsPerTeacher
);

router.get(
  "/course-completion-rates",
  allowRoles("admin", "teacher", "student"),
  getCourseCompletionRates
);

export default router;