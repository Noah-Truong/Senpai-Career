"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/AdminLayout";
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
      if (session?.user?.role !== "admin") {
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
      loadUsers();
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
      loadUsers();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.message || `Failed to ${action} user`);
    } finally {
      setBanningUser(null);
    }
  };

  if (status === "loading" || loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <p style={{ color: '#6B7280' }}>{t("common.loading")}</p>
        </div>
      </AdminLayout>
    );
  }

  const students = users.filter(u => u.role === "student");

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1" style={{ color: '#111827' }}>
          {t("admin.users.title")}
        </h1>
        <p style={{ color: '#6B7280' }}>{t("admin.users.subtitle")}</p>
      </div>

      {error && (
        <div 
          className="mb-4 px-4 py-3 rounded border"
          style={{ backgroundColor: '#FEE2E2', borderColor: '#FCA5A5', color: '#DC2626' }}
        >
          {error}
        </div>
      )}

      {success && (
        <div 
          className="mb-4 px-4 py-3 rounded border"
          style={{ backgroundColor: '#D1FAE5', borderColor: '#6EE7B7', color: '#059669' }}
        >
          {success}
        </div>
      )}

      {/* Students Section */}
      <div 
        className="bg-white border rounded mb-6"
        style={{ borderColor: '#E5E7EB', borderRadius: '6px' }}
      >
        <div className="p-4 border-b" style={{ borderColor: '#E5E7EB' }}>
          <h2 className="text-lg font-semibold" style={{ color: '#111827' }}>
            Students ({students.length})
          </h2>
        </div>
        <div className="table-responsive overflow-x-auto">
          <table className="min-w-full divide-y" style={{ borderColor: '#E5E7EB' }}>
            <thead style={{ backgroundColor: '#D7FFEF' }}>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase" style={{ color: '#6B7280' }}>User</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase" style={{ color: '#6B7280' }}>Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase" style={{ color: '#6B7280' }}>Strikes</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase" style={{ color: '#6B7280' }}>Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase" style={{ color: '#6B7280' }}>Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y" style={{ borderColor: '#E5E7EB' }}>
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
                        <div className="text-sm font-medium" style={{ color: '#111827' }}>{user.name}</div>
                        {user.nickname && (
                          <div className="text-sm" style={{ color: '#6B7280' }}>@{user.nickname}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: '#6B7280' }}>
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded ${
                      (user.strikes || 0) === 0 ? "bg-green-100 text-green-800" :
                      (user.strikes || 0) === 1 ? "bg-yellow-100 text-yellow-800" :
                      "bg-red-100 text-red-800"
                    }`}>
                      {(user.strikes || 0)} {t("admin.users.strikes")}{((user.strikes || 0) as number) !== 1 ? "s" : ""}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.isBanned ? (
                      <span className="px-2 py-1 text-xs font-medium rounded bg-red-100 text-red-800">
                        {t("admin.users.banned")}
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs font-medium rounded bg-green-100 text-green-800">
                        {t("admin.users.active")}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-3 flex-wrap">
                      {(user.strikes || 0) < 2 && (
                        <button
                          onClick={() => openStrikeModal(user, "add")}
                          className="hover:underline"
                          style={{ color: '#D97706' }}
                        >
                          {t("admin.users.addStrike")}
                        </button>
                      )}
                      {(user.strikes || 0) > 0 && (
                        <button
                          onClick={() => openStrikeModal(user, "remove")}
                          className="hover:underline"
                          style={{ color: '#059669' }}
                        >
                          {t("admin.users.removeStrike")}
                        </button>
                      )}
                      {!user.isBanned ? (
                        <button
                          onClick={() => handleBanAction(user.id, "ban")}
                          disabled={banningUser === user.id}
                          className="hover:underline disabled:opacity-50"
                          style={{ color: '#DC2626' }}
                        >
                          {banningUser === user.id ? t("admin.users.banning") : t("admin.users.ban")}
                        </button>
                      ) : (
                        <button
                          onClick={() => handleBanAction(user.id, "unban")}
                          disabled={banningUser === user.id}
                          className="hover:underline disabled:opacity-50"
                          style={{ color: '#059669' }}
                        >
                          {banningUser === user.id ? t("admin.users.unbanning") : t("admin.users.unban")}
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
      <div 
        className="bg-white border rounded"
        style={{ borderColor: '#E5E7EB', borderRadius: '6px' }}
      >
        <div className="p-4 border-b" style={{ borderColor: '#E5E7EB' }}>
          <h2 className="text-lg font-semibold" style={{ color: '#111827' }}>
            {t("admin.users.allUsers")} ({users.length})
          </h2>
        </div>
        <div className="table-responsive overflow-x-auto">
          <table className="min-w-full divide-y" style={{ borderColor: '#E5E7EB' }}>
            <thead style={{ backgroundColor: '#D7FFEF' }}>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase" style={{ color: '#6B7280' }}>{t("admin.dashboard.name")}</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase" style={{ color: '#6B7280' }}>{t("admin.dashboard.email")}</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase" style={{ color: '#6B7280' }}>{t("admin.dashboard.role")}</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase" style={{ color: '#6B7280' }}>{t("admin.dashboard.created")}</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y" style={{ borderColor: '#E5E7EB' }}>
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium" style={{ color: '#111827' }}>
                    {user.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: '#6B7280' }}>
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded ${
                      user.role === "student" ? "bg-blue-100 text-blue-800" :
                      user.role === "obog" ? "bg-green-100 text-green-800" :
                      user.role === "company" ? "bg-purple-100 text-purple-800" :
                      "bg-gray-100 text-gray-800"
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: '#6B7280' }}>
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
          <div 
            className="bg-white rounded p-6 max-w-md w-full mx-4"
            style={{ borderRadius: '6px' }}
          >
            <h3 className="text-lg font-semibold mb-4" style={{ color: '#111827' }}>
              {strikeAction === "add" ? t("admin.users.strikeModal.addTitle") : t("admin.users.strikeModal.removeTitle")} - {selectedUser.name}
            </h3>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
                {t("admin.users.strikeModal.reason")}
              </label>
              <textarea
                value={strikeReason}
                onChange={(e) => setStrikeReason(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border rounded"
                style={{ borderColor: '#D1D5DB', borderRadius: '6px', color: '#111827' }}
                placeholder={t("admin.users.strikeModal.reasonPlaceholder")}
              />
            </div>
            <div className="mb-4 text-sm" style={{ color: '#6B7280' }}>
              {t("admin.users.strikeModal.currentStrikes")}: <strong style={{ color: '#111827' }}>{selectedUser.strikes || 0}</strong>
              {strikeAction === "add" && (
                <span className="block mt-1">
                  {t("admin.users.strikeModal.afterAction")}: <strong style={{ color: '#111827' }}>{(selectedUser.strikes || 0) + 1}</strong>
                  {(selectedUser.strikes || 0) + 1 >= 2 && (
                    <span className="block mt-1" style={{ color: '#DC2626' }}>
                      {t("admin.users.strikeModal.willBeBanned")}
                    </span>
                  )}
                </span>
              )}
            </div>
            <div className="flex gap-4">
              <button
                onClick={handleStrikeAction}
                className="flex-1 btn-primary"
              >
                {strikeAction === "add" ? t("admin.users.strikeModal.addTitle") : t("admin.users.strikeModal.removeTitle")}
              </button>
              <button
                onClick={() => {
                  setShowStrikeModal(false);
                  setStrikeReason("");
                }}
                className="flex-1 btn-secondary"
              >
                {t("button.cancel")}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
