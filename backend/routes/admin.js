const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Graph = require("../models/Graph");
const Activity = require("../models/Activity");
const File = require("../models/File");

// Apply role-based authentication with fixed token
router.use((req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token || token !== "admin-auth-token") {
    return res.status(401).json({ msg: "Unauthorized: Invalid admin token" });
  }
  next();
});

router.get("/users", async (req, res) => {
  try {
    const users = await User.aggregate([
      {
        $lookup: {
          from: "graphs",
          localField: "_id",
          foreignField: "userId",
          as: "charts",
        },
      },
      {
        $project: {
          username: 1,
          role: 1,
          createdAt: 1,
          chartsCreated: { $size: { $ifNull: ["$charts", []] } },
          lastChartCreated: { $ifNull: [{ $max: "$charts.timestamp" }, null] },
          isActive: 1,
        },
      },
    ]);
    console.log("Users fetched:", users);
    if (users.length === 0) {
      console.log("No users found in database");
    }
    res.json(users);
  } catch (error) {
    console.error("Users fetch error:", error.message, error.stack);
    res.status(500).json({ msg: "Server error while fetching users" });
  }
});

router.put("/users/:id/status", async (req, res) => {
  try {
    const { isActive } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { isActive }, { new: true });
    if (!user) return res.status(404).json({ msg: "User not found" });
    res.json({ msg: "User status updated", user });
  } catch (error) {
    res.status(500).json({ msg: "Server error while updating user status" });
  }
});

router.post("/users/bulk-deactivate", async (req, res) => {
  try {
    const { userIds } = req.body;
    const result = await User.updateMany({ _id: { $in: userIds }, role: "user" }, { isActive: false });
    if (result.modifiedCount === 0) return res.status(404).json({ msg: "No users updated" });
    res.json({ msg: "Selected users deactivated", modifiedCount: result.modifiedCount });
  } catch (error) {
    res.status(500).json({ msg: "Server error while deactivating users" });
  }
});

router.get("/activity", async (req, res) => {
  try {
    const activities = await Activity.find()
      .populate("userId", "username")
      .sort({ timestamp: -1 });
    const activityList = activities.map(activity => ({
      username: activity.userId.username,
      action: activity.action,
      timestamp: activity.timestamp,
    }));
    res.json(activityList);
  } catch (error) {
    res.status(500).json({ msg: "Server error while fetching activity" });
  }
});

router.get("/stats", async (req, res) => {
  try {
    const totalCharts = await Graph.countDocuments();
    const totalFiles = await File.countDocuments(); // Ensure File model is imported
    const users = await User.countDocuments();
    const avgChartsPerUser = users > 0 ? totalCharts / users : 0;
    res.json({ totalCharts, totalFiles, avgChartsPerUser });
  } catch (error) {
    res.status(500).json({ msg: "Server error while fetching stats" });
  }
});

router.get("/user-charts/:userId", async (req, res) => {
  try {
    const charts = await Graph.find({ userId: req.params.userId })
      .select("fileName xAxis yAxis types timestamp")
      .sort({ timestamp: -1 });
    res.json(charts);
  } catch (error) {
    res.status(500).json({ msg: "Server error while fetching user charts" });
  }
});

router.get("/activity/export", async (req, res) => {
  try {
    const activities = await Activity.find()
      .populate("userId", "username")
      .sort({ timestamp: -1 });
    const activityList = activities.map(activity => ({
      username: activity.userId.username,
      action: activity.action,
      timestamp: activity.timestamp,
    }));
    const worksheet = XLSX.utils.json_to_sheet(activityList);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "AllActivities");
    res.setHeader("Content-Disposition", "attachment; filename=all_activities.csv");
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    XLSX.write(workbook, { type: "buffer" });
    res.end(Buffer.from(XLSX.write(workbook, { type: "buffer" })));
  } catch (error) {
    res.status(500).json({ msg: "Server error while exporting activities" });
  }
});

router.delete("/users/:id", async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ msg: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ msg: "Server error while deleting user" });
  }
});

module.exports = router;