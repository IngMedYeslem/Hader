import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, ImageBackground, StyleSheet } from "react-native";
import { Card, TextInput, Button, Snackbar } from "react-native-paper";
import { useMutation, gql } from "@apollo/client";
import AsyncStorage from "@react-native-async-storage/async-storage";
// const backgroundSource = Image.resolveAssetSource(require("../../assets/background.jpeg"));
const backgroundSource = require("../../assets/background.jpeg");


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

  return (
      <ImageBackground 
      source={require('../../assets/background.jpeg')} 
      style={styles.background}
      resizeMode="cover"
    >
       <KeyboardAvoidingView 
    behavior={Platform.OS === "ios" ? "padding" : "height"} 
    style={{ flex: 1, justifyContent: "center" , padding: 20}}
  >
        <Card style={styles.card}>
          <Card.Title 
            title="C A P I T A L " 
            titleStyle={styles.cardTitle} 
            // titleStyle={{ color: "blue", fontSize: 22, fontWeight: "bold",    justifyContent: "center",
            // textAlign: "center", }} 

          />
          <Card.Title 
            title="Authentification" 
            titleStyle={styles.cardTitle} 
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

// const styles = StyleSheet.create({
//   background: {
//     flex: 1,
//     justifyContent: "center",
//   },
//   container: {
//     flex: 1,
//     justifyContent: "center",
//     padding: 20,
//     backgroundColor: "#f5f5f5",
//   },
//   card: {
//     padding: 30,
//     borderRadius: 40,
//     backgroundColor: "rgba(0, 122, 61, 0.7)", // Vert avec 70% d'opacité
//     elevation: 0, // 🔹 Supprime l'ombre sur Android
//     shadowOpacity: 0, // 🔹 Supprime l'ombre sur iOS
//   },
//   cardTitle: {
//     // textAlign: "center",
//     // fontSize: 22,
//     // fontWeight: "bold",
//     // textColor:"white",

//     color: "blue",
//     fontSize: 22, 
//     fontWeight: "bold", 
//     justifyContent: "center",
//     textAlign: "center",
//   },
//   input: {
//     marginBottom: 10,
//   },
//   button: {
//     marginTop: 20,
//     padding: 5,
//   },
// });

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: "center",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  card: {
    padding: 30,
    borderRadius: 40,
    backgroundColor: "rgba(0, 122, 61, 0.9)", // 🌿 Vert du drapeau
    elevation: 4, // Effet d'ombre légère
    shadowOpacity: 0.3,
    shadowRadius: 5,
    borderWidth: 2,
    borderColor: "#CE1126", // 🔴 Bordures rouges comme les bandes du drapeau
    overflow: "hidden",
  },
  cardTitle: {
    color: "#FFD700", // ⭐ Jaune doré pour rappeler l'étoile et le croissant du drapeau
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
  },
  input: {
    marginBottom: 10,
    backgroundColor: "white", // 🎨 Fond blanc pour une meilleure lisibilité
  },
  button: {
    marginTop: 20,
    padding: 5,
    backgroundColor: "#CE1126", // 🔴 Bouton rouge inspiré du drapeau
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
  redBands: {
    position: "absolute",
    width: "100%",
    height: "10%", // Épaisseur des bandes rouges
    backgroundColor: "#CE1126",
  },
  topBand: { top: 0 },
  bottomBand: { bottom: 0 },
});