import { body } from "express-validator";

export const createCourseValidation = [
  body("title").notEmpty().withMessage("Course title is required"),
  body("description").notEmpty().withMessage("Course description is required"),
  body("startDate").isISO8601().withMessage("Valid start date is required"),
  body("endDate").isISO8601().withMessage("Valid end date is required"),
  body("assignedTeacher")
    .notEmpty()
    .withMessage("Assigned teacher is required")
    .isMongoId()
    .withMessage("Assigned teacher must be a valid user ID"),
];

export const updateCourseValidation = [
  body("title").optional().notEmpty().withMessage("Course title cannot be empty"),
  body("description")
    .optional()
    .notEmpty()
    .withMessage("Course description cannot be empty"),
  body("startDate").optional().isISO8601().withMessage("Invalid start date"),
  body("endDate").optional().isISO8601().withMessage("Invalid end date"),
  body("assignedTeacher")
    .optional()
    .isMongoId()
    .withMessage("Assigned teacher must be a valid user ID"),
  body("status")
    .optional()
    .isIn(["active", "inactive", "completed"])
    .withMessage("Invalid course status"),
];