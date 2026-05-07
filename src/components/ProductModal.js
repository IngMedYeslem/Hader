import React from 'react';
import { View, Text, Image, TouchableOpacity, Modal, ScrollView, Linking, Alert } from 'react-native';
import MediaCarousel from './MediaCarousel';
import { useTranslation } from '../translations';
import styles from './styles';

export default function ProductModal({ visible, product, onClose }) {
  const { t } = useTranslation();
  if (!product) return null;

  const handleWhatsApp = () => {
    if (product.shop?.whatsapp) {
      const { currentLanguage } = useTranslation();
      console.log('Langue actuelle:', currentLanguage);
      console.log('Message WhatsApp:', t('whatsappMessage'));
      const message = `${t('whatsappMessage')} ${product.name} (${product.price} MRU)`;
      const url = `whatsapp://send?phone=${product.shop.whatsapp}&text=${encodeURIComponent(message)}`;
      Linking.openURL(url).catch(() => {
        Alert.alert(t('error'), t('whatsappNotInstalled'));
      });
    }
  };

  const handleCall = () => {
    if (product.shop?.phone) {
      Linking.openURL(`tel:${product.shop.phone}`);
    }
  };

  const handleEmail = () => {
    if (product.shop?.email) {
      const subject = `${t('emailSubject')} - ${product.name}`;
      const body = `${t('emailBody')} ${product.name} (${product.price} MRU)`;
      Linking.openURL(`mailto:${product.shop.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>{t('productDetails')}</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeBtnText}>✕</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.modalContent}>
          <MediaCarousel 
            images={product.images || []} 
          />
          
          <View style={styles.productDetails}>
            <Text style={styles.productNameLarge}>{product.name}</Text>
            <Text style={styles.productPriceLarge}>{product.price} MRU</Text>
            
            <View style={styles.shopInfoLarge}>
              <Text style={styles.shopLabel}>{t('soldBy')}:</Text>
              <View style={styles.shopDetails}>
                {product.shop?.profileImage && (
                  <Image 
                    source={{ uri: product.shop.profileImage }} 
                    style={styles.shopAvatarLarge}
                  />
                )}
                <View>
                  <Text style={styles.shopNameLarge}>
                    {product.shop?.username || t('shopNotSpecified')}
                  </Text>
                  {product.shop?.address && (
                    <Text style={styles.shopAddress}>
                      📍 {product.shop.address}
                    </Text>
                  )}
                  {product.shop?.phone && (
                    <Text style={styles.shopContact}>
                      📞 {product.shop.phone}
                    </Text>
                  )}
                </View>
              </View>
            </View>
            
            <View style={styles.actionButtons}>
              {product.shop?.whatsapp && (
                <TouchableOpacity style={styles.contactBtn} onPress={handleWhatsApp}>
                  <Text style={styles.contactBtnText}>📱 {t('whatsapp')}</Text>
                </TouchableOpacity>
              )}
              
              {product.shop?.phone && (
                <TouchableOpacity style={[styles.contactBtn, styles.callBtn]} onPress={handleCall}>
                  <Text style={styles.contactBtnText}>📞 {t('call')}</Text>
                </TouchableOpacity>
              )}
              

            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}