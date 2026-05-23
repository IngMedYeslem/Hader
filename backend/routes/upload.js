const express = require("express");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log('☁️ Cloudinary config:', {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET ? '***set***' : 'MISSING',
});

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|mp4|mov|avi|webm/;
    if (allowed.test(file.mimetype)) cb(null, true);
    else cb(new Error("Type de fichier non supporté"));
  },
});

const uploadToCloudinary = (buffer, mimetype, options) => {
  const base64 = buffer.toString("base64");
  const dataUri = `data:${mimetype};base64,${base64}`;
  return cloudinary.uploader.upload(dataUri, options);
};

// رفع الصور والفيديوهات (المنتجات)
router.post("/upload-media", upload.single("media"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "Aucun fichier téléchargé" });

    const isVideo = req.file.mimetype.startsWith("video/");
    const result = await uploadToCloudinary(req.file.buffer, req.file.mimetype, {
      folder: "hader/media",
      resource_type: isVideo ? "video" : "image",
    });

    console.log("✅ Uploadé sur Cloudinary:", result.secure_url);
    res.json({
      mediaPath: result.secure_url,
      mediaType: isVideo ? "video" : "image",
      filename: result.public_id,
    });
  } catch (error) {
    console.error("❌ Erreur upload Cloudinary:", JSON.stringify(error));
    res.status(500).json({ error: error.message || error.error?.message || JSON.stringify(error) });
  }
});

// رفع صورة الملف الشخصي
router.post("/upload-profile-image", upload.single("profileImage"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "Aucun fichier téléchargé" });

    const result = await uploadToCloudinary(req.file.buffer, req.file.mimetype, {
      folder: "hader/profiles",
      resource_type: "image",
    });

    res.json({ imagePath: result.secure_url });
  } catch (error) {
    console.error("❌ Erreur upload profil:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// رفع صورة المتجر الرئيسية
router.post("/upload-shop-image", upload.single("mainImage"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "Aucun fichier" });

    const result = await uploadToCloudinary(req.file.buffer, req.file.mimetype, {
      folder: "hader/shops",
      resource_type: "image",
    });

    res.json({ imagePath: result.secure_url });
  } catch (error) {
    console.error("❌ Erreur upload shop:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// رفع إيصال الدفع
router.post("/upload-receipt", upload.single("receipt"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "Aucun fichier" });

    const result = await uploadToCloudinary(req.file.buffer, req.file.mimetype, {
      folder: "hader/receipts",
      resource_type: "image",
    });

    res.json({ receiptPath: result.secure_url });
  } catch (error) {
    console.error("❌ Erreur upload reçu:", error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
