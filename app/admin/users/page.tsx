"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
  const [showCorporateOBModal, setShowCorporateOBModal] = useState(false);
  const [companies, setCompanies] = useState<any[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [assigningCorporateOB, setAssigningCorporateOB] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");

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
      loadCompanies();
    }
  }, [status, router, session]);

  const loadCompanies = async () => {
    try {
      const response = await fetch("/api/companies/list");
      if (response.ok) {
        const data = await response.json();
        setCompanies(data.companies || []);
      }
    } catch (err) {
      console.error("Error loading companies:", err);
    }
  };

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

  const openCorporateOBModal = (user: any) => {
    setSelectedUser(user);
    setSelectedCompanyId("");
    setIsVerified(false);
    setShowCorporateOBModal(true);
  };

  const handleAssignCorporateOB = async () => {
    if (!selectedUser || !selectedCompanyId) {
      setError(t("corporateOb.error.noCompany") || "Please select a company");
      return;
    }

    setAssigningCorporateOB(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/admin/corporate-ob", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: selectedUser.id,
          companyId: selectedCompanyId,
          isVerified,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t("corporateOb.error.assign"));
      }

      setSuccess(data.message || t("corporateOb.assigned"));
      setShowCorporateOBModal(false);
      loadUsers();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.message || t("corporateOb.error.assign"));
    } finally {
      setAssigningCorporateOB(false);
    }
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
  
  // Filter all users based on search and role
  const filteredUsers = users.filter(user => {
    const matchesSearch = searchTerm === "" || 
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.nickname?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <AdminLayout>
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold mb-1" style={{ color: '#111827' }}>
          {t("admin.users.title")}
        </h1>
        <p className="text-sm sm:text-base" style={{ color: '#6B7280' }}>{t("admin.users.subtitle")}</p>
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
        
        {/* Mobile Card View */}
        <div className="md:hidden divide-y" style={{ borderColor: '#E5E7EB' }}>
          {students.map((user) => (
            <div key={user.id} className="p-4">
              <div className="flex items-start gap-3 mb-3">
                <Avatar
                  src={user.profilePhoto}
                  alt={user.name}
                  size="md"
                  fallbackText={user.name}
                  className="shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate" style={{ color: '#111827' }}>{user.name}</div>
                  <div className="text-xs truncate" style={{ color: '#6B7280' }}>{user.email}</div>
                  {user.nickname && (
                    <div className="text-xs truncate" style={{ color: '#6B7280' }}>@{user.nickname}</div>
                  )}
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded ${
                      (user.strikes || 0) === 0 ? "bg-green-100 text-green-800" :
                      (user.strikes || 0) === 1 ? "bg-yellow-100 text-yellow-800" :
                      "bg-red-100 text-red-800"
                    }`}>
                      {(user.strikes || 0)} {t("admin.users.strikes")}{((user.strikes || 0) as number) !== 1 ? "s" : ""}
                    </span>
                    {user.isBanned ? (
                      <span className="px-2 py-1 text-xs font-medium rounded bg-red-100 text-red-800">
                        {t("admin.users.banned")}
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs font-medium rounded bg-green-100 text-green-800">
                        {t("admin.users.active")}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href={`/user/${user.id}`}
                  className="inline-flex items-center justify-center px-3 py-1.5 rounded-full text-xs font-medium text-center"
                  style={{ backgroundColor: '#EFF6FF', color: '#2563EB' }}
                >
                  {t("admin.users.viewProfile")}
                </Link>
                <Link
                  href={`/messages/new?userId=${user.id}`}
                  className="inline-flex items-center justify-center px-3 py-1.5 rounded-full text-xs font-medium text-center"
                  style={{ backgroundColor: '#F5F3FF', color: '#7C3AED' }}
                >
                  {t("admin.users.message")}
                </Link>
                {(user.strikes || 0) < 2 && (
                  <button
                    onClick={() => openStrikeModal(user, "add")}
                    className="inline-flex items-center justify-center px-3 py-1.5 rounded-full text-xs font-medium text-center"
                    style={{ backgroundColor: '#FFFBEB', color: '#D97706' }}
                  >
                    {t("admin.users.addStrike")}
                  </button>
                )}
                {(user.strikes || 0) > 0 && (
                  <button
                    onClick={() => openStrikeModal(user, "remove")}
                    className="inline-flex items-center justify-center px-3 py-1.5 rounded-full text-xs font-medium text-center"
                    style={{ backgroundColor: '#ECFDF5', color: '#059669' }}
                  >
                    {t("admin.users.removeStrike")}
                  </button>
                )}
                {!user.isBanned ? (
                  <button
                    onClick={() => handleBanAction(user.id, "ban")}
                    disabled={banningUser === user.id}
                    className="inline-flex items-center justify-center px-3 py-1.5 rounded-full text-xs font-medium text-center disabled:opacity-50"
                    style={{ backgroundColor: '#FEF2F2', color: '#DC2626' }}
                  >
                    {banningUser === user.id ? t("admin.users.banning") : t("admin.users.ban")}
                  </button>
                ) : (
                  <button
                    onClick={() => handleBanAction(user.id, "unban")}
                    disabled={banningUser === user.id}
                    className="inline-flex items-center justify-center px-3 py-1.5 rounded-full text-xs font-medium text-center disabled:opacity-50"
                    style={{ backgroundColor: '#ECFDF5', color: '#059669' }}
                  >
                    {banningUser === user.id ? t("admin.users.unbanning") : t("admin.users.unban")}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
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
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center min-w-0">
                      <Avatar
                        src={user.profilePhoto}
                        alt={user.name}
                        size="sm"
                        fallbackText={user.name}
                        className="mr-3 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium truncate" style={{ color: '#111827' }}>{user.name}</div>
                        {user.nickname && (
                          <div className="text-xs truncate" style={{ color: '#6B7280' }}>@{user.nickname}</div>
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
                  <td className="px-6 py-4 text-sm font-medium">
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                      <Link
                        href={`/user/${user.id}`}
                        className="hover:underline whitespace-nowrap"
                        style={{ color: '#2563EB' }}
                      >
                        {t("admin.users.viewProfile")}
                      </Link>
                      <Link
                        href={`/messages/new?userId=${user.id}`}
                        className="hover:underline whitespace-nowrap"
                        style={{ color: '#7C3AED' }}
                      >
                        {t("admin.users.message")}
                      </Link>
                      {(user.strikes || 0) < 2 && (
                        <button
                          onClick={() => openStrikeModal(user, "add")}
                          className="hover:underline whitespace-nowrap"
                          style={{ color: '#D97706' }}
                        >
                          {t("admin.users.addStrike")}
                        </button>
                      )}
                      {(user.strikes || 0) > 0 && (
                        <button
                          onClick={() => openStrikeModal(user, "remove")}
                          className="hover:underline whitespace-nowrap"
                          style={{ color: '#059669' }}
                        >
                          {t("admin.users.removeStrike")}
                        </button>
                      )}
                      {!user.isBanned ? (
                        <button
                          onClick={() => handleBanAction(user.id, "ban")}
                          disabled={banningUser === user.id}
                          className="hover:underline disabled:opacity-50 whitespace-nowrap"
                          style={{ color: '#DC2626' }}
                        >
                          {banningUser === user.id ? t("admin.users.banning") : t("admin.users.ban")}
                        </button>
                      ) : (
                        <button
                          onClick={() => handleBanAction(user.id, "unban")}
                          disabled={banningUser === user.id}
                          className="hover:underline disabled:opacity-50 whitespace-nowrap"
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
          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-semibold" style={{ color: '#111827' }}>
              {t("admin.users.allUsers")} ({filteredUsers.length})
            </h2>
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search input */}
              <input
                type="text"
                placeholder={t("admin.users.searchPlaceholder") || "Search by name or email..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-auto px-3 py-2.5 border rounded text-sm sm:min-w-[200px]"
                style={{ borderColor: '#D1D5DB', color: '#111827' }}
              />
              {/* Role filter */}
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full sm:w-auto px-3 py-2.5 border rounded text-sm"
                style={{ borderColor: '#D1D5DB', color: '#111827' }}
              >
                <option value="all">{t("admin.users.filterAll") || "All Roles"}</option>
                <option value="student">{t("admin.users.filterStudent") || "Students"}</option>
                <option value="obog">{t("admin.users.filterObog") || "OB/OG"}</option>
                <option value="company">{t("admin.users.filterCompany") || "Companies"}</option>
                <option value="corporate_ob">{t("admin.users.filterCorporateOb") || "Corporate OB"}</option>
                <option value="admin">{t("admin.users.filterAdmin") || "Admins"}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden divide-y" style={{ borderColor: '#E5E7EB' }}>
          {filteredUsers.length === 0 ? (
            <div className="p-8 text-center" style={{ color: '#6B7280' }}>
              {t("admin.users.noUsersFound") || "No users found matching your search."}
            </div>
          ) : (
            filteredUsers.map((user) => (
              <div key={user.id} className="p-4">
                <div className="flex items-start gap-3 mb-3">
                  <Avatar
                    src={user.profilePhoto}
                    alt={user.name}
                    size="md"
                    fallbackText={user.name}
                    className="shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate" style={{ color: '#111827' }}>{user.name}</div>
                    <div className="text-xs truncate" style={{ color: '#6B7280' }}>{user.email}</div>
                    {user.nickname && (
                      <div className="text-xs truncate" style={{ color: '#6B7280' }}>@{user.nickname}</div>
                    )}
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${
                        user.role === "student" ? "bg-blue-100 text-blue-800" :
                        user.role === "obog" ? "bg-green-100 text-green-800" :
                        user.role === "company" ? "bg-purple-100 text-purple-800" :
                        user.role === "corporate_ob" ? "bg-indigo-100 text-indigo-800" :
                        user.role === "admin" ? "bg-red-100 text-red-800" :
                        "bg-gray-100 text-gray-800"
                      }`}>
                        {user.role === "corporate_ob" ? t("role.corporateOb") : user.role}
                      </span>
                      {user.isBanned && (
                        <span className="px-2 py-1 text-xs font-medium rounded bg-red-100 text-red-800">
                          {t("admin.users.banned")}
                        </span>
                      )}
                    </div>
                    <div className="text-xs mt-1" style={{ color: '#9CA3AF' }}>
                      {t("admin.dashboard.created")}: {new Date(user.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={`/user/${user.id}`}
                    className="inline-flex items-center justify-center px-3 py-1.5 rounded-full text-xs font-medium text-center"
                    style={{ backgroundColor: '#EFF6FF', color: '#2563EB' }}
                  >
                    {t("admin.users.viewProfile")}
                  </Link>
                  <Link
                    href={`/messages/new?userId=${user.id}`}
                    className="inline-flex items-center justify-center px-3 py-1.5 rounded-full text-xs font-medium text-center"
                    style={{ backgroundColor: '#F5F3FF', color: '#7C3AED' }}
                  >
                    {t("admin.users.message")}
                  </Link>
                  {(user.role === "obog" || user.role === "student") && (
                    <button
                      onClick={() => openCorporateOBModal(user)}
                      className="inline-flex items-center justify-center px-3 py-1.5 rounded-full text-xs font-medium text-center"
                      style={{ backgroundColor: '#EEF2FF', color: '#4F46E5' }}
                    >
                      {t("corporateOb.assign")}
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full divide-y" style={{ borderColor: '#E5E7EB' }}>
            <thead style={{ backgroundColor: '#D7FFEF' }}>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase" style={{ color: '#6B7280' }}>{t("admin.dashboard.name")}</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase" style={{ color: '#6B7280' }}>{t("admin.dashboard.email")}</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase" style={{ color: '#6B7280' }}>{t("admin.dashboard.role")}</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase" style={{ color: '#6B7280' }}>{t("admin.dashboard.created")}</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase" style={{ color: '#6B7280' }}>{t("admin.users.actions") || "Actions"}</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y" style={{ borderColor: '#E5E7EB' }}>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center" style={{ color: '#6B7280' }}>
                    {t("admin.users.noUsersFound") || "No users found matching your search."}
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center min-w-0">
                        <Avatar
                          src={user.profilePhoto}
                          alt={user.name}
                          size="sm"
                          fallbackText={user.name}
                          className="mr-3 shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium truncate" style={{ color: '#111827' }}>
                            {user.name}
                          </div>
                          {user.nickname && (
                            <div className="text-xs truncate" style={{ color: '#6B7280' }}>
                              @{user.nickname}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: '#6B7280' }}>
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        <span className={`px-2 py-1 text-xs font-medium rounded inline-block w-fit ${
                          user.role === "student" ? "bg-blue-100 text-blue-800" :
                          user.role === "obog" ? "bg-green-100 text-green-800" :
                          user.role === "company" ? "bg-purple-100 text-purple-800" :
                          user.role === "corporate_ob" ? "bg-indigo-100 text-indigo-800" :
                          user.role === "admin" ? "bg-red-100 text-red-800" :
                          "bg-gray-100 text-gray-800"
                        }`}>
                          {user.role === "corporate_ob" ? t("role.corporateOb") : user.role}
                        </span>
                        {user.isBanned && (
                          <span className="px-2 py-1 text-xs font-medium rounded bg-red-100 text-red-800 inline-block w-fit">
                            {t("admin.users.banned")}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: '#6B7280' }}>
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                        <Link
                          href={`/user/${user.id}`}
                          className="hover:underline whitespace-nowrap"
                          style={{ color: '#2563EB' }}
                        >
                          {t("admin.users.viewProfile")}
                        </Link>
                        <Link
                          href={`/messages/new?userId=${user.id}`}
                          className="hover:underline whitespace-nowrap"
                          style={{ color: '#7C3AED' }}
                        >
                          {t("admin.users.message")}
                        </Link>
                        {(user.role === "obog" || user.role === "student") && (
                          <button
                            onClick={() => openCorporateOBModal(user)}
                            className="hover:underline whitespace-nowrap"
                            style={{ color: '#4F46E5' }}
                          >
                            {t("corporateOb.assign")}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Strike Modal */}
      {showStrikeModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div 
            className="bg-white rounded-t-2xl sm:rounded p-4 sm:p-6 max-w-md w-full pb-[env(safe-area-inset-bottom)]"
            style={{ borderRadius: '6px' }}
          >
            <div className="flex justify-between items-start mb-4 gap-4">
              <h3 className="text-base sm:text-lg font-semibold flex-1" style={{ color: '#111827' }}>
                {strikeAction === "add" ? t("admin.users.strikeModal.addTitle") : t("admin.users.strikeModal.removeTitle")} - {selectedUser.name}
              </h3>
              <button
                onClick={() => {
                  setShowStrikeModal(false);
                  setStrikeReason("");
                }}
                className="text-gray-400 hover:text-gray-600 shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center text-xl sm:text-2xl"
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
                {t("admin.users.strikeModal.reason")}
              </label>
              <textarea
                value={strikeReason}
                onChange={(e) => setStrikeReason(e.target.value)}
                rows={3}
                className="w-full min-h-[44px] px-3 py-2 border rounded text-base"
                style={{ borderColor: '#D1D5DB', borderRadius: '6px', color: '#111827' }}
                placeholder={t("admin.users.strikeModal.reasonPlaceholder")}
              />
            </div>
            <div className="mb-4 text-xs sm:text-sm" style={{ color: '#6B7280' }}>
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
            <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4">
              <button
                onClick={handleStrikeAction}
                className="w-full sm:flex-1 min-h-[44px] btn-primary"
              >
                {strikeAction === "add" ? t("admin.users.strikeModal.addTitle") : t("admin.users.strikeModal.removeTitle")}
              </button>
              <button
                onClick={() => {
                  setShowStrikeModal(false);
                  setStrikeReason("");
                }}
                className="w-full sm:flex-1 min-h-[44px] btn-secondary"
              >
                {t("button.cancel")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Corporate OB Assignment Modal */}
      {showCorporateOBModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div 
            className="bg-white rounded-t-2xl sm:rounded p-4 sm:p-6 max-w-md w-full pb-[env(safe-area-inset-bottom)]"
            style={{ borderRadius: '6px' }}
          >
            <div className="flex justify-between items-start mb-4 gap-4">
              <h3 className="text-base sm:text-lg font-semibold flex-1" style={{ color: '#111827' }}>
                {t("corporateOb.assign")} - {selectedUser.name}
              </h3>
              <button
                onClick={() => {
                  setShowCorporateOBModal(false);
                  setSelectedCompanyId("");
                  setIsVerified(false);
                }}
                className="text-gray-400 hover:text-gray-600 shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center text-xl sm:text-2xl"
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
                {t("corporateOb.selectCompany")}
              </label>
              <select
                value={selectedCompanyId}
                onChange={(e) => setSelectedCompanyId(e.target.value)}
                className="w-full min-h-[44px] px-3 py-2 border rounded text-base"
                style={{ borderColor: '#D1D5DB', borderRadius: '6px', color: '#111827' }}
              >
                <option value="">{t("corporateOb.selectCompany")}</option>
                {companies.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={isVerified}
                  onChange={(e) => setIsVerified(e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-sm" style={{ color: '#374151' }}>
                  {t("corporateOb.verify")}
                </span>
              </label>
            </div>
            <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4">
              <button
                onClick={handleAssignCorporateOB}
                disabled={!selectedCompanyId || assigningCorporateOB}
                className="w-full sm:flex-1 min-h-[44px] btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {assigningCorporateOB ? t("common.loading") : t("corporateOb.assign")}
              </button>
              <button
                onClick={() => {
                  setShowCorporateOBModal(false);
                  setSelectedCompanyId("");
                  setIsVerified(false);
                }}
                className="w-full sm:flex-1 min-h-[44px] btn-secondary"
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
