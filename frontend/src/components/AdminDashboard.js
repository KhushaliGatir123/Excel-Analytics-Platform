import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import * as XLSX from "xlsx";

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [activity, setActivity] = useState([]);
  const [stats, setStats] = useState({ totalCharts: 0, totalFiles: 0, avgChartsPerUser: 0 });
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("adminToken"));
  const [loginCredentials, setLoginCredentials] = useState({ username: "", password: "" });
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoggedIn) {
      fetchAdminData();
    }
  }, [isLoggedIn]);

  const fetchAdminData = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const [usersRes, activityRes, statsRes] = await Promise.all([
        axios.get("http://localhost:5000/api/admin/users", { headers: { Authorization: `Bearer ${token}` } }),
        axios.get("http://localhost:5000/api/admin/activity", { headers: { Authorization: `Bearer ${token}` } }),
        axios.get("http://localhost:5000/api/admin/stats", { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      setUsers(usersRes.data);
      setActivity(activityRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error("Fetch error:", error.response?.data || error.message);
      toast.error("Failed to load admin data: " + (error.response?.data?.msg || error.message));
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        const token = localStorage.getItem("adminToken");
        await axios.delete(`http://localhost:5000/api/admin/users/${userId}`, { headers: { Authorization: `Bearer ${token}` } });
        setUsers(users.filter(user => user._id !== userId));
        toast.success("User deleted successfully");
      } catch (error) {
        toast.error("Failed to delete user: " + (error.response?.data?.msg || error.message));
      }
    }
  };

  const handleToggleStatus = async (userId) => {
    try {
      const token = localStorage.getItem("adminToken");
      const user = users.find(u => u._id === userId);
      await axios.put(`http://localhost:5000/api/admin/users/${userId}/status`, { isActive: !user.isActive }, { headers: { Authorization: `Bearer ${token}` } });
      setUsers(users.map(u => u._id === userId ? { ...u, isActive: !u.isActive } : u));
      toast.success("User status updated");
    } catch (error) {
      toast.error("Failed to update user status: " + (error.response?.data?.msg || error.message));
    }
  };

  const handleBulkDeactivate = async () => {
    if (selectedUsers.length === 0) {
      toast.error("No users selected");
      return;
    }
    if (window.confirm(`Deactivate ${selectedUsers.length} user(s)?`)) {
      try {
        const token = localStorage.getItem("adminToken");
        await axios.post("http://localhost:5000/api/admin/users/bulk-deactivate", { userIds: selectedUsers }, { headers: { Authorization: `Bearer ${token}` } });
        setUsers(users.map(u => selectedUsers.includes(u._id) ? { ...u, isActive: false } : u));
        setSelectedUsers([]);
        toast.success("Selected users deactivated");
      } catch (error) {
        toast.error("Failed to deactivate users: " + (error.response?.data?.msg || error.message));
      }
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (loginCredentials.username === "admin" && loginCredentials.password === "admin123") {
      localStorage.setItem("adminToken", "admin-auth-token");
      setIsLoggedIn(true);
      toast.success("Admin login successful");
    } else {
      toast.error("Invalid admin credentials");
    }
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      localStorage.removeItem("adminToken");
      setIsLoggedIn(false);
      navigate("/admin");
    }
  };

  const exportUsersToCSV = () => {
    const worksheet = XLSX.utils.json_to_sheet(users.map(user => ({
      Username: user.username,
      Role: user.role,
      Created: new Date(user.createdAt).toLocaleString(),
      ChartsCreated: user.chartsCreated,
      LastChartCreated: user.lastChartCreated ? new Date(user.lastChartCreated).toLocaleString() : "N/A",
      Status: user.isActive ? "Active" : "Inactive",
    })));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Users");
    XLSX.writeFile(workbook, "users_data.csv");
  };

  const exportUserChartsToCSV = async (userId) => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await axios.get(`http://localhost:5000/api/admin/user-charts/${userId}`, { headers: { Authorization: `Bearer ${token}` } });
      const worksheet = XLSX.utils.json_to_sheet(res.data.map(chart => ({
        FileName: chart.fileName,
        XAxis: chart.xAxis,
        YAxis: chart.yAxis,
        Types: chart.types.join(", "),
        Timestamp: new Date(chart.timestamp).toLocaleString(),
      })));
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "UserCharts");
      XLSX.writeFile(workbook, `charts_user_${userId}.csv`);
      toast.success("Charts exported successfully");
    } catch (error) {
      toast.error("Failed to export charts: " + (error.response?.data?.msg || error.message));
    }
  };

  const exportAllActivities = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await axios.get("http://localhost:5000/api/admin/activity/export", { headers: { Authorization: `Bearer ${token}` }, responseType: "arraybuffer" });
      const blob = new Blob([res.data], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "all_activities.csv";
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success("All activities exported successfully");
    } catch (error) {
      toast.error("Failed to export activities: " + (error.response?.data?.msg || error.message));
    }
  };

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
        <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
          <h2 className="text-2xl font-bold text-blue-900 mb-4 text-center">Admin Login</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-blue-700 mb-1">Username</label>
              <input
                type="text"
                value={loginCredentials.username}
                onChange={(e) => setLoginCredentials({ ...loginCredentials, username: e.target.value })}
                className="p-2 border border-blue-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-blue-700 mb-1">Password</label>
              <input
                type="password"
                value={loginCredentials.password}
                onChange={(e) => setLoginCredentials({ ...loginCredentials, password: e.target.value })}
                className="p-2 border border-blue-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 bg-blue-900 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
      <div className="w-64 bg-blue-800 shadow-lg p-4 fixed h-full flex flex-col space-y-6 text-white">
        <h1 className="text-2xl font-bold">Admin Panel</h1>
        <button
          onClick={handleLogout}
          className="py-2 bg-blue-900 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          Logout
        </button>
      </div>
      <div className="ml-64 flex-1 p-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-blue-900 mb-6">Admin Dashboard</h2>
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-lg font-semibold text-blue-700 mb-4">Statistics</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg shadow-sm">
                <p className="text-blue-900">Total Charts</p>
                <p className="text-2xl font-bold text-blue-600">{stats.totalCharts}</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg shadow-sm">
                <p className="text-blue-900">Total Files</p>
                <p className="text-2xl font-bold text-blue-600">{stats.totalFiles}</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg shadow-sm">
                <p className="text-blue-900">Avg Charts/User</p>
                <p className="text-2xl font-bold text-blue-600">{stats.avgChartsPerUser.toFixed(1)}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-lg font-semibold text-blue-700 mb-4">User Management</h3>
            <div className="mb-4 flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4">
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="p-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full md:w-1/3"
              />
              <button
                onClick={exportUsersToCSV}
                className="py-2 px-4 bg-blue-900 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                Export Users to CSV
              </button>
              <button
                onClick={exportAllActivities}
                className="py-2 px-4 bg-blue-900 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                Export All Activities
              </button>
              <button
                onClick={handleBulkDeactivate}
                className="py-2 px-4 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors duration-200"
              >
                Deactivate Selected Users
              </button>
              {selectedUser && (
                <button
                  onClick={() => exportUserChartsToCSV(selectedUser)}
                  className="py-2 px-4 bg-blue-900 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  Export Charts for Selected User
                </button>
              )}
            </div>
            <div className="overflow-x-auto max-h-[60vh] overflow-y-auto">
              <table className="w-full text-sm text-left text-blue-800 border-collapse">
                <thead className="bg-blue-600 text-white sticky top-0">
                  <tr>
                    <th className="p-2">
                      <input
                        type="checkbox"
                        onChange={(e) => setSelectedUsers(e.target.checked ? users.map(u => u._id) : [])}
                      />
                    </th>
                    <th className="p-2">Username</th>
                    <th className="p-2">Role</th>
                    <th className="p-2">Created</th>
                    <th className="p-2">Charts Created</th>
                    <th className="p-2">Last Chart Created</th>
                    <th className="p-2">Status</th>
                    <th className="p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user._id} className="border-b border-blue-200 hover:bg-blue-50">
                      <td className="p-2">
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user._id)}
                          onChange={(e) => setSelectedUsers(e.target.checked ? [...selectedUsers, user._id] : selectedUsers.filter(id => id !== user._id))}
                        />
                      </td>
                      <td className="p-2">{user.username}</td>
                      <td className="p-2">{user.role}</td>
                      <td className="p-2">{new Date(user.createdAt).toLocaleString()}</td>
                      <td className="p-2">{user.chartsCreated}</td>
                      <td className="p-2">{user.lastChartCreated ? new Date(user.lastChartCreated).toLocaleString() : "N/A"}</td>
                      <td className="p-2">{user.isActive ? "Active" : "Inactive"}</td>
                      <td className="p-2 flex space-x-2">
                        <button
                          onClick={() => handleToggleStatus(user._id)}
                          className={`py-1 px-2 rounded text-white ${user.isActive ? "bg-yellow-500 hover:bg-yellow-600" : "bg-green-500 hover:bg-green-600"}`}
                        >
                          {user.isActive ? "Deactivate" : "Activate"}
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user._id)}
                          className="py-1 px-2 bg-red-600 text-white rounded hover:bg-red-700"
                        >
                          Delete
                        </button>
                        <button
                          onClick={() => setSelectedUser(user._id)}
                          className="py-1 px-2 bg-blue-900 text-white rounded hover:bg-blue-700"
                        >
                          Select for Charts
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-blue-700 mb-4">Recent Activity</h3>
            <div className="mb-4">
              <select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                className="p-2 border border-blue-300 rounded-lg bg-white text-blue-800 focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Users</option>
                {users.map((user) => (
                  <option key={user._id} value={user._id}>{user.username}</option>
                ))}
              </select>
            </div>
            <div className="overflow-x-auto max-h-[60vh] overflow-y-auto">
              <table className="w-full text-sm text-left text-blue-800 border-collapse">
                <thead className="bg-blue-600 text-white sticky top-0">
                  <tr>
                    <th className="p-2">User</th>
                    <th className="p-2">Action</th>
                    <th className="p-2">Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {activity
                    .filter(act => !selectedUser || act.userId === selectedUser)
                    .map((act, index) => (
                      <tr key={index} className="border-b border-blue-200 hover:bg-blue-50">
                        <td className="p-2">{act.username}</td>
                        <td className="p-2">{act.action}</td>
                        <td className="p-2">{new Date(act.timestamp).toLocaleString()}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;