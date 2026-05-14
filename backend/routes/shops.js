const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const Shop = require('../models/Shop');
const Product = require('../models/Product');
const { calculateDeliveryTime } = require('../services/deliveryTimeService');

// PUT /shops/:shopId/main-image
router.put('/shops/:shopId/main-image', async (req, res) => {
  try {
    const shop = await Shop.findByIdAndUpdate(
      req.params.shopId,
      { mainImage: req.body.mainImage },
      { new: true }
    ).select('mainImage');
    if (!shop) return res.status(404).json({ error: 'المتجر غير موجود' });
    res.json({ mainImage: shop.mainImage });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /shops/:shopId - Update shop info
router.put('/shops/:shopId', async (req, res) => {
  try {
    const { name, email, address, phone, whatsapp, location, missingDataNote, category, description, stock } = req.body;

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (address !== undefined) updateData.address = address;
    if (phone !== undefined) updateData.phone = phone;
    if (whatsapp !== undefined) updateData.whatsapp = whatsapp;
    if (missingDataNote !== undefined) updateData.missingDataNote = missingDataNote;
    if (category !== undefined) updateData.category = category;
    if (description !== undefined) updateData.description = description;
    if (stock !== undefined) updateData.stock = stock;

    // Fix: save location fields properly
    if (location) {
      if (location.latitude !== undefined) updateData['location.latitude'] = parseFloat(location.latitude);
      if (location.longitude !== undefined) updateData['location.longitude'] = parseFloat(location.longitude);
      if (location.address !== undefined) updateData.address = location.address;
    }

    const shop = await Shop.findByIdAndUpdate(req.params.shopId, updateData, { new: true });
    if (!shop) return res.status(404).json({ error: 'المتجر غير موجود' });

    res.json({ message: 'تم التعديل بنجاح', shop });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /users/update-by-shop/:shopId - Update linked user (with bcrypt password)
router.put('/users/update-by-shop/:shopId', async (req, res) => {
  try {
    const User = require('../models/User');
    const { username, email, password } = req.body;

    const updateData = {};
    if (username) updateData.username = username;
    if (email) updateData.email = email;
    if (password) updateData.password = await bcrypt.hash(password, 10);

    const user = await User.findOneAndUpdate(
      { linkedShopId: req.params.shopId },
      updateData,
      { new: true }
    );
    if (!user) return res.status(404).json({ error: 'المستخدم المرتبط غير موجود' });

    res.json({ message: 'تم التعديل بنجاح', user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /shops/:shopId/change-password
router.post('/shops/:shopId/change-password', async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ error: 'كلمة المرور القديمة والجديدة مطلوبتان' });
    }

    const shop = await Shop.findById(req.params.shopId);
    if (!shop) return res.status(404).json({ error: 'المتجر غير موجود' });

    // Support both plain text (legacy) and bcrypt hashed passwords
    let isValid = false;
    if (shop.password.startsWith('$2')) {
      isValid = await bcrypt.compare(oldPassword, shop.password);
    } else {
      isValid = oldPassword === shop.password;
    }
    if (!isValid) return res.status(400).json({ error: 'كلمة المرور القديمة غير صحيحة' });

    shop.password = await bcrypt.hash(newPassword, 10);
    await shop.save();

    res.json({ message: 'تم تغيير كلمة المرور بنجاح' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /shops/:shopId/product-count - Fix product count
router.get('/shops/:shopId/product-count', async (req, res) => {
  try {
    const count = await Product.countDocuments({
      shopId: req.params.shopId,
      $or: [{ isActive: true }, { isActive: { $exists: false } }],
      stock: { $gte: 0 }
    });
    res.json({ count });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /shops/:shopId/delivery-time
router.get('/shops/:shopId/delivery-time', async (req, res) => {
  try {
    const shop = await Shop.findById(req.params.shopId).select('category status location');
    if (!shop) return res.status(404).json({ error: 'المتجر غير موجود' });

    const customerLocation = req.query.lat && req.query.lng
      ? { latitude: parseFloat(req.query.lat), longitude: parseFloat(req.query.lng) }
      : null;

    const deliveryTime = calculateDeliveryTime(shop, customerLocation);
    res.json({ deliveryTime });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /shops/:shopId/bank-accounts
router.get('/shops/:shopId/bank-accounts', async (req, res) => {
  try {
    const shop = await Shop.findById(req.params.shopId).select('bankAccounts');
    if (!shop) return res.status(404).json({ error: 'المتجر غير موجود' });
    res.json(shop.bankAccounts || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /shops/:shopId/bank-accounts
router.put('/shops/:shopId/bank-accounts', async (req, res) => {
  try {
    const shop = await Shop.findByIdAndUpdate(
      req.params.shopId,
      { bankAccounts: req.body.bankAccounts },
      { new: true }
    ).select('bankAccounts');
    if (!shop) return res.status(404).json({ error: 'المتجر غير موجود' });
    res.json(shop.bankAccounts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
