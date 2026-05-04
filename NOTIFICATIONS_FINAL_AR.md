# دليل الإشعارات - الحل النهائي

## ✅ التعديلات المنفذة

### 1. Backend (الخادم)
- ✅ إصلاح route الإشعارات في `routes/notifications.js`
- ✅ تبسيط `services/notificationService.js`
- ✅ إزالة التكرار في `server.js`
- ✅ تصحيح اسم قاعدة البيانات إلى `marketplace`

### 2. Frontend (الواجهة)
- ✅ إنشاء مكون `NotificationsList.js` جاهز للاستخدام

## 📱 كيفية الاستخدام

### الخطوة 1: استيراد المكون

في أي ملف تريد عرض الإشعارات فيه (مثل ShopDashboard):

```javascript
import NotificationsList from './NotificationsList';
```

### الخطوة 2: استخدام المكون

```javascript
// داخل المكون الخاص بك
<NotificationsList userId={currentUser._id} />
```

**مهم جداً:** استخدم `user._id` وليس `shop._id`

### مثال كامل:

```javascript
import React from 'react';
import { View } from 'react-native';
import NotificationsList from './NotificationsList';

const ShopDashboard = ({ user }) => {
  return (
    <View style={{ flex: 1 }}>
      <NotificationsList userId={user._id} />
    </View>
  );
};

export default ShopDashboard;
```

## 🔍 التحقق من عمل النظام

### 1. تشغيل الخادم
```bash
cd backend
node server.js
```

يجب أن ترى:
```
✅ Connexion MongoDB établie
Serveur démarré sur le port 3000
```

### 2. اختبار API مباشرة

افتح المتصفح أو Postman واختبر:

```
GET http://localhost:3000/api/notifications/{userId}
```

استبدل `{userId}` بمعرف المستخدم الفعلي.

### 3. إنشاء إشعار تجريبي

```bash
cd backend
node create-test-notification.js
```

## 🎯 سيناريو الاختبار الكامل

### 1. إنشاء متجر جديد
```javascript
// في تطبيقك
POST /api/shops/register
{
  "name": "متجر تجريبي",
  "email": "test@shop.com",
  "password": "123456",
  "address": "عنوان",
  "phone": "0612345678",
  "whatsapp": "0612345678",
  "location": {
    "latitude": 33.5731,
    "longitude": -7.5898
  }
}
```

احفظ `userId` من الاستجابة.

### 2. الموافقة على المتجر (من لوحة الإدارة)
```javascript
POST /api/users/{userId}/approve
```

### 3. التحقق من الإشعار
```javascript
GET /api/notifications/{userId}
```

يجب أن ترى:
```json
[
  {
    "_id": "...",
    "userId": "...",
    "title": "Boutique validée ✅",
    "body": "Votre boutique \"متجر تجريبي\" a été validée",
    "type": "shop_validated",
    "read": false,
    "createdAt": "2024-01-01T12:00:00.000Z"
  }
]
```

### 4. عرض الإشعار في التطبيق
```javascript
<NotificationsList userId={userId} />
```

## 🔧 استكشاف الأخطاء

### المشكلة: لا توجد إشعارات

**الحل 1:** تحقق من userId
```javascript
console.log('User ID:', user._id);
// يجب أن يكون شيء مثل: 507f1f77bcf86cd799439011
```

**الحل 2:** تحقق من قاعدة البيانات
```bash
mongosh
use marketplace
db.notifications.find()
```

**الحل 3:** تحقق من الخادم
```bash
# يجب أن يكون قيد التشغيل
cd backend
node server.js
```

### المشكلة: خطأ في الاتصال

**الحل:** تحقق من API_URL في `.env`:
```
API_URL=http://localhost:3000
```

### المشكلة: الإشعار لا يظهر بعد الموافقة

**الحل:** تحقق من logs الخادم:
```bash
# يجب أن ترى:
🔔 Envoi notification pour boutique: اسم المتجر
✅ Notification sauvegardée
```

## 📋 قائمة التحقق النهائية

- [ ] الخادم يعمل (`node server.js`)
- [ ] MongoDB متصلة
- [ ] API_URL صحيح في `.env`
- [ ] استخدام `user._id` وليس `shop._id`
- [ ] المكون `NotificationsList` مستورد بشكل صحيح
- [ ] تم تمرير `userId` للمكون

## 🎨 تخصيص المكون

### تغيير الألوان:
```javascript
const styles = StyleSheet.create({
  unread: {
    backgroundColor: '#e3f2fd', // لون الإشعارات غير المقروءة
    borderLeftColor: '#2196f3'  // لون الحد الأيسر
  }
});
```

### إضافة أيقونات:
```javascript
import Icon from 'react-native-vector-icons/MaterialIcons';

<View style={styles.notificationCard}>
  <Icon name="notifications" size={24} color="#2196f3" />
  <Text>{item.title}</Text>
</View>
```

### تصفية حسب النوع:
```javascript
const unreadNotifications = notifications.filter(n => !n.read);
const shopNotifications = notifications.filter(n => n.type === 'shop_validated');
```

## 📞 الدعم

إذا واجهت أي مشكلة:

1. **تحقق من logs الخادم** في terminal
2. **تحقق من console logs** في التطبيق
3. **اختبر API مباشرة** باستخدام Postman
4. **تحقق من قاعدة البيانات** باستخدام mongosh

## 🚀 الخطوات التالية

بعد التأكد من عمل الإشعارات:

1. **إضافة إشعارات push** باستخدام Expo Notifications
2. **إضافة أصوات** للإشعارات
3. **إضافة badges** لعدد الإشعارات غير المقروءة
4. **إضافة تصنيفات** للإشعارات (طلبات، منتجات، إلخ)

---

**تم إصلاح جميع المشاكل ✅**

النظام جاهز للاستخدام الآن!
