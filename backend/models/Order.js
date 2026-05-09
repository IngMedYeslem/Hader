const mongoose = require('mongoose');

const statusHistorySchema = new mongoose.Schema({
  status: { type: String, required: true },
  changedBy: { type: String, enum: ['store', 'driver', 'system', 'customer'], default: 'system' },
  changedById: { type: String },
  note: { type: String, default: '' },
  timestamp: { type: Date, default: Date.now }
}, { _id: false });

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
  driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
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
  paymentNote: { type: String, default: '' },
  notes: { type: String, default: '' },
  estimatedPrepTime: { type: Number, default: 0 }, // minutes
  prepStartedAt: { type: Date },
  readyAt: { type: Date },
  pickedUpAt: { type: Date },
  deliveredAt: { type: Date },
  status: {
    type: String,
    enum: [
      'pending',        // تم استلام الطلب
      'confirmed',      // تم تأكيد الطلب
      'preparing',      // جاري التحضير
      'ready',          // جاهز للاستلام
      'picked_up',      // تم تسليم للمندوب
      'on_the_way',     // في الطريق
      'delivered',      // تم التسليم
      'cancelled',      // ملغي
      'failed',         // فشل التوصيل
      'no_answer',      // العميل لا يرد
      'unavailable'     // المنتجات غير متوفرة
    ],
    default: 'pending'
  },
  statusHistory: [statusHistorySchema],
  shippingAddress: String,
  trackingLink: String,
  driverLocation: {
    lat: Number,
    lng: Number,
    updatedAt: Date
  },
  reviewSubmitted: { type: Boolean, default: false }
}, { timestamps: true });

orderSchema.index({ phoneNumber: 1, deviceId: 1 });
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ shopId: 1, status: 1 });

module.exports = mongoose.model('Order', orderSchema);
