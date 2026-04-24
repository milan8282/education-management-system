import Grade from "../models/Grade.js";
import Course from "../models/Course.js";
import User from "../models/User.js";
import Enrollment from "../models/Enrollment.js";
import Assignment from "../models/Assignment.js";
import asyncHandler from "../utils/asyncHandler.js";
import { successResponse } from "../utils/apiResponse.js";

const ensureTeacherOwnsCourse = async (courseId, teacherId) => {
  const course = await Course.findById(courseId);

  if (!course) {
    throw Object.assign(new Error("Course not found"), { statusCode: 404 });
  }

  if (course.assignedTeacher.toString() !== teacherId.toString()) {
    throw Object.assign(
      new Error("You can assign grades only for your assigned courses"),
      { statusCode: 403 }
    );
  }

  return course;
};

export const assignGrade = asyncHandler(async (req, res) => {
  const { courseId, studentId, assignmentId, grade, remarks } = req.body;

  await ensureTeacherOwnsCourse(courseId, req.user._id);

  const student = await User.findOne({
    _id: studentId,
    role: "student",
    isActive: true,
  });

  if (!student) {
    res.status(400);
    throw new Error("Student not found or user is not a student");
  }

  const enrollment = await Enrollment.findOne({
    course: courseId,
    student: studentId,
    status: "active",
  });

  if (!enrollment) {
    res.status(400);
    throw new Error("Student is not actively enrolled in this course");
  }

  let finalAssignmentId = null;

  if (assignmentId) {
    const assignment = await Assignment.findOne({
      _id: assignmentId,
      course: courseId,
    });

    if (!assignment) {
      res.status(400);
      throw new Error("Assignment not found for this course");
    }

    const submitted = assignment.submissions.some(
      (submission) => submission.student.toString() === studentId.toString()
    );

    if (!submitted) {
      res.status(400);
      throw new Error("Student has not submitted this assignment");
    }

    finalAssignmentId = assignmentId;
  }

  const existingGrade = await Grade.findOne({
    course: courseId,
    student: studentId,
    assignment: finalAssignmentId,
  });

  if (existingGrade) {
    existingGrade.grade = grade;
    existingGrade.remarks = remarks || "";
    existingGrade.gradedBy = req.user._id;

    await existingGrade.save();

    const populatedUpdatedGrade = await Grade.findById(existingGrade._id)
      .populate("course", "title description")
      .populate("student", "name email role")
      .populate("assignment", "title type dueDate")
      .populate("gradedBy", "name email role");

    return successResponse(
      res,
      "Grade updated successfully",
      populatedUpdatedGrade
    );
  }

  const newGrade = await Grade.create({
    course: courseId,
    student: studentId,
    assignment: finalAssignmentId,
    grade,
    remarks,
    gradedBy: req.user._id,
  });

  const populatedGrade = await Grade.findById(newGrade._id)
    .populate("course", "title description")
    .populate("student", "name email role")
    .populate("assignment", "title type dueDate")
    .populate("gradedBy", "name email role");

  return successResponse(res, "Grade assigned successfully", populatedGrade, 201);
});

export const getGrades = asyncHandler(async (req, res) => {
  const { courseId, studentId, assignmentId } = req.query;

  const filter = {};

  if (courseId) filter.course = courseId;
  if (studentId) filter.student = studentId;
  if (assignmentId) filter.assignment = assignmentId;

  if (req.user.role === "student") {
    filter.student = req.user._id;
  }

  if (req.user.role === "teacher") {
    const courses = await Course.find({
      assignedTeacher: req.user._id,
    }).select("_id");

    filter.course = {
      $in: courses.map((course) => course._id),
    };
  }

  const grades = await Grade.find(filter)
    .populate("course", "title description")
    .populate("student", "name email role")
    .populate("assignment", "title type dueDate")
    .populate("gradedBy", "name email role")
    .sort({ createdAt: -1 });

  return successResponse(res, "Grades fetched successfully", grades);
});

export const getGradeById = asyncHandler(async (req, res) => {
  const grade = await Grade.findById(req.params.id)
    .populate("course", "title description assignedTeacher")
    .populate("student", "name email role")
    .populate("assignment", "title type dueDate")
    .populate("gradedBy", "name email role");

  if (!grade) {
    res.status(404);
    throw new Error("Grade not found");
  }

  if (
    req.user.role === "student" &&
    grade.student._id.toString() !== req.user._id.toString()
  ) {
    res.status(403);
    throw new Error("You are not allowed to view this grade");
  }

  if (
    req.user.role === "teacher" &&
    grade.course.assignedTeacher.toString() !== req.user._id.toString()
  ) {
    res.status(403);
    throw new Error("You are not allowed to view this grade");
  }

  return successResponse(res, "Grade fetched successfully", grade);
});

export const updateGrade = asyncHandler(async (req, res) => {
  const gradeRecord = await Grade.findById(req.params.id);

  if (!gradeRecord) {
    res.status(404);
    throw new Error("Grade not found");
  }

  await ensureTeacherOwnsCourse(gradeRecord.course, req.user._id);

  if (req.body.grade !== undefined) {
    gradeRecord.grade = req.body.grade;
  }

  if (req.body.remarks !== undefined) {
    gradeRecord.remarks = req.body.remarks;
  }

  gradeRecord.gradedBy = req.user._id;

  await gradeRecord.save();

  const updatedGrade = await Grade.findById(gradeRecord._id)
    .populate("course", "title description")
    .populate("student", "name email role")
    .populate("assignment", "title type dueDate")
    .populate("gradedBy", "name email role");

  return successResponse(res, "Grade updated successfully", updatedGrade);
});

export const deleteGrade = asyncHandler(async (req, res) => {
  const gradeRecord = await Grade.findById(req.params.id);

  if (!gradeRecord) {
    res.status(404);
    throw new Error("Grade not found");
  }

  await ensureTeacherOwnsCourse(gradeRecord.course, req.user._id);

  await gradeRecord.deleteOne();

  return successResponse(res, "Grade deleted successfully");
});