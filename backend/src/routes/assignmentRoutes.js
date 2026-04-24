import express from "express";
import {
  createAssignment,
  getAssignments,
  getAssignmentById,
  updateAssignment,
  deleteAssignment,
  submitAssignment,
} from "../controllers/assignmentController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { allowRoles } from "../middlewares/roleMiddleware.js";
import validateRequest from "../middlewares/validateMiddleware.js";
import {
  createAssignmentValidation,
  updateAssignmentValidation,
  submitAssignmentValidation,
} from "../validations/assignmentValidation.js";

const router = express.Router();

router.use(protect);

router
  .route("/")
  .get(allowRoles("admin", "teacher", "student"), getAssignments)
  .post(
    allowRoles("teacher"),
    createAssignmentValidation,
    validateRequest,
    createAssignment
  );

router
  .route("/:id")
  .get(allowRoles("admin", "teacher", "student"), getAssignmentById)
  .patch(
    allowRoles("teacher"),
    updateAssignmentValidation,
    validateRequest,
    updateAssignment
  )
  .delete(allowRoles("teacher"), deleteAssignment);

router.post(
  "/:id/submit",
  allowRoles("student"),
  submitAssignmentValidation,
  validateRequest,
  submitAssignment
);

export default router;