import Course from "../models/Course.js";
import Enrollment from "../models/Enrollment.js";
import User from "../models/User.js";
import asyncHandler from "../utils/asyncHandler.js";
import { successResponse } from "../utils/apiResponse.js";

export const enrollStudentByAdmin = asyncHandler(async (req, res) => {
  const { courseId, studentId } = req.body;

  const course = await Course.findById(courseId);

  if (!course) {
    res.status(404);
    throw new Error("Course not found");
  }

  const student = await User.findOne({
    _id: studentId,
    role: "student",
    isActive: true,
  });

  if (!student) {
    res.status(400);
    throw new Error("Student not found or user is not a student");
  }

  const existingEnrollment = await Enrollment.findOne({
    course: courseId,
    student: studentId,
  });

  if (existingEnrollment) {
    res.status(400);
    throw new Error("Student is already enrolled in this course");
  }

  const enrollment = await Enrollment.create({
    course: courseId,
    student: studentId,
    enrolledBy: req.user._id,
  });

  const populatedEnrollment = await Enrollment.findById(enrollment._id)
    .populate("course", "title description startDate endDate status")
    .populate("student", "name email role")
    .populate("enrolledBy", "name email role");

  return successResponse(
    res,
    "Student enrolled successfully",
    populatedEnrollment,
    201
  );
});

export const selfEnrollStudent = asyncHandler(async (req, res) => {
  const { courseId } = req.body;

  const course = await Course.findOne({
    _id: courseId,
    status: "active",
  });

  if (!course) {
    res.status(404);
    throw new Error("Active course not found");
  }

  const existingEnrollment = await Enrollment.findOne({
    course: courseId,
    student: req.user._id,
  });

  if (existingEnrollment) {
    res.status(400);
    throw new Error("You are already enrolled in this course");
  }

  const enrollment = await Enrollment.create({
    course: courseId,
    student: req.user._id,
    enrolledBy: req.user._id,
  });

  const populatedEnrollment = await Enrollment.findById(enrollment._id)
    .populate("course", "title description startDate endDate status")
    .populate("student", "name email role")
    .populate("enrolledBy", "name email role");

  return successResponse(
    res,
    "You enrolled in this course successfully",
    populatedEnrollment,
    201
  );
});

export const getAllEnrollments = asyncHandler(async (req, res) => {
  const { courseId, studentId, status } = req.query;

  const filter = {};

  if (courseId) filter.course = courseId;
  if (studentId) filter.student = studentId;
  if (status) filter.status = status;

  if (req.user.role === "student") {
    filter.student = req.user._id;
  }

  if (req.user.role === "teacher") {
    const teacherCourses = await Course.find({
      assignedTeacher: req.user._id,
    }).select("_id");

    filter.course = {
      $in: teacherCourses.map((course) => course._id),
    };
  }

  const enrollments = await Enrollment.find(filter)
    .populate("course", "title description startDate endDate status assignedTeacher")
    .populate("student", "name email role")
    .populate("enrolledBy", "name email role")
    .sort({ createdAt: -1 });

  return successResponse(
    res,
    "Enrollments fetched successfully",
    enrollments
  );
});

export const getEnrollmentById = asyncHandler(async (req, res) => {
  const enrollment = await Enrollment.findById(req.params.id)
    .populate("course", "title description startDate endDate status assignedTeacher")
    .populate("student", "name email role")
    .populate("enrolledBy", "name email role");

  if (!enrollment) {
    res.status(404);
    throw new Error("Enrollment not found");
  }

  if (
    req.user.role === "student" &&
    enrollment.student._id.toString() !== req.user._id.toString()
  ) {
    res.status(403);
    throw new Error("You are not allowed to view this enrollment");
  }

  if (req.user.role === "teacher") {
    const course = await Course.findById(enrollment.course._id);

    if (course.assignedTeacher.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error("You are not allowed to view this enrollment");
    }
  }

  return successResponse(
    res,
    "Enrollment fetched successfully",
    enrollment
  );
});

export const removeEnrollment = asyncHandler(async (req, res) => {
  const enrollment = await Enrollment.findById(req.params.id);

  if (!enrollment) {
    res.status(404);
    throw new Error("Enrollment not found");
  }

  await enrollment.deleteOne();

  return successResponse(res, "Enrollment removed successfully");
});

export const updateEnrollmentStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  if (!["active", "completed", "dropped"].includes(status)) {
    res.status(400);
    throw new Error("Invalid enrollment status");
  }

  const enrollment = await Enrollment.findById(req.params.id);

  if (!enrollment) {
    res.status(404);
    throw new Error("Enrollment not found");
  }

  enrollment.status = status;
  await enrollment.save();

  const updatedEnrollment = await Enrollment.findById(enrollment._id)
    .populate("course", "title description startDate endDate status")
    .populate("student", "name email role")
    .populate("enrolledBy", "name email role");

  return successResponse(
    res,
    "Enrollment status updated successfully",
    updatedEnrollment
  );
});