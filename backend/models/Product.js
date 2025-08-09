const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
  name: String,
  price: Number,
  images: [String],
  videos: [String],
  shopId: String,
}, {
  timestamps: true
});

module.exports = mongoose.model("Product", ProductSchema);
