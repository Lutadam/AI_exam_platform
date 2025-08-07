"use client";

import React, { useEffect, useState } from "react";
import {
  createUser,
  fetchUsers,
  fetchRoles,
  updateUser,
  deleteUser,
  User,
  Role,
} from "@/services/admin/userService";
import { getUserSession } from "@/services/authService";
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [newUserVisible, setNewUserVisible] = useState(false);
  const [newUserPasswordVisible, setNewUserPasswordVisible] = useState(false);
  const [editPasswordVisible, setEditPasswordVisible] = useState(false);

  const [newUser, setNewUser] = useState({
    Username: "",
    Password: "",
    UserRoleId: 1,
  });

  const [search, setSearch] = useState("");
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({
    Username: "",
    Password: "",
    UserRoleId: 1,
  });

  useEffect(() => {
    async function load() {
      try {
        const usersData = await fetchUsers();
        const rolesData = await fetchRoles();
        setUsers(usersData);
        setRoles(rolesData);
      } catch (err) {
        console.error(err);
      }
    }
    load();
  }, []);

  function startEdit(user: User) {
    setEditingUserId(user.UserId);
    setEditForm({
      Username: user.Username,
      Password: "",
      UserRoleId: user.UserRoleId,
    });
  }

  function cancelEdit() {
    setEditingUserId(null);
    setEditForm({ Username: "", Password: "", UserRoleId: 1 });
    setEditPasswordVisible(false);
  }

  async function saveEdit(userId: number) {
    try {
      await updateUser({
        UserId: userId,
        Username: editForm.Username,
        Password: editForm.Password || undefined,
        UserRoleId: editForm.UserRoleId,
      });
      const updatedUsers = await fetchUsers();
      setUsers(updatedUsers);
      cancelEdit();
    } catch (error) {
      alert("Failed to save user changes");
      console.error(error);
    }
  }

  async function handleAddUser() {
    try {
      await createUser(newUser);
      const updatedUsers = await fetchUsers();
      setUsers(updatedUsers);
      setNewUser({ Username: "", Password: "", UserRoleId: 1 });
      setNewUserVisible(false);
      setNewUserPasswordVisible(false);
    } catch (err) {
      alert("Failed to add user");
    }
  }

  async function handleDeleteUser(userId: number) {
    const user = getUserSession();
    if (!user) {
      alert("Not authenticated");
      return;
    }

    const password = prompt("Enter your password to confirm deletion:");
    if (!password) return;

    try {
      await deleteUser(userId, { username: user.username, password });
      const updatedUsers = await fetchUsers();
      setUsers(updatedUsers);
    } catch (err: any) {
      alert(err.message || "Failed to delete user");
      console.error(err);
    }
  }

  const filteredUsers = users.filter(
    (u) =>
      u.Username.toLowerCase().includes(search.toLowerCase()) ||
      roles
        .find((r) => r.UserRoleId === u.UserRoleId)
        ?.UserRole.toLowerCase()
        .includes(search.toLowerCase())
  );

  function getRoleName(roleId: number) {
    return roles.find((r) => r.UserRoleId === roleId)?.UserRole || "Unknown";
  }

  return (
     <div className="p-6 max-w-5xl mx-auto">
    {/* Back button + title */}
    <div className="flex items-center gap-3 mb-6">
      <Link href="/admin/dashboard">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="w-4 h-4" />
        </Button>
      </Link>
      <h1 className="text-2xl font-bold">Manage Users</h1>
    </div>

      <input
        type="text"
        placeholder="Search by username or role..."
        className="mb-4 w-full border rounded px-3 py-2"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <button
        className="mb-6 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        onClick={() => setNewUserVisible(!newUserVisible)}
      >
        {newUserVisible ? "Cancel" : "Add User"}
      </button>

      {newUserVisible && (
        <div className="mb-6 border p-4 rounded bg-gray-50">
          <div className="mb-2">
            <input
              type="text"
              placeholder="Username"
              value={newUser.Username}
              onChange={(e) => setNewUser((f) => ({ ...f, Username: e.target.value }))}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div className="mb-2 flex items-center gap-2">
            <input
              type={newUserPasswordVisible ? "text" : "password"}
              placeholder="Password"
              value={newUser.Password}
              onChange={(e) => setNewUser((f) => ({ ...f, Password: e.target.value }))}
              className="w-full border rounded px-3 py-2"
            />
            <button
              type="button"
              onClick={() => setNewUserPasswordVisible((prev) => !prev)}
            >
              {newUserPasswordVisible ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          <div className="mb-4">
            <select
              value={newUser.UserRoleId}
              onChange={(e) => setNewUser((f) => ({ ...f, UserRoleId: Number(e.target.value) }))}
              className="w-full border rounded px-3 py-2"
            >
              {roles.map((role) => (
                <option key={role.UserRoleId} value={role.UserRoleId}>
                  {role.UserRole}
                </option>
              ))}
            </select>
          </div>
          <button
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            onClick={handleAddUser}
          >
            Save New User
          </button>
        </div>
      )}

      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 px-3 py-2 text-left">Username</th>
            <th className="border border-gray-300 px-3 py-2 text-left">Role</th>
            <th className="border border-gray-300 px-3 py-2 text-left">Password</th>
            <th className="border border-gray-300 px-3 py-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map((user) => (
            <tr key={user.UserId} className="odd:bg-white even:bg-gray-50">
              <td className="border border-gray-300 px-3 py-2">
                {editingUserId === user.UserId ? (
                  <input
                    type="text"
                    value={editForm.Username}
                    onChange={(e) =>
                      setEditForm((f) => ({ ...f, Username: e.target.value }))
                    }
                    className="border border-gray-300 rounded px-2 py-1 w-full"
                  />
                ) : (
                  user.Username
                )}
              </td>

              <td className="border border-gray-300 px-3 py-2">
                {editingUserId === user.UserId ? (
                  <select
                    value={editForm.UserRoleId}
                    onChange={(e) =>
                      setEditForm((f) => ({
                        ...f,
                        UserRoleId: Number(e.target.value),
                      }))
                    }
                    className="border border-gray-300 rounded px-2 py-1 w-full"
                  >
                    {roles.map((role) => (
                      <option key={role.UserRoleId} value={role.UserRoleId}>
                        {role.UserRole}
                      </option>
                    ))}
                  </select>
                ) : (
                  getRoleName(user.UserRoleId)
                )}
              </td>

              <td className="border border-gray-300 px-3 py-2">
                {editingUserId === user.UserId ? (
                  <div className="flex items-center gap-2">
                    <input
                      type={editPasswordVisible ? "text" : "password"}
                      placeholder="Enter new password"
                      value={editForm.Password}
                      onChange={(e) =>
                        setEditForm((f) => ({ ...f, Password: e.target.value }))
                      }
                      className="border border-gray-300 rounded px-2 py-1 w-full"
                    />
                    <button onClick={() => setEditPasswordVisible((p) => !p)}>
                      {editPasswordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                ) : (
                  "••••••••"
                )}
              </td>

              <td className="border border-gray-300 px-3 py-2 flex gap-2">
                {editingUserId === user.UserId ? (
                  <>
                    <button
                      className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                      onClick={() => saveEdit(user.UserId)}
                    >
                      Save
                    </button>
                    <button
                      className="bg-gray-400 text-black px-3 py-1 rounded hover:bg-gray-500"
                      onClick={cancelEdit}
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                      onClick={() => startEdit(user)}
                    >
                      Edit
                    </button>
                    <button
                      className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                      onClick={() => handleDeleteUser(user.UserId)}
                    >
                      Delete
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}

          {filteredUsers.length === 0 && (
            <tr>
              <td colSpan={4} className="text-center py-4 text-gray-500">
                No users found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
