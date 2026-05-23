const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  price: Number,
  category: { type: String, default: '' },
  stock: { type: Number, default: 0 },
  mainImage: { type: String, default: null },
  images: { type: [String], default: [], validate: v => v.length <= 5 },
  shopId: { type: String, required: true }
}, {
  timestamps: true
});

ProductSchema.index({ name: 1, shopId: 1 }, { unique: true });

module.exports = mongoose.model("Product", ProductSchema);
