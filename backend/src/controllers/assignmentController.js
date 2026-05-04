import Assignment from "../models/Assignment.js";
import Course from "../models/Course.js";
import Enrollment from "../models/Enrollment.js";
import asyncHandler from "../utils/asyncHandler.js";
import { successResponse } from "../utils/apiResponse.js";

const ensureTeacherOwnsCourse = async (courseId, teacherId) => {
    const course = await Course.findById(courseId);

    if (!course) {
        throw Object.assign(new Error("Course not found"), { statusCode: 404 });
    }

    if (course.assignedTeacher.toString() !== teacherId.toString()) {
        throw Object.assign(new Error("You can manage assignments only for your assigned courses"), {
            statusCode: 403,
        });
    }

    return course;
};

export const createAssignment = asyncHandler(async (req, res) => {
    const { courseId, title, description, type, dueDate, materialFile } = req.body;

    await ensureTeacherOwnsCourse(courseId, req.user._id);

    const assignment = await Assignment.create({
        course: courseId,
        title,
        description,
        type: type || "assignment",
        dueDate,
        materialFile: materialFile || null,
        createdBy: req.user._id,
    });

    const populatedAssignment = await Assignment.findById(assignment._id)
        .populate("course", "title description startDate endDate")
        .populate("createdBy", "name email role");

    return successResponse(
        res,
        "Assignment created successfully",
        populatedAssignment,
        201
    );
});

export const getAssignments = asyncHandler(async (req, res) => {
    const { courseId, type } = req.query;

    const filter = {};

    if (courseId) filter.course = courseId;
    if (type) filter.type = type;

    if (req.user.role === "teacher") {
        const courses = await Course.find({ assignedTeacher: req.user._id }).select("_id");
        filter.course = { $in: courses.map((course) => course._id) };
    }

    if (req.user.role === "student") {
        const enrollments = await Enrollment.find({
            student: req.user._id,
            status: "active",
        }).select("course");

        filter.course = {
            $in: enrollments.map((enrollment) => enrollment.course),
        };
    }

    const assignments = await Assignment.find(filter)
        .populate("course", "title description startDate endDate")
        .populate("createdBy", "name email role")
        .populate("submissions.student", "name email role")
        .sort({ createdAt: -1 });

    return successResponse(res, "Assignments fetched successfully", assignments);
});

export const getAssignmentById = asyncHandler(async (req, res) => {
    const assignment = await Assignment.findById(req.params.id)
        .populate("course", "title description startDate endDate assignedTeacher")
        .populate("createdBy", "name email role")
        .populate("submissions.student", "name email role");

    if (!assignment) {
        res.status(404);
        throw new Error("Assignment not found");
    }

    if (
        req.user.role === "teacher" &&
        assignment.course.assignedTeacher.toString() !== req.user._id.toString()
    ) {
        res.status(403);
        throw new Error("You are not allowed to view this assignment");
    }

    if (req.user.role === "student") {
        const enrolled = await Enrollment.findOne({
            course: assignment.course._id,
            student: req.user._id,
            status: "active",
        });

        if (!enrolled) {
            res.status(403);
            throw new Error("You are not enrolled in this course");
        }
    }

    return successResponse(res, "Assignment fetched successfully", assignment);
});

export const updateAssignment = asyncHandler(async (req, res) => {
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
        res.status(404);
        throw new Error("Assignment not found");
    }

    await ensureTeacherOwnsCourse(assignment.course, req.user._id);

    assignment.title = req.body.title ?? assignment.title;
    assignment.description = req.body.description ?? assignment.description;
    assignment.type = req.body.type ?? assignment.type;
    assignment.dueDate = req.body.dueDate ?? assignment.dueDate;

    if (req.body.materialFile !== undefined) {
        assignment.materialFile = req.body.materialFile;
    }

    await assignment.save();

    const updatedAssignment = await Assignment.findById(assignment._id)
        .populate("course", "title description startDate endDate")
        .populate("createdBy", "name email role")
        .populate("submissions.student", "name email role");

    return successResponse(
        res,
        "Assignment updated successfully",
        updatedAssignment
    );
});

export const deleteAssignment = asyncHandler(async (req, res) => {
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
        res.status(404);
        throw new Error("Assignment not found");
    }

    await ensureTeacherOwnsCourse(assignment.course, req.user._id);

    await assignment.deleteOne();

    return successResponse(res, "Assignment deleted successfully");
});

export const submitAssignment = asyncHandler(async (req, res) => {
  const { answerText, file } = req.body;

  if (!answerText && !file?.url) {
    res.status(400);
    throw new Error("Either answer text or uploaded file is required");
  }

  const assignment = await Assignment.findById(req.params.id);

  if (!assignment) {
    res.status(404);
    throw new Error("Assignment not found");
  }

  const now = new Date();

  if (new Date(assignment.dueDate) < now) {
    res.status(400);
    throw new Error("Submission closed. Assignment due date is passed.");
  }

  const enrolled = await Enrollment.findOne({
    course: assignment.course,
    student: req.user._id,
    status: "active",
  });

  if (!enrolled) {
    res.status(403);
    throw new Error("You must be enrolled in this course to submit assignment");
  }

  const existingSubmission = assignment.submissions.find(
    (submission) => submission.student.toString() === req.user._id.toString()
  );

  if (existingSubmission) {
    res.status(400);
    throw new Error("You have already submitted this assignment");
  }

  assignment.submissions.push({
    student: req.user._id,
    answerText: answerText || "",
    file: file || null,
  });

  await assignment.save();

  const updatedAssignment = await Assignment.findById(assignment._id)
    .populate("course", "title description")
    .populate("createdBy", "name email role")
    .populate("submissions.student", "name email role");

  return successResponse(
    res,
    "Assignment submitted successfully",
    updatedAssignment
  );
});