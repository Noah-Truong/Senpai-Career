"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { useLanguage } from "@/contexts/LanguageContext";
import Avatar from "@/components/Avatar";

export default function AdminUsersPage() {
  const { t } = useLanguage();
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showStrikeModal, setShowStrikeModal] = useState(false);
  const [strikeReason, setStrikeReason] = useState("");
  const [strikeAction, setStrikeAction] = useState<"add" | "remove">("add");
  const [banningUser, setBanningUser] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated") {
      if (session.user?.role !== "admin") {
        router.push("/");
        return;
      }
      loadUsers();
    }
  }, [status, router, session]);

  const loadUsers = async () => {
    try {
      const response = await fetch("/api/admin/users");
      if (!response.ok) {
        throw new Error("Failed to load users");
      }
      const data = await response.json();
      setUsers(data.users || []);
      setLoading(false);
    } catch (err: any) {
      setError(err.message || "Failed to load users");
      setLoading(false);
    }
  };

  const handleStrikeAction = async () => {
    if (!selectedUser) return;

    setError("");
    setSuccess("");

    try {
      const response = await fetch(`/api/admin/users/${selectedUser.id}/strikes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: strikeAction,
          reason: strikeReason,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update strikes");
      }

      setSuccess(data.message);
      setShowStrikeModal(false);
      setStrikeReason("");
      loadUsers(); // Reload users
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to update strikes");
    }
  };

  const openStrikeModal = (user: any, action: "add" | "remove") => {
    setSelectedUser(user);
    setStrikeAction(action);
    setStrikeReason("");
    setShowStrikeModal(true);
  };

  const handleBanAction = async (userId: string, action: "ban" | "unban") => {
    if (!confirm(`Are you sure you want to ${action === "ban" ? "ban" : "unban"} this user?`)) {
      return;
    }

    setBanningUser(userId);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`/api/admin/users/${userId}/ban`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Failed to ${action} user`);
      }

      setSuccess(data.message);
      loadUsers(); // Reload users
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.message || `Failed to ${action} user`);
    } finally {
      setBanningUser(null);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p>{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  const students = users.filter(u => u.role === "student");
  const obogs = users.filter(u => u.role === "obog");
  const companies = users.filter(u => u.role === "company");

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <button
            onClick={() => router.push("/dashboard/admin")}
            className="text-gray-600 hover:text-gray-900 mb-4"
          >
            ← Back to Admin Dashboard
          </button>
          <h1 className="text-3xl font-bold mb-2">User Management</h1>
          <p className="text-gray-600">Manage all users, apply strikes, and ban users</p>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
            {success}
          </div>
        )}

        {/* Students Section */}
        <div className="card-gradient p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4">Students ({students.length})</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Strikes</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {students.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Avatar
                          src={user.profilePhoto}
                          alt={user.name}
                          size="sm"
                          fallbackText={user.name}
                          className="mr-3"
                        />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          {user.nickname && (
                            <div className="text-sm text-gray-500">@{user.nickname}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded ${
                        (user.strikes || 0) === 0 ? "bg-green-100 text-green-800" :
                        (user.strikes || 0) === 1 ? "bg-yellow-100 text-yellow-800" :
                        "bg-red-100 text-red-800"
                      }`}>
                        {(user.strikes || 0)} Strike{(user.strikes || 0) !== 1 ? "s" : ""}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.isBanned ? (
                        <span className="px-2 py-1 text-xs font-semibold rounded bg-red-100 text-red-800">
                          Banned
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-semibold rounded bg-green-100 text-green-800">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2 flex-wrap">
                        {(user.strikes || 0) < 2 && (
                          <button
                            onClick={() => openStrikeModal(user, "add")}
                            className="text-yellow-600 hover:text-yellow-900"
                          >
                            Add Strike
                          </button>
                        )}
                        {(user.strikes || 0) > 0 && (
                          <button
                            onClick={() => openStrikeModal(user, "remove")}
                            className="text-green-600 hover:text-green-900"
                          >
                            Remove Strike
                          </button>
                        )}
                        {!user.isBanned ? (
                          <button
                            onClick={() => handleBanAction(user.id, "ban")}
                            disabled={banningUser === user.id}
                            className="text-red-600 hover:text-red-900 disabled:opacity-50"
                          >
                            {banningUser === user.id ? "Banning..." : "Ban"}
                          </button>
                        ) : (
                          <button
                            onClick={() => handleBanAction(user.id, "unban")}
                            disabled={banningUser === user.id}
                            className="text-green-600 hover:text-green-900 disabled:opacity-50"
                          >
                            {banningUser === user.id ? "Unbanning..." : "Unban"}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* All Users Table */}
        <div className="card-gradient p-6">
          <h2 className="text-2xl font-semibold mb-4">All Users ({users.length})</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {user.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded ${
                        user.role === "student" ? "bg-blue-100 text-blue-800" :
                        user.role === "obog" ? "bg-green-100 text-green-800" :
                        user.role === "company" ? "bg-purple-100 text-purple-800" :
                        "bg-gray-100 text-gray-800"
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Strike Modal */}
        {showStrikeModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold mb-4">
                {strikeAction === "add" ? "Add Strike" : "Remove Strike"} - {selectedUser.name}
              </h3>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason (optional)
                </label>
                <textarea
                  value={strikeReason}
                  onChange={(e) => setStrikeReason(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter reason for this action..."
                  style={{ color: '#000000' }}
                />
              </div>
              <div className="mb-4 text-sm text-gray-600">
                Current strikes: <strong>{selectedUser.strikes || 0}</strong>
                {strikeAction === "add" && (
                  <span className="block mt-1">
                    After this action: <strong>{(selectedUser.strikes || 0) + 1}</strong>
                    {(selectedUser.strikes || 0) + 1 >= 2 && (
                      <span className="text-red-600 block mt-1">⚠️ User will be automatically banned (2 strikes = ban)</span>
                    )}
                  </span>
                )}
              </div>
              <div className="flex gap-4">
                <button
                  onClick={handleStrikeAction}
                  className={`flex-1 btn-primary`}
                >
                  {strikeAction === "add" ? "Add Strike" : "Remove Strike"}
                </button>
                <button
                  onClick={() => {
                    setShowStrikeModal(false);
                    setStrikeReason("");
                  }}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

