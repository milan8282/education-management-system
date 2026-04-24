import { useEffect, useMemo, useState } from "react";
import { Award, BookOpen, GraduationCap, Search, TrendingUp } from "lucide-react";
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
import Loader from "../../components/common/Loader";
import EmptyState from "../../components/common/EmptyState";
import StatCard from "../../components/common/StatCard";
import { gradeApi } from "../../api/gradeApi";

const StudentGrades = () => {
    const [grades, setGrades] = useState([]);
    const [loading, setLoading] = useState(true);

    const [filters, setFilters] = useState({
        search: "",
        courseId: "",
    });

    const courses = useMemo(() => {
        const map = new Map();

        grades.forEach((item) => {
            if (item.course?._id) map.set(item.course._id, item.course);
        });

        return Array.from(map.values());
    }, [grades]);

    const filteredGrades = useMemo(() => {
        const search = filters.search.trim().toLowerCase();

        return grades.filter((item) => {
            const courseTitle = item.course?.title?.toLowerCase() || "";
            const assignmentTitle = item.assignment?.title?.toLowerCase() || "";
            const remarks = item.remarks?.toLowerCase() || "";

            const searchMatch =
                !search ||
                courseTitle.includes(search) ||
                assignmentTitle.includes(search) ||
                remarks.includes(search);

            const courseMatch =
                !filters.courseId || item.course?._id === filters.courseId;

            return searchMatch && courseMatch;
        });
    }, [grades, filters]);

    const stats = useMemo(() => {
        if (!grades.length) {
            return {
                totalGrades: 0,
                averageGrade: 0,
                highestGrade: 0,
                gradedCourses: 0,
            };
        }

        const total = grades.reduce((sum, item) => sum + Number(item.grade || 0), 0);
        const highest = Math.max(...grades.map((item) => Number(item.grade || 0)));
        const courseCount = new Set(
            grades.map((item) => item.course?._id).filter(Boolean)
        ).size;

        return {
            totalGrades: grades.length,
            averageGrade: Math.round((total / grades.length) * 100) / 100,
            highestGrade: highest,
            gradedCourses: courseCount,
        };
    }, [grades]);

    const chartData = useMemo(() => {
        const map = {};

        grades.forEach((item) => {
            const courseTitle = item.course?.title || "Course";

            if (!map[courseTitle]) {
                map[courseTitle] = {
                    courseTitle,
                    total: 0,
                    count: 0,
                };
            }

            map[courseTitle].total += Number(item.grade || 0);
            map[courseTitle].count += 1;
        });

        return Object.values(map).map((item) => ({
            courseTitle: item.courseTitle,
            averageGrade: Math.round((item.total / item.count) * 100) / 100,
        }));
    }, [grades]);

    const fetchGrades = async () => {
        try {
            setLoading(true);
            const res = await gradeApi.getGrades();
            setGrades(res.data.data || []);
        } catch (error) {
            toast.error(error?.response?.data?.message || "Failed to load grades");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGrades();
    }, []);

    if (loading) return <Loader text="Loading grades..." />;

    return (
        <div>
            {/* <PageHeader
        title="My Grades"
        description="View your assignment and course grades with teacher feedback."
      /> */}

            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                    title="Total Grades"
                    value={stats.totalGrades}
                    icon={Award}
                    helper="Grade records"
                />
                <StatCard
                    title="Average Grade"
                    value={stats.averageGrade}
                    icon={TrendingUp}
                    helper="Overall average"
                />
                <StatCard
                    title="Highest Grade"
                    value={stats.highestGrade}
                    icon={GraduationCap}
                    helper="Best performance"
                />
                <StatCard
                    title="Graded Courses"
                    value={stats.gradedCourses}
                    icon={BookOpen}
                    helper="Courses with grades"
                />
            </div>

            <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-5">
                    <h3 className="text-lg font-bold text-slate-950">
                        Course Performance
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                        Average grade by course.
                    </p>
                </div>

                {chartData.length ? (
                    <ResponsiveContainer width="100%" height={320}>
                        <BarChart data={chartData}>
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
                        title="No chart data"
                        description="Your performance chart will appear after grades are assigned."
                    />
                )}
            </div>

            <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="grid gap-4 md:grid-cols-2">
                    <div className="relative">
                        <Search
                            size={18}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                        />
                        <input
                            value={filters.search}
                            onChange={(e) =>
                                setFilters((prev) => ({ ...prev, search: e.target.value }))
                            }
                            placeholder="Search course, assignment, remarks..."
                            className="Input !pl-14"
                        />
                    </div>

                    <select
                        value={filters.courseId}
                        onChange={(e) =>
                            setFilters((prev) => ({ ...prev, courseId: e.target.value }))
                        }
                        className="Input"
                    >
                        <option value="">All Courses</option>
                        {courses.map((course) => (
                            <option key={course._id} value={course._id}>
                                {course.title}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="mt-6">
                {filteredGrades.length === 0 ? (
                    <EmptyState
                        title="No grades found"
                        description="Your grades will appear here after teachers review your submissions."
                    />
                ) : (
                    <div className="grid gap-5 xl:grid-cols-2">
                        {filteredGrades.map((item) => (
                            <div
                                key={item._id}
                                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex gap-4">
                                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                                            <Award size={26} />
                                        </div>

                                        <div>
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h3 className="text-lg font-bold text-slate-950">
                                                    {item.assignment?.title || "Overall Course Grade"}
                                                </h3>
                                                <GradeBadge grade={item.grade} />
                                            </div>

                                            <p className="mt-2 text-sm font-semibold text-slate-700">
                                                Course:{" "}
                                                <span className="font-medium text-slate-500">
                                                    {item.course?.title || "-"}
                                                </span>
                                            </p>

                                            <p className="mt-1 text-sm font-semibold text-slate-700">
                                                Graded By:{" "}
                                                <span className="font-medium text-slate-500">
                                                    {item.gradedBy?.name || "-"}
                                                </span>
                                            </p>

                                            {item.remarks && (
                                                <div className="mt-4 rounded-2xl bg-slate-50 p-4">
                                                    <p className="text-xs font-bold uppercase text-slate-400">
                                                        Teacher Remarks
                                                    </p>
                                                    <p className="mt-2 text-sm leading-6 text-slate-600">
                                                        {item.remarks}
                                                    </p>
                                                </div>
                                            )}

                                            <p className="mt-4 text-xs font-semibold text-slate-400">
                                                Updated{" "}
                                                {item.updatedAt
                                                    ? new Date(item.updatedAt).toLocaleDateString()
                                                    : "-"}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl bg-indigo-600 text-lg font-black text-white shadow-lg shadow-indigo-100">
                                        {item.grade}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

const GradeBadge = ({ grade }) => {
    const numeric = Number(grade);

    let label = "Needs Improvement";
    let className = "bg-rose-50 text-rose-700";

    if (numeric >= 85) {
        label = "Excellent";
        className = "bg-emerald-50 text-emerald-700";
    } else if (numeric >= 70) {
        label = "Good";
        className = "bg-indigo-50 text-indigo-700";
    } else if (numeric >= 50) {
        label = "Average";
        className = "bg-amber-50 text-amber-700";
    }

    return (
        <span className={`rounded-full px-3 py-1 text-xs font-bold ${className}`}>
            {label}
        </span>
    );
};

export default StudentGrades;