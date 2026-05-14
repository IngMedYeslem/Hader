import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { API_URL } from '../config/api';

const ReviewForm = ({ orderId, customerPhone, customerName, shopName, onDone, onBack, route, navigation }) => {
  // دعم الاستخدام كـ inline component أو كـ screen في React Navigation
  const _orderId = orderId ?? route?.params?.orderId;
  const _customerPhone = customerPhone ?? route?.params?.customerPhone;
  const _customerName = customerName ?? route?.params?.customerName ?? '';
  const _shopName = shopName ?? route?.params?.shopName ?? '';
  const _goBack = onBack ?? onDone ?? (() => navigation?.goBack?.());

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [canReview, setCanReview] = useState(null);

  useEffect(() => {
    if (!_orderId) { setCanReview(false); return; }
    fetch(`${API_URL}/orders/${_orderId}/can-review`)
      .then(r => r.json())
      .then(data => setCanReview(data.canReview))
      .catch(() => setCanReview(true));
  }, [_orderId]);

  const submitReview = async () => {
    if (rating === 0) {
      Alert.alert('خطأ', 'يرجى اختيار تقييم');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: _orderId, customerPhone: _customerPhone, customerName: _customerName, rating, comment })
      });
      const data = await response.json();
      if (data.success) {
        Alert.alert('شكراً!', 'تم حفظ تقييمك بنجاح', [
          { text: 'حسناً', onPress: _goBack }
        ]);
      } else {
        Alert.alert('خطأ', data.error || 'فشل إرسال التقييم');
      }
    } catch {
      Alert.alert('خطأ', 'تعذر الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  };

  if (canReview === null) return <ActivityIndicator style={{ flex: 1 }} color="#FF6B35" />;

  if (!canReview) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>⭐ تقييم المتجر</Text>
        <Text style={{ textAlign: 'center', color: '#888', fontSize: 15, marginTop: 20 }}>
          تم تقييم هذه الطلبية مسبقاً أو لم يتم تسليمها بعد.
        </Text>
        <TouchableOpacity style={[styles.button, { marginTop: 30 }]} onPress={_goBack}>
          <Text style={styles.buttonText}>رجوع</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>⭐ تقييم المتجر</Text>
      {_shopName ? <Text style={styles.shopName}>{_shopName}</Text> : null}

      <Text style={styles.label}>اختر تقييمك</Text>
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map(star => (
          <TouchableOpacity key={star} onPress={() => setRating(star)} style={styles.starBtn}>
            <Text style={[styles.star, star <= rating && styles.starActive]}>
              {star <= rating ? '⭐' : '☆'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {rating > 0 && (
        <Text style={styles.ratingLabel}>
          {['', 'سيء', 'مقبول', 'جيد', 'جيد جداً', 'ممتاز'][rating]}
        </Text>
      )}

      <Text style={styles.label}>تعليق (اختياري)</Text>
      <TextInput
        style={styles.input}
        placeholder="شاركنا تجربتك..."
        value={comment}
        onChangeText={setComment}
        multiline
        numberOfLines={4}
        textAlignVertical="top"
      />

      <TouchableOpacity
        style={[styles.button, (loading || rating === 0) && styles.buttonDisabled]}
        onPress={submitReview}
        disabled={loading || rating === 0}
      >
        {loading
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.buttonText}>إرسال التقييم</Text>
        }
      </TouchableOpacity>

      <TouchableOpacity onPress={_goBack} style={styles.skipBtn}>
        <Text style={styles.skipText}>تخطي</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', color: '#333', marginBottom: 4 },
  shopName: { fontSize: 15, textAlign: 'center', color: '#FF6B35', marginBottom: 20 },
  label: { fontSize: 14, color: '#555', marginBottom: 8, marginTop: 16 },
  starsContainer: { flexDirection: 'row', justifyContent: 'center', gap: 8 },
  starBtn: { padding: 4 },
  star: { fontSize: 38, color: '#ccc' },
  starActive: { color: '#FFD700' },
  ratingLabel: { textAlign: 'center', color: '#FF6B35', fontWeight: '600', marginTop: 6, fontSize: 14 },
  input: {
    borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 10,
    padding: 12, height: 100, fontSize: 14, color: '#333', backgroundColor: '#fafafa'
  },
  button: {
    backgroundColor: '#FF6B35', padding: 16, borderRadius: 12,
    alignItems: 'center', marginTop: 24
  },
  buttonDisabled: { backgroundColor: '#ccc' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  skipBtn: { alignItems: 'center', marginTop: 12 },
  skipText: { color: '#aaa', fontSize: 14 }
});

export default ReviewForm;
