# دليل حل مشكلة الإشعارات

## المشكلة
لم تظهر الإشعارات بعد الموافقة على المتجر

## الحل السريع

### الخطوة 1: تحديث ملف الإشعارات في الواجهة الأمامية

أضف هذا الكود في المكون الذي يعرض الإشعارات:

```javascript
import { API_URL } from '../config/api';

// جلب الإشعارات
const fetchNotifications = async (userId) => {
  try {
    const response = await fetch(`${API_URL}/api/notifications/${userId}`);
    const data = await response.json();
    console.log('📨 الإشعارات:', data);
    return data;
  } catch (error) {
    console.error('❌ خطأ:', error);
    return [];
  }
};
```

### الخطوة 2: التحقق من userId

تأكد من استخدام `userId` الصحيح (وليس `shopId`):

```javascript
// ✅ صحيح
const notifications = await fetchNotifications(user._id);

// ❌ خطأ
const notifications = await fetchNotifications(shop._id);
```

### الخطوة 3: اختبار الإشعارات يدوياً

قم بتشغيل هذا الأمر للتحقق:

```bash
cd backend
node check-notifications-ar.js
```

### الخطوة 4: إنشاء إشعار تجريبي

قم بتشغيل هذا السكريبت لإنشاء إشعار تجريبي:

```bash
cd backend
node create-test-notification.js
```

## التحقق من الإعدادات

### 1. تحقق من اتصال MongoDB
```bash
# في terminal
mongosh
use marketplace
db.notifications.find()
```

### 2. تحقق من API_URL
في ملف `.env` الخاص بالواجهة الأمامية:
```
API_URL=http://localhost:3000
```

### 3. تحقق من تشغيل الخادم
```bash
cd backend
node server.js
```

يجب أن ترى:
```
✅ MongoDB connecté
🚀 Serveur démarré sur le port 3000
```

## اختبار كامل

### 1. إنشاء متجر جديد
- سجل متجر جديد
- احفظ `userId` من الاستجابة

### 2. الموافقة على المتجر
```bash
# في Postman أو curl
POST http://localhost:3000/api/users/{userId}/approve
```

### 3. التحقق من الإشعار
```bash
GET http://localhost:3000/api/notifications/{userId}
```

يجب أن ترى:
```json
[
  {
    "_id": "...",
    "userId": "...",
    "title": "Boutique validée ✅",
    "body": "Votre boutique \"...\" a été validée",
    "type": "shop_validated",
    "read": false,
    "createdAt": "..."
  }
]
```

## الأخطاء الشائعة

### خطأ 1: userId غير صحيح
**المشكلة:** استخدام `shopId` بدلاً من `userId`
**الحل:** استخدم `user._id` من جدول Users

### خطأ 2: API_URL غير صحيح
**المشكلة:** عنوان API خاطئ
**الحل:** تحقق من ملف `.env`

### خطأ 3: الخادم لا يعمل
**المشكلة:** الخادم متوقف
**الحل:** 
```bash
cd backend
node server.js
```

### خطأ 4: MongoDB غير متصل
**المشكلة:** قاعدة البيانات متوقفة
**الحل:**
```bash
# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

## مكون الإشعارات الكامل

```javascript
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { API_URL } from '../config/api';

const NotificationsList = ({ userId }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await fetch(`${API_URL}/api/notifications/${userId}`);
      const data = await response.json();
      setNotifications(data);
    } catch (error) {
      console.error('خطأ في جلب الإشعارات:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderNotification = ({ item }) => (
    <View style={styles.notificationCard}>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.body}>{item.body}</Text>
      <Text style={styles.date}>
        {new Date(item.createdAt).toLocaleDateString('ar')}
      </Text>
    </View>
  );

  if (loading) {
    return <Text>جاري التحميل...</Text>;
  }

  if (notifications.length === 0) {
    return <Text>لا توجد إشعارات</Text>;
  }

  return (
    <FlatList
      data={notifications}
      renderItem={renderNotification}
      keyExtractor={(item) => item._id}
    />
  );
};

const styles = StyleSheet.create({
  notificationCard: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 8,
    borderRadius: 8
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4
  },
  body: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4
  },
  date: {
    fontSize: 12,
    color: '#999'
  }
});

export default NotificationsList;
```

## استخدام المكون

```javascript
// في ShopDashboard أو أي مكون آخر
import NotificationsList from './NotificationsList';

// داخل المكون
<NotificationsList userId={currentUser._id} />
```

## ملاحظات مهمة

1. **استخدم userId وليس shopId** - الإشعارات مرتبطة بالمستخدم
2. **تحقق من الخادم** - يجب أن يكون قيد التشغيل
3. **تحقق من MongoDB** - يجب أن تكون متصلة
4. **استخدم API_URL الصحيح** - تحقق من ملف .env

## الدعم

إذا استمرت المشكلة:
1. تحقق من سجلات الخادم (server logs)
2. تحقق من سجلات المتصفح (console logs)
3. استخدم Postman لاختبار API مباشرة
4. تحقق من قاعدة البيانات مباشرة باستخدام mongosh
