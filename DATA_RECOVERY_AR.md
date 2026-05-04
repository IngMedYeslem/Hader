# حل مشكلة المتاجر والحسابات المفقودة

## 🔍 المشكلة
المتاجر والحسابات كانت تظهر ولكن اختفت فجأة.

## ✅ السبب
تم تغيير اسم قاعدة البيانات من `ecommerce` إلى `marketplace` في `server.js`، لكن البيانات الفعلية موجودة في `ecommerce`.

## 📊 البيانات الموجودة في ecommerce:
- ✅ 30 متجر
- ✅ 22 حساب مستخدم
- ✅ 20 منتج

## 🔧 الحل (تم تطبيقه)

### تم إرجاع اسم قاعدة البيانات في server.js:
```javascript
// من
mongoose.connect('mongodb://localhost:27017/marketplace', {

// إلى
mongoose.connect('mongodb://localhost:27017/ecommerce', {
```

## ✅ النتيجة
الآن الخادم يستخدم قاعدة `ecommerce` حيث توجد جميع بياناتك.

## 🧪 التحقق

### 1. تشغيل الخادم:
```bash
cd backend
node server.js
```

### 2. فحص البيانات:
```bash
node check-ecommerce.js
```

يجب أن ترى:
```
📊 عدد المتاجر: 30
👥 عدد الحسابات: 22
📦 عدد المنتجات: 20
```

### 3. اختبار API:
```bash
# جلب المتاجر
curl http://localhost:3000/api/shops

# جلب المستخدمين
curl http://localhost:3000/api/users
```

## 📋 قائمة المتاجر الموجودة:
1. ديسق
2. B2, B3, B4, B5, B6, B7, B8, B9, B10
3. B12, B13, B15, B16, B20, B200
4. b22, B23, B24, B26, B30, b31
5. b409, b70, d1
6. القمة للالكترونيات
7. BZbi
8. اوردف
9. Matjar1, Matjer2

## 📋 قائمة الحسابات:
- admin (مصادق عليه)
- yeslem (مصادق عليه)
- B2, b22, B23, B24, B26, B30, b31 (مصادق عليهم)
- b40, b70, d1 (مصادق عليهم)
- القمة للالكترونيات، BZbi، اوردف (مصادق عليهم)
- Matjar1, Matjer2 (مصادق عليهم)
- B15, B16, B20, B200 (في انتظار المصادقة)

## 🔄 خيار بديل: نسخ البيانات إلى marketplace

إذا أردت استخدام قاعدة `marketplace` بدلاً من `ecommerce`:

```bash
cd backend
node copy-data.js
```

هذا سينسخ جميع البيانات من `ecommerce` إلى `marketplace`.

ثم غير في `server.js`:
```javascript
mongoose.connect('mongodb://localhost:27017/marketplace', {
```

## ⚠️ ملاحظات مهمة

### 1. لا تحذف قاعدة ecommerce
بياناتك الأصلية موجودة فيها.

### 2. استخدم قاعدة واحدة فقط
إما `ecommerce` أو `marketplace`، لا تتنقل بينهما.

### 3. النسخ الاحتياطي
قبل أي تغيير، انسخ قاعدة البيانات:
```bash
mongodump --db ecommerce --out backup/
```

### 4. الاستعادة
لاستعادة النسخة الاحتياطية:
```bash
mongorestore --db ecommerce backup/ecommerce/
```

## 🎯 التوصية

**استمر في استخدام قاعدة `ecommerce`** لأن:
- ✅ جميع بياناتك موجودة فيها
- ✅ لا حاجة لنسخ البيانات
- ✅ تجنب فقدان البيانات

## 📞 سكريبتات مفيدة

### فحص قاعدة ecommerce:
```bash
node check-ecommerce.js
```

### فحص قاعدة marketplace:
```bash
node check-data.js
```

### نسخ البيانات:
```bash
node copy-data.js
```

## ✅ الخلاصة

**تم حل المشكلة!**

- ✅ تم إرجاع اسم قاعدة البيانات إلى `ecommerce`
- ✅ جميع المتاجر والحسابات موجودة
- ✅ النظام جاهز للعمل

فقط أعد تشغيل الخادم:
```bash
cd backend
node server.js
```

وستجد جميع بياناتك كما كانت! 🎉
