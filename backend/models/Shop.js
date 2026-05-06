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
  createdAt: { type: Date, default: Date.now }
});

const Shop = mongoose.model("Shop", shopSchema);
module.exports = Shop;