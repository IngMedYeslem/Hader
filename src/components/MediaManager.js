import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView } from 'react-native';
import { productAPI } from '../services/api';
import { showAlert } from '../utils/alert';
import VideoThumbnail from './VideoThumbnail';
import styles from './styles';

// Composant séparé pour chaque vidéo
const VideoItem = ({ uri, index, onDelete, deleting }) => {
  return (
    <View style={styles.mediaItem}>
      <VideoThumbnail
        uri={uri}
        style={styles.mediaPreview}
        showPlayButton={true}
      />
      <TouchableOpacity 
        style={[
          styles.deleteButton,
          deleting === `videos-${index}` && { opacity: 0.5 }
        ]}
        onPress={() => onDelete('videos', index)}
        disabled={deleting === `videos-${index}`}
      >
        <Text style={styles.deleteButtonText}>
          {deleting === `videos-${index}` ? '...' : '🗑️'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const MediaManager = ({ product, onMediaDeleted }) => {
  const [deleting, setDeleting] = useState(null);

  const handleDeleteMedia = async (mediaType, mediaIndex) => {
    showAlert(
      'Confirmer la suppression',
      `Êtes-vous sûr de vouloir supprimer ce ${mediaType === 'images' ? 'photo' : 'vidéo'} ?`,
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

  if (!product || (!product.images?.length && !product.videos?.length)) {
    return (
      <View style={styles.emptyMediaContainer}>
        <Text style={styles.emptyMediaText}>Aucun média disponible</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.mediaManagerContainer}>
      <Text style={styles.mediaManagerTitle}>Gérer les médias</Text>
      
      {product.images?.length > 0 && (
        <View style={styles.mediaSection}>
          <Text style={styles.mediaSectionTitle}>Photos ({product.images.length})</Text>
          <View style={styles.mediaGrid}>
            {product.images.map((uri, index) => (
              <View key={`img-${index}`} style={styles.mediaItem}>
                <Image source={{ uri }} style={styles.mediaPreview} />
                <TouchableOpacity 
                  style={[
                    styles.deleteButton,
                    deleting === `images-${index}` && { opacity: 0.5 }
                  ]}
                  onPress={() => handleDeleteMedia('images', index)}
                  disabled={deleting === `images-${index}`}
                >
                  <Text style={styles.deleteButtonText}>
                    {deleting === `images-${index}` ? '...' : '🗑️'}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
      )}

      {product.videos?.length > 0 && (
        <View style={styles.mediaSection}>
          <Text style={styles.mediaSectionTitle}>Vidéos ({product.videos.length})</Text>
          <View style={styles.mediaGrid}>
            {product.videos.map((uri, index) => (
              <VideoItem
                key={`vid-${index}`}
                uri={uri}
                index={index}
                onDelete={handleDeleteMedia}
                deleting={deleting}
              />
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  );
};

export default MediaManager;