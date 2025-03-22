import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  fr: {
    translation: {
      "Produits": "Produits",
      "AjouterProd": "Ajouter un produit",
      "Déconnexion": "Déconnexion",
      "Ajouter un produit": "Ajouter un produit",
      "NomProduit": "Nom du produit",
      "Prix": "Prix",
      "Image (URL)": "Image (URL)",
      "Produit ajouté avec succès !": "Produit ajouté avec succès !",
      "Le nom et le prix sont obligatoires !": "Le nom et le prix sont obligatoires !",
      login: "Se connecter",
      username: "Nom d'utilisateur",
      password: "Mot de passe",
      authentication: "Authentification",
      incorrectCredentials: "Identifiants incorrects.",
      enterUsernamePassword: "Veuillez entrer un nom d'utilisateur et un mot de passe.",
     "Déconnexion": "Déconnexion",
    "Bonjour": "Bonjour",
    "nomWorck": "Mon capital market",
   
    }
  },
  ar: {
    translation: {
      "Produits": "المنتجات",
      "Déconnexion": "تسجيل الخروج",
      "AjouterProd": "إضافة منتج",
      "NomProduit": "اسم المنتج",
      "Prix": "السعر",
      "Image (URL)": "صورة (URL)",
      "Produit ajouté avec succès !": "تمت إضافة المنتج بنجاح!",
      "Le nom et le prix sont obligatoires !": "الاسم والسعر إلزاميان!",
      login: "تسجيل الدخول",
      username: "اسم المستخدم",
      password: "كلمة المرور",
      authentication: "المصادقة",
      incorrectCredentials: "بيانات الاعتماد غير صحيحة.",
      enterUsernamePassword: "يرجى إدخال اسم المستخدم وكلمة المرور.",
      "Déconnexion": "تسجيل الخروج",
      "Bonjour": "مرحبا",
      "nomWorck": "سوق كابتال الخاص بي",

   
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "fr", // Langue par défaut
    fallbackLng: "fr",
    interpolation: { escapeValue: false }
  });

export default i18n;
