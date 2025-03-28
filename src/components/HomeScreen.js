import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Image, ImageBackground } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native"; // Pour la navigation
import Navbar from "./Navbar"; // Assure-toi que le chemin est correct
import styles from "./styles";  // Importer les styles

export default function HomeScreen() {
  const [profileImage, setProfileImage] = useState(null);
  const navigation = useNavigation(); // Hook de navigation

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // Vérification de la présence du token
        const token = await AsyncStorage.getItem("token");
        
        if (!token) {
          // Si aucun token n'est trouvé, rediriger vers l'écran de connexion
          navigation.replace("Login"); // Utiliser replace pour éviter que l'utilisateur revienne sur l'écran précédent
        } else {
          // Si un token est trouvé, récupérer l'image de profil
          const storedImage = await AsyncStorage.getItem("profileImage");
          if (storedImage) {
            setProfileImage(storedImage);
          }
        }
      } catch (error) {
        console.error("Erreur lors de la récupération du token ou de l'image de profil :", error);
      }
    };

    checkAuthStatus(); // Vérifier si l'utilisateur est connecté
  }, [navigation]); // Effectuer ce check à chaque fois que HomeScreen est affiché

  return (
    <View style={{ flex: 1 }}>
      <Navbar />

      <ImageBackground 
        source={require('../../assets/b2.jpeg')} 
        style={styles.background}
        resizeMode="cover"
      >
        <View style={styles.containerhomscreen}>
          <Text style={styles.text}>Bienvenue !</Text>
          
        </View>
      </ImageBackground>
    </View>
  );
}


