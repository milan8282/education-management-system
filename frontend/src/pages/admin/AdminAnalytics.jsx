import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import toast from "react-hot-toast";
import PageHeader from "../../components/common/PageHeader";
import Loader from "../../components/common/Loader";
import EmptyState from "../../components/common/EmptyState";
import { analyticsApi } from "../../api/analyticsApi";

const COLORS = ["#4f46e5", "#10b981", "#f59e0b", "#ef4444", "#06b6d4", "#8b5cf6"];

const AdminAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [averageGrades, setAverageGrades] = useState([]);
  const [studentsPerCourse, setStudentsPerCourse] = useState([]);
  const [studentsPerTeacher, setStudentsPerTeacher] = useState([]);
  const [completionRates, setCompletionRates] = useState([]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);

      const [avgRes, courseRes, teacherRes, completionRes] = await Promise.all([
        analyticsApi.averageGradesPerCourse(),
        analyticsApi.studentsPerCourse(),
        analyticsApi.studentsPerTeacher(),
        analyticsApi.courseCompletionRates(),
      ]);

      setAverageGrades(avgRes.data.data || []);
      setStudentsPerCourse(courseRes.data.data || []);
      setStudentsPerTeacher(teacherRes.data.data || []);
      setCompletionRates(completionRes.data.data || []);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) return <Loader text="Loading analytics..." />;

  return (
    <div>

      <div className="grid gap-6 xl:grid-cols-2">
        <AnalyticsCard
          title="Average Grades Per Course"
          description="Average student performance across each course."
        >
          {averageGrades.length ? (
            <ResponsiveContainer width="100%" height={340}>
              <BarChart data={averageGrades}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="courseTitle" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="averageGrade" fill="#4f46e5" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState title="No grade analytics" />
          )}
        </AnalyticsCard>

        <AnalyticsCard
          title="Students Per Course"
          description="Total active, completed, and dropped enrollments."
        >
          {studentsPerCourse.length ? (
            <ResponsiveContainer width="100%" height={340}>
              <BarChart data={studentsPerCourse}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="courseTitle" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="activeStudents" stackId="a" fill="#10b981" radius={[10, 10, 0, 0]} />
                <Bar dataKey="completedStudents" stackId="a" fill="#4f46e5" />
                <Bar dataKey="droppedStudents" stackId="a" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState title="No enrollment analytics" />
          )}
        </AnalyticsCard>

        <AnalyticsCard
          title="Course Completion Rates"
          description="Percentage of students who completed each course."
        >
          {completionRates.length ? (
            <ResponsiveContainer width="100%" height={340}>
              <LineChart data={completionRates}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="courseTitle" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="completionRate"
                  stroke="#f59e0b"
                  strokeWidth={3}
                  dot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState title="No completion analytics" />
          )}
        </AnalyticsCard>

        <AnalyticsCard
          title="Students Per Teacher"
          description="Total students handled by each teacher."
        >
          {studentsPerTeacher.length ? (
            <ResponsiveContainer width="100%" height={340}>
              <PieChart>
                <Pie
                  data={studentsPerTeacher}
                  dataKey="totalStudents"
                  nameKey="teacherName"
                  outerRadius={115}
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
            <EmptyState title="No teacher analytics" />
          )}
        </AnalyticsCard>
      </div>
    </div>
  );
};

const AnalyticsCard = ({ title, description, children }) => {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-slate-950">{title}</h3>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>

      {children}
    </div>
  );
};

export default AdminAnalytics;