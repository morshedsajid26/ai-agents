"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { UserPlus, Shield, Mail, User, ShieldCheck, X, ShieldAlert, Key, Trash2, Pencil } from "lucide-react";
import toast from "react-hot-toast";
import { useDashboard } from "../../components/DashboardContext";
import InputField from "../../components/InputField";
import { Table, TableRow, TableCell } from "../../components/Table";
import { apiFetch } from "../../utils/api";

export default function UserManagementPage() {
  const { profile } = useDashboard();
  const router = useRouter();
  const queryClient = useQueryClient();

  const getActiveRole = () => {
    if (profile?.role) return profile.role;
    if (typeof window !== "undefined") {
      try {
        const cookieRole = Cookies.get("role");
        if (cookieRole) return cookieRole;

        const saved = localStorage.getItem("user-profile");
        if (saved) return JSON.parse(saved).role;
      } catch (e) {
        console.error(e);
      }
    }
    return undefined;
  };

  const activeRole = getActiveRole();

  // Redirect non-admins
  useEffect(() => {
    if (activeRole !== undefined && activeRole !== "SYSTEM_OWNER") {
      toast.error("Access denied: ADMIN role required.");
      router.push("/");
    }
  }, [activeRole, router]);

  // Modal and Form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState("USER");
  const [newPassword, setNewPassword] = useState("");
  const [editingUser, setEditingUser] = useState(null);

  const handleOpenAddModal = () => {
    setEditingUser(null);
    setNewName("");
    setNewEmail("");
    setNewRole("USER");
    setNewPassword("");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (user) => {
    setEditingUser(user);
    setNewName(user.name || "");
    setNewEmail(user.email || "");
    setNewRole(user.role || "USER");
    setNewPassword("");
    setIsModalOpen(true);
  };

  // Fetch Users Query
  const { data: users = [], isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const json = await apiFetch("/admin/add-user");
      return json.data;
    }
  });

  // Add User Mutation
  const addUserMutation = useMutation({
    mutationFn: async (newUser) => {
      const { name, email, password } = newUser;
      const json = await apiFetch("/admin/add-user", {
        method: "POST",
        body: JSON.stringify({ name, email, password }),
      });
      return json.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User added successfully!");
      setIsModalOpen(false);
      // Reset Form
      setNewName("");
      setNewEmail("");
      setNewRole("USER");
      setNewPassword("");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to add user");
    }
  });

  // Delete User Mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (userId) => {
      const json = await apiFetch(`/user/delete/${userId}`, {
        method: "DELETE",
      });
      return json.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User deleted successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete user");
    }
  });

  const handleDeleteUser = (userId) => {
    if (confirm("Are you sure you want to delete this user?")) {
      deleteUserMutation.mutate(userId);
    }
  };

  // Edit User Mutation
  const editUserMutation = useMutation({
    mutationFn: async (updatedUser) => {
      const json = await apiFetch(`/user/update/${updatedUser.id}`, {
        method: "PUT",
        body: JSON.stringify(updatedUser),
      });
      return json.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User updated successfully!");
      setIsModalOpen(false);
      // Reset Form
      setNewName("");
      setNewEmail("");
      setNewRole("USER");
      setNewPassword("");
      setEditingUser(null);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update user");
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newName || !newEmail) {
      toast.error("Please fill in all required fields");
      return;
    }
    if (editingUser) {
      editUserMutation.mutate({
        id: editingUser.id,
        name: newName,
        email: newEmail,
        role: newRole,
        ...(newPassword ? { password: newPassword } : {})
      });
    } else {
      if (!newPassword) {
        toast.error("Password is required for new users");
        return;
      }
      addUserMutation.mutate({
        name: newName,
        email: newEmail,
        role: newRole,
        password: newPassword
      });
    }
  };

  const tableHeads = React.useMemo(() => [
    {
      key: "name",
      Title: "User",
      render: (user) => (
        <div className="flex items-center gap-3 justify-center">
          <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-655 dark:text-slate-400 font-bold uppercase">
            {user.name ? user.name[0] : <User className="w-4 h-4" />}
          </div>
          <span className="font-semibold text-slate-900 dark:text-white">{user.name}</span>
        </div>
      )
    },
    {
      key: "email",
      Title: "Email"
    },
    {
      key: "createdAt",
      Title: "Created At",
      render: (user) => (
        <span className="text-slate-400 dark:text-slate-500 font-medium text-xxs">
          {new Date(user.createdAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
          })}
        </span>
      )
    },
    {
      key: "actions",
      Title: "Action",
      sortable: false,
      render: (user) => (
        <div className="flex justify-center gap-2">
          <button
            onClick={() => handleOpenEditModal(user)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 transition-all cursor-pointer"
            title="Edit User"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDeleteUser(user.id)}
            disabled={deleteUserMutation.isPending}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all cursor-pointer disabled:opacity-50"
            title="Delete User"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ], [deleteUserMutation.isPending]);

  if (activeRole === undefined || activeRole !== "SYSTEM_OWNER") {
    return (
      <div className="flex-1 flex items-center justify-center bg-white dark:bg-[#0b0f19]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <>
      <div className="flex-1 overflow-y-auto pr-1 pb-6 scrollbar-thin animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 select-none shrink-0 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            User Management
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-550 dark:text-slate-400">
            Monitor registered dashboard accounts, adjust authority rules, and add system operators.
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center justify-center gap-2 px-4.5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-550 text-white text-xs font-bold shadow-md shadow-indigo-600/10 hover:shadow-lg transition-all cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add User</span>
        </button>
      </div>

      {/* Users Table Container */}
      {isLoading ? (
        <div className="flex justify-center items-center py-20 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl bg-white dark:bg-[#0b0f19]">
          <div className="flex items-center gap-2 text-slate-405 dark:text-slate-400">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
            <span>Loading user directory...</span>
          </div>
        </div>
      ) : users.length === 0 ? (
        <div className="flex justify-center items-center py-20 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl bg-white dark:bg-[#0b0f19]">
          <span className="text-slate-450 dark:text-slate-500 font-semibold">No users found in directory.</span>
        </div>
      ) : (
        <Table TableHeads={tableHeads} TableRows={users} />
      )}
    </div>

    {/* Add User Modal */}
    {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs select-none w-full">
          <div className="w-full max-w-md rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xl dark:border-slate-800/80 dark:bg-[#0b0f19] animate-fade-in relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-5">
              {editingUser ? (
                <>
                  <Pencil className="w-5 h-5 text-indigo-500" />
                  <span>Edit User</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5 text-indigo-500" />
                  <span>Add New User</span>
                </>
              )}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <InputField
                label="Full Name"
                type="text"
                placeholder="Jane Doe"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                required
              />

              <InputField
                label="Email Address"
                type="email"
                placeholder="jane.doe@company.com"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                required
              />

              <InputField
                label={editingUser ? "New Password (optional)" : "Password"}
                type="password"
                placeholder={editingUser ? "Leave blank to keep unchanged" : "••••••••"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required={!editingUser}
              />

          

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800/80 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-850 text-xs font-bold text-slate-650 dark:text-slate-400 bg-white dark:bg-[#0b0f19] hover:bg-slate-50 dark:hover:bg-slate-850/60 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addUserMutation.isPending || editUserMutation.isPending}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-550 shadow-sm hover:shadow transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {addUserMutation.isPending || editUserMutation.isPending ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <span>{editingUser ? "Save Changes" : "Add User"}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
