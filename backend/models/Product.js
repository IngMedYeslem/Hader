const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  price: Number,
  category: { type: String, default: '' },
  stock: { type: Number, default: 0 },
  images: [String],
  videos: [String],
  shopId: { type: String, required: true }
}, {
  timestamps: true
});

ProductSchema.index({ name: 1, shopId: 1 }, { unique: true });

module.exports = mongoose.model("Product", ProductSchema);
