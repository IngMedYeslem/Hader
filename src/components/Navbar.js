import React, { useState, useEffect, useCallback } from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet, FlatList } from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialIcons, Feather } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { Menu, MenuItem, MenuDivider } from "react-native-material-menu";

const Navbar = () => {
  const navigation = useNavigation();
  const { t, i18n } = useTranslation();
  const [language, setLanguage] = useState("fr");
  const [user, setUser] = useState(null);
  const [menuVisible, setMenuVisible] = useState(false);

  // Charger la langue sauvegardée
  const loadLanguage = useCallback(async () => {
    try {
      const savedLang = await AsyncStorage.getItem("language");
      if (savedLang) {
        setLanguage(savedLang);
        i18n.changeLanguage(savedLang);
      }
    } catch (error) {
      console.error("Erreur lors du chargement de la langue :", error);
    }
  }, [i18n]);

  useEffect(() => {
    loadLanguage();
  }, [loadLanguage]);

  // Charger l'utilisateur de manière asynchrone
  useFocusEffect(
    useCallback(() => {
      async function loadUser() {
        try {
          const savedUser = await AsyncStorage.getItem("user");
          setUser(savedUser ? JSON.parse(savedUser) : null);
        } catch (error) {
          console.error("Erreur lors de la récupération des données utilisateur :", error);
        }
      }

      loadUser();
    }, [])
  );

  // Changer de langue
  const toggleLanguage = async () => {
    const newLang = language === "fr" ? "ar" : "fr";
    setLanguage(newLang);
    i18n.changeLanguage(newLang);
    await AsyncStorage.setItem("language", newLang);
  };

  // Déconnexion
  const handleLogout = async () => {
    try {
      await AsyncStorage.clear();
      setUser(null); // Met à jour immédiatement l'état utilisateur
      setMenuVisible(false); // Fermer le menu
      navigation.replace("Login");
    } catch (error) {
      console.error("Erreur lors de la déconnexion :", error);
    }
  };

  // Navigation
  const navItems = [
    { id: "1", name: t("Produits"), icon: "list", screen: "Products" },
    { id: "2", name: t("Ajouter"), icon: "plus-circle", screen: "addProduct" },
  ];

  // Afficher la photo de profil ou les initiales
  const renderProfile = () => {
    if (user && user.username) {
      return user.profileImage ? (
        <Image source={{ uri: user.profileImage }} style={styles.profileImage} />
      ) : (
        <View style={styles.initialsContainer}>
          <Text style={styles.profileInitials}>{user.username[0].toUpperCase()}</Text>
        </View>
      );
    }
    return <Text style={styles.loginText}>{t("Se connecter")}</Text>;
  };

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
        {/* Bouton pour changer de langue */}
        <TouchableOpacity style={styles.navItem} onPress={toggleLanguage}>
          <MaterialIcons name="language" size={24} color="white" />
          <Text style={styles.navText}>{language === "fr" ? "🇫🇷 France" : "🇲🇷 العربية"}</Text>
        </TouchableOpacity>

        {/* Menu utilisateur */}
        <Menu
          visible={menuVisible}
          anchor={
            <TouchableOpacity style={styles.profileContainer} onPress={() => setMenuVisible(true)}>
              {renderProfile()}
            </TouchableOpacity>
          }
          onRequestClose={() => setMenuVisible(false)}
        >
          {user ? (
            <>
              <MenuItem disabled style={styles.username}>
                {t("Bonjour")}, {user.username}
              </MenuItem>
              <MenuDivider />
              <MenuItem onPress={handleLogout}>
                <Feather name="log-out" size={20} color="red" />
                <Text style={styles.logoutText}>{t("Déconnexion")}</Text>
              </MenuItem>
            </>
          ) : (
            <MenuItem
              onPress={() => {
                setMenuVisible(false);
                navigation.navigate("Login");
              }}
            >
              <Feather name="log-in" size={20} color="green" />
              <Text style={styles.loginText}>{t("Se connecter")}</Text>
            </MenuItem>
          )}
        </Menu>
      </View>
    </View>
  );
};

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
  navText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "white",
    marginTop: 5,
  },
  rightContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  profileContainer: {
    marginLeft: 15,
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
  loginText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "white",
  },
  username: {
    fontSize: 16,
    fontWeight: "bold",
    padding: 10,
  },
  logoutText: {
    fontSize: 14,
    marginLeft: 10,
  },
});

export default Navbar;
