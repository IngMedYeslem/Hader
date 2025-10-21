import React, { useState, useCallback } from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Feather } from "@expo/vector-icons";
import { getLanguage, setLanguage, useTranslation } from '../translations';
import styles from "./styles";



const Navbar = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [currentLang, setCurrentLang] = useState(getLanguage());

  const cycleLanguage = () => {
    const languages = ['fr', 'en', 'ar'];
    const currentIndex = languages.indexOf(currentLang);
    const nextIndex = (currentIndex + 1) % languages.length;
    setLanguage(languages[nextIndex]);
    setCurrentLang(languages[nextIndex]);
  };
  const [user, setUser] = useState(null);
  const [profileImage, setProfileImage] = useState(null);


  const role = user?.role || "";



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
            source={require("../../assets/logof.png")}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </TouchableOpacity>

      <TouchableOpacity style={styles.navItem} onPress={cycleLanguage}>
        <Text style={styles.language}>{currentLang.toUpperCase()}</Text>
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
