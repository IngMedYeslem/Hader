const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Shop = require('./models/Shop');

async function encryptAllPasswords() {
  try {
    await mongoose.connect('mongodb://localhost:27017/hader');
    console.log('✅ متصل بقاعدة البيانات');

    // العثور على جميع المتاجر التي لديها كلمات مرور غير مشفرة
    const shops = await Shop.find({
      password: { $not: /^\$2[aby]\$/ } // كلمات مرور لا تبدأ بـ bcrypt hash
    });

    console.log(`🔍 وُجد ${shops.length} متجر بكلمة مرور غير مشفرة`);

    let encrypted = 0;
    for (const shop of shops) {
      const originalPassword = shop.password;
      const hashedPassword = await bcrypt.hash(originalPassword, 10);
      
      await Shop.findByIdAndUpdate(shop._id, { password: hashedPassword });
      
      console.log(`🔐 ${shop.name} (${shop.email}): "${originalPassword}" → مشفرة`);
      encrypted++;
    }

    console.log(`\n✅ تم تشفير ${encrypted} كلمة مرور`);
    console.log('🔑 يمكن الآن تسجيل الدخول بكلمات المرور الأصلية');

  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 تم قطع الاتصال');
  }
}

encryptAllPasswords();