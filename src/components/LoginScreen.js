import React, { useState, useCallback,useEffect} from "react";
import { 
  KeyboardAvoidingView, 
  Platform, 
  ImageBackground, 
  TouchableOpacity,
  Text,Image,View} from "react-native";
import { Card, TextInput, Button, Snackbar } from "react-native-paper";
import { useMutation } from "@apollo/client";
import AsyncStorage from "@react-native-async-storage/async-storage";

import styles from "./styles";  // Importer les styles
import { LOGIN_MUTATION } from "../graphql/LOGIN_MUTATION";
import { useTranslation } from "react-i18next";
import { MenuItem } from "react-native-material-menu";
import { MaterialIcons } from "@expo/vector-icons";


export default function LoginScreen({ navigation }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [secureText, setSecureText] = useState(true);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const { t, i18n } = useTranslation();
  const [language, setLanguage] = useState("fr");

  const [login, { loading }] = useMutation(LOGIN_MUTATION, {
    onCompleted: async (data) => {
      if (data.login.token) {
        await AsyncStorage.setItem("token", data.login.token);

        const userData = {
          username: data.login.username,
          email: data.login.email,
          profileImage: data.login.profileImage,
          role: data.login.roles ,  // Stocker les rôles aussi

        };
        await AsyncStorage.setItem("user", JSON.stringify(userData));

        navigation.replace("HomeScreen");
      }
    },
    onError: () => {
      setSnackbarMessage("Identifiants incorrects.");
      setSnackbarVisible(true);
    },
  });

  const handleLogin = async () => {
    if (!username || !password) {
      setSnackbarMessage("Veuillez entrer un username et un mot de passe.");
      setSnackbarVisible(true);
      return;
    }
    await login({ variables: { username, password } });
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
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"} 
        style={styles.keyboardAvoidingView}
      >
        

                
        
        <Card style={styles.card}>
            {/* <Text style={styles.arabicTitle}>MC</Text> */}
         
<Image 
          source={require('../../assets/logo.png')}
          style={[styles.productImage,{textAlign: "left"}]} 
        />

        <TouchableOpacity
  style={[
    styles.navItem,
    {
      alignSelf: language === "ar" ? "flex-end" : "flex-start", // pour aligner le bloc entier
      flexDirection: "row", // même sens pour les enfants
      alignItems: "center"
    }
  ]}
  onPress={toggleLanguage}
>
  <MaterialIcons name="language" size={24} style={styles.colorText} />
  <Text style={[styles.colorText, { marginLeft: 8 }]}>
    {language === "fr" ? "🇫🇷 France" : "🇲🇷 العربية"}
  </Text>
</TouchableOpacity>


          <Card.Content>
          <Text style={styles.englishTitle}>{t("cp")}</Text>  
            <Text style={styles.authTitle}>{t("Authentification")}</Text>

            <TextInput
  placeholder={t("username")}
  placeholderTextColor="#C8A55F" // Couleur du placeholder
  mode="outlined"
  value={username}
  onChangeText={setUsername}
  autoCapitalize="none"
  style={
    [styles.input,
    {
      textAlign: language === "ar" ? "right" : "left",
      

    }]
  }
/>

<TextInput
  placeholder={t("password")}
  placeholderTextColor="#C8A55F" // Couleur du placeholder
  mode="outlined"
              secureTextEntry={secureText}
              value={password}
              onChangeText={setPassword}
  style={[
    styles.input,
    {
      textAlign: language === "ar" ? "right" : "left",
    },
  ]}
  right={language === "ar" ? null : (
    <TextInput.Icon 
      icon={secureText ? "eye-off" : "eye"} 
      onPress={() => setSecureText(!secureText)}
    />
  )}
  left={language === "ar" ? (
    <TextInput.Icon 
      icon={secureText ? "eye-off" : "eye"} 
      onPress={() => setSecureText(!secureText)}
    />
  ) : null}
/>



            {/* <TextInput
             label={<Text style={styles.colorText}>{t("password")}</Text>}

              mode="outlined"
              secureTextEntry={secureText}
              value={password}
              onChangeText={setPassword}
              right={
                <TextInput.Icon 
                  icon={secureText ? "eye-off" : "eye"} 
                  onPress={() => setSecureText(!secureText)}
                />
              }
              style={styles.input}
            /> */}

            <Button
              mode="contained"
              loading={loading}
              onPress={handleLogin}
              style={styles.buttonlogin}
            >
              <Text >{t("SeConnecter")}</Text>

            </Button>

            <Button
              mode="text"
              onPress={() => navigation.navigate("RegisterScreen")}
            >
          <Text style={styles.colorText}>{t("Ccompte")}</Text>

              
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
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

