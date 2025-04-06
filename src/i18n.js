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
      "confirmPassword": "Confirmer le mot de passe",
      authentication: "Authentification",
      incorrectCredentials: "Identifiants incorrects.",
      enterUsernamePassword: "Veuillez entrer un nom d'utilisateur et un mot de passe.",
     "Déconnexion": "Déconnexion",
    "Bonjour": "Bonjour",
    "email": "Email",
    "nomWorck": "Mon capital market",
    "GestionRoles": "Gestion des Rôles",
    "updateProfil": "Mettre à jour le profil",
    GestionUsers: "Gestion des Utilisateurs",
    
      "AjouterRole": "Ajouter un Rôle",
      "NomRole": "Nom du rôle (ex: ADMIN)",
      "AjoutRole": "Ajouter",
      "AjoutEnCours": "Ajout...",
      "RoleRequis": "Le nom du rôle est requis !",
      "RoleAjouteSucces": "Rôle ajouté avec succès !",
      "ErreurAjoutRole": "Erreur lors de l'ajout du rôle",
      "SeConnecter": "Se connecter",
      "Bonjour": "Bonjour",
      "NomWorck": "Nom du travail",
      "SeDeconnecter": "Se déconnecter",
      "cp": "𝕄𝕒𝕣𝕔𝕙é ℂ𝕒𝕡𝕚𝕥𝕒𝕝𝕖",
      "Authentification": "Authentification",
      "Ccompte": "Créer un compte",
    "selectProfileImage": "Sélectionner une image de profil",
    "inscrire": "S'inscrire",
    "VConnectezVous": "Vous avez déjà un compte ? Connectez-vous?",
    "mainMenu": "Menu principal"
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
    "email": "البريد الإلكتروني",
      "nomWorck": "سوق كابتال الخاص بي",
      "GestionRoles": "إدارة الأدوار",
      "updateProfil": "تحديث الملف الشخصي",
      "GestionUsers": "إدارة المستخدمين",
      
        "AjouterRole": "إضافة دور",
        "NomRole": "اسم الدور (مثل: ADMIN)",
        "AjoutRole": "إضافة",
        "AjoutEnCours": "جارٍ الإضافة...",
        "RoleRequis": "اسم الدور مطلوب!",
        "RoleAjouteSucces": "تم إضافة الدور بنجاح!",
        "ErreurAjoutRole": "حدث خطأ أثناء إضافة الدور",
        "SeConnecter": "تسجيل الدخول",
        "Bonjour": "مرحباً",
        "NomWorck": "اسم العمل",
        "SeDeconnecter": "تسجيل الخروج",
        "cp": "سُــوقْ كَــبِّـتَــالْ",
      "Authentification": "المصادقة",
      "Ccompte": "إنشاء حساب",
      "confirmPassword": "تأكيد كلمة المرور",
      "selectProfileImage": "اختر صورة الملف الشخصي",
      "inscrire": "تسجيل",
      "VConnectezVous": "هل لديك حساب بالفعل؟ قم بتسجيل الدخول?",
      "mainMenu": "القائمة الرئيسية"
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
