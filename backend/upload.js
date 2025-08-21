const multer = require('multer');
const path = require('path');
const { processVideoUpload } = require('./convertVideo');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB pour vidéos
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Seules les images et vidéos sont autorisées'));
    }
  }
});

// Middleware pour convertir les vidéos après upload
const processUploads = async (req, res, next) => {
  if (req.file && req.file.mimetype.startsWith('video/')) {
    console.log(`Traitement vidéo uploadée: ${req.file.filename}`);
    await processVideoUpload(req.file.path);
  }
  if (req.files) {
    for (const file of req.files) {
      if (file.mimetype.startsWith('video/')) {
        console.log(`Traitement vidéo uploadée: ${file.filename}`);
        await processVideoUpload(file.path);
      }
    }
  }
  next();
};

module.exports = { upload, processUploads };