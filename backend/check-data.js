const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/marketplace');

const User = require('./models/User');
const Shop = require('./models/Shop');

async function checkData() {
  try {
    console.log('🔍 فحص قاعدة البيانات...\n');
    
    // فحص المتاجر
    const shops = await Shop.find();
    console.log(`📊 عدد المتاجر: ${shops.length}`);
    if (shops.length > 0) {
      console.log('\n📋 قائمة المتاجر:');
      shops.forEach((shop, i) => {
        console.log(`${i + 1}. ${shop.name} - ${shop.email}`);
      });
    }
    
    // فحص الحسابات
    const users = await User.find().populate('linkedShopId');
    console.log(`\n👥 عدد الحسابات: ${users.length}`);
    if (users.length > 0) {
      console.log('\n📋 قائمة الحسابات:');
      users.forEach((user, i) => {
        console.log(`${i + 1}. ${user.username} - ${user.email}`);
        console.log(`   مصادق عليه: ${user.isApproved ? 'نعم' : 'لا'}`);
        if (user.linkedShopId) {
          console.log(`   متجر مرتبط: ${user.linkedShopId.name}`);
        }
      });
    }
    
    // فحص قواعد البيانات المتاحة
    console.log('\n🗄️ قواعد البيانات المتاحة:');
    const admin = mongoose.connection.db.admin();
    const dbs = await admin.listDatabases();
    dbs.databases.forEach(db => {
      console.log(`- ${db.name}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ خطأ:', error);
    process.exit(1);
  }
}

checkData();
