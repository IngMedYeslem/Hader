const express = require("express");
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const router = express.Router();

const makeStorage = (folder, resourceType = "image") =>
  new CloudinaryStorage({
    cloudinary,
    params: {
      folder,
      resource_type: resourceType,
      allowed_formats: ["jpg", "jpeg", "png", "gif", "mp4", "mov", "avi", "webm"],
    },
  });

const mediaUpload = multer({
  storage: makeStorage("hader/media", "auto"),
  limits: { fileSize: 50 * 1024 * 1024 },
});

const imageUpload = multer({
  storage: makeStorage("hader/images", "image"),
  limits: { fileSize: 10 * 1024 * 1024 },
});

// رفع الصور والفيديوهات (المنتجات)
router.post("/upload-media", mediaUpload.single("media"), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "Aucun fichier téléchargé" });

    const isVideo = req.file.mimetype.startsWith("video/");
    console.log("✅ Fichier uploadé sur Cloudinary:", req.file.path);

    res.json({
      mediaPath: req.file.path,
      mediaType: isVideo ? "video" : "image",
      filename: req.file.filename,
    });
  } catch (error) {
    console.error("❌ Erreur upload:", error);
    res.status(500).json({ error: error.message });
  }
});

// رفع صورة الملف الشخصي
router.post("/upload-profile-image", imageUpload.single("profileImage"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "Aucun fichier téléchargé" });
  res.json({ imagePath: req.file.path });
});

// رفع صورة المتجر الرئيسية
router.post("/upload-shop-image", imageUpload.single("mainImage"), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "Aucun fichier" });
    res.json({ imagePath: req.file.path });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// رفع إيصال الدفع
router.post("/upload-receipt", imageUpload.single("receipt"), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "Aucun fichier" });
    res.json({ receiptPath: req.file.path });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
