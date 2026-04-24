import { useEffect, useMemo, useState } from "react";
import { BookOpen, CalendarDays, Search, Users } from "lucide-react";
import toast from "react-hot-toast";
import PageHeader from "../../components/common/PageHeader";
import Loader from "../../components/common/Loader";
import EmptyState from "../../components/common/EmptyState";
import { courseApi } from "../../api/courseApi";
import { enrollmentApi } from "../../api/enrollmentApi";

const TeacherCourses = () => {
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

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

  const enrollmentMap = useMemo(() => {
    const map = {};

    enrollments.forEach((item) => {
      const courseId = item.course?._id;

      if (!courseId) return;

      if (!map[courseId]) {
        map[courseId] = {
          total: 0,
          active: 0,
          completed: 0,
          dropped: 0,
        };
      }

      map[courseId].total += 1;
      map[courseId][item.status] += 1;
    });

    return map;
  }, [enrollments]);

  const filteredCourses = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) return courses;

    return courses.filter((course) => {
      return (
        course.title?.toLowerCase().includes(value) ||
        course.description?.toLowerCase().includes(value)
      );
    });
  }, [courses, search]);

  if (loading) return <Loader text="Loading assigned courses..." />;

  return (
    <div>
      {/* <PageHeader
        title="My Courses"
        description="View all courses assigned to you and track student enrollment status."
      /> */}

      <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="relative max-w-xl">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search assigned courses..."
            className="Input !pl-14"
          />
        </div>
      </div>

      {filteredCourses.length === 0 ? (
        <EmptyState
          title="No assigned courses"
          description="When admin assigns courses to you, they will appear here."
        />
      ) : (
        <div className="grid gap-5 xl:grid-cols-2">
          {filteredCourses.map((course) => {
            const count = enrollmentMap[course._id] || {
              total: 0,
              active: 0,
              completed: 0,
              dropped: 0,
            };

            return (
              <div
                key={course._id}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                    <BookOpen size={26} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-bold text-slate-950">
                        {course.title}
                      </h3>
                      <StatusBadge status={course.status} />
                    </div>

                    <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-500">
                      {course.description}
                    </p>

                    <div className="mt-5 flex flex-wrap gap-3">
                      <DatePill label="Start" date={course.startDate} />
                      <DatePill label="End" date={course.endDate} />
                    </div>

                    <div className="mt-5 grid gap-3 sm:grid-cols-4">
                      <MiniStat label="Total" value={count.total} />
                      <MiniStat label="Active" value={count.active} />
                      <MiniStat label="Completed" value={count.completed} />
                      <MiniStat label="Dropped" value={count.dropped} />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const MiniStat = ({ label, value }) => (
  <div className="rounded-2xl bg-slate-50 p-4">
    <div className="flex items-center gap-2 text-slate-500">
      <Users size={15} />
      <p className="text-xs font-bold uppercase">{label}</p>
    </div>
    <p className="mt-2 text-xl font-bold text-slate-950">{value}</p>
  </div>
);

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

export default TeacherCourses;