import { useEffect, useState } from "react";
import {
  BarChart3,
  BookOpen,
  ClipboardList,
  GraduationCap,
  School,
  Users,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Pie,
  PieChart,
  Cell,
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

const COLORS = ["#4f46e5", "#10b981", "#f59e0b", "#ef4444", "#06b6d4"];

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [averageGrades, setAverageGrades] = useState([]);
  const [studentsPerCourse, setStudentsPerCourse] = useState([]);
  const [completionRates, setCompletionRates] = useState([]);
  const [studentsPerTeacher, setStudentsPerTeacher] = useState([]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const [statsRes, avgRes, studentsCourseRes, completionRes, teacherRes] =
        await Promise.all([
          analyticsApi.dashboardStats(),
          analyticsApi.averageGradesPerCourse(),
          analyticsApi.studentsPerCourse(),
          analyticsApi.courseCompletionRates(),
          analyticsApi.studentsPerTeacher(),
        ]);

      setStats(statsRes.data.data);
      setAverageGrades(avgRes.data.data || []);
      setStudentsPerCourse(studentsCourseRes.data.data || []);
      setCompletionRates(completionRes.data.data || []);
      setStudentsPerTeacher(teacherRes.data.data || []);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) return <Loader text="Loading admin dashboard..." />;

  return (
    <div>
      

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          title="Total Courses"
          value={stats?.totalCourses}
          icon={BookOpen}
          helper="All created courses"
        />
        <StatCard
          title="Total Students"
          value={stats?.totalStudents}
          icon={Users}
          helper="Registered students"
        />
        <StatCard
          title="Total Teachers"
          value={stats?.totalTeachers}
          icon={GraduationCap}
          helper="Registered teachers"
        />
        <StatCard
          title="Enrollments"
          value={stats?.totalEnrollments}
          icon={School}
          helper="All student enrollments"
        />
        <StatCard
          title="Assignments"
          value={stats?.totalAssignments}
          icon={ClipboardList}
          helper="Assignments and quizzes"
        />
        <StatCard
          title="Grades"
          value={stats?.totalGrades}
          icon={BarChart3}
          helper="Total graded records"
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <ChartCard
          title="Average Grades Per Course"
          description="Course-wise average performance."
        >
          {averageGrades.length ? (
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={averageGrades}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="courseTitle" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="averageGrade" radius={[10, 10, 0, 0]} fill="#4f46e5" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState
              title="No grade data"
              description="Average grades will appear after teachers assign grades."
            />
          )}
        </ChartCard>

        <ChartCard
          title="Students Per Course"
          description="Enrollment distribution across courses."
        >
          {studentsPerCourse.length ? (
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={studentsPerCourse}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="courseTitle" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="totalStudents" radius={[10, 10, 0, 0]} fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState
              title="No enrollment data"
              description="Students per course will appear after enrollments."
            />
          )}
        </ChartCard>

        <ChartCard
          title="Course Completion Rates"
          description="Percentage of completed enrollments."
        >
          {completionRates.length ? (
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={completionRates}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="courseTitle" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="completionRate" radius={[10, 10, 0, 0]} fill="#f59e0b" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState
              title="No completion data"
              description="Completion rates will appear after enrollment statuses are updated."
            />
          )}
        </ChartCard>

        <ChartCard
          title="Students Per Teacher"
          description="Teacher-wise student assignment overview."
        >
          {studentsPerTeacher.length ? (
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie
                  data={studentsPerTeacher}
                  dataKey="totalStudents"
                  nameKey="teacherName"
                  outerRadius={110}
                  label
                >
                  {studentsPerTeacher.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState
              title="No teacher data"
              description="Teacher analytics will appear after courses and enrollments are added."
            />
          )}
        </ChartCard>
      </div>
    </div>
  );
};

const ChartCard = ({ title, description, children }) => {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5">
        <h3 className="text-lg font-bold text-slate-950">{title}</h3>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>
      {children}
    </div>
  );
};

export default AdminDashboard;