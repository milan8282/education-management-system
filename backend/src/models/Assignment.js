import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    answerText: {
      type: String,
      trim: true,
    },
    fileUrl: {
      type: String,
      trim: true,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["submitted", "reviewed"],
      default: "submitted",
    },
  },
  { timestamps: true }
);

const assignmentSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    title: {
      type: String,
      required: [true, "Assignment title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Assignment description is required"],
      trim: true,
    },
    type: {
      type: String,
      enum: ["assignment", "quiz"],
      default: "assignment",
    },
    dueDate: {
      type: Date,
      required: [true, "Due date is required"],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    submissions: [submissionSchema],
  },
  { timestamps: true }
);

const Assignment = mongoose.model("Assignment", assignmentSchema);

export default Assignment;