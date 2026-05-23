const express = require("express");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const router = express.Router();
const jsonBody = express.json({ limit: '50mb' });

const uploadToCloudinary = (dataUri, folder, resourceType = "image") =>
  cloudinary.uploader.upload(dataUri, { folder, resource_type: resourceType });

// رفع الصور والفيديوهات (المنتجات) — يستقبل JSON { file: "data:..." }
router.post("/upload-media", jsonBody, async (req, res) => {
  try {
    const { file } = req.body;
    if (!file) return res.status(400).json({ error: "Aucun fichier fourni" });

    const isVideo = file.startsWith("data:video/");
    const result = await uploadToCloudinary(file, "hader/media", isVideo ? "video" : "image");

    console.log("✅ Uploadé sur Cloudinary:", result.secure_url);
    res.json({
      mediaPath: result.secure_url,
      mediaType: isVideo ? "video" : "image",
      filename: result.public_id,
    });
  } catch (error) {
    console.error("❌ Erreur Cloudinary:", error.message || JSON.stringify(error));
    res.status(500).json({ error: error.message || JSON.stringify(error) });
  }
});

// رفع صورة الملف الشخصي
router.post("/upload-profile-image", jsonBody, async (req, res) => {
  try {
    const { file } = req.body;
    if (!file) return res.status(400).json({ error: "Aucun fichier fourni" });
    const result = await uploadToCloudinary(file, "hader/profiles");
    res.json({ imagePath: result.secure_url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// رفع صورة المتجر الرئيسية
router.post("/upload-shop-image", jsonBody, async (req, res) => {
  try {
    const { file } = req.body;
    if (!file) return res.status(400).json({ error: "Aucun fichier fourni" });
    const result = await uploadToCloudinary(file, "hader/shops");
    res.json({ imagePath: result.secure_url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// رفع إيصال الدفع
router.post("/upload-receipt", jsonBody, async (req, res) => {
  try {
    const { file } = req.body;
    if (!file) return res.status(400).json({ error: "Aucun fichier fourni" });
    const result = await uploadToCloudinary(file, "hader/receipts");
    res.json({ receiptPath: result.secure_url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
