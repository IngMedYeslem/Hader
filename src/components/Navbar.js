import React, { useState, useEffect, useCallback } from "react";
import { View, Text, TouchableOpacity, Image, FlatList } from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialIcons, Feather } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { Menu, MenuItem, MenuDivider } from "react-native-material-menu";
import styles from "./styles";

const Navbar = () => {
  const navigation = useNavigation();
  const { t, i18n } = useTranslation();
  const [language, setLanguage] = useState("fr");
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [menuVisible, setMenuVisible] = useState(false);

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

  useFocusEffect(
    useCallback(() => {
      async function loadUser() {
        try {
          const savedUser = await AsyncStorage.getItem("user");
          if (savedUser) {
            const parsedUser = JSON.parse(savedUser);
            setUser(parsedUser);
            setRole(parsedUser.role);
          }
        } catch (error) {
          console.error("Erreur lors de la récupération des données utilisateur :", error);
        }
      }
      loadUser();
    }, [])
  );

  const toggleLanguage = async () => {
    const newLang = language === "fr" ? "ar" : "fr";
    setLanguage(newLang);
    i18n.changeLanguage(newLang);
    await AsyncStorage.setItem("language", newLang);
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.clear();
      setUser(null);
      setRole(null);
      setMenuVisible(false);
      navigation.replace("Login");
    } catch (error) {
      console.error("Erreur lors de la déconnexion :", error);
    }
  };

  const navItems = [
  ];

  if (role === "LIST-PROD") {
    navItems.push({ id: "1", name: t("Produits"), icon: "list", screen: "Products" });
  }

  if (role === "AJOUT-PROD") {
    navItems.push({ id: "2", name: t("AjouterProd"), icon: "plus-circle", screen: "addProduct" });
  }

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
        <TouchableOpacity style={styles.navItem} onPress={toggleLanguage}>
          <MaterialIcons name="language" size={24} color="white" />
          <Text style={styles.navText}>{language === "fr" ? "🇫🇷 France" : "🇲🇷 العربية"}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.profileContainer} onPress={() => setMenuVisible(true)}>
          {renderProfile()}
        </TouchableOpacity>
      </View>

      <View style={styles.profileMenuWrapper}>
        <Menu
          visible={menuVisible}
          anchor={<View />} 
          onRequestClose={() => setMenuVisible(false)}
          style={styles.menuContainer}
        >
          {user ? (
            <>
              <MenuItem disabled style={styles.username}>
                {t("Bonjour")}, {user.username} 
              </MenuItem>
              <MenuItem>{t("nomWorck")}</MenuItem>
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

export default Navbar;
