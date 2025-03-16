import React, { useState, useEffect, useCallback } from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet, FlatList } from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialIcons, Feather } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

export default function Navbar() {
  const navigation = useNavigation();
  const { t, i18n } = useTranslation();
  const [language, setLanguage] = useState("fr");
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadLanguage = async () => {
      try {
        const savedLang = await AsyncStorage.getItem("language");
        if (savedLang) {
          setLanguage(savedLang);
          i18n.changeLanguage(savedLang);
        }
      } catch (error) {
        console.error("Erreur lors du chargement de la langue :", error);
      }
    };
    loadLanguage();
  }, []);

  const loadUser = async () => {
    try {
      const savedUser = await AsyncStorage.getItem("user");
      setUser(savedUser ? JSON.parse(savedUser) : null);
    } catch (error) {
      console.error("Erreur lors de la récupération des données utilisateur :", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadUser();
    }, [])
  );

  const handleLogout = async () => {
    try {
      await AsyncStorage.clear();
      navigation.replace("Login");
    } catch (error) {
      console.error("Erreur lors de la déconnexion :", error);
    }
  };

  const toggleLanguage = async () => {
    const newLang = language === "fr" ? "ar" : "fr";
    setLanguage(newLang);
    i18n.changeLanguage(newLang);
    await AsyncStorage.setItem("language", newLang);
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
          <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate(item.screen)}>
            <Feather name={item.icon} size={24} color="white" />
            <Text style={styles.navText}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />

      <View style={styles.rightContainer}>
        <TouchableOpacity style={styles.navItem} onPress={toggleLanguage}>
          <MaterialIcons name="language" size={24} color="white" />
          <Text style={styles.navText}>{language === "fr" ? "🇫🇷 France" : "🇲🇷 العربية"}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.profileContainer}
          onPress={() => (user ? navigation.navigate("ProfileScreen") : navigation.navigate("LoginScreen"))}
          onLongPress={user ? handleLogout : undefined}
        >
          {user ? (
            user.profileImage ? (
              <Image source={{ uri: user.profileImage }} style={styles.profileImage} />
            ) : (
              <View style={styles.initialsContainer}>
                <Text style={styles.profileInitials}>{user.username[0].toUpperCase()}</Text>
              </View>
            )
          ) : (
            <Text style={styles.loginText}>{t("Se connecter")}</Text>
          )}
        </TouchableOpacity>
      </View>
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
    marginHorizontal: 5,
    marginVertical: 15,
  },
  rightContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  profileContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 20,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  initialsContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  profileInitials: {
    fontWeight: "bold",
    color: "#005bb5",
    fontSize: 16,
  },
  navText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "white",
    marginTop: 5,
  },
  loginText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "white",
  },
});
