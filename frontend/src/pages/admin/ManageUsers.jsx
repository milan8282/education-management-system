import { useEffect, useMemo, useState } from "react";
import { Search, ShieldCheck, Trash2, Users } from "lucide-react";
import toast from "react-hot-toast";
import PageHeader from "../../components/common/PageHeader";
import Loader from "../../components/common/Loader";
import EmptyState from "../../components/common/EmptyState";
import { userApi } from "../../api/userApi";
import { useAuth } from "../../context/AuthContext";

const ManageUsers = () => {
  const { user: currentUser } = useAuth();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [filters, setFilters] = useState({
    search: "",
    role: "",
    isActive: "",
  });

  const queryParams = useMemo(() => {
    const params = {};
    if (filters.search) params.search = filters.search;
    if (filters.role) params.role = filters.role;
    if (filters.isActive) params.isActive = filters.isActive;
    return params;
  }, [filters]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await userApi.getUsers(queryParams);
      setUsers(res.data.data || []);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(fetchUsers, 300);
    return () => clearTimeout(timer);
  }, [queryParams]);

  const handleRoleChange = async (id, role) => {
    try {
      setActionLoading(id);
      await userApi.updateRole(id, { role });
      toast.success("User role updated");
      fetchUsers();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update role");
    } finally {
      setActionLoading(null);
    }
  };

  const handleStatusToggle = async (targetUser) => {
    try {
      setActionLoading(targetUser._id);
      await userApi.updateStatus(targetUser._id, {
        isActive: !targetUser.isActive,
      });
      toast.success(`User ${targetUser.isActive ? "deactivated" : "activated"}`);
      fetchUsers();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update status");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (targetUser) => {
    const ok = window.confirm(`Delete ${targetUser.name}? This cannot be undone.`);
    if (!ok) return;

    try {
      setActionLoading(targetUser._id);
      await userApi.deleteUser(targetUser._id);
      toast.success("User deleted");
      fetchUsers();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to delete user");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div>
      <PageHeader
        action={
          <div className="inline-flex items-center gap-2 rounded-2xl bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700">
            <Users size={18} />
            {users.length} Users
          </div>
        }
      />

      <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-4 md:grid-cols-3">
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
              placeholder="Search by name or email..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
            />
          </div>

          <select
            value={filters.role}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, role: e.target.value }))
            }
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
          >
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="teacher">Teacher</option>
            <option value="student">Student</option>
          </select>

          <select
            value={filters.isActive}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, isActive: e.target.value }))
            }
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
          >
            <option value="">All Status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>
      </div>

      {loading ? (
        <Loader text="Loading users..." />
      ) : users.length === 0 ? (
        <EmptyState
          title="No users found"
          description="Try changing search or filter options."
        />
      ) : (
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <Th>User</Th>
                  <Th>Role</Th>
                  <Th>Status</Th>
                  <Th>Created</Th>
                  <Th align="right">Actions</Th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 bg-white">
                {users.map((item) => {
                  const isSelf = item._id === currentUser?._id;

                  return (
                    <tr key={item._id} className="hover:bg-slate-50/80">
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 font-bold uppercase text-indigo-700">
                            {item.name?.charAt(0) || "U"}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-950">{item.name}</p>
                            <p className="text-sm text-slate-500">{item.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="whitespace-nowrap px-6 py-4">
                        <select
                          disabled={isSelf || actionLoading === item._id}
                          value={item.role}
                          onChange={(e) => handleRoleChange(item._id, e.target.value)}
                          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold capitalize text-slate-700 outline-none disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <option value="admin">Admin</option>
                          <option value="teacher">Teacher</option>
                          <option value="student">Student</option>
                        </select>
                      </td>

                      <td className="whitespace-nowrap px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                            item.isActive
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-rose-50 text-rose-700"
                          }`}
                        >
                          {item.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>

                      <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">
                        {item.createdAt
                          ? new Date(item.createdAt).toLocaleDateString()
                          : "-"}
                      </td>

                      <td className="whitespace-nowrap px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            disabled={isSelf || actionLoading === item._id}
                            onClick={() => handleStatusToggle(item)}
                            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <ShieldCheck size={16} />
                            {item.isActive ? "Deactivate" : "Activate"}
                          </button>

                          <button
                            disabled={isSelf || actionLoading === item._id}
                            onClick={() => handleDelete(item)}
                            className="inline-flex items-center gap-2 rounded-xl border border-rose-200 px-3 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <Trash2 size={16} />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

const Th = ({ children, align = "left" }) => (
  <th
    className={`whitespace-nowrap px-6 py-4 text-${align} text-xs font-bold uppercase tracking-wider text-slate-500`}
  >
    {children}
  </th>
);

export default ManageUsers;