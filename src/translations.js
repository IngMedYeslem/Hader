const translations = {
  fr: {
    loading: 'Chargement...',
    error: 'Erreur',
    addProducts: 'Ajouter des Produits',
    product: 'Produit',
    productName: 'Nom du produit',
    price: 'Prix (€)',
    addImage: '📷 Ajouter une image',
    imageSelected: '✓ Image sélectionnée',
    addAnother: '+ Ajouter un autre produit',
    saveProducts: 'Enregistrer les Produits',
    back: '← Retour',
    success: 'Succès',
    productsAdded: 'Produits ajoutés avec succès',
    selectImage: 'Sélectionner une image',
    chooseOption: 'Choisissez une option',
    gallery: 'Galerie',
    camera: 'Appareil photo',
    cancel: 'Annuler',
    permissionRequired: 'Permission requise',
    galleryAccess: 'Accès à la galerie nécessaire',
    cameraAccess: 'Accès à l\'appareil photo nécessaire',
    chooseFile: 'Choisir un fichier'
  },
  en: {
    loading: 'Loading...',
    error: 'Error',
    addProducts: 'Add Products',
    product: 'Product',
    productName: 'Product name',
    price: 'Price (€)',
    addImage: '📷 Add image',
    imageSelected: '✓ Image selected',
    addAnother: '+ Add another product',
    saveProducts: 'Save Products',
    back: '← Back',
    success: 'Success',
    productsAdded: 'Products added successfully',
    selectImage: 'Select image',
    chooseOption: 'Choose an option',
    gallery: 'Gallery',
    camera: 'Camera',
    cancel: 'Cancel',
    permissionRequired: 'Permission required',
    galleryAccess: 'Gallery access required',
    cameraAccess: 'Camera access required',
    chooseFile: 'Choose file'
  },
  ar: {
    loading: 'جاري التحميل...',
    error: 'خطأ',
    addProducts: 'إضافة المنتجات',
    product: 'المنتج',
    productName: 'اسم المنتج',
    price: 'السعر (€)',
    addImage: '📷 إضافة صورة',
    imageSelected: '✓ تم اختيار الصورة',
    addAnother: '+ إضافة منتج آخر',
    saveProducts: 'حفظ المنتجات',
    back: '← رجوع',
    success: 'نجح',
    productsAdded: 'تم إضافة المنتجات بنجاح',
    selectImage: 'اختيار صورة',
    chooseOption: 'اختر خياراً',
    gallery: 'المعرض',
    camera: 'الكاميرا',
    cancel: 'إلغاء',
    permissionRequired: 'إذن مطلوب',
    galleryAccess: 'الوصول إلى المعرض مطلوب',
    cameraAccess: 'الوصول إلى الكاميرا مطلوب',
    chooseFile: 'اختيار ملف'
  }
};

import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

let currentLanguage = 'fr';
let languageChangeListeners = [];

export const useTranslation = () => {
  const [, forceUpdate] = useState({});
  
  useEffect(() => {
    loadSavedLanguage();
    
    const listener = () => forceUpdate({});
    languageChangeListeners.push(listener);
    
    return () => {
      languageChangeListeners = languageChangeListeners.filter(l => l !== listener);
    };
  }, []);
  
  const loadSavedLanguage = async () => {
    try {
      let savedLang;
      if (Platform.OS === 'web') {
        savedLang = localStorage.getItem('selectedLanguage');
      } else {
        savedLang = await AsyncStorage.getItem('selectedLanguage');
      }
      
      if (savedLang && savedLang !== currentLanguage) {
        currentLanguage = savedLang;
        forceUpdate({});
      }
    } catch (error) {
      console.log('Erreur chargement langue:', error);
    }
  };
  
  const setLanguage = async (lang) => {
    if (translations[lang] && lang !== currentLanguage) {
      currentLanguage = lang;
      
      try {
        if (Platform.OS === 'web') {
          localStorage.setItem('selectedLanguage', lang);
          window.location.reload();
        } else {
          await AsyncStorage.setItem('selectedLanguage', lang);
          languageChangeListeners.forEach(listener => listener());
        }
      } catch (error) {
        console.log('Erreur sauvegarde langue:', error);
      }
    }
  };
  
  const t = (key) => {
    return translations[currentLanguage]?.[key] || key;
  };
  
  return { t, setLanguage, currentLanguage };
};

export const t = (key) => translations[currentLanguage][key] || key;
export const setLanguage = async (lang) => {
  if (translations[lang] && lang !== currentLanguage) {
    currentLanguage = lang;
    
    try {
      if (Platform.OS === 'web') {
        localStorage.setItem('selectedLanguage', lang);
        window.location.reload();
      } else {
        await AsyncStorage.setItem('selectedLanguage', lang);
        languageChangeListeners.forEach(listener => listener());
      }
    } catch (error) {
      console.log('Erreur sauvegarde langue:', error);
    }
  }
};
export const getLanguage = () => currentLanguage;