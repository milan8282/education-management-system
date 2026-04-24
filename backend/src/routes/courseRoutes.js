import express from "express";
import {
  createCourse,
  getAllCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
} from "../controllers/courseController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { allowRoles } from "../middlewares/roleMiddleware.js";
import validateRequest from "../middlewares/validateMiddleware.js";
import {
  createCourseValidation,
  updateCourseValidation,
} from "../validations/courseValidation.js";

const router = express.Router();

router.use(protect);

router
  .route("/")
  .post(
    allowRoles("admin"),
    createCourseValidation,
    validateRequest,
    createCourse
  )
  .get(allowRoles("admin", "teacher", "student"), getAllCourses);

router
  .route("/:id")
  .get(allowRoles("admin", "teacher", "student"), getCourseById)
  .patch(
    allowRoles("admin"),
    updateCourseValidation,
    validateRequest,
    updateCourse
  )
  .delete(allowRoles("admin"), deleteCourse);

export default router;