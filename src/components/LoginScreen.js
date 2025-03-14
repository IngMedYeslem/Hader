import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, ImageBackground, StyleSheet, Text, Dimensions } from "react-native";
import { Card, TextInput, Button, Snackbar } from "react-native-paper";
import { useMutation, gql } from "@apollo/client";
import AsyncStorage from "@react-native-async-storage/async-storage";

// 🔹 Mutation GraphQL pour la connexion
const LOGIN_MUTATION = gql`
  mutation Login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      token
    }
  }
`;

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

  // Récupérer la largeur de l'écran pour adapter les styles
  const screenWidth = Dimensions.get('window').width;
  const isSmallScreen = screenWidth < 375; // Si l'écran est plus petit que 375px, appliquer les styles responsives

  const stylesToApply = isSmallScreen ? responsiveStyles : styles;

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
          <Card.Title 
            title={
              <Text style={stylesToApply.title}>
                <Text style={stylesToApply.englishTitle}>Capital Market</Text> - 
                <Text style={stylesToApply.arabicTitle}> سوق العاصمة</Text>
              </Text>
            }
            titleStyle={stylesToApply.cardTitle} 
          />
          <Card.Title 
            title="Authentification" 
            titleStyle={stylesToApply.cardTitle} 
          />
          <Card.Content>
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
              mode="outlined"
              loading={loading}
              onPress={handleLogin}
              buttonColor="blue"
              textColor="white"
              style={styles.button}
            >
              Se connecter
            </Button>
          </Card.Content>
        </Card>

        {/* Snackbar pour afficher les erreurs */}
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

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
    justifyContent: "center",
  },
  keyboardAvoidingView: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  card: {
    padding: 30,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.3)", // Vert avec 70% d'opacité
    elevation: 0, // Supprime l'ombre sur Android
    shadowOpacity: 0, // Supprime l'ombre sur iOS
  },
  cardTitle: {
    color: "#005bb5",
    fontSize: 22,
    justifyContent: "center",
    textAlign: "center",
  },
  title: {
    flexDirection: 'row', // Alignement horizontal pour les deux textes
    justifyContent: 'center',
    textAlign: 'center',
    fontSize: 22, // Taille de texte par défaut
    paddingHorizontal: 10, // Un petit padding horizontal pour éviter que le texte touche les bords
    flexWrap: 'wrap', // Permet au texte de se répartir sur plusieurs lignes si nécessaire
  },
  englishTitle: {
    fontSize: 18, // Taille de texte pour l'anglais
    fontWeight: 'bold',
    color: '#005bb5',
  },
  arabicTitle: {
    fontSize: 18, // Taille de texte pour l'arabe
    fontWeight: 'bold',
    color: '#005bb5',
    marginRight: 5, // Espacement entre les deux textes
    flexWrap: 'wrap', // S'assurer que le texte arabe peut aussi s'enrouler
  },
  input: {
    marginBottom: 10,
  },
  button: {
    marginTop: 20,
    padding: 5,
    backgroundColor: "#005bb5",
  },
});

// Styles responsives pour les petits écrans
const responsiveStyles = StyleSheet.create({
  title: {
    fontSize: 18, // Réduit la taille de texte pour les petits écrans
    textAlign: 'center', // Centrer le texte texte
  },
  englishTitle: {
    fontSize: 18, // Réduit la taille de texte pour l'anglais sur petit écran
  },
  arabicTitle: {
    fontSize: 18, // Réduit la taille de texte pour l'arabe sur petit écran
    textAlign: 'center', // Centrer le texte arabe
  },
});
