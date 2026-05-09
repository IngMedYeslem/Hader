import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, Alert, ActivityIndicator, Image, Modal
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { API_CONFIG } from '../config/api';
import { useTranslation } from '../translations';

const BASE = API_CONFIG.BASE_URL;

export default function PaymentRejectionHandler({ order, onReceiptUploaded, visible, onClose }) {
  const { currentLanguage } = useTranslation();
  const isRTL = currentLanguage === 'ar';
  const [receiptImage, setReceiptImage] = useState(null);
  const [uploading, setUploading] = useState(false);

  const pickReceiptImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        isRTL ? 'خطأ' : 'Erreur', 
        isRTL ? 'يجب السماح بالوصول للصور' : 'Permission requise'
      );
      return;
    }
    
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });
    
    if (!result.canceled && result.assets?.[0]) {
      setReceiptImage(result.assets[0].uri);
    }
  };

  const uploadNewReceipt = async () => {
    if (!receiptImage) {
      Alert.alert(
        isRTL ? 'مطلوب' : 'Requis',
        isRTL ? 'يرجى اختيار صورة الإيصال أولاً' : 'Veuillez sélectionner une image'
      );
      return;
    }

    setUploading(true);
    try {
      // رفع الصورة
      const formData = new FormData();
      formData.append('receipt', {
        uri: receiptImage,
        type: 'image/jpeg',
        name: `new_receipt_${order._id}.jpg`,
      });

      const uploadRes = await fetch(`${BASE}/upload-receipt`, {
        method: 'POST',
        body: formData,
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const uploadData = await uploadRes.json();
      
      if (uploadData.receiptPath) {
        // تحديث الطلب بالإيصال الجديد
        const updateRes = await fetch(`${BASE}/orders/${order._id}/new-receipt`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ receiptUrl: uploadData.receiptPath }),
        });

        const updateData = await updateRes.json();
        
        if (updateData.success) {
          Alert.alert(
            isRTL ? 'تم بنجاح' : 'Succès',
            isRTL ? 'تم رفع الإيصال الجديد بنجاح' : 'Nouveau reçu téléchargé avec succès'
          );
          onReceiptUploaded?.(updateData.order);
          onClose();
        } else {
          throw new Error(updateData.error);
        }
      } else {
        throw new Error('فشل في رفع الصورة');
      }
    } catch (error) {
      Alert.alert(
        isRTL ? 'خطأ' : 'Erreur',
        error.message || (isRTL ? 'فشل في رفع الإيصال' : 'Échec du téléchargement')
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={{ 
        flex: 1, 
        backgroundColor: 'rgba(0,0,0,0.5)', 
        justifyContent: 'center', 
        alignItems: 'center', 
        padding: 20 
      }}>
        <View style={{ 
          backgroundColor: 'white', 
          borderRadius: 20, 
          padding: 24, 
          width: '100%', 
          maxWidth: 400 
        }}>
          {/* Header */}
          <View style={{ alignItems: 'center', marginBottom: 20 }}>
            <Text style={{ fontSize: 48, marginBottom: 8 }}>❌</Text>
            <Text style={{ 
              fontSize: 20, 
              fontWeight: 'bold', 
              color: '#e74c3c', 
              textAlign: 'center' 
            }}>
              {isRTL ? 'تم رفض إيصال الدفع' : 'Reçu de paiement rejeté'}
            </Text>
          </View>

          {/* Message */}
          <Text style={{ 
            color: '#555', 
            textAlign: 'center', 
            lineHeight: 22, 
            marginBottom: 20 
          }}>
            {isRTL 
              ? 'تم رفض إيصال الدفع الخاص بك. يرجى رفع إيصال جديد وصحيح لمتابعة الطلب.'
              : 'Votre reçu de paiement a été rejeté. Veuillez télécharger un nouveau reçu valide pour continuer.'
            }
          </Text>

          {/* Receipt Upload */}
          <TouchableOpacity
            onPress={pickReceiptImage}
            style={{
              borderWidth: 2,
              borderColor: receiptImage ? '#2ecc71' : '#e74c3c',
              borderStyle: 'dashed',
              borderRadius: 12,
              padding: 16,
              alignItems: 'center',
              backgroundColor: receiptImage ? '#f0fff4' : '#fff5f5',
              marginBottom: 20
            }}
          >
            {receiptImage ? (
              <>
                <Image 
                  source={{ uri: receiptImage }} 
                  style={{ width: '100%', height: 120, borderRadius: 8 }} 
                  resizeMode="cover" 
                />
                <Text style={{ 
                  color: '#2ecc71', 
                  marginTop: 8, 
                  fontWeight: 'bold',
                  textAlign: 'center'
                }}>
                  {isRTL ? '✅ تم اختيار الصورة' : '✅ Image sélectionnée'}
                </Text>
              </>
            ) : (
              <>
                <Text style={{ fontSize: 36 }}>📷</Text>
                <Text style={{ 
                  color: '#e74c3c', 
                  fontWeight: 'bold', 
                  marginTop: 8,
                  textAlign: 'center'
                }}>
                  {isRTL ? 'اضغط لرفع إيصال جديد' : 'Appuyer pour télécharger'}
                </Text>
              </>
            )}
          </TouchableOpacity>

          {/* Buttons */}
          <TouchableOpacity
            onPress={uploadNewReceipt}
            disabled={uploading || !receiptImage}
            style={{
              backgroundColor: (uploading || !receiptImage) ? '#ccc' : '#2ecc71',
              padding: 14,
              borderRadius: 12,
              alignItems: 'center',
              marginBottom: 10
            }}
          >
            {uploading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={{ 
                color: 'white', 
                fontWeight: 'bold', 
                fontSize: 15 
              }}>
                {isRTL ? 'رفع الإيصال الجديد' : 'Télécharger le nouveau reçu'}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onClose}
            style={{ padding: 14, alignItems: 'center' }}
          >
            <Text style={{ color: '#555', fontSize: 15 }}>
              {isRTL ? 'إغلاق' : 'Fermer'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}