import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Linking, Alert, Modal, TextInput, ScrollView } from 'react-native';
import { useTranslation } from '../translations';
import styles from './styles';

const ShopInfo = ({ shop, visible, onClose, allowEdit = false }) => {
  const { t } = useTranslation();
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
      // Mettre à jour la boutique
      const shopResponse = await fetch(`http://172.20.10.5:3000/api/shops/${shop._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData)
      });
      
      // Mettre à jour l'utilisateur lié
      const userResponse = await fetch(`http://172.20.10.5:3000/api/users/update-by-shop/${shop._id}`, {
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
                    style={[styles.closeInfoBtn, { flex: 1, backgroundColor: '#C8A55F' }]} 
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
                    <Text style={[styles.shopInfoValue, { color: '#007AFF' }]}>{shop.phone}</Text>
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
                    style={[styles.locationBtn, { backgroundColor: '#C8A55F', marginTop: 10 }]} 
                    onPress={() => setIsEditing(true)}
                  >
                    <Text style={[styles.locationBtnText, { color: 'white' }]}>✏️ Modifier</Text>
                  </TouchableOpacity>
                )}
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