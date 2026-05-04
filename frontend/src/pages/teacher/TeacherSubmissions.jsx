import { useEffect, useMemo, useState } from "react";
import {
    Award,
    CalendarDays,
    ExternalLink,
    FileText,
    Search,
    X,
} from "lucide-react";
import toast from "react-hot-toast";
import PageHeader from "../../components/common/PageHeader";
import Loader from "../../components/common/Loader";
import EmptyState from "../../components/common/EmptyState";
import { assignmentApi } from "../../api/assignmentApi";
import { gradeApi } from "../../api/gradeApi";
import { openUploadedFile } from "../../utils/fileViewer";

const initialGradeForm = {
    courseId: "",
    studentId: "",
    assignmentId: "",
    grade: "",
    remarks: "",
};

const TeacherSubmissions = () => {
    const [assignments, setAssignments] = useState([]);
    const [grades, setGrades] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [gradeModalOpen, setGradeModalOpen] = useState(false);
    const [selectedSubmission, setSelectedSubmission] = useState(null);
    const [gradeForm, setGradeForm] = useState(initialGradeForm);

    const [filters, setFilters] = useState({
        search: "",
        courseId: "",
        graded: "",
    });

    const submissions = useMemo(() => {
        return assignments.flatMap((assignment) =>
            (assignment.submissions || []).map((submission) => {
                const existingGrade = grades.find(
                    (grade) =>
                        grade.assignment?._id === assignment._id &&
                        grade.student?._id === submission.student?._id
                );

                return {
                    ...submission,
                    assignment,
                    course: assignment.course,
                    gradeRecord: existingGrade,
                };
            })
        );
    }, [assignments, grades]);

    const courses = useMemo(() => {
        const map = new Map();

        assignments.forEach((assignment) => {
            if (assignment.course?._id) {
                map.set(assignment.course._id, assignment.course);
            }
        });

        return Array.from(map.values());
    }, [assignments]);

    const filteredSubmissions = useMemo(() => {
        const search = filters.search.trim().toLowerCase();

        return submissions.filter((item) => {
            const studentName = item.student?.name?.toLowerCase() || "";
            const studentEmail = item.student?.email?.toLowerCase() || "";
            const assignmentTitle = item.assignment?.title?.toLowerCase() || "";
            const courseTitle = item.course?.title?.toLowerCase() || "";

            const searchMatch =
                !search ||
                studentName.includes(search) ||
                studentEmail.includes(search) ||
                assignmentTitle.includes(search) ||
                courseTitle.includes(search);

            const courseMatch =
                !filters.courseId || item.course?._id === filters.courseId;

            const gradedMatch =
                !filters.graded ||
                (filters.graded === "graded" && item.gradeRecord) ||
                (filters.graded === "ungraded" && !item.gradeRecord);

            return searchMatch && courseMatch && gradedMatch;
        });
    }, [submissions, filters]);

    const fetchData = async () => {
        try {
            setLoading(true);

            const [assignmentsRes, gradesRes] = await Promise.all([
                assignmentApi.getAssignments(),
                gradeApi.getGrades(),
            ]);

            setAssignments(assignmentsRes.data.data || []);
            setGrades(gradesRes.data.data || []);
        } catch (error) {
            toast.error(error?.response?.data?.message || "Failed to load submissions");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const openGradeModal = (submission) => {
        const getStudentId = (submission) => {
            if (!submission?.student) return null;

            if (typeof submission.student === "string") {
                return submission.student;
            }

            return submission.student._id;
        };
        setSelectedSubmission(submission);
        setGradeForm({
            courseId: submission.course?._id || "",
            studentId: getStudentId(submission) || "",
            assignmentId: submission.assignment?._id || "",
            grade: submission.gradeRecord?.grade ?? "",
            remarks: submission.gradeRecord?.remarks || "",
        });
        setGradeModalOpen(true);
    };

    const closeGradeModal = () => {
        if (saving) return;
        setSelectedSubmission(null);
        setGradeForm(initialGradeForm);
        setGradeModalOpen(false);
    };

    const handleGradeChange = (e) => {
        setGradeForm((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleGradeSubmit = async (e) => {
        e.preventDefault();

        if (gradeForm.grade === "") {
            toast.error("Grade is required");
            return;
        }

        const numericGrade = Number(gradeForm.grade);

        if (Number.isNaN(numericGrade) || numericGrade < 0 || numericGrade > 100) {
            toast.error("Grade must be between 0 and 100");
            return;
        }

        try {
            setSaving(true);

            await gradeApi.assignGrade({
                ...gradeForm,
                grade: numericGrade,
            });

            toast.success("Submission graded successfully");
            closeGradeModal();
            fetchData();
        } catch (error) {
            toast.error(error?.response?.data?.message || "Failed to assign grade");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <Loader text="Loading submissions..." />;

    return (
        <div>
            {/* <PageHeader
        title="Student Submissions"
        description="Review submitted assignments and assign grades directly."
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
                            placeholder="Search submissions..."
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
                        value={filters.graded}
                        onChange={(e) =>
                            setFilters((prev) => ({ ...prev, graded: e.target.value }))
                        }
                        className="Input"
                    >
                        <option value="">All Submissions</option>
                        <option value="graded">Graded</option>
                        <option value="ungraded">Ungraded</option>
                    </select>
                </div>
            </div>

            {filteredSubmissions.length === 0 ? (
                <EmptyState
                    title="No submissions found"
                    description="Submitted student work will appear here."
                />
            ) : (
                <div className="grid gap-5 xl:grid-cols-2">
                    {filteredSubmissions.map((submission) => (
                        <div
                            key={submission._id}
                            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex gap-4">
                                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                                        <FileText size={25} />
                                    </div>

                                    <div>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h3 className="text-lg font-bold text-slate-950">
                                                {submission.assignment?.title || "Assignment"}
                                            </h3>
                                            {submission.gradeRecord ? (
                                                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                                                    Graded: {submission.gradeRecord.grade}/100
                                                </span>
                                            ) : (
                                                <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
                                                    Ungraded
                                                </span>
                                            )}
                                        </div>

                                        <p className="mt-2 text-sm font-semibold text-slate-700">
                                            Student:{" "}
                                            <span className="font-medium text-slate-500">
                                                {submission.student?.name || "-"} (
                                                {submission.student?.email || "-"})
                                            </span>
                                        </p>

                                        <p className="mt-1 text-sm font-semibold text-slate-700">
                                            Course:{" "}
                                            <span className="font-medium text-slate-500">
                                                {submission.course?.title || "-"}
                                            </span>
                                        </p>

                                        {submission.answerText && (
                                            <p className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                                                {submission.answerText}
                                            </p>
                                        )}

                                        <div className="mt-4 flex flex-wrap gap-3">
                                            <InfoPill
                                                icon={CalendarDays}
                                                text={`Submitted: ${submission.submittedAt
                                                    ? new Date(submission.submittedAt).toLocaleDateString()
                                                    : "-"
                                                    }`}
                                            />

                                            {submission.file?.url && (
                                                <button
                                                    type="button"
                                                    onClick={() => openUploadedFile(submission.file)}
                                                    className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-2 text-xs font-bold text-indigo-700 transition hover:bg-indigo-100"
                                                >
                                                    <ExternalLink size={14} />
                                                    View Submitted File
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => openGradeModal(submission)}
                                    className="inline-flex shrink-0 items-center gap-2 rounded-2xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-100 transition hover:bg-indigo-700"
                                >
                                    <Award size={17} />
                                    {submission.gradeRecord ? "Update Grade" : "Grade"}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {gradeModalOpen && selectedSubmission && (
                <GradeModal
                    submission={selectedSubmission}
                    form={gradeForm}
                    saving={saving}
                    onChange={handleGradeChange}
                    onSubmit={handleGradeSubmit}
                    onClose={closeGradeModal}
                />
            )}
        </div>
    );
};

const GradeModal = ({ submission, form, saving, onChange, onSubmit, onClose }) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 py-8 backdrop-blur-sm">
            <div className="w-full max-w-xl rounded-3xl bg-white shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
                    <div>
                        <h2 className="text-xl font-bold text-slate-950">Grade Submission</h2>
                        <p className="mt-1 text-sm text-slate-500">
                            {submission.student?.name} • {submission.assignment?.title}
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
                        <Label>Grade / 100</Label>
                        <input
                            type="number"
                            min="0"
                            max="100"
                            name="grade"
                            value={form.grade}
                            onChange={onChange}
                            placeholder="85"
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
                            {saving ? "Saving..." : "Save Grade"}
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

const InfoPill = ({ icon: Icon, text }) => (
    <span className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600">
        <Icon size={14} />
        {text}
    </span>
);

export default TeacherSubmissions;