const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/hader');

const User = require('./models/User');
const Shop = require('./models/Shop');
const Product = require('./models/Product');

async function checkEcommerceData() {
  try {
    console.log('🔍 فحص قاعدة بيانات ecommerce...\n');
    
    const shops = await Shop.find();
    console.log(`📊 عدد المتاجر: ${shops.length}`);
    if (shops.length > 0) {
      console.log('\n📋 المتاجر:');
      shops.forEach((shop, i) => {
        console.log(`${i + 1}. ${shop.name} - ${shop.email}`);
      });
    }
    
    const users = await User.find().populate('linkedShopId');
    console.log(`\n👥 عدد الحسابات: ${users.length}`);
    if (users.length > 0) {
      console.log('\n📋 الحسابات:');
      users.forEach((user, i) => {
        console.log(`${i + 1}. ${user.username} - ${user.email}`);
        console.log(`   مصادق: ${user.isApproved ? 'نعم' : 'لا'}`);
        if (user.linkedShopId) {
          console.log(`   متجر: ${user.linkedShopId.name}`);
        }
      });
    }
    
    const products = await Product.find();
    console.log(`\n📦 عدد المنتجات: ${products.length}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ خطأ:', error);
    process.exit(1);
  }
}

checkEcommerceData();
