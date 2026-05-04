const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/hader');

const User = require('./models/User');
const Shop = require('./models/Shop');

const notificationSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  title: { type: String, required: true },
  body: { type: String, required: true },
  type: { type: String, default: 'shop_validated' },
  data: { type: Object, default: {} },
  read: { type: Boolean, default: false }
}, { timestamps: true });

const Notification = mongoose.model('Notification', notificationSchema);

async function checkM4Notifications() {
  try {
    console.log('🔍 البحث عن متجر m4...\n');
    
    const shop = await Shop.findOne({ email: 'm4' });
    if (!shop) {
      console.log('❌ متجر m4 غير موجود');
      process.exit(1);
    }
    
    console.log(`✅ متجر m4 موجود: ${shop.name}`);
    console.log(`📧 البريد: ${shop.email}`);
    console.log(`🆔 Shop ID: ${shop._id}\n`);
    
    const user = await User.findOne({ linkedShopId: shop._id });
    if (!user) {
      console.log('❌ لا يوجد حساب مرتبط بمتجر m4');
      process.exit(1);
    }
    
    console.log(`✅ الحساب المرتبط: ${user.username}`);
    console.log(`📧 البريد: ${user.email}`);
    console.log(`🆔 User ID: ${user._id}`);
    console.log(`✅ مصادق عليه: ${user.isApproved ? 'نعم' : 'لا'}\n`);
    
    const notifications = await Notification.find({ userId: user._id.toString() });
    console.log(`📨 عدد الإشعارات: ${notifications.length}\n`);
    
    if (notifications.length > 0) {
      console.log('📋 الإشعارات:');
      notifications.forEach((notif, i) => {
        console.log(`\n${i + 1}. ${notif.title}`);
        console.log(`   ${notif.body}`);
        console.log(`   مقروء: ${notif.read ? 'نعم' : 'لا'}`);
        console.log(`   التاريخ: ${notif.createdAt}`);
      });
    } else {
      console.log('⚠️ لا توجد إشعارات لهذا المتجر');
    }
    
    console.log('\n📱 لعرض الإشعارات في التطبيق:');
    console.log(`<NotificationsList userId="${user._id}" />`);
    
    console.log('\n🔗 API للإشعارات:');
    console.log(`GET http://localhost:3000/api/notifications/${user._id}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ خطأ:', error);
    process.exit(1);
  }
}

checkM4Notifications();
