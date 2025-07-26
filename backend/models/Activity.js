const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema({
  username: { type: String, required: true },
  action: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
});

module.exports = mongoose.model("Activity", activitySchema);