import { useEffect, useMemo, useState } from "react";
import {
    CalendarDays,
    CheckCircle2,
    ExternalLink,
    FileText,
    Search,
    Send,
    X,
} from "lucide-react";
import toast from "react-hot-toast";
import PageHeader from "../../components/common/PageHeader";
import Loader from "../../components/common/Loader";
import EmptyState from "../../components/common/EmptyState";
import { assignmentApi } from "../../api/assignmentApi";
import { useAuth } from "../../context/AuthContext";
import { uploadApi } from "../../api/uploadApi";
import { openUploadedFile } from "../../utils/fileViewer";


const initialForm = {
    answerText: "",
    file: null,
};

const StudentAssignments = () => {
    const { user } = useAuth();

    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [modalOpen, setModalOpen] = useState(false);
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [form, setForm] = useState(initialForm);

    const [filters, setFilters] = useState({
        search: "",
        type: "",
        status: "",
    });

    const getStudentId = (submission) => {
        if (!submission?.student) return null;

        if (typeof submission.student === "string") {
            return submission.student;
        }

        return submission.student._id;
    };

    const getMySubmission = (assignment) => {
        return assignment.submissions?.find(
            (submission) => getStudentId(submission) === user?._id
        );
    };
    const filteredAssignments = useMemo(() => {
        const search = filters.search.trim().toLowerCase();

        return assignments.filter((assignment) => {
            const submission = getMySubmission(assignment);

            const searchMatch =
                !search ||
                assignment.title?.toLowerCase().includes(search) ||
                assignment.description?.toLowerCase().includes(search) ||
                assignment.course?.title?.toLowerCase().includes(search);

            const typeMatch = !filters.type || assignment.type === filters.type;

            const statusMatch =
                !filters.status ||
                (filters.status === "submitted" && submission) ||
                (filters.status === "pending" && !submission);

            return searchMatch && typeMatch && statusMatch;
        });
    }, [assignments, filters, user?._id]);

    const fetchAssignments = async () => {
        try {
            setLoading(true);
            const res = await assignmentApi.getAssignments();
            setAssignments(res.data.data || []);
        } catch (error) {
            toast.error(error?.response?.data?.message || "Failed to load assignments");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAssignments();
    }, []);

    const openSubmitModal = (assignment) => {
        const submission = getMySubmission(assignment);

        setSelectedAssignment(assignment);
        setForm({
            answerText: submission?.answerText || "",
            file: null,
        });
        setModalOpen(true);
    };

    const closeModal = () => {
        if (saving) return;
        setSelectedAssignment(null);
        setForm(initialForm);
        setModalOpen(false);
    };

    const handleChange = (e) => {
        setForm((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleSubmitAssignment = async (e) => {
        e.preventDefault();

        if (!form.answerText.trim() && !form.file) {
            toast.error("Please enter answer text or upload a file");
            return;
        }

        try {
            setSaving(true);

            let uploadedFile = null;

            if (form.file) {
                const uploadRes = await uploadApi.uploadDocument(form.file);
                uploadedFile = uploadRes.data.data;
            }

            await assignmentApi.submitAssignment(selectedAssignment._id, {
                answerText: form.answerText,
                file: uploadedFile,
            });

            toast.success("Assignment submitted successfully");
            closeModal();
            fetchAssignments();
        } catch (error) {
            toast.error(error?.response?.data?.message || "Failed to submit assignment");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <Loader text="Loading assignments..." />;

    return (
        <div>
            {/* <PageHeader
        title="Assignments"
        description="View assignments from your enrolled courses and submit your work."
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
                            placeholder="Search assignments..."
                            className="Input !pl-14"
                        />
                    </div>

                    <select
                        value={filters.type}
                        onChange={(e) =>
                            setFilters((prev) => ({ ...prev, type: e.target.value }))
                        }
                        className="Input"
                    >
                        <option value="">All Types</option>
                        <option value="assignment">Assignment</option>
                        <option value="quiz">Quiz</option>
                    </select>

                    <select
                        value={filters.status}
                        onChange={(e) =>
                            setFilters((prev) => ({ ...prev, status: e.target.value }))
                        }
                        className="Input"
                    >
                        <option value="">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="submitted">Submitted</option>
                    </select>
                </div>
            </div>

            {filteredAssignments.length === 0 ? (
                <EmptyState
                    title="No assignments found"
                    description="Assignments from your enrolled courses will appear here."
                />
            ) : (
                <div className="grid gap-5 xl:grid-cols-2">
                    {filteredAssignments.map((assignment) => {
                        const submission = getMySubmission(assignment);

                        return (
                            <div
                                key={assignment._id}
                                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                            >
                                <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                                    <div className="flex gap-4">
                                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                                            <FileText size={26} />
                                        </div>

                                        <div>
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h3 className="text-lg font-bold text-slate-950">
                                                    {assignment.title}
                                                </h3>
                                                <TypeBadge type={assignment.type} />
                                                {submission ? (
                                                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                                                        Submitted
                                                    </span>
                                                ) : (
                                                    <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
                                                        Pending
                                                    </span>
                                                )}
                                            </div>

                                            <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-500">
                                                {assignment.description}
                                            </p>

                                            <p className="mt-4 text-sm font-semibold text-slate-700">
                                                Course:{" "}
                                                <span className="font-medium text-slate-500">
                                                    {assignment.course?.title || "-"}
                                                </span>
                                            </p>

                                            <div className="mt-4 flex flex-wrap gap-3">
                                                <InfoPill
                                                    icon={CalendarDays}
                                                    text={`Due: ${assignment.dueDate
                                                        ? new Date(assignment.dueDate).toLocaleDateString()
                                                        : "-"
                                                        }`}
                                                />

                                                {submission?.file?.url && (
                                                    <button
                                                        type="button"
                                                        onClick={() => openUploadedFile(submission.file)}
                                                        className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-2 text-xs font-bold text-indigo-700 transition hover:bg-indigo-100"
                                                    >
                                                        <ExternalLink size={14} />
                                                        Submitted File
                                                    </button>
                                                )}
                                            </div>

                                            {submission?.answerText && (
                                                <div className="mt-4 rounded-2xl bg-slate-50 p-4">
                                                    <p className="text-xs font-bold uppercase text-slate-400">
                                                        Your Answer
                                                    </p>
                                                    <p className="mt-2 text-sm leading-6 text-slate-600">
                                                        {submission.answerText}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <button
                                        disabled={Boolean(submission)}
                                        onClick={() => openSubmitModal(assignment)}
                                        className={`inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-bold shadow-lg transition disabled:cursor-not-allowed disabled:opacity-70 ${submission
                                            ? "bg-emerald-600 text-white shadow-emerald-100"
                                            : "bg-indigo-600 text-white shadow-indigo-100 hover:bg-indigo-700"
                                            }`}
                                    >
                                        {submission ? <CheckCircle2 size={18} /> : <Send size={18} />}
                                        {submission ? "Submitted" : "Submit"}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {modalOpen && selectedAssignment && (
                <SubmitModal
                    assignment={selectedAssignment}
                    form={form}
                    saving={saving}
                    onChange={handleChange}
                    onSubmit={handleSubmitAssignment}
                    onClose={closeModal}
                />
            )}
        </div>
    );
};

const SubmitModal = ({
    assignment,
    form,
    saving,
    onChange,
    onSubmit,
    onClose,
}) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 py-8 backdrop-blur-sm">
            <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
                <div className="sticky top-0 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-5">
                    <div>
                        <h2 className="text-xl font-bold text-slate-950">
                            Submit Assignment
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                            {assignment.title} • {assignment.course?.title}
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
                    <div className="rounded-2xl bg-slate-50 p-4">
                        <p className="text-sm font-bold text-slate-950">
                            Assignment Details
                        </p>
                        <p className="mt-2 text-sm leading-6 text-slate-600">
                            {assignment.description}
                        </p>
                    </div>

                    <div>
                        <Label>Answer Text</Label>
                        <textarea
                            name="answerText"
                            value={form.answerText}
                            onChange={onChange}
                            rows="6"
                            placeholder="Write your answer here..."
                            className="Input resize-none"
                        />
                    </div>

                    <div>
                        <Label>Upload Assignment File</Label>
                        <input
                            type="file"
                            accept=".pdf,.doc,.docx"
                            onChange={(e) =>
                                onChange({
                                    target: {
                                        name: "file",
                                        value: e.target.files?.[0] || null,
                                    },
                                })
                            }
                            className="Input"
                        />
                        <p className="mt-2 text-xs text-slate-500">
                            Allowed file types: PDF, DOC, DOCX. Max size: 10MB.
                        </p>
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
                            {saving ? "Submitting..." : "Submit Work"}
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

const TypeBadge = ({ type }) => (
    <span
        className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${type === "quiz"
            ? "bg-amber-50 text-amber-700"
            : "bg-indigo-50 text-indigo-700"
            }`}
    >
        {type}
    </span>
);

export default StudentAssignments;