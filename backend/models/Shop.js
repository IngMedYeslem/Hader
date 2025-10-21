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
  missingDataNote: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

const Shop = mongoose.model("Shop", shopSchema);
module.exports = Shop;