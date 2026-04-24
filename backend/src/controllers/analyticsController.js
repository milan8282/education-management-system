import Course from "../models/Course.js";
import Enrollment from "../models/Enrollment.js";
import Grade from "../models/Grade.js";
import User from "../models/User.js";
import Assignment from "../models/Assignment.js";
import asyncHandler from "../utils/asyncHandler.js";
import { successResponse } from "../utils/apiResponse.js";

export const getDashboardStats = asyncHandler(async (req, res) => {
  const filter = {};

  if (req.user.role === "teacher") {
    filter.assignedTeacher = req.user._id;
  }

  const courses = await Course.find(filter).select("_id");

  const courseIds = courses.map((course) => course._id);

  const [
    totalCourses,
    totalStudents,
    totalTeachers,
    totalEnrollments,
    totalAssignments,
    totalGrades,
  ] = await Promise.all([
    req.user.role === "teacher"
      ? Course.countDocuments({ assignedTeacher: req.user._id })
      : Course.countDocuments(),

    req.user.role === "admin"
      ? User.countDocuments({ role: "student" })
      : Enrollment.distinct("student", { course: { $in: courseIds } }).then(
          (students) => students.length
        ),

    req.user.role === "admin"
      ? User.countDocuments({ role: "teacher" })
      : Promise.resolve(0),

    req.user.role === "teacher"
      ? Enrollment.countDocuments({ course: { $in: courseIds } })
      : Enrollment.countDocuments(),

    req.user.role === "teacher"
      ? Assignment.countDocuments({ course: { $in: courseIds } })
      : Assignment.countDocuments(),

    req.user.role === "teacher"
      ? Grade.countDocuments({ course: { $in: courseIds } })
      : Grade.countDocuments(),
  ]);

  return successResponse(res, "Dashboard stats fetched successfully", {
    totalCourses,
    totalStudents,
    totalTeachers,
    totalEnrollments,
    totalAssignments,
    totalGrades,
  });
});

export const getAverageGradesPerCourse = asyncHandler(async (req, res) => {
  const matchStage = {};

  if (req.user.role === "teacher") {
    const courses = await Course.find({ assignedTeacher: req.user._id }).select(
      "_id"
    );

    matchStage.course = {
      $in: courses.map((course) => course._id),
    };
  }

  if (req.user.role === "student") {
    matchStage.student = req.user._id;
  }

  const data = await Grade.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: "$course",
        averageGrade: { $avg: "$grade" },
        totalGrades: { $sum: 1 },
      },
    },
    {
      $lookup: {
        from: "courses",
        localField: "_id",
        foreignField: "_id",
        as: "course",
      },
    },
    { $unwind: "$course" },
    {
      $project: {
        _id: 0,
        courseId: "$course._id",
        courseTitle: "$course.title",
        averageGrade: { $round: ["$averageGrade", 2] },
        totalGrades: 1,
      },
    },
    { $sort: { averageGrade: -1 } },
  ]);

  return successResponse(res, "Average grades per course fetched successfully", data);
});

export const getStudentsPerCourse = asyncHandler(async (req, res) => {
  const matchStage = {};

  if (req.user.role === "teacher") {
    const courses = await Course.find({ assignedTeacher: req.user._id }).select(
      "_id"
    );

    matchStage.course = {
      $in: courses.map((course) => course._id),
    };
  }

  if (req.user.role === "student") {
    matchStage.student = req.user._id;
  }

  const data = await Enrollment.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: "$course",
        totalStudents: { $sum: 1 },
        activeStudents: {
          $sum: {
            $cond: [{ $eq: ["$status", "active"] }, 1, 0],
          },
        },
        completedStudents: {
          $sum: {
            $cond: [{ $eq: ["$status", "completed"] }, 1, 0],
          },
        },
        droppedStudents: {
          $sum: {
            $cond: [{ $eq: ["$status", "dropped"] }, 1, 0],
          },
        },
      },
    },
    {
      $lookup: {
        from: "courses",
        localField: "_id",
        foreignField: "_id",
        as: "course",
      },
    },
    { $unwind: "$course" },
    {
      $project: {
        _id: 0,
        courseId: "$course._id",
        courseTitle: "$course.title",
        totalStudents: 1,
        activeStudents: 1,
        completedStudents: 1,
        droppedStudents: 1,
      },
    },
    { $sort: { totalStudents: -1 } },
  ]);

  return successResponse(res, "Students per course fetched successfully", data);
});

export const getStudentsPerTeacher = asyncHandler(async (req, res) => {
  const matchStage = {};

  if (req.user.role === "teacher") {
    matchStage.assignedTeacher = req.user._id;
  }

  const data = await Course.aggregate([
    { $match: matchStage },
    {
      $lookup: {
        from: "enrollments",
        localField: "_id",
        foreignField: "course",
        as: "enrollments",
      },
    },
    {
      $group: {
        _id: "$assignedTeacher",
        totalCourses: { $sum: 1 },
        totalStudents: {
          $sum: { $size: "$enrollments" },
        },
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "teacher",
      },
    },
    { $unwind: "$teacher" },
    {
      $project: {
        _id: 0,
        teacherId: "$teacher._id",
        teacherName: "$teacher.name",
        teacherEmail: "$teacher.email",
        totalCourses: 1,
        totalStudents: 1,
      },
    },
    { $sort: { totalStudents: -1 } },
  ]);

  return successResponse(res, "Students per teacher fetched successfully", data);
});

export const getCourseCompletionRates = asyncHandler(async (req, res) => {
  const matchStage = {};

  if (req.user.role === "teacher") {
    const courses = await Course.find({ assignedTeacher: req.user._id }).select(
      "_id"
    );

    matchStage.course = {
      $in: courses.map((course) => course._id),
    };
  }

  if (req.user.role === "student") {
    matchStage.student = req.user._id;
  }

  const data = await Enrollment.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: "$course",
        totalEnrollments: { $sum: 1 },
        completedEnrollments: {
          $sum: {
            $cond: [{ $eq: ["$status", "completed"] }, 1, 0],
          },
        },
      },
    },
    {
      $lookup: {
        from: "courses",
        localField: "_id",
        foreignField: "_id",
        as: "course",
      },
    },
    { $unwind: "$course" },
    {
      $project: {
        _id: 0,
        courseId: "$course._id",
        courseTitle: "$course.title",
        totalEnrollments: 1,
        completedEnrollments: 1,
        completionRate: {
          $cond: [
            { $eq: ["$totalEnrollments", 0] },
            0,
            {
              $round: [
                {
                  $multiply: [
                    {
                      $divide: [
                        "$completedEnrollments",
                        "$totalEnrollments",
                      ],
                    },
                    100,
                  ],
                },
                2,
              ],
            },
          ],
        },
      },
    },
    { $sort: { completionRate: -1 } },
  ]);

  return successResponse(res, "Course completion rates fetched successfully", data);
});