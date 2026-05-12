import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { productAPI } from '../services/api';
import { uploadService } from '../services/uploadService';
import { getMediaUrl } from '../services/api';
import { showAlert } from '../utils/alert';
import styles from './styles';

const MediaManager = ({ product, onMediaDeleted, onMediaAdded }) => {
  const [deleting, setDeleting] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleAddImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      showAlert('Permission refusée', 'Accès à la galerie requis');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });
    if (result.canceled) return;
    setUploading(true);
    try {
      const uploaded = [];
      for (const asset of result.assets) {
        const path = await uploadService.uploadMedia(asset.uri, 'image');
        if (path) uploaded.push(path);
      }
      if (!uploaded.length) throw new Error('Upload failed');
      const currentImages = product.images || [];
      const newImages = [...currentImages, ...uploaded];
      await productAPI.update(product._id, { images: newImages });
      if (onMediaAdded) onMediaAdded(uploaded);
      showAlert('Succès', `${uploaded.length} photo(s) ajoutée(s)`);
    } catch (e) {
      showAlert('Erreur', 'Impossible d\'ajouter la photo');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteMedia = async (mediaType, mediaIndex) => {
    showAlert(
      'Confirmer la suppression',
      `Êtes-vous sûr de vouloir supprimer ce ${mediaType === 'images' ? 'photo' : 'média'} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            setDeleting(`${mediaType}-${mediaIndex}`);
            try {
              await productAPI.deleteMedia(product._id, mediaType, mediaIndex);
              if (onMediaDeleted) {
                onMediaDeleted(mediaType, mediaIndex);
              }
              showAlert('Succès', 'Média supprimé avec succès');
            } catch (error) {
              showAlert('Erreur', 'Impossible de supprimer le média');
              console.error(error);
            } finally {
              setDeleting(null);
            }
          }
        }
      ]
    );
  };

  return (
    <View style={{ backgroundColor: 'white', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#FFE0D0' }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <Text style={{ fontSize: 15, fontWeight: 'bold', color: '#FF6B35' }}>📷 Photos</Text>
        <TouchableOpacity
          onPress={handleAddImage}
          disabled={uploading}
          style={{ backgroundColor: '#FF6B35', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 7, flexDirection: 'row', alignItems: 'center' }}
        >
          {uploading
            ? <ActivityIndicator size="small" color="white" />
            : <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 13 }}>+ إضافة</Text>
          }
        </TouchableOpacity>
      </View>

      {(!product?.images?.length) ? (
        <View style={{ padding: 20, alignItems: 'center' }}>
          <Text style={{ color: '#aaa', fontSize: 13 }}>لا توجد صور — اضغط إضافة</Text>
        </View>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            {product.images.map((uri, index) => (
              <View key={`img-${index}`} style={[styles.mediaItem, { position: 'relative' }]}>
                <Image
                  source={{ uri: getMediaUrl(uri) || uri }}
                  style={[styles.mediaPreview, { width: 90, height: 90, borderRadius: 10 }]}
                />
                <TouchableOpacity
                  style={[
                    styles.deleteButton,
                    { position: 'absolute', top: 4, right: 4, backgroundColor: 'rgba(0,0,0,0.55)', borderRadius: 12, width: 24, height: 24, justifyContent: 'center', alignItems: 'center' },
                    deleting === `images-${index}` && { opacity: 0.4 }
                  ]}
                  onPress={() => handleDeleteMedia('images', index)}
                  disabled={!!deleting}
                >
                  <Text style={{ color: 'white', fontSize: 12 }}>
                    {deleting === `images-${index}` ? '…' : '✕'}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  );
};

export default MediaManager;