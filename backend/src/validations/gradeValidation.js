import { body } from "express-validator";

export const assignGradeValidation = [
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

  body("assignmentId")
    .optional({ nullable: true })
    .isMongoId()
    .withMessage("Assignment ID must be valid"),

  body("grade")
    .notEmpty()
    .withMessage("Grade is required")
    .isFloat({ min: 0, max: 100 })
    .withMessage("Grade must be between 0 and 100"),

  body("remarks").optional().isString().withMessage("Remarks must be text"),
];

export const updateGradeValidation = [
  body("grade")
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage("Grade must be between 0 and 100"),

  body("remarks").optional().isString().withMessage("Remarks must be text"),
];