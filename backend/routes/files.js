const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const File = require("../models/File");
const multer = require("multer");
const xlsx = require("xlsx");

const upload = multer({ dest: "uploads/" });

const auth = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) {
    return res.status(401).json({ msg: "No token, authorization denied" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: "Token is not valid" });
  }
};

router.post("/upload", auth, upload.single("file"), async (req, res) => {
  try {
    const workbook = xlsx.readFile(req.file.path);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(sheet);
    const file = new File({
      userId: req.user.id,
      filename: req.file.originalname,
      data,
    });
    await file.save();
    res.status(201).json({ file });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ msg: "Server error" });
  }
});

router.get("/", auth, async (req, res) => {
  try {
    const files = await File.find({ userId: req.user.id });
    res.json(files);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ msg: "Server error" });
  }
});

router.get("/:id", auth, async (req, res) => {
  try {
    const file = await File.findById(req.params.id);
    if (!file || file.userId.toString() !== req.user.id) {
      return res.status(404).json({ msg: "File not found" });
    }
    res.json(file);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;