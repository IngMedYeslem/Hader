const express = require("express");
const multer = require("multer");
const path = require("path");

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

router.post("/upload-profile-image", upload.single("profileImage"), (req, res) => {
  if (!req.file) return res.status(400).send("Aucun fichier téléchargé.");
  res.json({ imagePath: `/assets/${req.file.filename}` });
});

module.exports = router;
