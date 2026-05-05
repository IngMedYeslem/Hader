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

const upload = multer({ 
  storage, 
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB pour les vidéos
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|mp4|mov|avi|webm/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Type de fichier non supporté'));
    }
  }
});

router.post("/upload-profile-image", upload.single("profileImage"), (req, res) => {
  if (!req.file) return res.status(400).send("Aucun fichier téléchargé.");
  res.json({ imagePath: `/assets/${req.file.filename}` });
});

router.post("/upload-media", upload.single("media"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Aucun fichier téléchargé" });
    }
    
    console.log('✅ Fichier uploadé:', req.file.filename);
    
    const isVideo = /\.(mp4|mov|avi|webm)$/i.test(req.file.originalname);
    const mediaType = isVideo ? 'video' : 'image';
    
    res.json({ 
      mediaPath: `/uploads/${req.file.filename}`,
      mediaType: mediaType,
      filename: req.file.filename
    });
  } catch (error) {
    console.error('❌ Erreur upload:', error);
    res.status(500).json({ error: error.message });
  }
});

// Upload payment receipt
router.post("/upload-receipt", upload.single("receipt"), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "Aucun fichier" });
    res.json({ receiptPath: `/uploads/${req.file.filename}` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
