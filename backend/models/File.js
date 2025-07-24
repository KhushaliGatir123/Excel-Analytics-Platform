const mongoose = require("mongoose");
const FileSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  filename: { type: String, required: true },
  path: { type: String, required: true },
  data: { type: Array, required: true },
  uploadDate: { type: Date, default: Date.now },
});
module.exports = mongoose.model("File", FileSchema);