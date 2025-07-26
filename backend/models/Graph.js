const mongoose = require("mongoose");
const GraphSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  fileName: { type: String, required: true },
  xAxis: { type: String, required: true },
  yAxis: { type: String, required: true },
  types: { type: [String], required: true },
  timestamp: { type: String, required: true },
  data: { type: [Number], required: false },
});
module.exports = mongoose.model("Graph", GraphSchema);