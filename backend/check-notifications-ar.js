const mongoose = require('mongoose');

// الاتصال بقاعدة البيانات
mongoose.connect('mongodb://localhost:27017/marketplace', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const notificationSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  title: { type: String, required: true },
  body: { type: String, required: true },
  type: { type: String, default: 'shop_validated' },
  data: { type: Object, default: {} },
  read: { type: Boolean, default: false }
}, { timestamps: true });

const Notification = mongoose.model('Notification', notificationSchema);

async function checkNotifications() {
  try {
    console.log('🔍 فحص الإشعارات...\n');
    
    const allNotifications = await Notification.find();
    console.log(`📊 إجمالي الإشعارات: ${allNotifications.length}\n`);
    
    if (allNotifications.length > 0) {
      console.log('📋 قائمة الإشعارات:');
      allNotifications.forEach((notif, index) => {
        console.log(`\n${index + 1}. ${notif.title}`);
        console.log(`   المستخدم: ${notif.userId}`);
        console.log(`   الرسالة: ${notif.body}`);
        console.log(`   مقروء: ${notif.read ? 'نعم' : 'لا'}`);
        console.log(`   التاريخ: ${notif.createdAt}`);
      });
    } else {
      console.log('⚠️ لا توجد إشعارات في قاعدة البيانات');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ خطأ:', error);
    process.exit(1);
  }
}

checkNotifications();
