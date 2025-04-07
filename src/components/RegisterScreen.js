import React, { useState, useCallback, useEffect } from "react";
import { 
  KeyboardAvoidingView, 
  Platform, 
  ImageBackground, 
  Text, 
  Image,View 
} from "react-native";
import { Card, TextInput, Button, Snackbar } from "react-native-paper";
import { useMutation, gql } from "@apollo/client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from 'expo-image-manipulator';
import styles from "./styles";  // Importer les styles
import { useTranslation } from "react-i18next";

const REGISTER_MUTATION = gql`
  mutation Register($username: String!, $email: String!, $password: String!, $profileImage: String) {
    register(username: $username, email: $email, password: $password, profileImage: $profileImage) {
      token
    }
  }
`;

export default function RegisterScreen({ navigation }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [secureText, setSecureText] = useState(true);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const { t, i18n } = useTranslation();
  const [language, setLanguage] = useState("fr");
  const [register, { loading }] = useMutation(REGISTER_MUTATION, {
    onCompleted: async (data) => {
      try {
        const token = data.register.token;
        const userData = {
          username: username,
          profileImage: profileImage,
        };
        await AsyncStorage.setItem("user", JSON.stringify(userData));

        if (token) {
          await AsyncStorage.setItem("token", token);
          navigation.replace("HomeScreen");
        }
      } catch (error) {
        console.error("Erreur AsyncStorage :", error);
      }
    },
    onError: (error) => {
      console.error("❌ Erreur d'inscription :", error);
      setSnackbarMessage("L'inscription a échoué. Essayez un autre username ou email.");
      setSnackbarVisible(true);
    },
  });

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert("Permission requise pour accéder à la galerie.");
      return false;
    }
    return true;
  };

  const selectProfileImage = async () => {
    console.log("📷 Tentative de sélection d'une image...");
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.5, // Réduire la qualité de l'image
        base64: true,
      });

      if (result.canceled) {
        console.log("⚠️ Sélection annulée.");
        return;
      }

      if (result.assets && result.assets.length > 0) {
        const selectedImage = result.assets[0];
        console.log("✅ Image sélectionnée :", selectedImage.uri);

        // Compresser et redimensionner l'image
        const compressedImage = await ImageManipulator.manipulateAsync(
          selectedImage.uri, // URI de l'image sélectionnée
          [{ resize: { width: 500 } }], // Redimensionner l'image à une largeur de 500px
          { compress: 0.5, format: ImageManipulator.SaveFormat.JPEG, base64: true } // Compresser l'image à 50% de sa qualité
        );

        // Mettre à jour l'état avec l'image compressée
        setProfileImage(`data:${compressedImage.mimeType};base64,${compressedImage.base64}`);
      }
    } catch (error) {
      console.error("❌ Erreur lors de la sélection de l'image :", error);
    }
  };

  const handleRegister = async () => {
    if (!username || !email || !password || !confirmPassword) {
      setSnackbarMessage("Tous les champs sont requis.");
      setSnackbarVisible(true);
      return;
    }

    if (password !== confirmPassword) {
      setSnackbarMessage("Les mots de passe ne correspondent pas.");
      setSnackbarVisible(true);
      return;
    }

    await register({
      variables: {
        username,
        email,
        password,
        profileImage: profileImage || ""
      }
    });
  };

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

  const toggleLanguage = async () => {
    const newLang = language === "fr" ? "ar" : "fr";
    setLanguage(newLang);
    i18n.changeLanguage(newLang);
    await AsyncStorage.setItem("language", newLang);
  };

  return (
    <ImageBackground 
      source={require('../../assets/b2.jpeg')} 
      style={styles.background}
      resizeMode="cover"
    >
    <View style={styles.container}>
        <Card style={styles.card}>
          <Text style={[styles.authTitle, styles.createAccountText]}>
            {t("Ccompte")}
          </Text>

          <Card.Content>
            <TextInput
              placeholder={t("username")}
              placeholderTextColor="#C8A55F"
              mode="outlined"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              style={[
                styles.input,
                { textAlign: i18n.language === "ar" ? "right" : "left" }
              ]}
            />

            <TextInput
              placeholder={t("email")}
              placeholderTextColor="#C8A55F"
              mode="outlined"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              style={[
                styles.input,
                { textAlign: i18n.language === "ar" ? "right" : "left" }
              ]}
            />

            <TextInput
              placeholder={t("password")}
              placeholderTextColor="#C8A55F"
              mode="outlined"
              secureTextEntry={secureText}
              value={password}
              onChangeText={setPassword}
               right={i18n.language === "ar" ? null : (
                              <TextInput.Icon 
                                icon={secureText ? "eye-off" : "eye"} 
                                onPress={() => setSecureText(!secureText)}
                              />
                            )}
                            left={i18n.language === "ar" ? (
                              <TextInput.Icon 
                                icon={secureText ? "eye-off" : "eye"} 
                                onPress={() => setSecureText(!secureText)}
                              />
                            ) : null}
              style={[
                styles.input,
                { textAlign: i18n.language === "ar" ? "right" : "left" }
              ]}
            />

            <TextInput
              placeholder={t("confirmPassword")}
              placeholderTextColor="#C8A55F"
              mode="outlined"
              secureTextEntry={secureText}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
               right={i18n.language === "ar" ? null : (
                              <TextInput.Icon 
                                icon={secureText ? "eye-off" : "eye"} 
                                onPress={() => setSecureText(!secureText)}
                              />
                            )}
                            left={i18n.language === "ar" ? (
                              <TextInput.Icon 
                                icon={secureText ? "eye-off" : "eye"} 
                                onPress={() => setSecureText(!secureText)}
                              />
                            ) : null}
              style={[
                styles.input,
                { textAlign: i18n.language === "ar" ? "right" : "left" }
              ]}
            />

            <Button 
              mode="contained" 
              onPress={selectProfileImage}
              style={styles.button}
            >
              <Text>{t("selectProfileImage")}</Text>
            </Button>

            {profileImage && (
              <Image 
                source={{ uri: profileImage }} 
                style={styles.profileImagePreview} 
              />
            )}

            <Button
              mode="contained"
              loading={loading}
              onPress={handleRegister}
              style={styles.button}
            >
              <Text>{t("inscrire")}</Text>
            </Button>

            <Button 
              mode="text" 
              onPress={() => navigation.navigate("Login")}
              style={styles.loginButton}
            >
              <Text style={[{ fontSize: 10 }, styles.colorText]}>
                {t("VConnectezVous")}
              </Text>
            </Button>
          </Card.Content>
        </Card>

        <Snackbar
          visible={snackbarVisible}
          onDismiss={() => setSnackbarVisible(false)}
          duration={3000}
        >
          {snackbarMessage}
        </Snackbar>
      </View>
    </ImageBackground>
  );
}
