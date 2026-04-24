import express from "express";
import {
  assignGrade,
  getGrades,
  getGradeById,
  updateGrade,
  deleteGrade,
} from "../controllers/gradeController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { allowRoles } from "../middlewares/roleMiddleware.js";
import validateRequest from "../middlewares/validateMiddleware.js";
import {
  assignGradeValidation,
  updateGradeValidation,
} from "../validations/gradeValidation.js";

const router = express.Router();

router.use(protect);

router
  .route("/")
  .get(allowRoles("admin", "teacher", "student"), getGrades)
  .post(
    allowRoles("teacher"),
    assignGradeValidation,
    validateRequest,
    assignGrade
  );

router
  .route("/:id")
  .get(allowRoles("admin", "teacher", "student"), getGradeById)
  .patch(
    allowRoles("teacher"),
    updateGradeValidation,
    validateRequest,
    updateGrade
  )
  .delete(allowRoles("teacher"), deleteGrade);

export default router;