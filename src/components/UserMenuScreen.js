import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ImageBackground,
  Alert,
} from "react-native";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { Card } from "react-native-paper";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useMutation, gql } from "@apollo/client";

import Navbar from "./Navbar";
import styles from "./styles";

// GraphQL Mutation
const UPDATE_PROFILE_IMAGE = gql`
  mutation UpdateProfileImage($username: String!, $profileImage: String!) {
    updateProfileImage(username: $username, profileImage: $profileImage) {
      profileImage
    }
  }
`;

const UserMenuScreen = () => {
  const navigation = useNavigation();
  const { t, i18n } = useTranslation();

  const [user, setUser] = useState(null);
  const [language, setLanguage] = useState("fr");
  const [profileImage, setProfileImage] = useState(null);
  const [register] = useMutation(UPDATE_PROFILE_IMAGE);

  // Initialisation des données
  useEffect(() => {
    const init = async () => {
      const savedLang = await AsyncStorage.getItem("language");
      if (savedLang) {
        setLanguage(savedLang);
        i18n.changeLanguage(savedLang);
      }

      const savedUser = await AsyncStorage.getItem("user");
      const savedProfileImage = await AsyncStorage.getItem("profileImage");

      if (savedUser) {
        const parsedUser = JSON.parse(savedUser);
        const finalImage = savedProfileImage || parsedUser.profileImage;
        setUser({ ...parsedUser, profileImage: finalImage });
        setProfileImage(finalImage);
      }
    };

    init();
  }, []);

  // Changer de langue
  const toggleLanguage = async () => {
    const newLang = language === "fr" ? "ar" : "fr";
    setLanguage(newLang);
    i18n.changeLanguage(newLang);
    await AsyncStorage.setItem("language", newLang);
  };

  // Déconnexion
  const handleLogout = () => {
    Alert.alert(
      t("Confirmation"),
      t("cdeconnecter"),
      [
        { text: t("Annuler"), style: "cancel" },
        {
          text: t("Déconnexion"),
          style: "destructive",
          onPress: async () => {
            await AsyncStorage.clear();
            navigation.replace("Login");
          },
        },
      ]
    );
  };

  // Sélection et mise à jour de l'image de profil
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
      setUser((prev) => ({ ...prev, profileImage: base64Image }));
      setProfileImage(base64Image);
      await AsyncStorage.setItem("profileImage", base64Image);

      const { data } = await register({
        variables: { username: user.username, profileImage: base64Image },
      });

      const updatedImage = data?.updateProfileImage?.profileImage;
      if (updatedImage) {
        setUser((prev) => ({ ...prev, profileImage: updatedImage }));
        setProfileImage(updatedImage);
        await AsyncStorage.setItem("profileImage", updatedImage);
      }
    } catch (error) {
      console.error("Erreur sélection image :", error);
    }
  };

  // Si l'utilisateur n'est pas connecté
  if (!user) {
    return (
      <View style={styles.centeredContainer}>
        <TouchableOpacity onPress={() => navigation.navigate("Login")}>
          <Feather name="log-in" size={20} color="green" />
          <Text style={styles.loginText}>{t("Se connecter")}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <Navbar />
      <ImageBackground
        source={require("../../assets/b2.jpeg")}
        style={styles.background}
        resizeMode="cover"
      >
        <View style={styles.container}>
          {/* Image de profil */}
          <TouchableOpacity style={styles.profileHeader} onPress={selectProfileImage}>
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.profileImage} />
            ) : (
              <View style={styles.initialsContainer}>
                <Text style={styles.profileInitials}>
                  {user.username[0].toUpperCase()}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          <Card style={styles.card}>
            {/* Nom d'utilisateur */}
            <Text style={styles.titleprofil}>
              {t("Bonjour")}, {user.username}
            </Text>

            {/* Bouton changement de langue */}
            <TouchableOpacity
              style={{
                flexDirection: i18n.language === "ar" ? "row-reverse" : "row",
                alignItems: "center",
                paddingVertical: 12,
                borderBottomColor: "#ddd",
                borderBottomWidth: 1,
              }}
              onPress={toggleLanguage}
            >
              <MaterialIcons
                name="language"
                size={24}
                color="#C8A55F"
                style={{ marginRight: 10 }}
              />
              <Text
                style={{
                  color: "white",
                  fontWeight: "bold",
                  fontSize: 16,
                  textAlign: i18n.language === "ar" ? "right" : "left",
                  marginRight: i18n.language === "ar" ? 10 : 0,
                }}
              >
                {language === "fr" ? "🇫🇷 Français" : "🇲🇷 العربية"}
              </Text>
            </TouchableOpacity>

            {/* Bouton déconnexion */}
            <TouchableOpacity
              style={{
                flexDirection: i18n.language === "ar" ? "row-reverse" : "row",
                alignItems: "center",
                paddingVertical: 12,
              }}
              onPress={handleLogout}
            >
              <Feather
                name="log-out"
                size={20}
                color="red"
                style={{ marginRight: 10 }}
              />
              <Text
                style={{
                  color: "white",
                  fontWeight: "bold",
                  fontSize: 16,
                  textAlign: i18n.language === "ar" ? "right" : "left",
                  marginRight: i18n.language === "ar" ? 10 : 0,
                }}
              >
                {t("Déconnexion")}
              </Text>
            </TouchableOpacity>
          </Card>

         <Text style={styles.textcoprit}>{t("copr")}</Text> 
        </View>
      </ImageBackground>
    </View>
  );
};

export default UserMenuScreen;
