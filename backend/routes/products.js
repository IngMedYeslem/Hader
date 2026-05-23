const express = require('express');
const cloudinary = require('cloudinary').v2;
const Product = require('../models/Product');
const Shop = require('../models/Shop');
const Order = require('../models/Order');

const router = express.Router();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// استخراج public_id من Cloudinary URL
const getPublicId = (url) => {
  if (!url || !url.includes('cloudinary.com')) return null;
  try {
    const parts = url.split('/upload/');
    if (parts.length < 2) return null;
    // إزالة version (v1234567) إن وجد وإزالة الامتداد
    const withoutVersion = parts[1].replace(/^v\d+\//, '');
    return withoutVersion.replace(/\.[^/.]+$/, '');
  } catch { return null; }
};

// حذف صورة من Cloudinary بأمان
const deleteFromCloudinary = async (url) => {
  const publicId = getPublicId(url);
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (e) {
    console.warn('⚠️ Cloudinary delete failed:', publicId, e.message);
  }
};

// حذف قائمة صور من Cloudinary
const deleteMany = (urls = []) =>
  Promise.all(urls.filter(Boolean).map(deleteFromCloudinary));

// ─── Helper: كمية محجوزة ───────────────────────────────────────────────────
async function getReservedQty(productId) {
  const activeStatuses = ['pending', 'confirmed', 'preparing', 'on_the_way', 'ready', 'picked_up'];
  const orders = await Order.find(
    { 'items.productId': productId, status: { $in: activeStatuses } },
    'items'
  );
  return orders.reduce((sum, order) => {
    const item = order.items.find(i => i.productId?.toString() === productId.toString());
    return sum + (item?.quantity || 0);
  }, 0);
}

// ─── GET ───────────────────────────────────────────────────────────────────

router.get('/shop/:shopId/available-stock', async (req, res) => {
  try {
    const products = await Product.find({ shopId: req.params.shopId }, '_id stock');
    const result = {};
    await Promise.all(products.map(async (p) => {
      const reserved = await getReservedQty(p._id);
      result[p._id.toString()] = Math.max(0, (p.stock || 0) - reserved);
    }));
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/public', async (req, res) => {
  try {
    const products = await Product.find({ stock: { $gt: 0 } }).limit(100);
    const productsWithShop = await Promise.all(
      products.map(async (product) => {
        const shop = await Shop.findById(product.shopId);
        return { ...product.toObject(), shopName: shop?.name || 'Boutique inconnue' };
      })
    );
    res.json(productsWithShop);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/shop/:shopId/count', async (req, res) => {
  try {
    const count = await Product.countDocuments({ shopId: req.params.shopId, stock: { $gt: 0 } });
    res.json({ count });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/shop/:shopId', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const products = await Product.find({ shopId: req.params.shopId })
      .skip((page - 1) * limit)
      .limit(limit);
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:shopId', async (req, res) => {
  try {
    const products = await Product.find({ shopId: req.params.shopId });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── POST: إنشاء منتج ──────────────────────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const { mainImage, images = [], ...rest } = req.body;

    if (images.length > 5) {
      return res.status(400).json({ error: 'الحد الأقصى 5 صور إضافية' });
    }

    const product = new Product({ ...rest, mainImage: mainImage || null, images });
    const saved = await product.save();

    console.log('✅ Produit créé:', saved._id, '| mainImage:', !!mainImage, '| images:', images.length);
    res.status(201).json(saved);
  } catch (error) {
    console.error('❌ Erreur création produit:', error.message);
    res.status(400).json({ error: error.message });
  }
});

// ─── PUT: تحديث منتج مع حذف الصور القديمة من Cloudinary ──────────────────
router.put('/:id', async (req, res) => {
  try {
    const { mainImage, images = [], ...rest } = req.body;

    if (images.length > 5) {
      return res.status(400).json({ error: 'الحد الأقصى 5 صور إضافية' });
    }

    const existing = await Product.findById(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Produit non trouvé' });

    // حذف الصورة الرئيسية القديمة إن تغيرت
    if (mainImage !== undefined && existing.mainImage && existing.mainImage !== mainImage) {
      await deleteFromCloudinary(existing.mainImage);
    }

    // حذف الصور الإضافية التي حُذفت
    const removedImages = existing.images.filter(url => !images.includes(url));
    await deleteMany(removedImages);

    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      { ...rest, mainImage: mainImage ?? existing.mainImage, images },
      { new: true }
    );

    console.log('✅ Produit mis à jour:', updated._id);
    res.json(updated);
  } catch (error) {
    console.error('❌ Erreur mise à jour produit:', error.message);
    res.status(400).json({ error: error.message });
  }
});

// ─── DELETE media: حذف صورة واحدة مع Cloudinary ──────────────────────────
router.delete('/:id/media', async (req, res) => {
  try {
    const { mediaType, mediaIndex } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Produit non trouvé' });

    if (mediaType === 'images' && product.images[mediaIndex]) {
      await deleteFromCloudinary(product.images[mediaIndex]);
      product.images.splice(mediaIndex, 1);
    } else if (mediaType === 'mainImage') {
      await deleteFromCloudinary(product.mainImage);
      product.mainImage = null;
    }

    await product.save();
    res.json(product);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ─── DELETE: حذف منتج مع كل صوره من Cloudinary ───────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ error: 'Produit non trouvé' });

    // حذف كل الصور من Cloudinary
    await Promise.all([
      deleteFromCloudinary(product.mainImage),
      deleteMany(product.images),
    ]);

    res.json({ message: 'Produit supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
