import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, Alert } from 'react-native';
import MediaManager from './MediaManager';
import styles from './styles';

const EditProduct = ({ product, visible, onClose, onProductUpdated }) => {
  const [currentProduct, setCurrentProduct] = useState(product);

  const handleMediaDeleted = (mediaType, mediaIndex) => {
    const updatedProduct = { ...currentProduct };
    if (mediaType === 'images') {
      updatedProduct.images = updatedProduct.images.filter((_, index) => index !== mediaIndex);
    } else if (mediaType === 'videos') {
      updatedProduct.videos = updatedProduct.videos.filter((_, index) => index !== mediaIndex);
    }
    setCurrentProduct(updatedProduct);
    
    if (onProductUpdated) {
      onProductUpdated(updatedProduct);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
        <View style={styles.galleryHeader}>
          <Text style={[styles.galleryTitle, { color: '#2C3E50' }]}>
            Éditer: {product?.name}
          </Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={[styles.closeBtnText, { color: '#2C3E50' }]}>✕</Text>
          </TouchableOpacity>
        </View>

        <MediaManager 
          product={currentProduct}
          onMediaDeleted={handleMediaDeleted}
        />
      </View>
    </Modal>
  );
};

export default EditProduct;