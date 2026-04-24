import mongoose from "mongoose";

const gradeSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    assignment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Assignment",
      default: null,
    },
    grade: {
      type: Number,
      required: [true, "Grade is required"],
      min: 0,
      max: 100,
    },
    remarks: {
      type: String,
      trim: true,
      default: "",
    },
    gradedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

gradeSchema.index(
  { course: 1, student: 1, assignment: 1 },
  { unique: true }
);

const Grade = mongoose.model("Grade", gradeSchema);

export default Grade;