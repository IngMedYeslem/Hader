import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialIcons, Feather } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { Menu, MenuItem, MenuDivider } from "react-native-material-menu";
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { useMutation, gql } from "@apollo/client";
import styles from "./styles";

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
  const [profileImage, setProfileImage] = useState(null);
  const [register] = useMutation(UPDATE_PROFILE_IMAGE);

  const menuRefProfile = useRef(null);

  const role = user?.role || "";

  const loadLanguage = useCallback(async () => {
    const savedLang = await AsyncStorage.getItem("language");
    if (savedLang) {
      setLanguage(savedLang);
      i18n.changeLanguage(savedLang);
    }
  }, [i18n]);

  useEffect(() => {
    loadLanguage();
  }, [loadLanguage]);

  useFocusEffect(
    useCallback(() => {
      const loadUser = async () => {
        try {
          const savedUser = await AsyncStorage.getItem("user");
          const savedProfileImage = await AsyncStorage.getItem("profileImage");

          if (savedUser) {
            const parsedUser = JSON.parse(savedUser);
            const finalImage = savedProfileImage || parsedUser.profileImage;
            setUser({ ...parsedUser, profileImage: finalImage });
            setProfileImage(finalImage);
          }
        } catch (error) {
          console.error("Erreur récupération utilisateur :", error);
        }
      };
      loadUser();
    }, [])
  );

  const selectProfileImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.5,
        base64: true,
      });

      if (result.canceled || !result.assets?.length) return;

      const selectedImage = result.assets[0];
      const compressedImage = await ImageManipulator.manipulateAsync(
        selectedImage.uri,
        [{ resize: { width: 500 } }],
        { compress: 0.5, format: ImageManipulator.SaveFormat.JPEG, base64: true }
      );

      const base64Image = `data:image/jpeg;base64,${compressedImage.base64}`;
      setUser(prev => ({ ...prev, profileImage: base64Image }));
      setProfileImage(base64Image);
      await AsyncStorage.setItem("profileImage", base64Image);

      const { data } = await register({
        variables: { username: user.username, profileImage: base64Image }
      });

      const updatedImage = data?.updateProfileImage?.profileImage;
      if (updatedImage) {
        setUser(prev => ({ ...prev, profileImage: updatedImage }));
        setProfileImage(updatedImage);
        await AsyncStorage.setItem("profileImage", updatedImage);
      }
    } catch (error) {
      console.error("Erreur sélection image :", error);
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
      navigation.replace("Login");
    } catch (error) {
      console.error("Erreur déconnexion :", error);
    }
  };

  const renderProfile = () => {
    if (user?.username) {
      return user.profileImage ? (
        <Feather name="user" size={25} style={styles.colorText} />
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
      
      {/* === ☰ Menu Icon, navigue vers l'écran de navigation === */}
      <TouchableOpacity
        style={styles.profileContainer}
        onPress={() => navigation.navigate("NavigationListScreen", { role })}
      >
        <Feather name="menu" size={24} style={styles.colorText} />
      </TouchableOpacity>

      {/* === Logo centré === */}
      <TouchableOpacity onPress={() => navigation.navigate("HomeScreen")}>
        <Image
          source={require("../../assets/logo.png")}
          style={styles.logoContainer}
          resizeMode="contain"
        />
      </TouchableOpacity>

      {/* === Menu utilisateur === */}
      {/* <View style={styles.rightContainer}>
        <Menu
          ref={menuRefProfile}
          anchor={
            <TouchableOpacity style={styles.profileContainer} onPress={() => menuRefProfile.current?.show()}>
              {renderProfile()}
            </TouchableOpacity>
          }
          onRequestClose={() => menuRefProfile.current?.hide()}
        >
          {user ? (
            <>
              <View style={styles.profileHeader}>
                <TouchableOpacity onPress={selectProfileImage}>
                  <Image source={{ uri: user.profileImage }} style={styles.profileImage} />
                </TouchableOpacity>
                <MenuItem disabled style={styles.language}>
                  {t("Bonjour")}, {user.username}
                </MenuItem>
              </View>

              <MenuDivider />

              <MenuItem>
                <Text style={styles.language}>{t("nomWorck")}</Text>
              </MenuItem>

              <MenuItem style={styles.navItem} onPress={toggleLanguage}>
                <MaterialIcons name="language" size={24} color="#005bb5" />
                <Text style={styles.language}>{language === "fr" ? "🇫🇷 France" : "🇲🇷 العربية"}</Text>
              </MenuItem>

              <MenuDivider />

              <MenuItem onPress={handleLogout}>
                <Feather name="log-out" size={20} color="red" />
                <Text style={styles.logoutText}>{t("Déconnexion")}</Text>
              </MenuItem>
            </>
          ) : (
            <MenuItem onPress={() => navigation.navigate("Login")}>
              <Feather name="log-in" size={20} color="green" />
              <Text style={styles.loginText}>{t("Se connecter")}</Text>
            </MenuItem>
          )}
        </Menu>
      </View> */}

<TouchableOpacity
  style={styles.profileContainer}
  onPress={() => navigation.navigate("UserMenuScreen", { user, profileImage, language })}
>
  <Feather name="user" size={25} style={styles.colorText} />
</TouchableOpacity>

    </View>
  );
};

export default Navbar;
