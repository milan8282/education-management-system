import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  BookOpen,
  ClipboardCheck,
  FileText,
  GraduationCap,
  Users,
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
import { analyticsApi } from "../../api/analyticsApi";
import { courseApi } from "../../api/courseApi";
import { enrollmentApi } from "../../api/enrollmentApi";
import { gradeApi } from "../../api/gradeApi";
import { assignmentApi } from "../../api/assignmentApi";

const TeacherDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [courses, setCourses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [grades, setGrades] = useState([]);
  const [averageGrades, setAverageGrades] = useState([]);

  const totalSubmissions = useMemo(() => {
    return assignments.reduce(
      (total, assignment) => total + (assignment.submissions?.length || 0),
      0
    );
  }, [assignments]);

  const fetchTeacherDashboard = async () => {
    try {
      setLoading(true);

      const [
        statsRes,
        coursesRes,
        assignmentsRes,
        enrollmentsRes,
        gradesRes,
        avgGradesRes,
      ] = await Promise.all([
        analyticsApi.dashboardStats(),
        courseApi.getCourses(),
        assignmentApi.getAssignments(),
        enrollmentApi.getEnrollments(),
        gradeApi.getGrades(),
        analyticsApi.averageGradesPerCourse(),
      ]);

      setStats(statsRes.data.data);
      setCourses(coursesRes.data.data || []);
      setAssignments(assignmentsRes.data.data || []);
      setEnrollments(enrollmentsRes.data.data || []);
      setGrades(gradesRes.data.data || []);
      setAverageGrades(avgGradesRes.data.data || []);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load teacher dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeacherDashboard();
  }, []);

  if (loading) return <Loader text="Loading teacher dashboard..." />;

  return (
    <div>
      {/* <PageHeader
        title="Teacher Dashboard"
        description="Track your assigned courses, students, assignments, submissions, and grades."
      /> */}

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="My Courses"
          value={stats?.totalCourses}
          icon={BookOpen}
          helper="Assigned courses"
        />
        <StatCard
          title="Students"
          value={stats?.totalStudents}
          icon={Users}
          helper="Across your courses"
        />
        <StatCard
          title="Assignments"
          value={stats?.totalAssignments}
          icon={FileText}
          helper="Created by you"
        />
        <StatCard
          title="Submissions"
          value={totalSubmissions}
          icon={ClipboardCheck}
          helper="Received submissions"
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-950">Average Grades</h3>
              <p className="mt-1 text-sm text-slate-500">
                Performance across your assigned courses.
              </p>
            </div>
            <BarChart3 className="text-indigo-600" />
          </div>

          {averageGrades.length ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={averageGrades}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="courseTitle" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="averageGrade" fill="#4f46e5" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState
              title="No grade data"
              description="Grades will appear once you grade student submissions."
            />
          )}
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-950">Recent Assignments</h3>
              <p className="mt-1 text-sm text-slate-500">
                Latest assignments and quizzes.
              </p>
            </div>
            <FileText className="text-indigo-600" />
          </div>

          {assignments.length ? (
            <div className="space-y-3">
              {assignments.slice(0, 5).map((assignment) => (
                <div
                  key={assignment._id}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="font-bold text-slate-950">{assignment.title}</h4>
                      <p className="mt-1 text-sm text-slate-500">
                        {assignment.course?.title || "Course"} • {assignment.type}
                      </p>
                    </div>
                    <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">
                      {assignment.submissions?.length || 0} submissions
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No assignments"
              description="Create your first assignment for your course."
            />
          )}
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <SummaryCard
          title="Assigned Courses"
          icon={BookOpen}
          items={courses}
          emptyTitle="No assigned courses"
          renderItem={(course) => (
            <>
              <p className="font-bold text-slate-950">{course.title}</p>
              <p className="mt-1 text-sm text-slate-500">
                {course.startDate ? new Date(course.startDate).toLocaleDateString() : "-"} to{" "}
                {course.endDate ? new Date(course.endDate).toLocaleDateString() : "-"}
              </p>
            </>
          )}
        />

        <SummaryCard
          title="Recent Grades"
          icon={GraduationCap}
          items={grades}
          emptyTitle="No grades yet"
          renderItem={(grade) => (
            <>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-bold text-slate-950">
                    {grade.student?.name || "Student"}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {grade.course?.title || "Course"}
                  </p>
                </div>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                  {grade.grade}/100
                </span>
              </div>
            </>
          )}
        />
      </div>
    </div>
  );
};

const SummaryCard = ({ title, icon: Icon, items, emptyTitle, renderItem }) => {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-950">{title}</h3>
        <Icon className="text-indigo-600" />
      </div>

      {items.length ? (
        <div className="space-y-3">
          {items.slice(0, 5).map((item) => (
            <div key={item._id} className="rounded-2xl border border-slate-200 p-4">
              {renderItem(item)}
            </div>
          ))}
        </div>
      ) : (
        <EmptyState title={emptyTitle} />
      )}
    </div>
  );
};

export default TeacherDashboard;