import React, { useState, useEffect, useCallback, useRef } from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Feather } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
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
  const { i18n } = useTranslation();

  const [language, setLanguage] = useState("fr");
  const [user, setUser] = useState(null);
  const [profileImage, setProfileImage] = useState(null);


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





  return (
    <View style={styles.navbar}>
      
      {/* === ☰ Menu Icon, navigue vers l'écran de navigation === */}
      { (Array.isArray(role) && !(role.length === 1 && role[0] === "USER")) && ( 
        <TouchableOpacity
        style={{ marginRight: 'auto' }}
        onPress={() => navigation.navigate("NavigationListScreen", { role })}
      >
        <Feather name="menu" size={24} style={styles.colorText} />
      </TouchableOpacity>
      )}
      {/* === Logo centré === */}
        <TouchableOpacity  style={styles.logoButton} onPress={() => navigation.navigate("HomeScreen")}>
          <Image
            source={require("../../assets/logo.png")}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </TouchableOpacity>

     

<TouchableOpacity
  style={{ marginLeft: 'auto' }}
  onPress={() => navigation.navigate("UserMenuScreen", { user, profileImage, language })}
>
  <Feather name="user" size={25}  style={styles.colorText} />
</TouchableOpacity>

    </View>
  );
};

export default Navbar;
