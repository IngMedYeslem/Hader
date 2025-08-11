import React from 'react';
import { View, Text, TouchableOpacity, Linking, Alert, Modal } from 'react-native';
import { useTranslation } from '../translations';
import styles from './styles';

const ShopInfo = ({ shop, visible, onClose }) => {
  const { t } = useTranslation();
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

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.shopInfoOverlay}>
        <View style={styles.shopInfoContainer}>
      <Text style={styles.shopInfoTitle}>{shop.name}</Text>
      
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
        <TouchableOpacity onPress={() => handleWhatsApp(shop.whatsapp)}>
          <Text style={[styles.shopInfoValue, { color: '#25D366' }]}>{shop.whatsapp}</Text>
        </TouchableOpacity>
      </View>
      
      {shop.location?.latitude && shop.location?.longitude && (
        <TouchableOpacity style={styles.locationBtn} onPress={handleLocation}>
          <Text style={styles.locationBtnText}>🗺️ {t('viewOnMap')}</Text>
        </TouchableOpacity>
      )}
      
      <TouchableOpacity style={styles.closeInfoBtn} onPress={onClose}>
        <Text style={styles.closeInfoBtnText}>{t('close')}</Text>
      </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default ShopInfo;