import { useEffect, useMemo, useState } from "react";
import { BookOpen, CalendarDays, CheckCircle2, Search, UserPlus } from "lucide-react";
import toast from "react-hot-toast";
import PageHeader from "../../components/common/PageHeader";
import Loader from "../../components/common/Loader";
import EmptyState from "../../components/common/EmptyState";
import { courseApi } from "../../api/courseApi";
import { enrollmentApi } from "../../api/enrollmentApi";

const StudentCourses = () => {
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const [filters, setFilters] = useState({
    search: "",
    status: "",
    view: "all",
  });

  const enrolledCourseIds = useMemo(() => {
    return new Set(enrollments.map((item) => item.course?._id).filter(Boolean));
  }, [enrollments]);

  const enrollmentByCourse = useMemo(() => {
    const map = {};
    enrollments.forEach((item) => {
      if (item.course?._id) map[item.course._id] = item;
    });
    return map;
  }, [enrollments]);

  const filteredCourses = useMemo(() => {
    const search = filters.search.trim().toLowerCase();

    return courses.filter((course) => {
      const isEnrolled = enrolledCourseIds.has(course._id);

      const searchMatch =
        !search ||
        course.title?.toLowerCase().includes(search) ||
        course.description?.toLowerCase().includes(search) ||
        course.assignedTeacher?.name?.toLowerCase().includes(search);

      const statusMatch = !filters.status || course.status === filters.status;

      const viewMatch =
        filters.view === "all" ||
        (filters.view === "enrolled" && isEnrolled) ||
        (filters.view === "available" && !isEnrolled);

      return searchMatch && statusMatch && viewMatch;
    });
  }, [courses, filters, enrolledCourseIds]);

  const fetchData = async () => {
    try {
      setLoading(true);

      const [coursesRes, enrollmentsRes] = await Promise.all([
        courseApi.getCourses(),
        enrollmentApi.getEnrollments(),
      ]);

      setCourses(coursesRes.data.data || []);
      setEnrollments(enrollmentsRes.data.data || []);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSelfEnroll = async (course) => {
    const ok = window.confirm(`Enroll in "${course.title}"?`);
    if (!ok) return;

    try {
      setActionLoading(course._id);
      await enrollmentApi.selfEnroll({ courseId: course._id });
      toast.success("Enrolled successfully");
      fetchData();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to enroll");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) return <Loader text="Loading courses..." />;

  return (
    <div>
      {/* <PageHeader
        title="My Courses"
        description="Browse available courses and manage your enrolled learning."
      /> */}

      <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-3">
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
              placeholder="Search courses or teacher..."
              className="Input !pl-14"
            />
          </div>

          <select
            value={filters.view}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, view: e.target.value }))
            }
            className="Input"
          >
            <option value="all">All Courses</option>
            <option value="enrolled">Enrolled Courses</option>
            <option value="available">Available Courses</option>
          </select>

          <select
            value={filters.status}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, status: e.target.value }))
            }
            className="Input"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {filteredCourses.length === 0 ? (
        <EmptyState
          title="No courses found"
          description="Try changing your filters or search keyword."
        />
      ) : (
        <div className="grid gap-5 xl:grid-cols-2">
          {filteredCourses.map((course) => {
            const isEnrolled = enrolledCourseIds.has(course._id);
            const enrollment = enrollmentByCourse[course._id];

            return (
              <div
                key={course._id}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                      <BookOpen size={26} />
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-bold text-slate-950">
                          {course.title}
                        </h3>
                        <StatusBadge status={course.status} />
                        {isEnrolled && (
                          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                            Enrolled
                          </span>
                        )}
                      </div>

                      <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-500">
                        {course.description}
                      </p>

                      <p className="mt-4 text-sm font-semibold text-slate-700">
                        Teacher:{" "}
                        <span className="font-medium text-slate-500">
                          {course.assignedTeacher?.name || "-"}
                        </span>
                      </p>

                      <div className="mt-4 flex flex-wrap gap-3">
                        <DatePill label="Start" date={course.startDate} />
                        <DatePill label="End" date={course.endDate} />
                      </div>

                      {enrollment && (
                        <p className="mt-4 text-sm text-slate-500">
                          Enrollment Status:{" "}
                          <span className="font-bold capitalize text-slate-800">
                            {enrollment.status}
                          </span>
                        </p>
                      )}
                    </div>
                  </div>

                  {isEnrolled ? (
                    <button
                      disabled
                      className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700"
                    >
                      <CheckCircle2 size={18} />
                      Enrolled
                    </button>
                  ) : (
                    <button
                      disabled={course.status !== "active" || actionLoading === course._id}
                      onClick={() => handleSelfEnroll(course)}
                      className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-100 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <UserPlus size={18} />
                      {actionLoading === course._id ? "Enrolling..." : "Enroll"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const DatePill = ({ label, date }) => (
  <div className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600">
    <CalendarDays size={14} />
    {label}: {date ? new Date(date).toLocaleDateString() : "-"}
  </div>
);

const StatusBadge = ({ status }) => {
  const styles = {
    active: "bg-emerald-50 text-emerald-700",
    inactive: "bg-slate-100 text-slate-600",
    completed: "bg-indigo-50 text-indigo-700",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${
        styles[status] || styles.inactive
      }`}
    >
      {status}
    </span>
  );
};

export default StudentCourses;