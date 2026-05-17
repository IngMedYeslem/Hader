const mongoose = require('mongoose');
const Offer = require('./models/Offer');

mongoose.connect('mongodb://localhost:27017/hader').then(async () => {
  await Offer.deleteMany({});
  await Offer.insertMany([
    { title: 'عرض الأسبوع', subtitle: 'خصم 20% على جميع المنتجات', emoji: '🔥', color: '#FF6B35' },
    { title: 'توصيل مجاني', subtitle: 'على الطلبات فوق 500 MRU', emoji: '🚚', color: '#2C3E50' },
    { title: 'منتجات جديدة', subtitle: 'اكتشف أحدث المنتجات', emoji: '✨', color: '#8E44AD' },
  ]);
  console.log('✅ تم إضافة 3 عروض تجريبية');
  process.exit(0);
}).catch(e => { console.error(e); process.exit(1); });
