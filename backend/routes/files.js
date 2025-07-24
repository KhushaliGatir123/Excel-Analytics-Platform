const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const File = require("../models/File");
const Graph = require("../models/Graph");

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