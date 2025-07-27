"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import * as XLSX from "xlsx"

const AdminDashboard = () => {
  const [users, setUsers] = useState([])
  const [activity, setActivity] = useState([])
  const [stats, setStats] = useState({ totalCharts: 0, totalFiles: 0, avgChartsPerUser: 0 })
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("adminToken"))
  const [loginCredentials, setLoginCredentials] = useState({ username: "", password: "" })
  const [selectedUser, setSelectedUser] = useState("")
  const [selectedUsers, setSelectedUsers] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [activeSection, setActiveSection] = useState("dashboard")
  const navigate = useNavigate()

  useEffect(() => {
    if (isLoggedIn) {
      fetchAdminData()
    }
  }, [isLoggedIn])

  const fetchAdminData = async () => {
    try {
      const token = localStorage.getItem("adminToken")
      const [usersRes, activityRes, statsRes] = await Promise.all([
        axios.get("http://localhost:5000/api/admin/users", { headers: { Authorization: `Bearer ${token}` } }),
        axios.get("http://localhost:5000/api/admin/activity", { headers: { Authorization: `Bearer ${token}` } }),
        axios.get("http://localhost:5000/api/admin/stats", { headers: { Authorization: `Bearer ${token}` } }),
      ])
      setUsers(usersRes.data)
      setActivity(activityRes.data)
      setStats(statsRes.data)
    } catch (error) {
      console.error("Fetch error:", error.response?.data || error.message)
      toast.error("Failed to load admin data: " + (error.response?.data?.msg || error.message))
    }
  }

  const handleDeleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        const token = localStorage.getItem("adminToken")
        await axios.delete(`http://localhost:5000/api/admin/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        setUsers(users.filter((user) => user._id !== userId))
        toast.success("User deleted successfully")
      } catch (error) {
        toast.error("Failed to delete user: " + (error.response?.data?.msg || error.message))
      }
    }
  }

  const handleToggleStatus = async (userId) => {
    try {
      const token = localStorage.getItem("adminToken")
      const user = users.find((u) => u._id === userId)
      await axios.put(
        `http://localhost:5000/api/admin/users/${userId}/status`,
        { isActive: !user.isActive },
        { headers: { Authorization: `Bearer ${token}` } },
      )
      setUsers(users.map((u) => (u._id === userId ? { ...u, isActive: !u.isActive } : u)))
      toast.success("User status updated")
    } catch (error) {
      toast.error("Failed to update user status: " + (error.response?.data?.msg || error.message))
    }
  }

  const handleBulkDeactivate = async () => {
    if (selectedUsers.length === 0) {
      toast.error("No users selected")
      return
    }
    if (window.confirm(`Deactivate ${selectedUsers.length} user(s)?`)) {
      try {
        const token = localStorage.getItem("adminToken")
        await axios.post(
          "http://localhost:5000/api/admin/users/bulk-deactivate",
          { userIds: selectedUsers },
          { headers: { Authorization: `Bearer ${token}` } },
        )
        setUsers(users.map((u) => (selectedUsers.includes(u._id) ? { ...u, isActive: false } : u)))
        setSelectedUsers([])
        toast.success("Selected users deactivated")
      } catch (error) {
        toast.error("Failed to deactivate users: " + (error.response?.data?.msg || error.message))
      }
    }
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    if (loginCredentials.username === "admin" && loginCredentials.password === "admin123") {
      localStorage.setItem("adminToken", "admin-auth-token")
      setIsLoggedIn(true)
      toast.success("Admin login successful")
    } else {
      toast.error("Invalid admin credentials")
    }
  }

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      localStorage.removeItem("adminToken")
      setIsLoggedIn(false)
      navigate("/admin")
    }
  }

  const handleBackToDashboard = () => {
    navigate("/")
  }

  const exportUsersToCSV = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      users.map((user) => ({
        Username: user.username,
        Role: user.role,
        Created: new Date(user.createdAt).toLocaleString(),
        ChartsCreated: user.chartsCreated,
        LastChartCreated: user.lastChartCreated ? new Date(user.lastChartCreated).toLocaleString() : "N/A",
        Status: user.isActive ? "Active" : "Inactive",
      })),
    )
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Users")
    XLSX.writeFile(workbook, "users_data.csv")
  }

  const exportUserChartsToCSV = async (userId) => {
    try {
      const token = localStorage.getItem("adminToken")
      const res = await axios.get(`http://localhost:5000/api/admin/user-charts/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const worksheet = XLSX.utils.json_to_sheet(
        res.data.map((chart) => ({
          FileName: chart.fileName,
          XAxis: chart.xAxis,
          YAxis: chart.yAxis,
          Types: chart.types.join(", "),
          Timestamp: new Date(chart.timestamp).toLocaleString(),
        })),
      )
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, "UserCharts")
      XLSX.writeFile(workbook, `charts_user_${userId}.csv`)
      toast.success("Charts exported successfully")
    } catch (error) {
      toast.error("Failed to export charts: " + (error.response?.data?.msg || error.message))
    }
  }

  const exportAllActivities = async () => {
    try {
      const token = localStorage.getItem("adminToken")
      const res = await axios.get("http://localhost:5000/api/admin/activity/export", {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "arraybuffer",
      })
      const blob = new Blob([res.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "all_activities.csv"
      a.click()
      window.URL.revokeObjectURL(url)
      toast.success("All activities exported successfully")
    } catch (error) {
      toast.error("Failed to export activities: " + (error.response?.data?.msg || error.message))
    }
  }

  const filteredUsers = users.filter((user) => user.username.toLowerCase().includes(searchTerm.toLowerCase()))

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0F0F2A] via-[#191B45] to-[#2B2C5B] flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-black/70" />

        {/* Background glow effect */}
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{
            background: "radial-gradient(circle at center, rgba(66,61,128,0.2) 0%, transparent 70%)",
          }}
        />

        <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />

        <div className="relative z-10 w-full max-w-md">
          <div
            className="bg-[#0F0F2A]/90 backdrop-blur-lg rounded-xl p-8 border border-[#423D80]/50 transition-all duration-500 hover:scale-[1.02]"
            style={{
              boxShadow: `
                0 0 0 1px rgba(66, 61, 128, 0.3),
                0 4px 8px rgba(0, 0, 0, 0.3),
                0 8px 16px rgba(43, 44, 91, 0.4),
                0 16px 32px rgba(43, 44, 91, 0.3),
                0 32px 64px rgba(15, 15, 42, 0.2),
                inset 0 1px 0 rgba(255, 255, 255, 0.1),
                0 0 80px rgba(66, 61, 128, 0.15)
              `,
            }}
          >
            <h2
              className="text-2xl font-bold text-white mb-6 text-center"
              style={{ textShadow: "0 4px 8px rgba(0, 0, 0, 0.5), 0 0 20px rgba(66, 61, 128, 0.3)" }}
            >
              Admin Login
            </h2>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Username</label>
                <input
                  type="text"
                  value={loginCredentials.username}
                  onChange={(e) => setLoginCredentials({ ...loginCredentials, username: e.target.value })}
                  className="w-full p-2 bg-[#2B2C5B]/50 border border-[#423D80] rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-[#423D80] focus:border-[#423D80] transition-all duration-300 backdrop-blur-sm focus:outline-none"
                  placeholder="Enter admin username"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                <input
                  type="password"
                  value={loginCredentials.password}
                  onChange={(e) => setLoginCredentials({ ...loginCredentials, password: e.target.value })}
                  className="w-full p-2 bg-[#2B2C5B]/50 border border-[#423D80] rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-[#423D80] focus:border-[#423D80] transition-all duration-300 backdrop-blur-sm focus:outline-none"
                  placeholder="Enter admin password"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full px-4 py-2 bg-gradient-to-r from-[#2B2C5B] to-[#423D80] text-white font-bold rounded-lg border border-[#423D80] hover:from-[#423D80] hover:to-[#5A4FCF] transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:-translate-y-1 hover:scale-105"
              >
                Login
              </button>
            </form>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0F0F2A] via-[#191B45] to-[#2B2C5B] relative overflow-hidden">
      <div className="absolute inset-0 bg-black/70" />

      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />

      {/* Top Navbar - Different Color & Navigation Buttons on Right */}
      <header className="flex justify-between items-center p-4 bg-gradient-to-r from-[#1a1a3a] to-[#2d2d5f] backdrop-blur-lg shadow-xl relative z-20 border-b border-[#5a4fcf]/50">
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Admin Panel - Excel Analytics</h1>
        <div className="flex items-center space-x-4">
          <button
            onClick={handleBackToDashboard}
            className="px-4 py-2 bg-gradient-to-r from-[#4f46e5] to-[#7c3aed] text-white font-bold rounded-md border border-[#6366f1] hover:from-[#6366f1] hover:to-[#8b5cf6] transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1"
          >
            Back to Dashboard
          </button>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-gradient-to-r from-[#dc2626] to-[#ef4444] text-white font-bold rounded-md border border-[#f87171] hover:from-[#ef4444] hover:to-[#f87171] transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1"
          >
            Logout
          </button>
        </div>
      </header>

      <div className="flex relative z-10">
        {/* Sidebar */}
        <div className="w-64 bg-[#0F0F2A]/90 backdrop-blur-lg shadow-xl p-6 h-[calc(100vh-72px)] flex flex-col space-y-6 border-r border-[#423D80]/50">
          <ul className="space-y-4">
            <li>
              <button
                onClick={() => setActiveSection("dashboard")}
                className={`w-full text-left p-3 rounded-lg font-medium text-white transition-all duration-300 ${
                  activeSection === "dashboard" ? "bg-[#423D80] shadow-lg" : "hover:bg-[#2B2C5B] hover:shadow-md"
                }`}
              >
                Dashboard
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveSection("users")}
                className={`w-full text-left p-3 rounded-lg font-medium text-white transition-all duration-300 ${
                  activeSection === "users" ? "bg-[#423D80] shadow-lg" : "hover:bg-[#2B2C5B] hover:shadow-md"
                }`}
              >
                User Management
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveSection("activity")}
                className={`w-full text-left p-3 rounded-lg font-medium text-white transition-all duration-300 ${
                  activeSection === "activity" ? "bg-[#423D80] shadow-lg" : "hover:bg-[#2B2C5B] hover:shadow-md"
                }`}
              >
                Activity Logs
              </button>
            </li>
          </ul>

          {/* Quick Actions in Sidebar */}
          <div className="mt-auto pt-6 border-t border-[#423D80]/50">
            <div className="bg-[#2B2C5B]/50 rounded-lg p-4 border border-[#423D80]/30">
              <h4 className="text-sm font-medium text-white mb-3">Quick Actions</h4>
              <div className="space-y-2">
                <button
                  onClick={exportUsersToCSV}
                  className="w-full px-3 py-2 bg-gradient-to-r from-[#16a34a] to-[#22c55e] text-white text-sm font-bold rounded-lg border border-[#22c55e] hover:from-[#22c55e] hover:to-[#4ade80] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  Export Users
                </button>
                <button
                  onClick={exportAllActivities}
                  className="w-full px-3 py-2 bg-gradient-to-r from-[#f59e0b] to-[#f97316] text-white text-sm font-bold rounded-lg border border-[#f59e0b] hover:from-[#f97316] hover:to-[#fb923c] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  Export Activities
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          <div className="max-w-6xl mx-auto">
            {activeSection === "dashboard" && (
              <div
                className="bg-[#0F0F2A]/90 backdrop-blur-lg rounded-xl p-8 border border-[#423D80]/50 shadow-xl"
                style={{
                  boxShadow: `
                    0 0 0 1px rgba(66, 61, 128, 0.3),
                    0 4px 8px rgba(0, 0, 0, 0.3),
                    0 8px 16px rgba(43, 44, 91, 0.4),
                    0 16px 32px rgba(43, 44, 91, 0.3),
                    0 32px 64px rgba(15, 15, 42, 0.2),
                    inset 0 1px 0 rgba(255, 255, 255, 0.1),
                    0 0 80px rgba(66, 61, 128, 0.15)
                  `,
                }}
              >
                <h2
                  className="text-3xl font-bold text-white mb-6"
                  style={{ textShadow: "0 4px 8px rgba(0, 0, 0, 0.5), 0 0 20px rgba(66, 61, 128, 0.3)" }}
                >
                  Admin Dashboard
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-[#2B2C5B]/50 rounded-lg p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-[#423D80]/30 hover:border-[#423D80]/50">
                    <h3 className="text-lg font-medium text-white">Total Charts</h3>
                    <p className="text-4xl font-bold text-blue-400 mt-2">{stats.totalCharts}</p>
                    <p className="text-gray-300 mt-1">Charts created by all users</p>
                  </div>
                  <div className="bg-[#2B2C5B]/50 rounded-lg p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-[#423D80]/30 hover:border-[#423D80]/50">
                    <h3 className="text-lg font-medium text-white">Total Files</h3>
                    <p className="text-4xl font-bold text-blue-400 mt-2">{stats.totalFiles}</p>
                    <p className="text-gray-300 mt-1">Files uploaded by all users</p>
                  </div>
                  <div className="bg-[#2B2C5B]/50 rounded-lg p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-[#423D80]/30 hover:border-[#423D80]/50">
                    <h3 className="text-lg font-medium text-white">Avg Charts/User</h3>
                    <p className="text-4xl font-bold text-blue-400 mt-2">{stats.avgChartsPerUser.toFixed(1)}</p>
                    <p className="text-gray-300 mt-1">Average charts per user</p>
                  </div>
                </div>
              </div>
            )}

            {activeSection === "users" && (
              <div
                className="bg-[#0F0F2A]/90 backdrop-blur-lg rounded-xl p-8 border border-[#423D80]/50 shadow-xl"
                style={{
                  boxShadow: `
                    0 0 0 1px rgba(66, 61, 128, 0.3),
                    0 4px 8px rgba(0, 0, 0, 0.3),
                    0 8px 16px rgba(43, 44, 91, 0.4),
                    0 16px 32px rgba(43, 44, 91, 0.3),
                    0 32px 64px rgba(15, 15, 42, 0.2),
                    inset 0 1px 0 rgba(255, 255, 255, 0.1),
                    0 0 80px rgba(66, 61, 128, 0.15)
                  `,
                }}
              >
                <h2
                  className="text-2xl font-bold text-white mb-6"
                  style={{ textShadow: "0 4px 8px rgba(0, 0, 0, 0.5), 0 0 20px rgba(66, 61, 128, 0.3)" }}
                >
                  User Management
                </h2>

                <div className="mb-6 flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4">
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="p-3 bg-[#2B2C5B]/50 border border-[#423D80] rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-[#423D80] focus:border-[#423D80] transition-all duration-300 backdrop-blur-sm focus:outline-none w-full md:w-1/3"
                  />
                  <button
                    onClick={handleBulkDeactivate}
                    className="px-4 py-3 bg-gradient-to-r from-[#dc2626] to-[#ef4444] text-white font-bold rounded-lg border border-[#f87171] hover:from-[#ef4444] hover:to-[#f87171] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                  >
                    Deactivate Selected
                  </button>
                  {selectedUser && (
                    <button
                      onClick={() => exportUserChartsToCSV(selectedUser)}
                      className="px-4 py-3 bg-gradient-to-r from-[#0ea5e9] to-[#06b6d4] text-white font-bold rounded-lg border border-[#0ea5e9] hover:from-[#06b6d4] hover:to-[#22d3ee] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                    >
                      Export User Charts
                    </button>
                  )}
                </div>

                <div className="bg-[#2B2C5B]/30 rounded-lg overflow-hidden border border-[#423D80]/30">
                  <div className="overflow-x-auto max-h-[60vh] overflow-y-auto">
                    <table className="w-full text-sm text-left text-white">
                      <thead className="bg-[#423D80]/80 text-white sticky top-0">
                        <tr>
                          <th className="p-3">
                            <input
                              type="checkbox"
                              onChange={(e) => setSelectedUsers(e.target.checked ? users.map((u) => u._id) : [])}
                              className="h-4 w-4 text-[#423D80] focus:ring-[#423D80] border-[#423D80] rounded bg-[#2B2C5B]"
                            />
                          </th>
                          <th className="p-3 font-semibold">Username</th>
                          <th className="p-3 font-semibold">Role</th>
                          <th className="p-3 font-semibold">Created</th>
                          <th className="p-3 font-semibold">Charts Created</th>
                          <th className="p-3 font-semibold">Last Chart</th>
                          <th className="p-3 font-semibold">Status</th>
                          <th className="p-3 font-semibold">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredUsers.map((user) => (
                          <tr
                            key={user._id}
                            className="border-b border-[#423D80]/20 hover:bg-[#2B2C5B]/50 transition-colors duration-200"
                          >
                            <td className="p-3">
                              <input
                                type="checkbox"
                                checked={selectedUsers.includes(user._id)}
                                onChange={(e) =>
                                  setSelectedUsers(
                                    e.target.checked
                                      ? [...selectedUsers, user._id]
                                      : selectedUsers.filter((id) => id !== user._id),
                                  )
                                }
                                className="h-4 w-4 text-[#423D80] focus:ring-[#423D80] border-[#423D80] rounded bg-[#2B2C5B]"
                              />
                            </td>
                            <td className="p-3 text-gray-200">{user.username}</td>
                            <td className="p-3 text-gray-200">{user.role}</td>
                            <td className="p-3 text-gray-200">{new Date(user.createdAt).toLocaleString()}</td>
                            <td className="p-3 text-gray-200">{user.chartsCreated}</td>
                            <td className="p-3 text-gray-200">
                              {user.lastChartCreated ? new Date(user.lastChartCreated).toLocaleString() : "N/A"}
                            </td>
                            <td className="p-3">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                  user.isActive
                                    ? "bg-green-500/20 text-green-400 border border-green-500/30"
                                    : "bg-red-500/20 text-red-400 border border-red-500/30"
                                }`}
                              >
                                {user.isActive ? "Active" : "Inactive"}
                              </span>
                            </td>
                            <td className="p-3">
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleToggleStatus(user._id)}
                                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all duration-300 ${
                                    user.isActive
                                      ? "bg-gradient-to-r from-[#f59e0b] to-[#f97316] text-white hover:from-[#f97316] hover:to-[#fb923c]"
                                      : "bg-gradient-to-r from-[#16a34a] to-[#22c55e] text-white hover:from-[#22c55e] hover:to-[#4ade80]"
                                  }`}
                                >
                                  {user.isActive ? "Deactivate" : "Activate"}
                                </button>
                                <button
                                  onClick={() => handleDeleteUser(user._id)}
                                  className="px-3 py-1 bg-gradient-to-r from-[#dc2626] to-[#ef4444] text-white rounded-lg text-xs font-bold hover:from-[#ef4444] hover:to-[#f87171] transition-all duration-300"
                                >
                                  Delete
                                </button>
                                <button
                                  onClick={() => setSelectedUser(user._id)}
                                  className="px-3 py-1 bg-gradient-to-r from-[#0ea5e9] to-[#06b6d4] text-white rounded-lg text-xs font-bold hover:from-[#06b6d4] hover:to-[#22d3ee] transition-all duration-300"
                                >
                                  Select
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeSection === "activity" && (
              <div
                className="bg-[#0F0F2A]/90 backdrop-blur-lg rounded-xl p-8 border border-[#423D80]/50 shadow-xl"
                style={{
                  boxShadow: `
                    0 0 0 1px rgba(66, 61, 128, 0.3),
                    0 4px 8px rgba(0, 0, 0, 0.3),
                    0 8px 16px rgba(43, 44, 91, 0.4),
                    0 16px 32px rgba(43, 44, 91, 0.3),
                    0 32px 64px rgba(15, 15, 42, 0.2),
                    inset 0 1px 0 rgba(255, 255, 255, 0.1),
                    0 0 80px rgba(66, 61, 128, 0.15)
                  `,
                }}
              >
                <h2
                  className="text-2xl font-bold text-white mb-6"
                  style={{ textShadow: "0 4px 8px rgba(0, 0, 0, 0.5), 0 0 20px rgba(66, 61, 128, 0.3)" }}
                >
                  Activity Logs
                </h2>

                <div className="mb-6">
                  <select
                    value={selectedUser}
                    onChange={(e) => setSelectedUser(e.target.value)}
                    className="p-3 bg-[#2B2C5B]/50 border border-[#423D80] rounded-lg text-white focus:ring-2 focus:ring-[#423D80] focus:border-[#423D80] transition-all duration-300 backdrop-blur-sm focus:outline-none"
                  >
                    <option value="">All Users</option>
                    {users.map((user) => (
                      <option key={user._id} value={user._id} className="bg-[#2B2C5B] text-white">
                        {user.username}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="bg-[#2B2C5B]/30 rounded-lg overflow-hidden border border-[#423D80]/30">
                  <div className="overflow-x-auto max-h-[60vh] overflow-y-auto">
                    <table className="w-full text-sm text-left text-white">
                      <thead className="bg-[#423D80]/80 text-white sticky top-0">
                        <tr>
                          <th className="p-3 font-semibold">User</th>
                          <th className="p-3 font-semibold">Action</th>
                          <th className="p-3 font-semibold">Timestamp</th>
                        </tr>
                      </thead>
                      <tbody>
                        {activity
                          .filter((act) => !selectedUser || act.userId === selectedUser)
                          .map((act, index) => (
                            <tr
                              key={index}
                              className="border-b border-[#423D80]/20 hover:bg-[#2B2C5B]/50 transition-colors duration-200"
                            >
                              <td className="p-3 text-gray-200">{act.username}</td>
                              <td className="p-3 text-gray-200">{act.action}</td>
                              <td className="p-3 text-gray-200">{new Date(act.timestamp).toLocaleString()}</td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard;
