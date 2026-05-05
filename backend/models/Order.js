const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, required: true, unique: true },
  phoneNumber: { type: String, required: true },
  customerName: { type: String, default: '' },
  deviceId: { type: String },
  softOtp: { type: String },
  otpStatus: { type: String, enum: ['pending', 'verified', 'expired'], default: 'pending' },
  otpExpiresAt: { type: Date },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop' },
  items: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name: String,
    price: Number,
    quantity: { type: Number, default: 1 }
  }],
  totalAmount: { type: Number, required: true },
  deliveryFee: { type: Number, default: 0 },
  paymentMethod: { type: String, default: 'cash' },
  paymentReceiptUrl: { type: String, default: '' },
  paymentStatus: { type: String, enum: ['pending', 'receipt_uploaded', 'confirmed', 'rejected'], default: 'pending' },
  notes: { type: String, default: '' },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'preparing', 'on_the_way', 'delivered', 'cancelled', 'processing', 'shipped'],
    default: 'pending'
  },
  shippingAddress: String,
  trackingLink: String,
  reviewSubmitted: { type: Boolean, default: false }
}, { timestamps: true });

orderSchema.index({ phoneNumber: 1, deviceId: 1 });
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ shopId: 1, status: 1 });

module.exports = mongoose.model('Order', orderSchema);
