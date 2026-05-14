import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Linking, Alert, Modal, TextInput, ScrollView, Image, Platform, Clipboard } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useTranslation } from '../translations';
import styles from './styles';
import { API_CONFIG, getMediaUrl } from '../config/api';

const BASE = API_CONFIG.BASE_URL;

const SHOP_CATEGORIES = [
  { id: 'food', icon: '🍔' },
  { id: 'grocery', icon: '🛒' },
  { id: 'pharmacy', icon: '💊' },
  { id: 'electronics', icon: '📱' },
  { id: 'fashion', icon: '👗' },
  { id: 'other', icon: '📦' },
];

const ShopInfo = ({ shop, visible, onClose, allowEdit = false, onShopUpdated }) => {
  const { t, currentLanguage } = useTranslation();
  const isRTL = currentLanguage === 'ar';

  const buildEditData = (s) => ({
    name: s.name || '',
    email: s.email || '',
    address: s.address || '',
    phone: s.phone || '',
    whatsapp: s.whatsapp || '',
    location: s.location || { latitude: '', longitude: '' },
    missingDataNote: s.missingDataNote || '',
    category: s.category || '',
    oldPassword: '',
    newPassword: '',
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(buildEditData(shop));
  const [updatedShop, setUpdatedShop] = useState(shop);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [showBankEditor, setShowBankEditor] = useState(false);
  const [newBank, setNewBank] = useState({ bankName: '', accountNumber: '', accountHolder: '' });
  const [mainImage, setMainImage] = useState(shop.mainImage || null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible && shop._id) {
      fetch(`${BASE}/shops/${shop._id}/bank-accounts`)
        .then(r => r.json())
        .then(data => Array.isArray(data) && setBankAccounts(data))
        .catch(() => {});
    }
  }, [visible, shop._id]);

  // Reset form when opening
  useEffect(() => {
    if (visible) {
      setEditData(buildEditData(shop));
      setIsEditing(false);
    }
  }, [visible]);

  const saveBankAccounts = async (accounts) => {
    try {
      const res = await fetch(`${BASE}/shops/${shop._id}/bank-accounts`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bankAccounts: accounts }),
      });
      if (res.ok) setBankAccounts(accounts);
    } catch {
      Alert.alert('', isRTL ? 'تعذر الحفظ' : 'Impossible de sauvegarder');
    }
  };

  const addBankAccount = () => {
    if (!newBank.bankName.trim() || !newBank.accountNumber.trim()) {
      Alert.alert('', isRTL ? 'اسم البنك ورقم الحساب مطلوبان' : 'Nom et numéro requis');
      return;
    }
    saveBankAccounts([...bankAccounts, { ...newBank }]);
    setNewBank({ bankName: '', accountNumber: '', accountHolder: '' });
  };

  const removeBankAccount = (index) => {
    saveBankAccounts(bankAccounts.filter((_, i) => i !== index));
  };

  const pickAndUploadMainImage = async () => {
    setUploadingImage(true);
    try {
      if (Platform.OS === 'web') {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = async (e) => {
          const file = e.target.files[0];
          if (!file) { setUploadingImage(false); return; }
          const formData = new FormData();
          formData.append('mainImage', file);
          try {
            const uploadRes = await fetch(`${BASE}/upload-shop-image`, { method: 'POST', body: formData });
            const uploadData = await uploadRes.json();
            if (uploadData.imagePath) {
              await fetch(`${BASE}/shops/${shop._id}/main-image`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mainImage: uploadData.imagePath }),
              });
              setMainImage(uploadData.imagePath);
              onShopUpdated?.({ ...updatedShop, mainImage: uploadData.imagePath });
              Alert.alert('', t('imageUpdated'));
            }
          } catch { Alert.alert('', isRTL ? 'تعذر الرفع' : 'Impossible de télécharger'); }
          finally { setUploadingImage(false); }
        };
        input.click();
        return;
      }
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') { Alert.alert('', t('galleryAccess')); setUploadingImage(false); return; }
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8 });
      if (result.canceled || !result.assets?.[0]) { setUploadingImage(false); return; }
      const formData = new FormData();
      formData.append('mainImage', { uri: result.assets[0].uri, type: 'image/jpeg', name: 'main.jpg' });
      const uploadRes = await fetch(`${BASE}/upload-shop-image`, { method: 'POST', body: formData });
      const uploadData = await uploadRes.json();
      if (uploadData.imagePath) {
        await fetch(`${BASE}/shops/${shop._id}/main-image`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mainImage: uploadData.imagePath }),
        });
        setMainImage(uploadData.imagePath);
        onShopUpdated?.({ ...updatedShop, mainImage: uploadData.imagePath });
        Alert.alert('', t('imageUpdated'));
      }
    } catch { Alert.alert('', isRTL ? 'تعذر الرفع' : 'Impossible de télécharger'); }
    finally { setUploadingImage(false); }
  };

  const openLocationOnMap = () => {
    const loc = updatedShop.location;
    if (loc?.latitude && loc?.longitude) {
      Linking.openURL(`https://maps.google.com/?q=${loc.latitude},${loc.longitude}`);
    } else {
      Alert.alert(t('info'), t('locationNotAvailable'));
    }
  };

  const handleSave = async () => {
    if (!editData.name.trim() || !editData.phone.trim()) {
      Alert.alert(t('error'), isRTL ? 'الاسم والهاتف مطلوبان' : 'Nom et téléphone requis');
      return;
    }
    setSaving(true);
    try {
      // Validate location if provided
      const lat = parseFloat(editData.location?.latitude);
      const lng = parseFloat(editData.location?.longitude);
      const hasValidLocation = !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0;

      const shopPayload = {
        name: editData.name,
        email: editData.email,
        address: editData.address,
        phone: editData.phone,
        whatsapp: editData.whatsapp,
        category: editData.category,
        missingDataNote: editData.missingDataNote,
        ...(hasValidLocation && { location: { latitude: lat, longitude: lng } }),
      };

      const shopRes = await fetch(`${BASE}/shops/${shop._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(shopPayload),
      });

      await fetch(`${BASE}/users/update-by-shop/${shop._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: editData.name, email: editData.email }),
      });

      // Change password if provided
      if (editData.oldPassword && editData.newPassword) {
        const pwRes = await fetch(`${BASE}/shops/${shop._id}/change-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ oldPassword: editData.oldPassword, newPassword: editData.newPassword }),
        });
        const pwData = await pwRes.json();
        if (!pwRes.ok) {
          Alert.alert(t('error'), pwData.error || (isRTL ? 'كلمة المرور القديمة غير صحيحة' : 'Ancien mot de passe incorrect'));
          setSaving(false);
          return;
        }
      }

      if (shopRes.ok) {
        const data = await shopRes.json();
        const newShop = data.shop || data;
        setUpdatedShop(newShop);
        onShopUpdated?.(newShop);
        setEditData(prev => ({ ...prev, oldPassword: '', newPassword: '' }));
        setIsEditing(false);
        Alert.alert(t('success'), isRTL ? 'تم التعديل بنجاح' : 'Modifié avec succès');
      } else {
        const errData = await shopRes.json().catch(() => ({}));
        Alert.alert(t('error'), errData.error || (isRTL ? 'تعذر التحديث' : 'Impossible de mettre à jour'));
      }
    } catch {
      Alert.alert(t('error'), isRTL ? 'خطأ في الاتصال' : 'Erreur de connexion');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditData(buildEditData(updatedShop));
    setIsEditing(false);
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.shopInfoOverlay}>
        <View style={styles.shopInfoContainer}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.shopInfoTitle}>
              {isEditing ? t('editInfo') : updatedShop.name}
            </Text>

            {isEditing ? (
              <>
                {/* Name */}
                <View style={styles.shopInfoItem}>
                  <Text style={styles.shopInfoLabel}>🏪 {isRTL ? 'الاسم' : 'Nom'}:</Text>
                  <TextInput
                    style={[styles.input, { marginTop: 5 }]}
                    value={editData.name}
                    onChangeText={v => setEditData(p => ({ ...p, name: v }))}
                    placeholder={isRTL ? 'اسم المتجر' : 'Nom de la boutique'}
                  />
                </View>

                {/* Email */}
                <View style={styles.shopInfoItem}>
                  <Text style={styles.shopInfoLabel}>📧 Email:</Text>
                  <TextInput
                    style={[styles.input, { marginTop: 5 }]}
                    value={editData.email}
                    onChangeText={v => setEditData(p => ({ ...p, email: v }))}
                    placeholder="Email"
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                {/* Address */}
                <View style={styles.shopInfoItem}>
                  <Text style={styles.shopInfoLabel}>📍 {isRTL ? 'العنوان' : 'Adresse'}:</Text>
                  <TextInput
                    style={[styles.input, { marginTop: 5 }]}
                    value={editData.address}
                    onChangeText={v => setEditData(p => ({ ...p, address: v }))}
                    placeholder={isRTL ? 'العنوان' : 'Adresse'}
                    multiline
                  />
                </View>

                {/* Phone */}
                <View style={styles.shopInfoItem}>
                  <Text style={styles.shopInfoLabel}>📞 {isRTL ? 'الهاتف' : 'Téléphone'}:</Text>
                  <TextInput
                    style={[styles.input, { marginTop: 5 }]}
                    value={editData.phone}
                    onChangeText={v => setEditData(p => ({ ...p, phone: v }))}
                    placeholder={isRTL ? 'رقم الهاتف' : 'Téléphone'}
                    keyboardType="phone-pad"
                  />
                </View>

                {/* WhatsApp */}
                <View style={styles.shopInfoItem}>
                  <Text style={styles.shopInfoLabel}>💬 WhatsApp:</Text>
                  <TextInput
                    style={[styles.input, { marginTop: 5 }]}
                    value={editData.whatsapp}
                    onChangeText={v => setEditData(p => ({ ...p, whatsapp: v }))}
                    placeholder="WhatsApp"
                    keyboardType="phone-pad"
                  />
                </View>

                {/* Category */}
                <View style={styles.shopInfoItem}>
                  <Text style={styles.shopInfoLabel}>🏷️ {isRTL ? 'الصنف' : 'Catégorie'}:</Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 5 }}>
                    {SHOP_CATEGORIES.map(cat => (
                      <TouchableOpacity
                        key={cat.id}
                        onPress={() => setEditData(p => ({ ...p, category: cat.id }))}
                        style={{
                          flexDirection: 'row', alignItems: 'center',
                          paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16,
                          backgroundColor: editData.category === cat.id ? '#FF6B35' : 'rgba(255,107,53,0.08)',
                          borderWidth: 1,
                          borderColor: editData.category === cat.id ? '#FF6B35' : 'rgba(255,107,53,0.2)',
                        }}
                      >
                        <Text style={{ fontSize: 13, marginRight: 3 }}>{cat.icon}</Text>
                        <Text style={{ fontSize: 11, color: editData.category === cat.id ? 'white' : '#FF6B35', fontWeight: '600' }}>
                          {cat.id}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Location - manual input */}
                <View style={styles.shopInfoItem}>
                  <Text style={styles.shopInfoLabel}>🗺️ {isRTL ? 'الموقع (إحداثيات)' : 'Localisation (coordonnées)'}:</Text>
                  <View style={{ flexDirection: 'row', gap: 8, marginTop: 5 }}>
                    <TextInput
                      style={[styles.input, { flex: 1, marginBottom: 0 }]}
                      value={editData.location?.latitude?.toString() || ''}
                      onChangeText={v => setEditData(p => ({ ...p, location: { ...p.location, latitude: v } }))}
                      placeholder={isRTL ? 'خط العرض' : 'Latitude'}
                      keyboardType="numeric"
                    />
                    <TextInput
                      style={[styles.input, { flex: 1, marginBottom: 0 }]}
                      value={editData.location?.longitude?.toString() || ''}
                      onChangeText={v => setEditData(p => ({ ...p, location: { ...p.location, longitude: v } }))}
                      placeholder={isRTL ? 'خط الطول' : 'Longitude'}
                      keyboardType="numeric"
                    />
                  </View>
                  {editData.location?.latitude && editData.location?.longitude && (
                    <TouchableOpacity
                      style={{ marginTop: 6, alignSelf: 'flex-start' }}
                      onPress={() => {
                        const lat = parseFloat(editData.location.latitude);
                        const lng = parseFloat(editData.location.longitude);
                        if (!isNaN(lat) && !isNaN(lng)) {
                          Linking.openURL(`https://maps.google.com/?q=${lat},${lng}`);
                        }
                      }}
                    >
                      <Text style={{ color: '#FF6B35', fontSize: 12 }}>🔍 {isRTL ? 'معاينة على الخريطة' : 'Aperçu sur la carte'}</Text>
                    </TouchableOpacity>
                  )}
                </View>

                {/* Password change */}
                <View style={styles.shopInfoItem}>
                  <Text style={styles.shopInfoLabel}>🔑 {isRTL ? 'تغيير كلمة المرور' : 'Changer le mot de passe'}:</Text>
                  <TextInput
                    style={[styles.input, { marginTop: 5 }]}
                    value={editData.oldPassword}
                    onChangeText={v => setEditData(p => ({ ...p, oldPassword: v }))}
                    placeholder={isRTL ? 'كلمة المرور الحالية' : 'Mot de passe actuel'}
                    secureTextEntry
                  />
                  <TextInput
                    style={[styles.input, { marginTop: 5 }]}
                    value={editData.newPassword}
                    onChangeText={v => setEditData(p => ({ ...p, newPassword: v }))}
                    placeholder={isRTL ? 'كلمة المرور الجديدة' : 'Nouveau mot de passe'}
                    secureTextEntry
                  />
                </View>

                {/* Save / Cancel buttons */}
                <View style={{ flexDirection: 'row', gap: 10, marginTop: 20, marginBottom: 10 }}>
                  <TouchableOpacity
                    style={[styles.closeInfoBtn, { flex: 1, backgroundColor: saving ? '#ccc' : '#FF6B35' }]}
                    onPress={handleSave}
                    disabled={saving}
                  >
                    <Text style={[styles.closeInfoBtnText, { color: 'white' }]}>
                      {saving ? (isRTL ? 'جاري الحفظ...' : 'Sauvegarde...') : t('save')}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.closeInfoBtn, { flex: 1, backgroundColor: '#ccc' }]}
                    onPress={handleCancel}
                    disabled={saving}
                  >
                    <Text style={styles.closeInfoBtnText}>{t('cancel')}</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <>
                <View style={styles.shopInfoItem}>
                  <Text style={styles.shopInfoLabel}>👤 {t('loginLabel')}:</Text>
                  <Text style={styles.shopInfoValue}>{updatedShop.email}</Text>
                </View>

                <View style={styles.shopInfoItem}>
                  <Text style={styles.shopInfoLabel}>📍 {t('addressLabel')}:</Text>
                  <Text style={styles.shopInfoValue}>{updatedShop.address}</Text>
                </View>

                <View style={styles.shopInfoItem}>
                  <Text style={styles.shopInfoLabel}>📞 {t('phoneLabel')}:</Text>
                  <TouchableOpacity onPress={() => Linking.openURL(`tel:${updatedShop.phone}`)}>
                    <Text style={[styles.shopInfoValue, { color: '#FF6B35' }]}>{updatedShop.phone}</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.shopInfoItem}>
                  <Text style={styles.shopInfoLabel}>💬 {t('whatsappLabel')}:</Text>
                  <TouchableOpacity onPress={() => Linking.openURL(`whatsapp://send?phone=${updatedShop.whatsapp}`)}>
                    <Text style={[styles.shopInfoValue, { color: '#25D366' }]}>{updatedShop.whatsapp}</Text>
                  </TouchableOpacity>
                </View>

                {updatedShop.category ? (
                  <View style={styles.shopInfoItem}>
                    <Text style={styles.shopInfoLabel}>🏷️ {isRTL ? 'الصنف' : 'Catégorie'}:</Text>
                    <Text style={[styles.shopInfoValue, { color: '#FF6B35' }]}>{updatedShop.category}</Text>
                  </View>
                ) : null}

                {updatedShop.location?.latitude && updatedShop.location?.longitude && (
                  <TouchableOpacity style={styles.locationBtn} onPress={openLocationOnMap}>
                    <Text style={styles.locationBtnText}>🗺️ {t('viewOnMap')}</Text>
                  </TouchableOpacity>
                )}

                {allowEdit && (
                  <TouchableOpacity
                    style={[styles.locationBtn, { backgroundColor: '#FF6B35', marginTop: 10 }]}
                    onPress={() => setIsEditing(true)}
                  >
                    <Text style={[styles.locationBtnText, { color: 'white' }]}>✏️ {t('edit')}</Text>
                  </TouchableOpacity>
                )}

                {/* Main Image */}
                {allowEdit && (
                  <View style={{ marginTop: 16 }}>
                    <Text style={[styles.shopInfoLabel, { fontSize: 14, fontWeight: 'bold', marginBottom: 8 }]}>
                      🖼️ {t('mainImage')}
                    </Text>
                    {mainImage ? (
                      <Image
                        source={{ uri: getMediaUrl(mainImage) }}
                        style={{ width: '100%', height: 160, borderRadius: 10, marginBottom: 8 }}
                        resizeMode="cover"
                      />
                    ) : null}
                    <TouchableOpacity
                      onPress={pickAndUploadMainImage}
                      disabled={uploadingImage}
                      style={{ backgroundColor: uploadingImage ? '#ccc' : '#3498db', padding: 10, borderRadius: 8, alignItems: 'center' }}
                    >
                      <Text style={{ color: 'white', fontWeight: 'bold' }}>
                        {uploadingImage ? '⏳...' : (mainImage ? t('changeImage') : t('addImage2'))}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* Bank Accounts */}
                <View style={{ marginTop: 16 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <Text style={[styles.shopInfoLabel, { fontSize: 14, fontWeight: 'bold' }]}>
                      🏦 {t('bankAccountsTitle')}
                    </Text>
                    {allowEdit && (
                      <TouchableOpacity
                        onPress={() => setShowBankEditor(!showBankEditor)}
                        style={{ backgroundColor: '#3498db', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }}
                      >
                        <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>
                          {showBankEditor ? t('closeBankEditor') : t('addBankAccount')}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  {bankAccounts.map((acc, i) => (
                    <View key={i} style={{ backgroundColor: '#f0f7ff', borderRadius: 8, padding: 10, marginBottom: 6, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontWeight: 'bold', color: '#333', fontSize: 13 }}>{acc.bankName}</Text>
                        <TouchableOpacity
                          onPress={() => {
                            if (Platform.OS === 'web') {
                              navigator.clipboard?.writeText(acc.accountNumber).catch(() => {});
                            } else {
                              Clipboard.setString(acc.accountNumber);
                            }
                            Alert.alert(isRTL ? '✅ تم النسخ' : '✅ Copié', acc.accountNumber, [{ text: 'OK' }], { cancelable: true });
                          }}
                          style={{ flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', marginTop: 2, gap: 6 }}
                        >
                          <Text style={{ color: '#3498db', fontSize: 13, fontWeight: 'bold', flex: 1 }}>{acc.accountNumber}</Text>
                          <View style={{ backgroundColor: '#3498db', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 }}>
                            <Text style={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}>
                              {isRTL ? '📋 نسخ' : '📋 Copier'}
                            </Text>
                          </View>
                        </TouchableOpacity>
                        {acc.accountHolder ? <Text style={{ color: '#555', fontSize: 12, marginTop: 2 }}>{acc.accountHolder}</Text> : null}
                      </View>
                      {allowEdit && (
                        <TouchableOpacity onPress={() => removeBankAccount(i)} style={{ padding: 6, marginLeft: 8 }}>
                          <Text style={{ color: '#e74c3c', fontSize: 16 }}>🗑</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  ))}

                  {allowEdit && showBankEditor && (
                    <View style={{ backgroundColor: 'white', borderRadius: 10, padding: 12, marginTop: 4 }}>
                      <TextInput
                        placeholder={t('bankNamePlaceholder')}
                        value={newBank.bankName}
                        onChangeText={v => setNewBank(p => ({ ...p, bankName: v }))}
                        style={[styles.input, { marginBottom: 6 }]}
                      />
                      <TextInput
                        placeholder={t('accountNumberPlaceholder')}
                        value={newBank.accountNumber}
                        onChangeText={v => setNewBank(p => ({ ...p, accountNumber: v }))}
                        style={[styles.input, { marginBottom: 6 }]}
                        keyboardType="numeric"
                      />
                      <TextInput
                        placeholder={t('accountHolderPlaceholder')}
                        value={newBank.accountHolder}
                        onChangeText={v => setNewBank(p => ({ ...p, accountHolder: v }))}
                        style={[styles.input, { marginBottom: 8 }]}
                      />
                      <TouchableOpacity
                        onPress={addBankAccount}
                        style={{ backgroundColor: '#2ecc71', padding: 10, borderRadius: 8, alignItems: 'center' }}
                      >
                        <Text style={{ color: 'white', fontWeight: 'bold' }}>{t('saveBankAccount')}</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </>
            )}

            <TouchableOpacity style={[styles.closeInfoBtn, { marginTop: 12 }]} onPress={onClose}>
              <Text style={styles.closeInfoBtnText}>{t('close')}</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default ShopInfo;
