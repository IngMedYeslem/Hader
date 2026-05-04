const mongoose = require('mongoose');

// الاتصال بقاعدة ecommerce
const connEcommerce = mongoose.createConnection('mongodb://localhost:27017/hader');
const connMarketplace = mongoose.createConnection('mongodb://localhost:27017/marketplace');

const User = require('./models/User');
const Shop = require('./models/Shop');
const Product = require('./models/Product');
const Role = require('./models/Role');

async function copyData() {
  try {
    console.log('🔄 بدء نسخ البيانات من ecommerce إلى marketplace...\n');
    
    // Models من ecommerce
    const ShopSource = connEcommerce.model('Shop', Shop.schema);
    const UserSource = connEcommerce.model('User', User.schema);
    const ProductSource = connEcommerce.model('Product', Product.schema);
    const RoleSource = connEcommerce.model('Role', Role.schema);
    
    // Models إلى marketplace
    const ShopDest = connMarketplace.model('Shop', Shop.schema);
    const UserDest = connMarketplace.model('User', User.schema);
    const ProductDest = connMarketplace.model('Product', Product.schema);
    const RoleDest = connMarketplace.model('Role', Role.schema);
    
    // نسخ الأدوار
    const roles = await RoleSource.find();
    console.log(`📋 نسخ ${roles.length} أدوار...`);
    for (const role of roles) {
      const exists = await RoleDest.findOne({ name: role.name });
      if (!exists) {
        await RoleDest.create({ _id: role._id, name: role.name });
      }
    }
    
    // نسخ المتاجر
    const shops = await ShopSource.find();
    console.log(`🏪 نسخ ${shops.length} متجر...`);
    for (const shop of shops) {
      const exists = await ShopDest.findById(shop._id);
      if (!exists) {
        await ShopDest.create(shop.toObject());
      }
    }
    
    // نسخ المستخدمين
    const users = await UserSource.find();
    console.log(`👥 نسخ ${users.length} مستخدم...`);
    for (const user of users) {
      const exists = await UserDest.findById(user._id);
      if (!exists) {
        await UserDest.create(user.toObject());
      }
    }
    
    // نسخ المنتجات
    const products = await ProductSource.find();
    console.log(`📦 نسخ ${products.length} منتج...`);
    for (const product of products) {
      const exists = await ProductDest.findById(product._id);
      if (!exists) {
        await ProductDest.create(product.toObject());
      }
    }
    
    console.log('\n✅ تم نسخ جميع البيانات بنجاح!');
    console.log('\n📊 الإحصائيات:');
    console.log(`- الأدوار: ${await RoleDest.countDocuments()}`);
    console.log(`- المتاجر: ${await ShopDest.countDocuments()}`);
    console.log(`- المستخدمين: ${await UserDest.countDocuments()}`);
    console.log(`- المنتجات: ${await ProductDest.countDocuments()}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ خطأ:', error);
    process.exit(1);
  }
}

copyData();
