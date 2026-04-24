import { useEffect, useMemo, useState } from "react";
import { Award, Edit, GraduationCap, Search, Trash2, X } from "lucide-react";
import toast from "react-hot-toast";
import PageHeader from "../../components/common/PageHeader";
import Loader from "../../components/common/Loader";
import EmptyState from "../../components/common/EmptyState";
import { gradeApi } from "../../api/gradeApi";

const initialForm = {
    grade: "",
    remarks: "",
};

const TeacherGrades = () => {
    const [grades, setGrades] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [modalOpen, setModalOpen] = useState(false);
    const [selectedGrade, setSelectedGrade] = useState(null);
    const [form, setForm] = useState(initialForm);

    const [filters, setFilters] = useState({
        search: "",
        courseId: "",
        studentId: "",
    });

    const courses = useMemo(() => {
        const map = new Map();

        grades.forEach((item) => {
            if (item.course?._id) {
                map.set(item.course._id, item.course);
            }
        });

        return Array.from(map.values());
    }, [grades]);

    const students = useMemo(() => {
        const map = new Map();

        grades.forEach((item) => {
            if (item.student?._id) {
                map.set(item.student._id, item.student);
            }
        });

        return Array.from(map.values());
    }, [grades]);

    const filteredGrades = useMemo(() => {
        const search = filters.search.trim().toLowerCase();

        return grades.filter((item) => {
            const studentName = item.student?.name?.toLowerCase() || "";
            const studentEmail = item.student?.email?.toLowerCase() || "";
            const courseTitle = item.course?.title?.toLowerCase() || "";
            const assignmentTitle = item.assignment?.title?.toLowerCase() || "";

            const searchMatch =
                !search ||
                studentName.includes(search) ||
                studentEmail.includes(search) ||
                courseTitle.includes(search) ||
                assignmentTitle.includes(search);

            const courseMatch =
                !filters.courseId || item.course?._id === filters.courseId;

            const studentMatch =
                !filters.studentId || item.student?._id === filters.studentId;

            return searchMatch && courseMatch && studentMatch;
        });
    }, [grades, filters]);

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

    const openEditModal = (gradeRecord) => {
        setSelectedGrade(gradeRecord);
        setForm({
            grade: gradeRecord.grade ?? "",
            remarks: gradeRecord.remarks || "",
        });
        setModalOpen(true);
    };

    const closeModal = () => {
        if (saving) return;
        setSelectedGrade(null);
        setForm(initialForm);
        setModalOpen(false);
    };

    const handleChange = (e) => {
        setForm((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleUpdate = async (e) => {
        e.preventDefault();

        if (form.grade === "") {
            toast.error("Grade is required");
            return;
        }

        const numericGrade = Number(form.grade);

        if (Number.isNaN(numericGrade) || numericGrade < 0 || numericGrade > 100) {
            toast.error("Grade must be between 0 and 100");
            return;
        }

        try {
            setSaving(true);

            await gradeApi.updateGrade(selectedGrade._id, {
                grade: numericGrade,
                remarks: form.remarks,
            });

            toast.success("Grade updated successfully");
            closeModal();
            fetchGrades();
        } catch (error) {
            toast.error(error?.response?.data?.message || "Failed to update grade");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (gradeRecord) => {
        const ok = window.confirm(
            `Delete grade for ${gradeRecord.student?.name || "student"}?`
        );

        if (!ok) return;

        try {
            await gradeApi.deleteGrade(gradeRecord._id);
            toast.success("Grade deleted successfully");
            fetchGrades();
        } catch (error) {
            toast.error(error?.response?.data?.message || "Failed to delete grade");
        }
    };

    if (loading) return <Loader text="Loading grades..." />;

    return (
        <div>
            {/* <PageHeader
        title="Grades"
        description="View, update, and manage grades for your assigned courses."
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
                            placeholder="Search grades..."
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
                </div>
            </div>

            {filteredGrades.length === 0 ? (
                <EmptyState
                    title="No grades found"
                    description="Grades will appear after you grade submitted work."
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
                                        <GraduationCap size={25} />
                                    </div>

                                    <div>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h3 className="text-lg font-bold text-slate-950">
                                                {item.student?.name || "Student"}
                                            </h3>

                                            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                                                {item.grade}/100
                                            </span>
                                        </div>

                                        <p className="mt-2 text-sm font-semibold text-slate-700">
                                            Course:{" "}
                                            <span className="font-medium text-slate-500">
                                                {item.course?.title || "-"}
                                            </span>
                                        </p>

                                        <p className="mt-1 text-sm font-semibold text-slate-700">
                                            Assignment:{" "}
                                            <span className="font-medium text-slate-500">
                                                {item.assignment?.title || "Overall Course Grade"}
                                            </span>
                                        </p>

                                        {item.remarks && (
                                            <p className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                                                {item.remarks}
                                            </p>
                                        )}

                                        <p className="mt-4 text-xs font-semibold text-slate-400">
                                            Graded by {item.gradedBy?.name || "-"} •{" "}
                                            {item.updatedAt
                                                ? new Date(item.updatedAt).toLocaleDateString()
                                                : "-"}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex shrink-0 gap-2">
                                    <button
                                        onClick={() => openEditModal(item)}
                                        className="rounded-xl border border-slate-200 p-2.5 text-slate-600 transition hover:bg-slate-50 hover:text-indigo-600"
                                    >
                                        <Edit size={17} />
                                    </button>

                                    <button
                                        onClick={() => handleDelete(item)}
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

            {modalOpen && selectedGrade && (
                <GradeEditModal
                    gradeRecord={selectedGrade}
                    form={form}
                    saving={saving}
                    onChange={handleChange}
                    onSubmit={handleUpdate}
                    onClose={closeModal}
                />
            )}
        </div>
    );
};

const GradeEditModal = ({
    gradeRecord,
    form,
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
                        <h2 className="text-xl font-bold text-slate-950">Update Grade</h2>
                        <p className="mt-1 text-sm text-slate-500">
                            {gradeRecord.student?.name} • {gradeRecord.course?.title}
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
                    <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-50 text-emerald-600">
                        <Award size={30} />
                    </div>

                    <div>
                        <Label>Grade / 100</Label>
                        <input
                            type="number"
                            min="0"
                            max="100"
                            name="grade"
                            value={form.grade}
                            onChange={onChange}
                            className="Input"
                        />
                    </div>

                    <div>
                        <Label>Remarks</Label>
                        <textarea
                            name="remarks"
                            value={form.remarks}
                            onChange={onChange}
                            rows="4"
                            placeholder="Write feedback..."
                            className="Input resize-none"
                        />
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
                            {saving ? "Saving..." : "Update Grade"}
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

export default TeacherGrades;