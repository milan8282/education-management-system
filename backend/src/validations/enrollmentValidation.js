import { body } from "express-validator";

export const enrollStudentValidation = [
  body("courseId")
    .notEmpty()
    .withMessage("Course ID is required")
    .isMongoId()
    .withMessage("Course ID must be valid"),

  body("studentId")
    .notEmpty()
    .withMessage("Student ID is required")
    .isMongoId()
    .withMessage("Student ID must be valid"),
];

export const selfEnrollValidation = [
  body("courseId")
    .notEmpty()
    .withMessage("Course ID is required")
    .isMongoId()
    .withMessage("Course ID must be valid"),
];