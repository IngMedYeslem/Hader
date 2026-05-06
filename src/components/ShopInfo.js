import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Linking, Alert, Modal, TextInput, ScrollView, Image, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useTranslation } from '../translations';
import styles from './styles';
import { API_CONFIG, getMediaUrl } from '../config/api';

const BASE = API_CONFIG.BASE_URL;

const ShopInfo = ({ shop, visible, onClose, allowEdit = false }) => {
  const { t, currentLanguage } = useTranslation();
  const isRTL = currentLanguage === 'ar';
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingLocation, setIsEditingLocation] = useState(false);
  const [editData, setEditData] = useState({
    name: shop.name || '',
    email: shop.email || '',
    address: shop.address || '',
    phone: shop.phone || '',
    whatsapp: shop.whatsapp || '',
    location: shop.location || { latitude: '', longitude: '' },
    missingDataNote: shop.missingDataNote || ''
  });
  const [updatedShop, setUpdatedShop] = useState(shop);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [showBankEditor, setShowBankEditor] = useState(false);
  const [newBank, setNewBank] = useState({ bankName: '', accountNumber: '', accountHolder: '' });
  const [mainImage, setMainImage] = useState(shop.mainImage || null);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    if (visible && shop._id) {
      fetch(`${BASE}/shops/${shop._id}/bank-accounts`)
        .then(r => r.json())
        .then(data => Array.isArray(data) && setBankAccounts(data))
        .catch(() => {});
    }
  }, [visible, shop._id]);

  const saveBankAccounts = async (accounts) => {
    try {
      const res = await fetch(`${BASE}/shops/${shop._id}/bank-accounts`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bankAccounts: accounts }),
      });
      if (res.ok) setBankAccounts(accounts);
    } catch (e) {
      Alert.alert('Erreur', 'Impossible de sauvegarder');
    }
  };

  const addBankAccount = () => {
    if (!newBank.bankName.trim() || !newBank.accountNumber.trim()) {
      Alert.alert('', 'اسم البنك ورقم الحساب مطلوبان');
      return;
    }
    const updated = [...bankAccounts, { ...newBank }];
    saveBankAccounts(updated);
    setNewBank({ bankName: '', accountNumber: '', accountHolder: '' });
  };

  const removeBankAccount = (index) => {
    const updated = bankAccounts.filter((_, i) => i !== index);
    saveBankAccounts(updated);
  };

  const pickAndUploadMainImage = async () => {
    setUploadingImage(true);
    try {
      if (Platform.OS === 'web') {
        // Web: use file input
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
              Alert.alert('', isRTL ? 'تم رفع الصورة بنجاح' : 'Image mise à jour');
            }
          } catch (e) { Alert.alert('Erreur', 'Impossible de télécharger'); }
          finally { setUploadingImage(false); }
        };
        input.click();
        return;
      }
      // Mobile: use ImagePicker
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') { Alert.alert('', 'يجب السماح بالوصول للصور'); setUploadingImage(false); return; }
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
        Alert.alert('', isRTL ? 'تم رفع الصورة بنجاح' : 'Image mise à jour');
      }
    } catch (e) { Alert.alert('Erreur', 'Impossible de télécharger'); }
    finally { setUploadingImage(false); }
  };
  const handleCall = (number) => {
    Linking.openURL(`tel:${number}`);
  };

  const handleWhatsApp = (number) => {
    Linking.openURL(`whatsapp://send?phone=${number}`);
  };

  const handleLocation = () => {
    if (shop.location?.latitude && shop.location?.longitude) {
      const url = `https://maps.google.com/?q=${shop.location.latitude},${shop.location.longitude}`;
      Linking.openURL(url);
    } else {
      Alert.alert(t('info'), t('locationNotAvailable'));
    }
  };

  const handleSave = async () => {
    try {
      const shopResponse = await fetch(`${BASE}/shops/${shop._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData)
      });
      
      const userResponse = await fetch(`${BASE}/users/update-by-shop/${shop._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: editData.name, email: editData.email })
      });
      
      if (shopResponse.ok && userResponse.ok) {
        const updatedShopData = await shopResponse.json();
        setUpdatedShop(updatedShopData.shop);
        Alert.alert('Succès', 'Informations mises à jour');
        setIsEditing(false);
        onClose();
      } else {
        Alert.alert('Erreur', 'Impossible de mettre à jour');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Erreur de connexion');
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.shopInfoOverlay}>
        <View style={styles.shopInfoContainer}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.shopInfoTitle}>
              {isEditing ? 'Modifier les informations' : shop.name}
            </Text>
            
            {isEditing ? (
              <>
                <View style={styles.shopInfoItem}>
                  <Text style={styles.shopInfoLabel}>🏪 Nom:</Text>
                  <TextInput
                    style={[styles.input, { marginTop: 5 }]}
                    value={editData.name}
                    onChangeText={(text) => setEditData({...editData, name: text})}
                    placeholder="Nom de la boutique"
                  />
                </View>
                
                <View style={styles.shopInfoItem}>
                  <Text style={styles.shopInfoLabel}>👤 Email:</Text>
                  <TextInput
                    style={[styles.input, { marginTop: 5 }]}
                    value={editData.email}
                    onChangeText={(text) => setEditData({...editData, email: text})}
                    placeholder="Email"
                    keyboardType="email-address"
                  />
                </View>
                
                <View style={styles.shopInfoItem}>
                  <Text style={styles.shopInfoLabel}>📍 Adresse:</Text>
                  <TextInput
                    style={[styles.input, { marginTop: 5 }]}
                    value={editData.address}
                    onChangeText={(text) => setEditData({...editData, address: text})}
                    placeholder="Adresse"
                    multiline
                  />
                </View>
                
                <View style={styles.shopInfoItem}>
                  <Text style={styles.shopInfoLabel}>📞 Téléphone:</Text>
                  <TextInput
                    style={[styles.input, { marginTop: 5 }]}
                    value={editData.phone}
                    onChangeText={(text) => setEditData({...editData, phone: text})}
                    placeholder="Téléphone"
                    keyboardType="phone-pad"
                  />
                </View>
                
                <View style={styles.shopInfoItem}>
                  <Text style={styles.shopInfoLabel}>💬 WhatsApp:</Text>
                  <TextInput
                    style={[styles.input, { marginTop: 5 }]}
                    value={editData.whatsapp}
                    onChangeText={(text) => setEditData({...editData, whatsapp: text})}
                    placeholder="WhatsApp"
                    keyboardType="phone-pad"
                  />
                </View>
                
                <TouchableOpacity 
                  style={[styles.locationBtn, { marginTop: 10 }]} 
                  onPress={handleLocation}
                >
                  <Text style={styles.locationBtnText}>
                    🗺️ {editData.location.latitude && editData.location.longitude 
                      ? 'Modifier localisation sur carte' 
                      : 'Définir localisation sur carte'}
                  </Text>
                </TouchableOpacity>
                
                <View style={{ flexDirection: 'row', gap: 10, marginTop: 20 }}>
                  <TouchableOpacity 
                    style={[styles.closeInfoBtn, { flex: 1, backgroundColor: '#FF6B35' }]} 
                    onPress={handleSave}
                  >
                    <Text style={[styles.closeInfoBtnText, { color: 'white' }]}>Sauvegarder</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.closeInfoBtn, { flex: 1, backgroundColor: '#ccc' }]} 
                    onPress={() => setIsEditing(false)}
                  >
                    <Text style={styles.closeInfoBtnText}>Annuler</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <>
                <View style={styles.shopInfoItem}>
                  <Text style={styles.shopInfoLabel}>👤 {t('loginLabel')}:</Text>
                  <Text style={styles.shopInfoValue}>{shop.email}</Text>
                </View>
                
                <View style={styles.shopInfoItem}>
                  <Text style={styles.shopInfoLabel}>📍 {t('addressLabel')}:</Text>
                  <Text style={styles.shopInfoValue}>{shop.address}</Text>
                </View>
                
                <View style={styles.shopInfoItem}>
                  <Text style={styles.shopInfoLabel}>📞 {t('phoneLabel')}:</Text>
                  <TouchableOpacity onPress={() => handleCall(shop.phone)}>
                    <Text style={[styles.shopInfoValue, { color: '#FF6B35' }]}>{shop.phone}</Text>
                  </TouchableOpacity>
                </View>
                
                <View style={styles.shopInfoItem}>
                  <Text style={styles.shopInfoLabel}>💬 {t('whatsappLabel')}:</Text>
                  <TouchableOpacity onPress={() => handleWhatsApp(updatedShop.whatsapp)}>
                    <Text style={[styles.shopInfoValue, { color: '#25D366' }]}>{updatedShop.whatsapp}</Text>
                  </TouchableOpacity>
                </View>
                
                {updatedShop.location?.latitude && updatedShop.location?.longitude && (
                  <TouchableOpacity style={styles.locationBtn} onPress={handleLocation}>
                    <Text style={styles.locationBtnText}>🗺️ {t('viewOnMap')}</Text>
                  </TouchableOpacity>
                )}
                
                {allowEdit && (
                  <TouchableOpacity 
                    style={[styles.locationBtn, { backgroundColor: '#FF6B35', marginTop: 10 }]} 
                    onPress={() => setIsEditing(true)}
                  >
                    <Text style={[styles.locationBtnText, { color: 'white' }]}>✏️ Modifier</Text>
                  </TouchableOpacity>
                )}

                {/* Main Image */}
                {allowEdit && (
                  <View style={{ marginTop: 16 }}>
                    <Text style={[styles.shopInfoLabel, { fontSize: 14, fontWeight: 'bold', marginBottom: 8 }]}>
                      🖼️ {isRTL ? 'الصورة الرئيسية للمتجر' : 'Image principale'}
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
                        {uploadingImage ? '⏳...' : (mainImage ? (isRTL ? 'تغيير الصورة' : 'Changer l\'image') : (isRTL ? 'إضافة صورة' : 'Ajouter une image'))}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* Bank Accounts Management */}
                <View style={{ marginTop: 16 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <Text style={[styles.shopInfoLabel, { fontSize: 14, fontWeight: 'bold' }]}>
                      🏦 أرقام الحسابات البنكية
                    </Text>
                    <TouchableOpacity
                      onPress={() => setShowBankEditor(!showBankEditor)}
                      style={{ backgroundColor: '#3498db', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }}
                    >
                      <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>
                        {showBankEditor ? '× إغلاق' : '+ إضافة'}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {bankAccounts.map((acc, i) => (
                    <View key={i} style={{ backgroundColor: '#f0f7ff', borderRadius: 8, padding: 10, marginBottom: 6, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontWeight: 'bold', color: '#333', fontSize: 13 }}>{acc.bankName}</Text>
                        <Text style={{ color: '#3498db', fontSize: 13 }}>{acc.accountNumber}</Text>
                        {acc.accountHolder ? <Text style={{ color: '#555', fontSize: 12 }}>{acc.accountHolder}</Text> : null}
                      </View>
                      <TouchableOpacity onPress={() => removeBankAccount(i)} style={{ padding: 6 }}>
                        <Text style={{ color: '#e74c3c', fontSize: 16 }}>🗑</Text>
                      </TouchableOpacity>
                    </View>
                  ))}

                  {showBankEditor && (
                    <View style={{ backgroundColor: 'white', borderRadius: 10, padding: 12, marginTop: 4 }}>
                      <TextInput
                        placeholder="اسم البنك *"
                        value={newBank.bankName}
                        onChangeText={v => setNewBank(p => ({ ...p, bankName: v }))}
                        style={[styles.input, { marginBottom: 6 }]}
                      />
                      <TextInput
                        placeholder="رقم الحساب *"
                        value={newBank.accountNumber}
                        onChangeText={v => setNewBank(p => ({ ...p, accountNumber: v }))}
                        style={[styles.input, { marginBottom: 6 }]}
                        keyboardType="numeric"
                      />
                      <TextInput
                        placeholder="اسم صاحب الحساب (اختياري)"
                        value={newBank.accountHolder}
                        onChangeText={v => setNewBank(p => ({ ...p, accountHolder: v }))}
                        style={[styles.input, { marginBottom: 8 }]}
                      />
                      <TouchableOpacity
                        onPress={addBankAccount}
                        style={{ backgroundColor: '#2ecc71', padding: 10, borderRadius: 8, alignItems: 'center' }}
                      >
                        <Text style={{ color: 'white', fontWeight: 'bold' }}>+ حفظ الحساب</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </>
            )}
            
            <TouchableOpacity style={styles.closeInfoBtn} onPress={onClose}>
              <Text style={styles.closeInfoBtnText}>{t('close')}</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default ShopInfo;