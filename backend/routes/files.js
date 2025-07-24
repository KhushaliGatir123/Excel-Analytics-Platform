const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const File = require("../models/File");
const Graph = require("../models/Graph");
const multer = require("multer");
const path = require("path");
const XLSX = require("xlsx");

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    cb(null, `${timestamp}-${file.originalname}`);
  },
});
const upload = multer({ storage });

router.post("/upload", auth, upload.single("file"), async (req, res) => {
  try {
    const workbook = XLSX.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
    const file = new File({
      userId: req.user.id,
      filename: req.file.originalname, // Store original file name
      path: req.file.path,
      data,
      uploadDate: new Date(),
    });
    await file.save();
    res.json({ file });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ msg: "Server error" });
  }
});

router.get("/", auth, async (req, res) => {
  try {
    const files = await File.find({ userId: req.user.id }).sort({ uploadDate: -1 });
    res.json(files);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ msg: "Server error" });
  }
});

router.post("/graphs", auth, async (req, res) => {
  const { fileName, xAxis, yAxis, types, timestamp } = req.body;
  try {
    const graph = new Graph({
      userId: req.user.id,
      fileName,
      xAxis,
      yAxis,
      types,
      timestamp,
    });
    await graph.save();
    res.json(graph);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ msg: "Server error" });
  }
});

router.get("/graphs", auth, async (req, res) => {
  try {
    const graphs = await Graph.find({ userId: req.user.id }).sort({ timestamp: -1 });
    res.json(graphs);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;