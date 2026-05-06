const express = require('express');
const router = express.Router();
const Shop = require('../models/Shop');

// Route pour mettre à jour l'image principale d'une boutique
router.put('/shops/:shopId/main-image', async (req, res) => {
  try {
    const { mainImage } = req.body;
    const shop = await Shop.findByIdAndUpdate(
      req.params.shopId,
      { mainImage },
      { new: true }
    ).select('mainImage');
    if (!shop) return res.status(404).json({ error: 'Boutique non trouvée' });
    res.json({ mainImage: shop.mainImage });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route pour mettre à jour les informations d'une boutique
router.put('/shops/:shopId', async (req, res) => {
  try {
    const { name, email, address, phone, whatsapp, location, missingDataNote } = req.body;
    
    const updateData = { name, email, address, phone, whatsapp };
    if (location) {
      updateData.location = location;
    }
    if (missingDataNote !== undefined) {
      updateData.missingDataNote = missingDataNote;
    }
    
    const shop = await Shop.findByIdAndUpdate(
      req.params.shopId,
      updateData,
      { new: true }
    );
    
    if (!shop) {
      return res.status(404).json({ error: 'Boutique non trouvée' });
    }
    
    res.json({ message: 'Informations mises à jour', shop });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route pour mettre à jour l'utilisateur lié à une boutique
router.put('/users/update-by-shop/:shopId', async (req, res) => {
  try {
    const User = require('../models/User');
    const { username, email } = req.body;
    
    const user = await User.findOneAndUpdate(
      { linkedShopId: req.params.shopId },
      { username, email },
      { new: true }
    );
    
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur lié non trouvé' });
    }
    
    res.json({ message: 'Utilisateur mis à jour', user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;