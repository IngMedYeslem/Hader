import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, Modal, ScrollView,
  Switch, Alert, Platform, TextInput, SafeAreaView
} from 'react-native';
import { API_URL } from '../config/api';

const DAYS_AR = ['أحد', 'اثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'];
const DAYS_FR = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

export default function ShopSchedule({ shop, visible, onClose, onSaved, isRTL }) {
  const initSchedule = () => ({
    enabled:   shop?.schedule?.enabled   ?? false,
    openTime:  shop?.schedule?.openTime  ?? '08:00',
    closeTime: shop?.schedule?.closeTime ?? '22:00',
    days:      shop?.schedule?.days      ?? [0, 1, 2, 3, 4, 5, 6],
  });

  const [schedule, setSchedule] = useState(initSchedule);
  const [saving, setSaving] = useState(false);

  const toggleDay = (dayIndex) => {
    const days = schedule.days.includes(dayIndex)
      ? schedule.days.filter(d => d !== dayIndex)
      : [...schedule.days, dayIndex].sort((a, b) => a - b);
    setSchedule(s => ({ ...s, days }));
  };

  const setTime = (field, value) => {
    // يقبل فقط HH:MM
    const cleaned = value.replace(/[^0-9:]/g, '').slice(0, 5);
    setSchedule(s => ({ ...s, [field]: cleaned }));
  };

  const save = async () => {
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (schedule.enabled) {
      if (!timeRegex.test(schedule.openTime) || !timeRegex.test(schedule.closeTime)) {
        const msg = isRTL ? 'صيغة الوقت غير صحيحة (HH:MM)' : 'Format d\'heure invalide (HH:MM)';
        Platform.OS === 'web' ? window.alert(msg) : Alert.alert('', msg);
        return;
      }
      if (schedule.days.length === 0) {
        const msg = isRTL ? 'اختر يوماً واحداً على الأقل' : 'Choisissez au moins un jour';
        Platform.OS === 'web' ? window.alert(msg) : Alert.alert('', msg);
        return;
      }
    }

    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/shops/${shop._id}/schedule`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(schedule),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(`${res.status}: ${body.error || 'server error'}`);
      }
      onSaved({ ...shop, schedule });
      onClose();
    } catch (e) {
      const detail = e.message || '';
      const msg = isRTL
        ? `فشل الحفظ\n${detail}`
        : `Échec de la sauvegarde\n${detail}`;
      Platform.OS === 'web' ? window.alert(msg) : Alert.alert(isRTL ? 'خطأ' : 'Erreur', msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
        {/* Header */}
        <View style={{ backgroundColor: '#FF6B35', padding: 16, flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={{ color: 'white', fontSize: 17, fontWeight: 'bold' }}>
            🕐 {isRTL ? 'أوقات عمل المتجر' : 'Horaires du magasin'}
          </Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 24 }}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={{ padding: 20 }}>
          {/* تفعيل الجدول */}
          <View style={{ backgroundColor: '#f8f8f8', borderRadius: 14, padding: 16, marginBottom: 16, flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 15, fontWeight: 'bold', color: '#333', textAlign: isRTL ? 'right' : 'left' }}>
                {isRTL ? 'تفعيل جدول الأوقات' : 'Activer les horaires'}
              </Text>
              <Text style={{ fontSize: 12, color: '#777', marginTop: 3, textAlign: isRTL ? 'right' : 'left' }}>
                {isRTL
                  ? schedule.enabled ? 'المتجر سيُغلق تلقائياً خارج أوقات العمل' : 'المتجر مفتوح دائماً'
                  : schedule.enabled ? 'Fermeture automatique hors horaires' : 'Magasin toujours ouvert'}
              </Text>
            </View>
            <Switch
              value={schedule.enabled}
              onValueChange={v => setSchedule(s => ({ ...s, enabled: v }))}
              trackColor={{ false: '#ddd', true: '#FF6B35' }}
              thumbColor="white"
            />
          </View>

          {schedule.enabled && (
            <>
              {/* أوقات الفتح والإغلاق */}
              <View style={{ backgroundColor: 'white', borderRadius: 14, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#eee' }}>
                <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#555', marginBottom: 14, textAlign: isRTL ? 'right' : 'left' }}>
                  {isRTL ? '⏰ أوقات الدوام' : '⏰ Heures d\'ouverture'}
                </Text>

                <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', gap: 12 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 12, color: '#888', marginBottom: 6, textAlign: isRTL ? 'right' : 'left' }}>
                      {isRTL ? 'وقت الفتح' : 'Ouverture'}
                    </Text>
                    <TextInput
                      value={schedule.openTime}
                      onChangeText={v => setTime('openTime', v)}
                      placeholder="08:00"
                      keyboardType="numbers-and-punctuation"
                      style={{
                        borderWidth: 1, borderColor: '#ddd', borderRadius: 10,
                        padding: 12, fontSize: 18, textAlign: 'center',
                        fontWeight: 'bold', color: '#2ecc71'
                      }}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 12, color: '#888', marginBottom: 6, textAlign: isRTL ? 'right' : 'left' }}>
                      {isRTL ? 'وقت الإغلاق' : 'Fermeture'}
                    </Text>
                    <TextInput
                      value={schedule.closeTime}
                      onChangeText={v => setTime('closeTime', v)}
                      placeholder="22:00"
                      keyboardType="numbers-and-punctuation"
                      style={{
                        borderWidth: 1, borderColor: '#ddd', borderRadius: 10,
                        padding: 12, fontSize: 18, textAlign: 'center',
                        fontWeight: 'bold', color: '#e74c3c'
                      }}
                    />
                  </View>
                </View>

                <Text style={{ fontSize: 11, color: '#aaa', marginTop: 8, textAlign: 'center' }}>
                  {isRTL ? 'الصيغة: ساعة:دقيقة (مثال 08:00)' : 'Format 24h — ex: 08:00 / 22:00'}
                </Text>
              </View>

              {/* أيام العمل */}
              <View style={{ backgroundColor: 'white', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: '#eee' }}>
                <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#555', marginBottom: 14, textAlign: isRTL ? 'right' : 'left' }}>
                  {isRTL ? '📅 أيام العمل' : '📅 Jours de travail'}
                </Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
                  {[0, 1, 2, 3, 4, 5, 6].map(day => {
                    const active = schedule.days.includes(day);
                    return (
                      <TouchableOpacity
                        key={day}
                        onPress={() => toggleDay(day)}
                        style={{
                          paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10,
                          backgroundColor: active ? '#FF6B35' : '#f0f0f0',
                          minWidth: 48, alignItems: 'center',
                        }}
                      >
                        <Text style={{ color: active ? 'white' : '#666', fontWeight: active ? 'bold' : 'normal', fontSize: 13 }}>
                          {isRTL ? DAYS_AR[day] : DAYS_FR[day]}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </>
          )}

          {/* معاينة الحالة */}
          <View style={{ backgroundColor: schedule.enabled ? '#fff8e1' : '#e8f5e9', borderRadius: 12, padding: 14, marginTop: 16, alignItems: 'center' }}>
            <Text style={{ fontSize: 13, color: schedule.enabled ? '#e65100' : '#2e7d32', fontWeight: '600' }}>
              {schedule.enabled
                ? (isRTL
                    ? `المتجر مفتوح من ${schedule.openTime} إلى ${schedule.closeTime}`
                    : `Ouvert de ${schedule.openTime} à ${schedule.closeTime}`)
                : (isRTL ? '🟢 المتجر مفتوح على مدار الساعة' : '🟢 Magasin ouvert en permanence')}
            </Text>
          </View>
        </ScrollView>

        {/* زر الحفظ */}
        <View style={{ padding: 16, paddingBottom: 24, borderTopWidth: 1, borderTopColor: '#eee' }}>
          <TouchableOpacity
            onPress={save}
            disabled={saving}
            style={{ backgroundColor: saving ? '#ccc' : '#FF6B35', borderRadius: 14, padding: 16, alignItems: 'center' }}
          >
            <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>
              {saving ? '⏳...' : (isRTL ? '💾 حفظ الإعدادات' : '💾 Enregistrer')}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}
