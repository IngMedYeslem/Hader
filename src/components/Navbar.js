import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialIcons, Feather } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

export default function Navbar() {
  const navigation = useNavigation();
  const { t, i18n } = useTranslation();
  const [language, setLanguage] = useState("fr");

  // Charger la langue sauvegardée au démarrage
  useEffect(() => {
    const loadLanguage = async () => {
      const savedLang = await AsyncStorage.getItem("language");
      if (savedLang) {
        setLanguage(savedLang);
        i18n.changeLanguage(savedLang);
      }
    };
    loadLanguage();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem("token");
    navigation.replace("Login");
  };

  // Fonction pour changer la langue et la sauvegarder
  const toggleLanguage = async () => {
    const newLang = language === "fr" ? "ar" : "fr";
    setLanguage(newLang);
    i18n.changeLanguage(newLang);
    await AsyncStorage.setItem("language", newLang); // Sauvegarde de la langue
  };

  const navItems = [
    { id: "1", name: t("Produits"), icon: "list", screen: "Products" },
    { id: "2", name: t("Ajouter"), icon: "plus-circle", screen: "addProduct" },
  ];

  return (
    <View style={styles.navbar}>
      <FlatList
        data={navItems}
        horizontal
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.navItem}
            onPress={() => navigation.navigate(item.screen)}
          >
            <Feather name={item.icon} size={24} color="white" />
            <Text style={styles.navText}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />

      {/* Bouton de changement de langue */}
      <TouchableOpacity style={styles.navItem} onPress={toggleLanguage}>
        <MaterialIcons name="language" size={24} color="white" />
        <Text style={styles.navText}>{language === "fr" ? "🇫🇷 France" : "🇲🇷 العربية"}</Text>
      </TouchableOpacity>

      {/* Bouton de déconnexion */}
      <TouchableOpacity style={styles.navItem} onPress={handleLogout}>
        <MaterialIcons name="logout" size={24} color="white" />
        <Text style={styles.navText}>{t("Déconnexion")}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  navbar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#005bb5",
    paddingVertical: 12,
    paddingHorizontal: 15,
    
  },
  navItem: {
    flexDirection: "column",
    alignItems: "center",
    marginHorizontal: 15,
    marginVertical: 15,
    shadowColor: "#000", // لون الظل
    shadowOffset: { width: 8, height: 8 }, // انحراف الظل
    shadowOpacity: 0.9, // شفافية الظل
    shadowRadius: 8, // مدى انتشار الظل
    elevation: 5, // تأثير الظل في أندرويد
     // الخلفية ضرورية لظهور الظل في أندرويد
    //  backgroundColor: "#fff", 
     borderRadius: 10,
    //  overflow: "hidden",
  },
  navText: {
    fontSize: 12,
  fontWeight: "bold",
  color: "white",
  baßckgroundColor: "#ccc",
  backgroundClip: "text",
  WebkitBackgroundClip: "text",
  textShadowColor: "rgba(0, 0, 0, 0.9)",
  textShadowOffset: { width: 2, height: 2 },
  textShadowRadius: 5,
  marginTop: 5,
  },
});
