const mongoose = require("mongoose");

const shopSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  address: { type: String, required: true },
  phone: { type: String, required: true },
  whatsapp: { type: String, required: true },
  location: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true }
  },
  description: { type: String, default: '' },
  stock: { type: Number, default: 0 },
  category: { type: String, default: '' },
  missingDataNote: { type: String, default: '' },
  bankAccounts: [{
    bankName: { type: String, required: true },
    accountNumber: { type: String, required: true },
    accountHolder: { type: String, default: '' }
  }],
  mainImage: { type: String, default: '' },
  status: { type: String, enum: ['ACTIVE', 'BUSY', 'CLOSED'], default: 'ACTIVE' },
  schedule: {
    enabled:   { type: Boolean, default: false },
    openTime:  { type: String, default: '08:00' },
    closeTime: { type: String, default: '22:00' },
    days: {
      type: [Number], // 0=أحد, 1=اثنين, ..., 6=سبت
      default: [0, 1, 2, 3, 4, 5, 6]
    }
  },
  averageRating: { type: Number, default: 0 },
  totalRatings: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

const Shop = mongoose.model("Shop", shopSchema);
module.exports = Shop;