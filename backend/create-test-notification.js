const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/marketplace');

const notificationSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  title: { type: String, required: true },
  body: { type: String, required: true },
  type: { type: String, default: 'shop_validated' },
  data: { type: Object, default: {} },
  read: { type: Boolean, default: false }
}, { timestamps: true });

const Notification = mongoose.model('Notification', notificationSchema);
const User = require('./models/User');

async function createTestNotification() {
  try {
    console.log('🔍 البحث عن مستخدم...');
    
    const user = await User.findOne().populate('linkedShopId');
    
    if (!user) {
      console.log('❌ لم يتم العثور على مستخدمين');
      console.log('💡 قم بإنشاء متجر أولاً');
      process.exit(1);
    }
    
    console.log(`✅ تم العثور على المستخدم: ${user.username}`);
    console.log(`📧 البريد: ${user.email}`);
    console.log(`🆔 userId: ${user._id}`);
    
    if (user.linkedShopId) {
      console.log(`🏪 المتجر: ${user.linkedShopId.name}`);
    }
    
    const notification = new Notification({
      userId: user._id.toString(),
      title: 'إشعار تجريبي ✅',
      body: 'هذا إشعار تجريبي للتأكد من عمل النظام',
      type: 'shop_validated',
      data: { test: true },
      read: false
    });
    
    await notification.save();
    console.log('\n✅ تم إنشاء الإشعار التجريبي بنجاح!');
    console.log(`📨 معرف الإشعار: ${notification._id}`);
    
    console.log('\n📋 للتحقق من الإشعار، استخدم:');
    console.log(`GET http://localhost:3000/api/notifications/${user._id}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ خطأ:', error);
    process.exit(1);
  }
}

createTestNotification();
