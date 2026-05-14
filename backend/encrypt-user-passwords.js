const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

async function encryptUserPasswords() {
  try {
    await mongoose.connect('mongodb://localhost:27017/hader');
    console.log('✅ متصل بقاعدة البيانات');

    // العثور على جميع المستخدمين الذين لديهم كلمات مرور غير مشفرة
    const users = await User.find({
      password: { $not: /^\$2[aby]\$/ } // كلمات مرور لا تبدأ بـ bcrypt hash
    });

    console.log(`🔍 وُجد ${users.length} مستخدم بكلمة مرور غير مشفرة`);

    let encrypted = 0;
    for (const user of users) {
      const originalPassword = user.password;
      const hashedPassword = await bcrypt.hash(originalPassword, 10);
      
      await User.findByIdAndUpdate(user._id, { password: hashedPassword });
      
      console.log(`🔐 ${user.username} (${user.email}): "${originalPassword}" → مشفرة`);
      encrypted++;
    }

    console.log(`\n✅ تم تشفير ${encrypted} كلمة مرور للمستخدمين`);

  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 تم قطع الاتصال');
  }
}

encryptUserPasswords();