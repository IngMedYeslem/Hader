const express = require('express');
const router = express.Router();
const Shop = require('../models/Shop');

// Vérifier le statut du compte
router.get('/shops/:shopId/status', async (req, res) => {
  try {
    const shop = await Shop.findById(req.params.shopId);
    res.json({ status: shop.validationStatus });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Demander la réactivation
router.post('/shops/:shopId/reactivate', async (req, res) => {
  try {
    await Shop.findByIdAndUpdate(req.params.shopId, {
      validationStatus: 'pending_reactivation',
      reactivationRequestDate: new Date()
    });
    res.json({ message: 'Demande de réactivation soumise' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// SSE pour les mises à jour de statut
router.get('/shops/:shopId/status-updates', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });

  const interval = setInterval(async () => {
    try {
      const shop = await Shop.findById(req.params.shopId);
      res.write(`data: ${JSON.stringify({ status: shop.validationStatus })}\n\n`);
    } catch (error) {
      res.write(`data: ${JSON.stringify({ error: 'Erreur de connexion' })}\n\n`);
    }
  }, 5000);

  req.on('close', () => clearInterval(interval));
});

module.exports = router;