const mongoose = require("mongoose");

const FileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  filename: { type: String, required: true },
  path: { type: String, required: true },
  data: { type: Array, required: true }, // Ensure this is populated with valid data
  uploadDate: { type: Date, default: Date.now },
});

module.exports = mongoose.model("File", FileSchema);