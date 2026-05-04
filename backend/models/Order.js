const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, required: true, unique: true },
  phoneNumber: { type: String, required: true },
  deviceId: { type: String },
  softOtp: { type: String },
  otpStatus: { type: String, enum: ['pending', 'verified', 'expired'], default: 'pending' },
  otpExpiresAt: { type: Date },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
  items: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: String,
    price: Number,
    quantity: { type: Number, default: 1 }
  }],
  totalAmount: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'], default: 'pending' },
  shippingAddress: String,
  trackingLink: String,
  reviewSubmitted: { type: Boolean, default: false }
}, { timestamps: true });

orderSchema.index({ phoneNumber: 1, deviceId: 1 });
orderSchema.index({ orderNumber: 1 });

module.exports = mongoose.model('Order', orderSchema);
