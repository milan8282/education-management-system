import { useEffect, useMemo, useState } from "react";
import {
  Award,
  BookOpen,
  CalendarClock,
  ClipboardCheck,
  FileText,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import toast from "react-hot-toast";
import PageHeader from "../../components/common/PageHeader";
import StatCard from "../../components/common/StatCard";
import Loader from "../../components/common/Loader";
import EmptyState from "../../components/common/EmptyState";
import { enrollmentApi } from "../../api/enrollmentApi";
import { assignmentApi } from "../../api/assignmentApi";
import { gradeApi } from "../../api/gradeApi";
import { analyticsApi } from "../../api/analyticsApi";
import { useAuth } from "../../context/AuthContext";

const StudentDashboard = () => {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [enrollments, setEnrollments] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [grades, setGrades] = useState([]);
  const [averageGrades, setAverageGrades] = useState([]);

  const submittedAssignmentIds = useMemo(() => {
    return new Set(
      assignments
        .filter((assignment) =>
          assignment.submissions?.some(
            (submission) => submission.student?._id === user?._id
          )
        )
        .map((assignment) => assignment._id)
    );
  }, [assignments, user?._id]);

  const pendingAssignments = useMemo(() => {
    return assignments.filter(
      (assignment) => !submittedAssignmentIds.has(assignment._id)
    );
  }, [assignments, submittedAssignmentIds]);

  const fetchDashboard = async () => {
    try {
      setLoading(true);

      const [enrollmentRes, assignmentRes, gradeRes, avgGradeRes] =
        await Promise.all([
          enrollmentApi.getEnrollments(),
          assignmentApi.getAssignments(),
          gradeApi.getGrades(),
          analyticsApi.averageGradesPerCourse(),
        ]);

      setEnrollments(enrollmentRes.data.data || []);
      setAssignments(assignmentRes.data.data || []);
      setGrades(gradeRes.data.data || []);
      setAverageGrades(avgGradeRes.data.data || []);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) return <Loader text="Loading student dashboard..." />;

  return (
    <div>
      {/* <PageHeader
        title="Student Dashboard"
        description="Track your enrolled courses, assignments, submissions, and grades."
      /> */}

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Enrolled Courses"
          value={enrollments.length}
          icon={BookOpen}
          helper="Your active learning"
        />
        <StatCard
          title="Assignments"
          value={assignments.length}
          icon={FileText}
          helper="Available tasks"
        />
        <StatCard
          title="Submitted"
          value={submittedAssignmentIds.size}
          icon={ClipboardCheck}
          helper="Completed submissions"
        />
        <StatCard
          title="Grades"
          value={grades.length}
          icon={Award}
          helper="Grade records"
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h3 className="text-lg font-bold text-slate-950">
              My Average Grades
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Course-wise performance overview.
            </p>
          </div>

          {averageGrades.length ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={averageGrades}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="courseTitle" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip />
                <Bar
                  dataKey="averageGrade"
                  fill="#4f46e5"
                  radius={[10, 10, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState
              title="No grade data"
              description="Your grade analytics will appear once teachers grade your work."
            />
          )}
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h3 className="text-lg font-bold text-slate-950">
              Pending Assignments
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Assignments you still need to submit.
            </p>
          </div>

          {pendingAssignments.length ? (
            <div className="space-y-3">
              {pendingAssignments.slice(0, 5).map((assignment) => (
                <div
                  key={assignment._id}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="font-bold text-slate-950">
                        {assignment.title}
                      </h4>
                      <p className="mt-1 text-sm text-slate-500">
                        {assignment.course?.title || "Course"} •{" "}
                        {assignment.type}
                      </p>
                    </div>

                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
                      <CalendarClock size={13} />
                      Due{" "}
                      {assignment.dueDate
                        ? new Date(assignment.dueDate).toLocaleDateString()
                        : "-"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No pending assignments"
              description="Great! You do not have pending submissions right now."
            />
          )}
        </div>
      </div>

      <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-bold text-slate-950">Recent Grades</h3>
        <p className="mt-1 text-sm text-slate-500">
          Latest grades assigned by your teachers.
        </p>

        {grades.length ? (
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            {grades.slice(0, 6).map((grade) => (
              <div
                key={grade._id}
                className="rounded-2xl border border-slate-200 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-bold text-slate-950">
                      {grade.assignment?.title || "Overall Course Grade"}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {grade.course?.title || "-"}
                    </p>
                  </div>

                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                    {grade.grade}/100
                  </span>
                </div>

                {grade.remarks && (
                  <p className="mt-3 rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
                    {grade.remarks}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-5">
            <EmptyState
              title="No grades yet"
              description="Your grades will appear here after teachers review your submissions."
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;