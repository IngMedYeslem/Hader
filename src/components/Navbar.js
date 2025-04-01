import React, { useState, useEffect, useCallback } from "react";
import { View, Text, TouchableOpacity, Image, FlatList } from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialIcons, Feather } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { Menu, MenuItem, MenuDivider } from "react-native-material-menu";
import styles from "./styles";
import * as ImagePicker from 'expo-image-picker'; // Importation d'ImagePicker
import * as ImageManipulator from 'expo-image-manipulator'; // Importation d'ImageManipulator
import { useMutation, gql } from "@apollo/client";


const UPDATE_PROFILE_IMAGE = gql`
  mutation UpdateProfileImage($username: String!, $profileImage: String!) {
    updateProfileImage(username: $username, profileImage: $profileImage) {
      profileImage
    }
  }
`;

const Navbar = () => {
  const navigation = useNavigation();
  const { t, i18n } = useTranslation();
  const [language, setLanguage] = useState("fr");
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [register] = useMutation(UPDATE_PROFILE_IMAGE);;

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
          const savedProfileImage = await AsyncStorage.getItem("profileImage");

          if (savedUser) {
            const parsedUser = JSON.parse(savedUser);
            setUser({ ...parsedUser, profileImage: savedProfileImage || parsedUser.profileImage });
            setRole(parsedUser.role);
            setProfileImage(savedProfileImage || parsedUser.profileImage);
          }
        } catch (error) {
          console.error("Erreur lors de la récupération des données utilisateur :", error);
        }
      }
      loadUser();
    }, [])
  );
  useEffect(() => {
      if (user?.profileImage) {
        setProfileImage(user.profileImage);
      }
    }, [user?.profileImage]);
  
const selectProfileImage = async () => {
  try {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.5,
      base64: true,
    });

    if (result.canceled) return;

    if (result.assets && result.assets.length > 0) {
      const selectedImage = result.assets[0];

      // Compression de l'image
      const compressedImage = await ImageManipulator.manipulateAsync(
        selectedImage.uri,
        [{ resize: { width: 500 } }],
        { compress: 0.5, format: ImageManipulator.SaveFormat.JPEG, base64: true }
      );

      const base64Image = `data:image/jpeg;base64,${compressedImage.base64}`;
      setUser((prevUser) => ({
        ...prevUser,
        profileImage: base64Image,
      }));

      // Mise à jour locale immédiate
      setProfileImage(base64Image);

      // Enregistrement dans le stockage local
      await AsyncStorage.setItem("profileImage", base64Image);

      // Appel API pour mettre à jour l'image sur le serveur
      const { data } = await register({ 
        variables: { 
          username: user.username, 
          profileImage: base64Image
        } 
      });

      // Vérifier la réponse et mettre à jour l'image avec celle renvoyée par l'API
      if (data && data.updateProfileImage && data.updateProfileImage.profileImage) {
        setUser((prevUser) => ({
          ...prevUser,
          profileImage: data.updateProfileImage.profileImage,
        }));

        setProfileImage(data.updateProfileImage.profileImage);
        await AsyncStorage.setItem("profileImage", data.updateProfileImage.profileImage);
      }
    }
  } catch (error) {
    console.error("Erreur lors de la sélection de l'image :", error);
  }
};



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

 

  if (role && role.includes("ADMIN")) {
    navItems.push({ id: "1", name: t("GestionRoles"), icon: "list", screen: "AddRole" });
  }

  if (role && role.includes("ADMIN")) {
    navItems.push( { id: "3", name: t("GestionUsers"), icon: "list", screen: "UserAdminScreen" });
  }
  
  if (role && role.includes("LIST-PROD")) {
    navItems.push({ id: "4", name: t("Produits"), icon: "list", screen: "Products" });
  }

  if (role && role.includes("AJOUT-PROD")) {
    navItems.push({ id: "2", name: t("AjouterProd"), icon: "plus-circle", screen: "addProduct" });
  }
  

 
  const renderProfile = () => {
    if (user && user.username) {
      return user.profileImage ? (
        <Feather name="user" size={25} color="white" />

      ) : (
        <View style={styles.initialsContainer}>
          <Text style={styles.profileInitials}>{user.username[0].toUpperCase()}</Text>
        </View>
      );
    }
    return <Text style={styles.loginText}>{t("Se connecter")}</Text>;
  };

  return (
    <View style={styles.navbar} >
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
        {/* 🔹 Section Profil */}
        <View style={styles.profileHeader}>
        <TouchableOpacity onPress={selectProfileImage}>
          <Image source={{ uri: user.profileImage }} style={styles.profileImage} />
        </TouchableOpacity>
          <MenuItem disabled style={styles.username}>
            {t("Bonjour")}, {user.username}
          </MenuItem>
        </View>

        <MenuDivider />

        <MenuItem>{t("nomWorck")}</MenuItem>

        {/* 🔹 Email */}
        <MenuItem>
          <Feather name="mail" size={20} color="red" />
          <Text style={styles.logoutText}>{user.email}</Text>
        </MenuItem>

        {/* 🔹 Mise à jour du profil */}
        <MenuItem
          onPress={() => {
            setMenuVisible(false);
            navigation.navigate("UpdateUserScreen");
          }}
        >
          <Feather name="edit" size={20} color="blue" />
          <Text style={styles.menuText}>{t("updateProfil")}</Text>
        </MenuItem>

        <MenuDivider />

        {/* 🔹 Déconnexion */}
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
