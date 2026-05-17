const express = require('express');
const router = express.Router();
const Offer = require('../models/Offer');

// GET /api/offers — جلب العروض النشطة
router.get('/offers', async (req, res) => {
  try {
    const offers = await Offer.find({ active: true }).sort({ createdAt: -1 });
    res.json({ data: offers });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/offers — إنشاء عرض جديد (للأدمن)
router.post('/offers', async (req, res) => {
  try {
    const offer = new Offer(req.body);
    await offer.save();
    res.json(offer);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// PUT /api/offers/:id — تعديل عرض
router.put('/offers/:id', async (req, res) => {
  try {
    const offer = await Offer.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!offer) return res.status(404).json({ error: 'not found' });
    res.json(offer);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// PATCH /api/offers/:id/click — تسجيل نقرة
router.patch('/offers/:id/click', async (req, res) => {
  try {
    await Offer.findByIdAndUpdate(req.params.id, { $inc: { clicks: 1 } });
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// DELETE /api/offers/:id — حذف عرض
router.delete('/offers/:id', async (req, res) => {
  try {
    await Offer.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
