import React, { useState } from "react";
import { 
  KeyboardAvoidingView, 
  Platform, 
  ImageBackground, 
  StyleSheet, 
  Text, 
  Image, 
  Dimensions, 
  View 
} from "react-native";
import { Card, TextInput, Button, Snackbar } from "react-native-paper";
import { useMutation, gql } from "@apollo/client";
import AsyncStorage from "@react-native-async-storage/async-storage";

const LOGIN_MUTATION = gql`
  mutation Login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      token
      username
      email
      profileImage
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

        // Stockage des informations utilisateur
        const userData = {
          username: data.login.username,
          profileImage: data.login.profileImage,
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
        <Card style={styles.card}>
          <View style={styles.titleContainer}>
            <Text style={styles.englishTitle}>Capital Market -</Text>  
            <Text style={styles.arabicTitle}>سوق كبتال</Text>
          </View>

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
              mode="contained"
              loading={loading}
              onPress={handleLogin}
              style={styles.button}
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

const styles = StyleSheet.create({
  background: { flex: 1, width: "100%", height: "100%", justifyContent: "center" },
  keyboardAvoidingView: { flex: 1, justifyContent: "center", padding: 20 },
  card: { padding: 30, borderRadius: 40, backgroundColor: "rgba(255, 255, 255, 0.3)", elevation: 0.1, shadowOpacity: 0.1 },
  titleContainer: { flexDirection: 'row', justifyContent: 'center', marginBottom: 10 },
  englishTitle: { fontSize: 20, fontWeight: 'bold', color: '#005bb5' },
  arabicTitle: { fontSize: 20, fontWeight: 'bold', color: '#005bb5', marginLeft: 5 },
  input: { marginBottom: 10 },
  button: { marginTop: 20, padding: 8, backgroundColor: "#005bb5" },
  registerButton: { marginTop: 10, alignSelf: "center" },
  productImage: { width: 100, height: 100, alignSelf: "center", marginBottom: 110, borderRadius: 50 },
});
