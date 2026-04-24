import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "./models/User.js";
import Course from "./models/Course.js";
import Assignment from "./models/Assignment.js";

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected");

    await User.deleteMany({
      email: {
        $regex: /^(teacher|student)[0-9]+@gmail\.com$/,
      },
    });

    await Course.deleteMany({});
    await Assignment.deleteMany({});

    const teachers = await User.insertMany([
      { name: "Teacher 1", email: "teacher1@gmail.com", password: "123456", role: "teacher" },
      { name: "Teacher 2", email: "teacher2@gmail.com", password: "123456", role: "teacher" },
      { name: "Teacher 3", email: "teacher3@gmail.com", password: "123456", role: "teacher" },
      { name: "Teacher 4", email: "teacher4@gmail.com", password: "123456", role: "teacher" },
      { name: "Teacher 5", email: "teacher5@gmail.com", password: "123456", role: "teacher" },
    ]);

    const students = await User.insertMany([
      { name: "Student 1", email: "student1@gmail.com", password: "123456", role: "student" },
      { name: "Student 2", email: "student2@gmail.com", password: "123456", role: "student" },
      { name: "Student 3", email: "student3@gmail.com", password: "123456", role: "student" },
      { name: "Student 4", email: "student4@gmail.com", password: "123456", role: "student" },
      { name: "Student 5", email: "student5@gmail.com", password: "123456", role: "student" },
      { name: "Student 6", email: "student6@gmail.com", password: "123456", role: "student" },
      { name: "Student 7", email: "student7@gmail.com", password: "123456", role: "student" },
      { name: "Student 8", email: "student8@gmail.com", password: "123456", role: "student" },
      { name: "Student 9", email: "student9@gmail.com", password: "123456", role: "student" },
      { name: "Student 10", email: "student10@gmail.com", password: "123456", role: "student" },
    ]);

    const courses = await Course.insertMany([
      {
        title: "React Fundamentals",
        description: "Learn React basics, components, props, state, and hooks.",
        startDate: "2026-05-01",
        endDate: "2026-06-15",
        assignedTeacher: teachers[0]._id,
        createdBy: teachers[0]._id,
        status: "active",
      },
      {
        title: "Node.js Backend Development",
        description: "Build REST APIs using Node.js, Express, and MongoDB.",
        startDate: "2026-05-05",
        endDate: "2026-07-01",
        assignedTeacher: teachers[1]._id,
        createdBy: teachers[1]._id,
        status: "active",
      },
      {
        title: "MongoDB Database Design",
        description: "Understand MongoDB schemas, relations, indexes, and aggregation.",
        startDate: "2026-05-10",
        endDate: "2026-06-30",
        assignedTeacher: teachers[2]._id,
        createdBy: teachers[2]._id,
        status: "active",
      },
      {
        title: "JavaScript Advanced Concepts",
        description: "Master closures, promises, async-await, ES modules, and patterns.",
        startDate: "2026-05-15",
        endDate: "2026-07-10",
        assignedTeacher: teachers[3]._id,
        createdBy: teachers[3]._id,
        status: "active",
      },
      {
        title: "Tailwind CSS UI Design",
        description: "Design modern responsive interfaces using Tailwind CSS.",
        startDate: "2026-05-20",
        endDate: "2026-06-25",
        assignedTeacher: teachers[4]._id,
        createdBy: teachers[4]._id,
        status: "active",
      },
      {
        title: "Express API Security",
        description: "Implement JWT auth, RBAC, validation, and error handling.",
        startDate: "2026-06-01",
        endDate: "2026-07-20",
        assignedTeacher: teachers[0]._id,
        createdBy: teachers[0]._id,
        status: "active",
      },
      {
        title: "Frontend State Management",
        description: "Learn Context API, Redux concepts, and global state patterns.",
        startDate: "2026-06-05",
        endDate: "2026-07-25",
        assignedTeacher: teachers[1]._id,
        createdBy: teachers[1]._id,
        status: "active",
      },
      {
        title: "Full Stack MERN Project",
        description: "Build and integrate a complete MERN stack application.",
        startDate: "2026-06-10",
        endDate: "2026-08-01",
        assignedTeacher: teachers[2]._id,
        createdBy: teachers[2]._id,
        status: "active",
      },
      {
        title: "Dashboard Analytics with Recharts",
        description: "Create charts, dashboards, and analytics views using Recharts.",
        startDate: "2026-06-15",
        endDate: "2026-07-30",
        assignedTeacher: teachers[3]._id,
        createdBy: teachers[3]._id,
        status: "active",
      },
      {
        title: "Deployment and Production Setup",
        description: "Deploy frontend and backend apps using Vercel, Render, and environment variables.",
        startDate: "2026-06-20",
        endDate: "2026-08-10",
        assignedTeacher: teachers[4]._id,
        createdBy: teachers[4]._id,
        status: "active",
      },
    ]);

    await Assignment.insertMany([
      {
        course: courses[0]._id,
        title: "React Components Assignment",
        description: "Create reusable React components for a dashboard layout.",
        type: "assignment",
        dueDate: "2026-05-25",
        createdBy: teachers[0]._id,
      },
      {
        course: courses[1]._id,
        title: "Express Routes Quiz",
        description: "Answer questions about Express routes, controllers, and middleware.",
        type: "quiz",
        dueDate: "2026-05-30",
        createdBy: teachers[1]._id,
      },
      {
        course: courses[2]._id,
        title: "MongoDB Schema Design",
        description: "Design MongoDB schemas for users, courses, enrollments, and grades.",
        type: "assignment",
        dueDate: "2026-06-05",
        createdBy: teachers[2]._id,
      },
      {
        course: courses[3]._id,
        title: "JavaScript Async Practice",
        description: "Solve async-await and promise-based JavaScript problems.",
        type: "assignment",
        dueDate: "2026-06-10",
        createdBy: teachers[3]._id,
      },
      {
        course: courses[4]._id,
        title: "Tailwind Landing Page Task",
        description: "Build a responsive landing page using Tailwind CSS.",
        type: "assignment",
        dueDate: "2026-06-15",
        createdBy: teachers[4]._id,
      },
    ]);

    console.log("Seed data inserted successfully");
    console.log("Teachers:", teachers.length);
    console.log("Students:", students.length);
    console.log("Courses:", courses.length);
    console.log("Assignments:", 5);

    process.exit(0);
  } catch (error) {
    console.error("Seed error:", error.message);
    process.exit(1);
  }
};

seedData();