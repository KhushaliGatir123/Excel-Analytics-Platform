const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  filename: {
    type: String,
    required: true,
  },
  data: [
    {
      type: Object,
    },
  ],
  uploadDate: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("File", fileSchema);