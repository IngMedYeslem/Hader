import React, { useState } from "react";
import { 
  View, // Remplace KeyboardAvoidingView
  Platform, 
  ImageBackground, 
  Text,
  Image
} from "react-native";
import { Card, TextInput, Button, Snackbar } from "react-native-paper";
import { useMutation } from "@apollo/client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LOGIN_MUTATION } from "../graphql/LOGIN_MUTATION";
import { useTranslation } from "react-i18next";
import LanguageToggle from "./LanguageToggle";
import styles from "./styles";

export default function LoginScreen({ navigation }) {
  const { t, i18n } = useTranslation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [secureText, setSecureText] = useState(true);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const [login, { loading }] = useMutation(LOGIN_MUTATION, {
    onCompleted: async (data) => {
      if (data.login.token) {
        await AsyncStorage.setItem("token", data.login.token);
        const userData = {
          username: data.login.username,
          email: data.login.email,
          profileImage: data.login.profileImage,
          role: data.login.roles,
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

  return (
    <ImageBackground 
      source={require('../../assets/b2.jpeg')} 
      style={styles.background}
      resizeMode="cover"
    >
      {/* Remplacement de KeyboardAvoidingView par View */}
      <View style={styles.container}>
        <Card style={styles.card}>
          <Image 
            source={require('../../assets/logo.png')}
            style={[styles.productImage, { textAlign: "left" }]} 
          />
          
          <LanguageToggle />
          
          <Card.Content>
            <Text style={styles.englishTitle}>{t("cp")}</Text>
            <Text style={styles.authTitle}>{t("Authentification")}</Text>

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
              placeholder={t("password")}
              placeholderTextColor="#C8A55F"
              mode="outlined"
              secureTextEntry={secureText}
              value={password}
              onChangeText={setPassword}
              style={[
                styles.input,
                { textAlign: i18n.language === "ar" ? "right" : "left" }
              ]}
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
            />

            <Button
              mode="contained"
              loading={loading}
              onPress={handleLogin}
              style={styles.buttonlogin}
            >
              <Text>{t("SeConnecter")}</Text>
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
      </View>
    </ImageBackground>
  );
}