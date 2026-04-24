import { useEffect, useMemo, useState } from "react";
import { BookOpen, CalendarDays, Edit, Plus, Search, Trash2, X } from "lucide-react";
import toast from "react-hot-toast";
import PageHeader from "../../components/common/PageHeader";
import Loader from "../../components/common/Loader";
import EmptyState from "../../components/common/EmptyState";
import { courseApi } from "../../api/courseApi";
import { userApi } from "../../api/userApi";

const initialForm = {
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    assignedTeacher: "",
    status: "active",
};

const ManageCourses = () => {
    const [courses, setCourses] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [modalOpen, setModalOpen] = useState(false);
    const [editingCourse, setEditingCourse] = useState(null);
    const [form, setForm] = useState(initialForm);

    const [filters, setFilters] = useState({
        search: "",
        status: "",
        teacher: "",
    });

    const queryParams = useMemo(() => {
        const params = {};
        if (filters.search) params.search = filters.search;
        if (filters.status) params.status = filters.status;
        if (filters.teacher) params.teacher = filters.teacher;
        return params;
    }, [filters]);

    const fetchCourses = async () => {
        try {
            setLoading(true);
            const res = await courseApi.getCourses(queryParams);
            setCourses(res.data.data || []);
        } catch (error) {
            toast.error(error?.response?.data?.message || "Failed to load courses");
        } finally {
            setLoading(false);
        }
    };

    const fetchTeachers = async () => {
        try {
            const res = await userApi.getUsers({ role: "teacher", isActive: true });
            setTeachers(res.data.data || []);
        } catch {
            toast.error("Failed to load teachers");
        }
    };

    useEffect(() => {
        fetchTeachers();
    }, []);

    useEffect(() => {
        const timer = setTimeout(fetchCourses, 300);
        return () => clearTimeout(timer);
    }, [queryParams]);

    const openCreateModal = () => {
        setEditingCourse(null);
        setForm(initialForm);
        setModalOpen(true);
    };

    const openEditModal = (course) => {
        setEditingCourse(course);
        setForm({
            title: course.title || "",
            description: course.description || "",
            startDate: course.startDate ? course.startDate.slice(0, 10) : "",
            endDate: course.endDate ? course.endDate.slice(0, 10) : "",
            assignedTeacher: course.assignedTeacher?._id || "",
            status: course.status || "active",
        });
        setModalOpen(true);
    };

    const closeModal = () => {
        if (saving) return;
        setModalOpen(false);
        setEditingCourse(null);
        setForm(initialForm);
    };

    const handleChange = (e) => {
        setForm((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const validateForm = () => {
        if (!form.title.trim()) return "Course title is required";
        if (!form.description.trim()) return "Description is required";
        if (!form.startDate) return "Start date is required";
        if (!form.endDate) return "End date is required";
        if (!form.assignedTeacher) return "Assigned teacher is required";
        if (new Date(form.endDate) <= new Date(form.startDate)) {
            return "End date must be greater than start date";
        }
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const error = validateForm();
        if (error) {
            toast.error(error);
            return;
        }

        try {
            setSaving(true);

            const payload = {
                title: form.title,
                description: form.description,
                startDate: form.startDate,
                endDate: form.endDate,
                assignedTeacher: form.assignedTeacher,
                status: form.status,
            };

            if (editingCourse) {
                await courseApi.updateCourse(editingCourse._id, payload);
                toast.success("Course updated successfully");
            } else {
                await courseApi.createCourse(payload);
                toast.success("Course created successfully");
            }

            closeModal();
            fetchCourses();
        } catch (error) {
            toast.error(error?.response?.data?.message || "Failed to save course");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (course) => {
        const ok = window.confirm(`Delete "${course.title}"? This cannot be undone.`);
        if (!ok) return;

        try {
            await courseApi.deleteCourse(course._id);
            toast.success("Course deleted successfully");
            fetchCourses();
        } catch (error) {
            toast.error(error?.response?.data?.message || "Failed to delete course");
        }
    };

    return (
        <div>
            <PageHeader
                action={
                    <button
                        onClick={openCreateModal}
                        className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-100 transition hover:bg-indigo-700"
                    >
                        <Plus size={18} />
                        Add Course
                    </button>
                }
            />

            <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="grid gap-4 md:grid-cols-3">
                    <div className="relative">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            value={filters.search}
                            onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                            placeholder="Search courses..."
                            className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                        />

                    </div>

                    <select
                        value={filters.status}
                        onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
                        className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                    >
                        <option value="">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="completed">Completed</option>
                    </select>

                    <select
                        value={filters.teacher}
                        onChange={(e) => setFilters((prev) => ({ ...prev, teacher: e.target.value }))}
                        className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                    >
                        <option value="">All Teachers</option>
                        {teachers.map((teacher) => (
                            <option key={teacher._id} value={teacher._id}>
                                {teacher.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {loading ? (
                <Loader text="Loading courses..." />
            ) : courses.length === 0 ? (
                <EmptyState title="No courses found" description="Create your first course to get started." />
            ) : (
                <div className="grid gap-5 xl:grid-cols-2">
                    {courses.map((course) => (
                        <div
                            key={course._id}
                            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                        >
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                <div className="flex gap-4">
                                    <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                                        <BookOpen size={24} />
                                    </div>

                                    <div>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h3 className="text-lg font-bold text-slate-950">{course.title}</h3>
                                            <StatusBadge status={course.status} />
                                        </div>

                                        <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">
                                            {course.description}
                                        </p>

                                        <div className="mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
                                            <div>
                                                <p className="text-xs font-bold uppercase text-slate-400">Teacher</p>
                                                <p className="mt-1 font-semibold text-slate-800">
                                                    {course.assignedTeacher?.name || "Not assigned"}
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-xs font-bold uppercase text-slate-400">Email</p>
                                                <p className="mt-1 font-semibold text-slate-800">
                                                    {course.assignedTeacher?.email || "-"}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="mt-4 flex flex-wrap gap-3">
                                            <DatePill label="Start" date={course.startDate} />
                                            <DatePill label="End" date={course.endDate} />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => openEditModal(course)}
                                        className="rounded-xl border border-slate-200 p-2.5 text-slate-600 transition hover:bg-slate-50 hover:text-indigo-600"
                                    >
                                        <Edit size={17} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(course)}
                                        className="rounded-xl border border-rose-200 p-2.5 text-rose-600 transition hover:bg-rose-50"
                                    >
                                        <Trash2 size={17} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {modalOpen && (
                <CourseModal
                    form={form}
                    teachers={teachers}
                    editingCourse={editingCourse}
                    saving={saving}
                    onClose={closeModal}
                    onChange={handleChange}
                    onSubmit={handleSubmit}
                />
            )}
        </div>
    );
};

const CourseModal = ({
    form,
    teachers,
    editingCourse,
    saving,
    onClose,
    onChange,
    onSubmit,
}) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 py-8 backdrop-blur-sm">
            <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
                <div className="sticky top-0 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-5">
                    <div>
                        <h2 className="text-xl font-bold text-slate-950">
                            {editingCourse ? "Edit Course" : "Create Course"}
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                            Fill course details and assign a teacher.
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
                    <div>
                        <Label>Course Title</Label>
                        <input
                            name="title"
                            value={form.title}
                            onChange={onChange}
                            placeholder="React Fundamentals"
                            className="Input"
                        />
                    </div>

                    <div>
                        <Label>Description</Label>
                        <textarea
                            name="description"
                            value={form.description}
                            onChange={onChange}
                            rows="4"
                            placeholder="Describe what students will learn..."
                            className="Input resize-none"
                        />
                    </div>

                    <div className="grid gap-5 md:grid-cols-2">
                        <div>
                            <Label>Start Date</Label>
                            <input
                                type="date"
                                name="startDate"
                                value={form.startDate}
                                onChange={onChange}
                                className="Input"
                            />
                        </div>

                        <div>
                            <Label>End Date</Label>
                            <input
                                type="date"
                                name="endDate"
                                value={form.endDate}
                                onChange={onChange}
                                className="Input"
                            />
                        </div>
                    </div>

                    <div className="grid gap-5 md:grid-cols-2">
                        <div>
                            <Label>Assigned Teacher</Label>
                            <select
                                name="assignedTeacher"
                                value={form.assignedTeacher}
                                onChange={onChange}
                                className="Input"
                            >
                                <option value="">Select teacher</option>
                                {teachers.map((teacher) => (
                                    <option key={teacher._id} value={teacher._id}>
                                        {teacher.name} ({teacher.email})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <Label>Status</Label>
                            <select
                                name="status"
                                value={form.status}
                                onChange={onChange}
                                className="Input"
                            >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                                <option value="completed">Completed</option>
                            </select>
                        </div>
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
                            {saving ? "Saving..." : editingCourse ? "Update Course" : "Create Course"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const Label = ({ children }) => (
    <label className="mb-2 block text-sm font-bold text-slate-700">{children}</label>
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
        <span className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${styles[status] || styles.inactive}`}>
            {status}
        </span>
    );
};

export default ManageCourses;