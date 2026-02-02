"use client";

import { useEffect, useState } from "react";
import { useSession } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";

export default function AdminDashboardPage() {
  const { t } = useLanguage();
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated" && session?.user?.role !== "admin") {
      router.push("/dashboard");
      return;
    }

    if (status === "authenticated" && session?.user?.role === "admin") {
      loadUsers();
    }
  }, [status, session, router]);

  const loadUsers = async () => {
    try {
      const response = await fetch("/api/users");
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error("Error loading users:", error);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p style={{ color: '#6B7280' }}>{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  const students = users.filter((u: any) => u.role === "student");
  const obogs = users.filter((u: any) => u.role === "obog");
  const companies = users.filter((u: any) => u.role === "company");
  const bannedUsers = users.filter((u: any) => u.isBanned === true);
  const usersWithStrikes = users.filter((u: any) => u.strikes > 0);

  return (
    <div className="min-h-screen bg-white">
     
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{t("admin.dashboard.title")}</h1>
          <p className="text-gray-600">{t("admin.dashboard.subtitle")}</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card-gradient p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">{t("admin.dashboard.totalUsers")}</h3>
            <p className="text-3xl font-bold">{users.length}</p>
          </div>
          <div className="card-gradient p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">{t("admin.dashboard.students")}</h3>
            <p className="text-3xl font-bold">{students.length}</p>
          </div>
          <div className="card-gradient p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">{t("admin.dashboard.obog")}</h3>
            <p className="text-3xl font-bold">{obogs.length}</p>
          </div>
          <div className="card-gradient p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">{t("admin.dashboard.companies")}</h3>
            <p className="text-3xl font-bold">{companies.length}</p>
          </div>
        </div>

        {/* Alerts */}
        {(bannedUsers.length > 0 || usersWithStrikes.length > 0) && (
          <div className="mb-8 space-y-4">
            {bannedUsers.length > 0 && (
              <div className="card-gradient p-6 border-l-4 border-red-500">
                <h3 className="text-lg font-semibold text-red-700 mb-2">
                  Banned Users: {bannedUsers.length}
                </h3>
                <div className="space-y-2">
                  {bannedUsers.slice(0, 5).map((user) => (
                    <div key={user.id} className="text-sm">
                      <span className="font-medium">{user.name}</span> ({user.email}) - 
                      Strikes: {(user as any).strikes || 0}
                    </div>
                  ))}
                  {bannedUsers.length > 5 && (
                    <p className="text-sm text-gray-600">...and {bannedUsers.length - 5} more</p>
                  )}
                </div>
              </div>
            )}
            {usersWithStrikes.length > 0 && (
              <div className="card-gradient p-6 border-l-4 border-yellow-500">
                <h3 className="text-lg font-semibold text-yellow-700 mb-2">
                  Users with Strikes: {usersWithStrikes.length}
                </h3>
                <div className="space-y-2">
                  {usersWithStrikes.slice(0, 5).map((user) => (
                    <div key={user.id} className="text-sm">
                      <span className="font-medium">{user.name}</span> ({user.email}) - 
                      Strikes: {(user as any).strikes || 0}
                    </div>
                  ))}
                  {usersWithStrikes.length > 5 && (
                    <p className="text-sm text-gray-600">...and {usersWithStrikes.length - 5} more</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="card-gradient p-6 h-full flex flex-col">
            <h3 className="text-xl font-semibold mb-4">{t("admin.dashboard.userManagement")}</h3>
            <p className="text-gray-700 mb-4 flex-grow">
              {t("admin.dashboard.userManagementDesc")}
            </p>
            <div className="mt-auto">
              <Link href="/admin/users" className="btn-primary inline-block">
                {t("admin.dashboard.manageUsers")}
              </Link>
            </div>
          </div>
          <div className="card-gradient p-6 h-full flex flex-col">
            <h3 className="text-xl font-semibold mb-4">{t("admin.dashboard.reports")}</h3>
            <p className="text-gray-700 mb-4 flex-grow">
              {t("admin.dashboard.reportsDesc")}
            </p>
            <div className="mt-auto">
              <Link href="/admin/reports" className="btn-primary inline-block">
                {t("admin.dashboard.viewReports")}
              </Link>
            </div>
          </div>
          <div className="card-gradient p-6 h-full flex flex-col">
            <h3 className="text-xl font-semibold mb-4">{t("admin.corporateOb.title") || "Corporate OB Management"}</h3>
            <p className="text-gray-700 mb-4 flex-grow">
              {t("admin.corporateOb.subtitle") || "Manage Corporate OB assignments and verifications"}
            </p>
            <div className="mt-auto">
              <Link href="/admin/corporate-ob" className="btn-primary inline-block">
                {t("admin.corporateOb.manage") || "Manage Corporate OB"}
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Users Table */}
        <div className="card-gradient p-6">
          <h3 className="text-xl font-semibold mb-4">{t("admin.dashboard.recentUsers")}</h3>
          <div className="table-responsive overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("admin.dashboard.name")}
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                    {t("admin.dashboard.email")}
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("admin.dashboard.role")}
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    {t("admin.dashboard.created")}
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("admin.dashboard.status")}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.slice(-10).reverse().map((user) => (
                  <tr key={user.id}>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900">
                      {user.name}
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500 hidden sm:table-cell">
                      {user.email}
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded ${
                        user.role === "student" ? "bg-blue-100 text-blue-800" :
                        user.role === "obog" ? "bg-green-100 text-green-800" :
                        user.role === "company" ? "bg-purple-100 text-purple-800" :
                        "bg-gray-100 text-gray-800"
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500 hidden md:table-cell">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      {(user as any).isBanned ? (
                        <span className="px-2 py-1 text-xs font-semibold rounded bg-red-100 text-red-800">
                          {t("admin.dashboard.banned")}
                        </span>
                      ) : (user as any).strikes > 0 ? (
                        <span className="px-2 py-1 text-xs font-semibold rounded bg-yellow-100 text-yellow-800">
                          {(user as any).strikes} {t("admin.dashboard.strikes")}{((user as any).strikes as number) > 1 ? "s" : ""}
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-semibold rounded bg-green-100 text-green-800">
                          {t("admin.dashboard.active")}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

