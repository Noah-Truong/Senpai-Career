import { auth } from "@/lib/auth-server";
import { redirect } from "next/navigation";
import Header from "@/components/Header";
import { readUsers } from "@/lib/users";
import Link from "next/link";

export default async function AdminDashboardPage() {
  const session = await auth();

  if (!session || session.user?.role !== "admin") {
    redirect("/login");
  }

  // Get all users for admin view
  const users = readUsers();
  const students = users.filter(u => u.role === "student");
  const obogs = users.filter(u => u.role === "obog");
  const companies = users.filter(u => u.role === "company");
  const bannedUsers = users.filter(u => (u as any).isBanned === true);
  const usersWithStrikes = users.filter(u => (u as any).strikes > 0);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage users, reports, and platform settings</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card-gradient p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Total Users</h3>
            <p className="text-3xl font-bold">{users.length}</p>
          </div>
          <div className="card-gradient p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Students</h3>
            <p className="text-3xl font-bold">{students.length}</p>
          </div>
          <div className="card-gradient p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">OB/OG</h3>
            <p className="text-3xl font-bold">{obogs.length}</p>
          </div>
          <div className="card-gradient p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Companies</h3>
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
          <div className="card-gradient p-6">
            <h3 className="text-xl font-semibold mb-4">User Management</h3>
            <p className="text-gray-700 mb-4">
              View and manage all users on the platform.
            </p>
            <Link href="/admin/users" className="btn-primary inline-block">
              Manage Users
            </Link>
          </div>
          <div className="card-gradient p-6">
            <h3 className="text-xl font-semibold mb-4">Reports</h3>
            <p className="text-gray-700 mb-4">
              Review user reports and safety issues.
            </p>
            <Link href="/admin/reports" className="btn-primary inline-block">
              View Reports
            </Link>
          </div>
          <div className="card-gradient p-6">
            <h3 className="text-xl font-semibold mb-4">Platform Settings</h3>
            <p className="text-gray-700 mb-4">
              Configure platform-wide settings and rules.
            </p>
            <Link href="/admin/settings" className="btn-primary inline-block">
              Settings
            </Link>
          </div>
        </div>

        {/* Recent Users Table */}
        <div className="card-gradient p-6">
          <h3 className="text-xl font-semibold mb-4">Recent Users</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.slice(-10).reverse().map((user) => (
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
                    <td className="px-6 py-4 whitespace-nowrap">
                      {(user as any).isBanned ? (
                        <span className="px-2 py-1 text-xs font-semibold rounded bg-red-100 text-red-800">
                          Banned
                        </span>
                      ) : (user as any).strikes > 0 ? (
                        <span className="px-2 py-1 text-xs font-semibold rounded bg-yellow-100 text-yellow-800">
                          {(user as any).strikes} Strike{(user as any).strikes > 1 ? "s" : ""}
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-semibold rounded bg-green-100 text-green-800">
                          Active
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

