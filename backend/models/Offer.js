const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
  title:     { type: String, required: true },
  subtitle:  { type: String, default: '' },
  emoji:     { type: String, default: '🎁' },
  color:     { type: String, default: '#FF6B35' },
  link_type: { type: String, enum: ['store', 'none'], default: 'none' },
  store_id:  { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', default: null },
  end_date:  { type: String, default: null }, // YYYY-MM-DD
  clicks:    { type: Number, default: 0 },
  active:    { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Offer', offerSchema);
