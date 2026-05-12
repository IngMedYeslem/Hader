import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, KeyboardAvoidingView, Platform, Animated, Dimensions } from 'react-native';
import MediaManager from './MediaManager';
import styles from './styles';
import { useTranslation } from '../translations';
import { productAPI } from '../services/api';
import { RTLTextInput } from './RTLInput';
import { showAlert } from '../utils/alert';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const EditProduct = ({ product, visible, onClose, onProductUpdated }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stock: '',
    images: []
  });
  const slideAnim = useState(new Animated.Value(300))[0];
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        })
      ]).start();
    } else {
      slideAnim.setValue(300);
      fadeAnim.setValue(0);
    }
  }, [visible]);

  useEffect(() => {
    if (product) {
      console.log('=== Produit reçu ===');
      console.log('Produit complet:', product);
      console.log('Nom:', product.name);
      console.log('Description:', product.description);
      console.log('Prix:', product.price);
      console.log('Catégorie:', product.category);
      console.log('Stock:', product.stock);
      
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price?.toString() || '',
        category: product.category || '',
        stock: product.stock?.toString() || '',
        images: product.images || []
      });
    }
  }, [product]);

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.price.trim()) {
      showAlert('Erreur', 'Le nom et le prix sont obligatoires');
      return;
    }

    try {
      console.log('=== Sauvegarde ===');
      console.log('FormData:', formData);
      
      const updatedProduct = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price) || 0,
        category: formData.category.trim(),
        stock: parseInt(formData.stock) || 0,
        images: formData.images
      };
      
      console.log('Produit à envoyer:', updatedProduct);

      const result = await productAPI.update(product._id, updatedProduct);
      console.log('Résultat API:', result);
      
      onProductUpdated({ ...product, ...updatedProduct });
      showAlert('Succès', 'Produit mis à jour');
      onClose();
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      showAlert('Erreur', `Impossible de mettre à jour le produit: ${error.message}`);
    }
  };

  const handleMediaAdded = (newPaths) => {
    setFormData(prev => ({ ...prev, images: [...prev.images, ...newPaths] }));
  };

  const handleMediaDeleted = (mediaType, mediaIndex) => {
    setFormData(prev => ({
      ...prev,
      [mediaType]: prev[mediaType].filter((_, index) => index !== mediaIndex)
    }));
  };

  const handleDelete = () => {
    showAlert(
      'Confirmer la suppression',
      'Voulez-vous vraiment supprimer ce produit ? Cette action est irréversible.',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Supprimer', 
          style: 'destructive',
          onPress: async () => {
            try {
              await productAPI.delete(product._id);
              showAlert('Succès', 'Produit supprimé');
              onProductUpdated(null); // Signal pour supprimer de la liste
              onClose();
            } catch (error) {
              console.error('Erreur suppression:', error);
              showAlert('Erreur', `Impossible de supprimer le produit: ${error.message}`);
            }
          }
        }
      ]
    );
  };

  return (
    <Modal visible={visible} animationType="none" presentationStyle="pageSheet">
      <View style={{ flex: 1, backgroundColor: 'white' }}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          {/* Header */}
          <View style={{ backgroundColor: '#FF6B35', paddingTop: Platform.OS === 'ios' ? 50 : 20, paddingBottom: 16, paddingHorizontal: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>✏️ تعديل المنتج</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={{ color: 'white', fontSize: 22, fontWeight: 'bold' }}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Animated.View style={{ transform: [{ translateY: slideAnim }], opacity: fadeAnim }}>

              {/* حقول النموذج */}
              <View style={{ backgroundColor: '#FFF0EB', borderRadius: 12, padding: 12, marginBottom: 12 }}>
                <RTLTextInput
                  style={[styles.addProductInput, { fontSize: 15, height: 48 }]}
                  placeholder="Nom du produit *"
                  placeholderTextColor="#aaa"
                  value={formData.name}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
                />
                <RTLTextInput
                  style={[styles.addProductInput, { fontSize: 15, minHeight: 70, textAlignVertical: 'top', marginBottom: 0 }]}
                  placeholder="Description"
                  placeholderTextColor="#aaa"
                  multiline
                  value={formData.description}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
                />
              </View>

              <View style={{ backgroundColor: '#FFF0EB', borderRadius: 12, padding: 12, marginBottom: 12 }}>
                <RTLTextInput
                  style={[styles.addProductInput, { fontSize: 15, height: 48 }]}
                  placeholder="Prix (MRU) *"
                  placeholderTextColor="#aaa"
                  keyboardType="numeric"
                  value={formData.price}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, price: text }))}
                />
                <RTLTextInput
                  style={[styles.addProductInput, { fontSize: 15, height: 48, marginBottom: 0 }]}
                  placeholder="Stock disponible"
                  placeholderTextColor="#aaa"
                  keyboardType="numeric"
                  value={formData.stock}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, stock: text }))}
                />
              </View>

              <View style={{ backgroundColor: '#FFF0EB', borderRadius: 12, padding: 12, marginBottom: 16 }}>
                <Text style={{ color: '#777', fontSize: 13, marginBottom: 8 }}>{t('category')}</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {[
                    { id: 'food', icon: '🍔' },
                    { id: 'grocery', icon: '🛒' },
                    { id: 'pharmacy', icon: '💊' },
                    { id: 'electronics', icon: '📱' },
                    { id: 'fashion', icon: '👗' },
                    { id: 'other', icon: '📦' },
                  ].map(cat => (
                    <TouchableOpacity
                      key={cat.id}
                      onPress={() => setFormData(prev => ({ ...prev, category: cat.id }))}
                      style={{
                        flexDirection: 'row', alignItems: 'center',
                        paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20,
                        backgroundColor: formData.category === cat.id ? '#FF6B35' : 'rgba(255,107,53,0.08)',
                        borderWidth: 1,
                        borderColor: formData.category === cat.id ? '#C8A55F' : 'rgba(255,107,53,0.2)',
                      }}
                    >
                      <Text style={{ fontSize: 14, marginRight: 4 }}>{cat.icon}</Text>
                      <Text style={{ fontSize: 12, color: formData.category === cat.id ? 'white' : '#FF6B35', fontWeight: '600' }}>
                        {t(cat.id)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* أزرار الحفظ والحذف */}
              <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
                <TouchableOpacity
                  style={[styles.submitBtn, { flex: 1, paddingVertical: 14, borderRadius: 12 }]}
                  onPress={handleSave}
                >
                  <Text style={styles.submitText}>💾 Sauvegarder</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.submitBtn, { flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: '#e74c3c' }]}
                  onPress={handleDelete}
                >
                  <Text style={styles.submitText}>🗑️ Supprimer</Text>
                </TouchableOpacity>
              </View>

              <MediaManager
                product={{ ...product, images: formData.images }}
                onMediaDeleted={handleMediaDeleted}
                onMediaAdded={handleMediaAdded}
              />
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

export default EditProduct;