import { body } from "express-validator";

export const createAssignmentValidation = [
  body("courseId")
    .notEmpty()
    .withMessage("Course ID is required")
    .isMongoId()
    .withMessage("Course ID must be valid"),
  body("title").notEmpty().withMessage("Assignment title is required"),
  body("description").notEmpty().withMessage("Assignment description is required"),
  body("type")
    .optional()
    .isIn(["assignment", "quiz"])
    .withMessage("Type must be assignment or quiz"),
  body("dueDate").isISO8601().withMessage("Valid due date is required"),
];

export const updateAssignmentValidation = [
  body("title").optional().notEmpty().withMessage("Title cannot be empty"),
  body("description")
    .optional()
    .notEmpty()
    .withMessage("Description cannot be empty"),
  body("type")
    .optional()
    .isIn(["assignment", "quiz"])
    .withMessage("Type must be assignment or quiz"),
  body("dueDate").optional().isISO8601().withMessage("Invalid due date"),
];

export const submitAssignmentValidation = [
  body("answerText")
    .optional()
    .isString()
    .withMessage("Answer text must be a string"),
  body("fileUrl").optional().isString().withMessage("File URL must be a string"),
];