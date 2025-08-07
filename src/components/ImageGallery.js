import React, { useState, useRef } from 'react';
import { View, Text, Image, TouchableOpacity, Modal, ScrollView, Dimensions, Platform } from 'react-native';
import styles from './styles';

const { width, height } = Dimensions.get('window');

function ImageGallery({ images, visible, onClose, productName }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollViewRef = useRef(null);
  const { width } = Dimensions.get('window');

  if (!images || images.length === 0) return null;

  const onScroll = (event) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = Math.round(event.nativeEvent.contentOffset.x / slideSize);
    if (index !== currentIndex && index >= 0 && index < images.length) {
      setCurrentIndex(index);
    }
  };

  const onMomentumScrollEnd = (event) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = Math.round(event.nativeEvent.contentOffset.x / slideSize);
    setCurrentIndex(index);
  };



  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.galleryOverlay}>
        <View style={styles.galleryHeader}>
          <Text style={styles.galleryTitle}>{productName}</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeBtnText}>✕</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.mainImageContainer}>
          <TouchableOpacity 
            style={styles.singleImageContainer}
            onPress={() => {
              if (images.length > 1) {
                setCurrentIndex(prev => prev < images.length - 1 ? prev + 1 : 0);
              }
            }}
            activeOpacity={0.9}
          >
            <Image 
              source={{ uri: images[currentIndex] }} 
              style={[
                styles.mainImage,
                Platform.OS === 'web' && styles.webMainImage
              ]}
              resizeMode="contain"
            />
          </TouchableOpacity>
          
          <View style={styles.imageIndicators}>
            {images.map((_, index) => (
              <TouchableOpacity
                key={`dot-${index}`}
                style={[
                  styles.indicator,
                  currentIndex === index && styles.activeIndicator
                ]}
                onPress={() => {
                  setCurrentIndex(index);
                  scrollViewRef.current?.scrollTo({ x: index * width, animated: true });
                }}
              />
            ))}
          </View>
          
          <Text style={styles.imageCounter}>
            {currentIndex + 1} / {images.length}
          </Text>
        </View>

        <ScrollView 
          horizontal 
          style={styles.thumbnailContainer}
          showsHorizontalScrollIndicator={false}
        >
          {images.map((image, index) => (
            <TouchableOpacity 
              key={`thumb-${index}-${image.substring(0, 10)}`}
              onPress={() => {
                if (index !== currentIndex) {
                  setCurrentIndex(index);
                }
              }}
              style={[
                styles.thumbnail,
                currentIndex === index && styles.activeThumbnail
              ]}
            >
              <Image 
                source={{ uri: image }} 
                style={styles.thumbnailImage}
                resizeMode="cover"
              />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </Modal>
  );
}

export default ImageGallery;