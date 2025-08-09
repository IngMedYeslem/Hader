import React from 'react';
import { View, Text, Image, TouchableOpacity, Modal, ScrollView, Linking, Alert } from 'react-native';
import styles from './styles';

export default function ProductModal({ visible, product, onClose }) {
  if (!product) return null;

  const handleWhatsApp = () => {
    if (product.shop?.whatsapp) {
      const message = `Bonjour, je suis intéressé(e) par le produit: ${product.name} (${product.price} DH)`;
      const url = `whatsapp://send?phone=${product.shop.whatsapp}&text=${encodeURIComponent(message)}`;
      Linking.openURL(url).catch(() => {
        Alert.alert('Erreur', 'WhatsApp n\'est pas installé sur cet appareil');
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
      const subject = `Demande d'information - ${product.name}`;
      const body = `Bonjour,\n\nJe suis intéressé(e) par le produit: ${product.name} (${product.price} DH).\n\nMerci de me contacter.`;
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
          <Text style={styles.modalTitle}>Détails du produit</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeBtnText}>✕</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.modalContent}>
          <View style={styles.productImageLarge}>
            {product.images && product.images.length > 0 ? (
              <Image 
                source={{ uri: product.images[0] }} 
                style={styles.modalImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.placeholderImageLarge}>
                <Text style={styles.placeholderTextLarge}>📷</Text>
              </View>
            )}
          </View>
          
          <View style={styles.productDetails}>
            <Text style={styles.productNameLarge}>{product.name}</Text>
            <Text style={styles.productPriceLarge}>{product.price} DH</Text>
            
            <View style={styles.shopInfoLarge}>
              <Text style={styles.shopLabel}>Vendu par:</Text>
              <View style={styles.shopDetails}>
                {product.shop?.profileImage && (
                  <Image 
                    source={{ uri: product.shop.profileImage }} 
                    style={styles.shopAvatarLarge}
                  />
                )}
                <View>
                  <Text style={styles.shopNameLarge}>
                    {product.shop?.username || 'Boutique non spécifiée'}
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
                  <Text style={styles.contactBtnText}>📱 WhatsApp</Text>
                </TouchableOpacity>
              )}
              
              {product.shop?.phone && (
                <TouchableOpacity style={[styles.contactBtn, styles.callBtn]} onPress={handleCall}>
                  <Text style={styles.contactBtnText}>📞 Appeler</Text>
                </TouchableOpacity>
              )}
              

            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}