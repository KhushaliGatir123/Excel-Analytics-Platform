const mongoose = require("mongoose");
const GraphSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  fileName: { type: String, required: true },
  xAxis: { type: String, required: true },
  yAxis: { type: String, required: true },
  types: { type: [String], required: true },
  timestamp: { type: String, required: true },
});
module.exports = mongoose.model("Graph", GraphSchema);