import React, { useState } from "react";
import { 
  KeyboardAvoidingView, 
  Platform, 
  ImageBackground, 
  Text, 
  Image, 
  View 
} from "react-native";
import { Card, TextInput, Button, Snackbar } from "react-native-paper";
import { useMutation } from "@apollo/client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";

import styles from "./styles";  // Importer les styles
import { LOGIN_MUTATION } from "../graphql/LOGIN_MUTATION";


export default function LoginScreen({ navigation }) {
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
        <Image 
          source={require('../../assets/logo.jpeg')}
          style={styles.productImage} 
        />
        
        <View style={styles.titleContainer}>
          <Text style={styles.englishTitle}>Capital Market -</Text>  
          <Text style={styles.arabicTitle}>سوق كبتال</Text>
        </View>
        
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.authTitle}>Authentification</Text>

            <TextInput
              label="Username"
              mode="outlined"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              style={styles.input}
            />

            <TextInput
              label="Mot de passe"
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
            />

            <Button
              mode="contained"
              loading={loading}
              onPress={handleLogin}
              style={styles.buttonlogin}
            >
              Se connecter
            </Button>

            <Button
              mode="text"
              onPress={() => navigation.navigate("RegisterScreen")}
              style={styles.registerButton}
            >
              Créer un compte
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

