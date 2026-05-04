import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  ClipboardCheck,
  Edit,
  FileText,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import PageHeader from "../../components/common/PageHeader";
import Loader from "../../components/common/Loader";
import EmptyState from "../../components/common/EmptyState";
import { assignmentApi } from "../../api/assignmentApi";
import { courseApi } from "../../api/courseApi";
import { ExternalLink } from "lucide-react";
import { uploadApi } from "../../api/uploadApi";
import { openUploadedFile } from "../../utils/fileViewer";

const initialForm = {
  courseId: "",
  title: "",
  description: "",
  type: "assignment",
  dueDate: "",
  file: null,
  materialFile: null,
};

const TeacherAssignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [form, setForm] = useState(initialForm);

  const [filters, setFilters] = useState({
    search: "",
    courseId: "",
    type: "",
  });

  const queryParams = useMemo(() => {
    const params = {};
    if (filters.courseId) params.course = filters.courseId;
    if (filters.type) params.type = filters.type;
    return params;
  }, [filters.courseId, filters.type]);

  const filteredAssignments = useMemo(() => {
    const search = filters.search.trim().toLowerCase();

    if (!search) return assignments;

    return assignments.filter((item) => {
      return (
        item.title?.toLowerCase().includes(search) ||
        item.description?.toLowerCase().includes(search) ||
        item.course?.title?.toLowerCase().includes(search)
      );
    });
  }, [assignments, filters.search]);

  const fetchData = async () => {
    try {
      setLoading(true);

      const [assignmentsRes, coursesRes] = await Promise.all([
        assignmentApi.getAssignments(queryParams),
        courseApi.getCourses(),
      ]);

      setAssignments(assignmentsRes.data.data || []);
      setCourses(coursesRes.data.data || []);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load assignments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [queryParams]);

  const openCreateModal = () => {
    setEditingAssignment(null);
    setForm(initialForm);
    setModalOpen(true);
  };

  const openEditModal = (assignment) => {
    setEditingAssignment(assignment);
    setForm({
      courseId: assignment.course?._id || "",
      title: assignment.title || "",
      description: assignment.description || "",
      type: assignment.type || "assignment",
      dueDate: assignment.dueDate ? assignment.dueDate.slice(0, 10) : "",
      file: null,
      materialFile: assignment.materialFile || null,
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;
    setModalOpen(false);
    setEditingAssignment(null);
    setForm(initialForm);
  };

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const validateForm = () => {
    if (!form.courseId) return "Course is required";
    if (!form.title.trim()) return "Title is required";
    if (!form.description.trim()) return "Description is required";
    if (!form.dueDate) return "Due date is required";
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

      if (editingAssignment) {

        let uploadedMaterial = form.materialFile;

        if (form.file) {
          const uploadRes = await uploadApi.uploadDocument(form.file);
          uploadedMaterial = uploadRes.data.data;
        }

        const updatePayload = {
          title: form.title,
          description: form.description,
          type: form.type,
          dueDate: form.dueDate,
          materialFile: uploadedMaterial,
        };

        await assignmentApi.updateAssignment(editingAssignment._id, updatePayload);
        toast.success("Assignment updated successfully");
      } else {

        let uploadedMaterial = form.materialFile;

        if (form.file) {
          const uploadRes = await uploadApi.uploadDocument(form.file);
          uploadedMaterial = uploadRes.data.data;
        }

        await assignmentApi.createAssignment({
          courseId: form.courseId,
          title: form.title,
          description: form.description,
          type: form.type,
          dueDate: form.dueDate,
          materialFile: uploadedMaterial,
        });

        toast.success("Assignment created successfully");
      }

      closeModal();
      fetchData();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to save assignment");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (assignment) => {
    const ok = window.confirm(`Delete "${assignment.title}"? This cannot be undone.`);
    if (!ok) return;

    try {
      await assignmentApi.deleteAssignment(assignment._id);
      toast.success("Assignment deleted successfully");
      fetchData();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to delete assignment");
    }
  };

  if (loading) return <Loader text="Loading assignments..." />;

  return (
    <div>
      <PageHeader
        action={
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-100 transition hover:bg-indigo-700"
          >
            <Plus size={18} />
            Add Assignment
          </button>
        }
      />

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
        </div>
      </div>

      {filteredAssignments.length === 0 ? (
        <EmptyState
          title="No assignments found"
          description="Create an assignment or quiz for your assigned courses."
        />
      ) : (
        <div className="grid gap-5 xl:grid-cols-2">
          {filteredAssignments.map((assignment) => (
            <div
              key={assignment._id}
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
                        {assignment.title}
                      </h3>
                      <TypeBadge type={assignment.type} />
                    </div>

                    <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-500">
                      {assignment.description}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-3">
                      <InfoPill
                        icon={ClipboardCheck}
                        text={`${assignment.submissions?.length || 0} submissions`}
                      />
                      <InfoPill
                        icon={CalendarDays}
                        text={`Due: ${assignment.dueDate
                          ? new Date(assignment.dueDate).toLocaleDateString()
                          : "-"
                          }`}
                      />
                    </div>

                    <p className="mt-4 text-sm font-semibold text-slate-700">
                      Course:{" "}
                      <span className="text-slate-500">
                        {assignment.course?.title || "-"}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 gap-2">
                  {assignment.materialFile?.url && (
                    <button
                      type="button"
                      onClick={() => openUploadedFile(assignment.materialFile)}
                      className="rounded-xl border border-indigo-200 p-2.5 text-indigo-600 transition hover:bg-indigo-50"
                      title="View uploaded file"
                    >
                      <ExternalLink size={17} />
                    </button>
                  )}
                  <button
                    onClick={() => openEditModal(assignment)}
                    className="rounded-xl border border-slate-200 p-2.5 text-slate-600 transition hover:bg-slate-50 hover:text-indigo-600"
                  >
                    <Edit size={17} />
                  </button>
                  <button
                    onClick={() => handleDelete(assignment)}
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
        <AssignmentModal
          form={form}
          courses={courses}
          editingAssignment={editingAssignment}
          saving={saving}
          onClose={closeModal}
          onChange={handleChange}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
};

const AssignmentModal = ({
  form,
  courses,
  editingAssignment,
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
              {editingAssignment ? "Edit Assignment" : "Create Assignment"}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Add assignment or quiz details for a course.
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
            <Label>Course</Label>
            <select
              name="courseId"
              value={form.courseId}
              onChange={onChange}
              disabled={Boolean(editingAssignment)}
              className="Input disabled:cursor-not-allowed disabled:opacity-60"
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
            <Label>Title</Label>
            <input
              name="title"
              value={form.title}
              onChange={onChange}
              placeholder="React Components Assignment"
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
              placeholder="Explain assignment details..."
              className="Input resize-none"
            />
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <Label>Type</Label>
              <select
                name="type"
                value={form.type}
                onChange={onChange}
                className="Input"
              >
                <option value="assignment">Assignment</option>
                <option value="quiz">Quiz</option>
              </select>
            </div>

            <div>
              <Label>Due Date</Label>
              <input
                type="date"
                name="dueDate"
                value={form.dueDate}
                onChange={onChange}
                className="Input"
              />
            </div>
          </div>

          {form.type === "assignment" && (
            <div>
              <Label>Upload Assignment Material</Label>
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

              {form.materialFile?.url && (
                <button
                  type="button"
                  onClick={() => openUploadedFile(form.materialFile)}
                  className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-700"
                >
                  <ExternalLink size={16} />
                  View Current Uploaded File
                </button>
              )}
            </div>
          )}

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
              {saving
                ? "Saving..."
                : editingAssignment
                  ? "Update Assignment"
                  : "Create Assignment"}
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

export default TeacherAssignments;