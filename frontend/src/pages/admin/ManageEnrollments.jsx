import { useEffect, useMemo, useState } from "react";
import {
  GraduationCap,
  Plus,
  Search,
  Trash2,
  UserPlus,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import PageHeader from "../../components/common/PageHeader";
import Loader from "../../components/common/Loader";
import EmptyState from "../../components/common/EmptyState";
import { enrollmentApi } from "../../api/enrollmentApi";
import { courseApi } from "../../api/courseApi";
import { userApi } from "../../api/userApi";

const initialForm = {
  courseId: "",
  studentId: "",
};

const ManageEnrollments = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(initialForm);

  const [filters, setFilters] = useState({
    search: "",
    courseId: "",
    studentId: "",
    status: "",
  });

  const filteredEnrollments = useMemo(() => {
    const search = filters.search.trim().toLowerCase();

    return enrollments.filter((item) => {
      const studentName = item.student?.name?.toLowerCase() || "";
      const studentEmail = item.student?.email?.toLowerCase() || "";
      const courseTitle = item.course?.title?.toLowerCase() || "";

      return (
        !search ||
        studentName.includes(search) ||
        studentEmail.includes(search) ||
        courseTitle.includes(search)
      );
    });
  }, [enrollments, filters.search]);

  const queryParams = useMemo(() => {
    const params = {};
    if (filters.courseId) params.courseId = filters.courseId;
    if (filters.studentId) params.studentId = filters.studentId;
    if (filters.status) params.status = filters.status;
    return params;
  }, [filters.courseId, filters.studentId, filters.status]);

  const fetchEnrollments = async () => {
    try {
      setLoading(true);
      const res = await enrollmentApi.getEnrollments(queryParams);
      setEnrollments(res.data.data || []);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load enrollments");
    } finally {
      setLoading(false);
    }
  };

  const fetchDropdownData = async () => {
    try {
      const [coursesRes, studentsRes] = await Promise.all([
        courseApi.getCourses(),
        userApi.getUsers({ role: "student", isActive: true }),
      ]);

      setCourses(coursesRes.data.data || []);
      setStudents(studentsRes.data.data || []);
    } catch {
      toast.error("Failed to load courses or students");
    }
  };

  useEffect(() => {
    fetchDropdownData();
  }, []);

  useEffect(() => {
    fetchEnrollments();
  }, [queryParams]);

  const openModal = () => {
    setForm(initialForm);
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;
    setModalOpen(false);
    setForm(initialForm);
  };

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleEnroll = async (e) => {
    e.preventDefault();

    if (!form.courseId || !form.studentId) {
      toast.error("Course and student are required");
      return;
    }

    try {
      setSaving(true);
      await enrollmentApi.enrollByAdmin(form);
      toast.success("Student enrolled successfully");
      closeModal();
      fetchEnrollments();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to enroll student");
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await enrollmentApi.updateStatus(id, { status });
      toast.success("Enrollment status updated");
      fetchEnrollments();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update status");
    }
  };

  const handleDelete = async (item) => {
    const ok = window.confirm(
      `Remove ${item.student?.name || "student"} from ${
        item.course?.title || "course"
      }?`
    );

    if (!ok) return;

    try {
      await enrollmentApi.removeEnrollment(item._id);
      toast.success("Enrollment removed successfully");
      fetchEnrollments();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to remove enrollment");
    }
  };

  return (
    <div>
      <PageHeader
        action={
          <button
            onClick={openModal}
            className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-100 transition hover:bg-indigo-700"
          >
            <Plus size={18} />
            Enroll Student
          </button>
        }
      />

      <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-4">
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
              placeholder="Search student or course..."
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

          <select
            value={filters.studentId}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, studentId: e.target.value }))
            }
            className="Input"
          >
            <option value="">All Students</option>
            {students.map((student) => (
              <option key={student._id} value={student._id}>
                {student.name}
              </option>
            ))}
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
            <option value="completed">Completed</option>
            <option value="dropped">Dropped</option>
          </select>
        </div>
      </div>

      {loading ? (
        <Loader text="Loading enrollments..." />
      ) : filteredEnrollments.length === 0 ? (
        <EmptyState
          title="No enrollments found"
          description="Enroll a student into a course to see records here."
        />
      ) : (
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <Th>Student</Th>
                  <Th>Course</Th>
                  <Th>Teacher</Th>
                  <Th>Status</Th>
                  <Th>Enrolled On</Th>
                  <Th align="right">Actions</Th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredEnrollments.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50/80">
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 font-bold uppercase text-indigo-700">
                          {item.student?.name?.charAt(0) || "S"}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-950">
                            {item.student?.name || "-"}
                          </p>
                          <p className="text-sm text-slate-500">
                            {item.student?.email || "-"}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="whitespace-nowrap px-6 py-4">
                      <p className="font-semibold text-slate-900">
                        {item.course?.title || "-"}
                      </p>
                      <p className="text-sm text-slate-500">
                        {item.course?.status || ""}
                      </p>
                    </td>

                    <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
                      {item.course?.assignedTeacher?.name || "-"}
                    </td>

                    <td className="whitespace-nowrap px-6 py-4">
                      <select
                        value={item.status}
                        onChange={(e) =>
                          handleStatusChange(item._id, e.target.value)
                        }
                        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold capitalize text-slate-700 outline-none"
                      >
                        <option value="active">Active</option>
                        <option value="completed">Completed</option>
                        <option value="dropped">Dropped</option>
                      </select>
                    </td>

                    <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">
                      {item.createdAt
                        ? new Date(item.createdAt).toLocaleDateString()
                        : "-"}
                    </td>

                    <td className="whitespace-nowrap px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(item)}
                        className="inline-flex items-center gap-2 rounded-xl border border-rose-200 px-3 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
                      >
                        <Trash2 size={16} />
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {modalOpen && (
        <EnrollModal
          form={form}
          courses={courses}
          students={students}
          saving={saving}
          onChange={handleChange}
          onSubmit={handleEnroll}
          onClose={closeModal}
        />
      )}
    </div>
  );
};

const EnrollModal = ({
  form,
  courses,
  students,
  saving,
  onChange,
  onSubmit,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 py-8 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <h2 className="text-xl font-bold text-slate-950">
              Enroll Student
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Select a course and student to create enrollment.
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-500 hover:bg-slate-100"
          >
            <X size={22} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-5 p-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-indigo-50 text-indigo-600">
            <UserPlus size={30} />
          </div>

          <div>
            <Label>Course</Label>
            <select
              name="courseId"
              value={form.courseId}
              onChange={onChange}
              className="Input"
            >
              <option value="">Select course</option>
              {courses.map((course) => (
                <option key={course._id} value={course._id}>
                  {course.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label>Student</Label>
            <select
              name="studentId"
              value={form.studentId}
              onChange={onChange}
              className="Input"
            >
              <option value="">Select student</option>
              {students.map((student) => (
                <option key={student._id} value={student._id}>
                  {student.name} ({student.email})
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 border-t border-slate-200 pt-5">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-100 transition hover:bg-indigo-700 disabled:opacity-60"
            >
              {saving ? "Enrolling..." : "Enroll Student"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Label = ({ children }) => (
  <label className="mb-2 block text-sm font-bold text-slate-700">
    {children}
  </label>
);

const Th = ({ children, align = "left" }) => (
  <th
    className={`whitespace-nowrap px-6 py-4 text-${align} text-xs font-bold uppercase tracking-wider text-slate-500`}
  >
    {children}
  </th>
);

export default ManageEnrollments;