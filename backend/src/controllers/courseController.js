import Course from "../models/Course.js";
import User from "../models/User.js";
import asyncHandler from "../utils/asyncHandler.js";
import { successResponse } from "../utils/apiResponse.js";

export const createCourse = asyncHandler(async (req, res) => {
  const { title, description, startDate, endDate, assignedTeacher } = req.body;

  const teacher = await User.findOne({
    _id: assignedTeacher,
    role: "teacher",
    isActive: true,
  });

  if (!teacher) {
    res.status(400);
    throw new Error("Assigned teacher not found or user is not a teacher");
  }

  if (new Date(endDate) <= new Date(startDate)) {
    res.status(400);
    throw new Error("End date must be greater than start date");
  }

  const course = await Course.create({
    title,
    description,
    startDate,
    endDate,
    assignedTeacher,
    createdBy: req.user._id,
  });

  const populatedCourse = await Course.findById(course._id)
    .populate("assignedTeacher", "name email role")
    .populate("createdBy", "name email role");

  return successResponse(res, "Course created successfully", populatedCourse, 201);
});

export const getAllCourses = asyncHandler(async (req, res) => {
  const { status, teacher, search } = req.query;

  const filter = {};

  if (status) filter.status = status;
  if (teacher) filter.assignedTeacher = teacher;

  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }

  if (req.user.role === "teacher") {
    filter.assignedTeacher = req.user._id;
  }

  const courses = await Course.find(filter)
    .populate("assignedTeacher", "name email role")
    .populate("createdBy", "name email role")
    .sort({ createdAt: -1 });

  return successResponse(res, "Courses fetched successfully", courses);
});

export const getCourseById = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id)
    .populate("assignedTeacher", "name email role")
    .populate("createdBy", "name email role");

  if (!course) {
    res.status(404);
    throw new Error("Course not found");
  }

  if (
    req.user.role === "teacher" &&
    course.assignedTeacher._id.toString() !== req.user._id.toString()
  ) {
    res.status(403);
    throw new Error("You are not allowed to view this course");
  }

  return successResponse(res, "Course fetched successfully", course);
});

export const updateCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    res.status(404);
    throw new Error("Course not found");
  }

  if (req.body.assignedTeacher) {
    const teacher = await User.findOne({
      _id: req.body.assignedTeacher,
      role: "teacher",
      isActive: true,
    });

    if (!teacher) {
      res.status(400);
      throw new Error("Assigned teacher not found or user is not a teacher");
    }
  }

  const startDate = req.body.startDate || course.startDate;
  const endDate = req.body.endDate || course.endDate;

  if (new Date(endDate) <= new Date(startDate)) {
    res.status(400);
    throw new Error("End date must be greater than start date");
  }

  const updatedCourse = await Course.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  })
    .populate("assignedTeacher", "name email role")
    .populate("createdBy", "name email role");

  return successResponse(res, "Course updated successfully", updatedCourse);
});

export const deleteCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    res.status(404);
    throw new Error("Course not found");
  }

  await course.deleteOne();

  return successResponse(res, "Course deleted successfully");
});