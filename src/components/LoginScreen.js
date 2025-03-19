import React, { useState } from "react";
import { 
  KeyboardAvoidingView, 
  Platform, 
  ImageBackground, 
  StyleSheet, 
  Text, 
  Image, 
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
  card: {
    padding: 20, 
    borderRadius: 15, 
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    borderWidth: 0,
  },
  titleContainer: { flexDirection: 'row', justifyContent: 'center', marginBottom: 10 },
  englishTitle: { fontSize: 24, fontWeight: 'bold', color: '#005bb5' },
  arabicTitle: { fontSize: 24, fontWeight: 'bold', color: '#005bb5', marginLeft: 5 },
  authTitle: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 20, color: '#005bb5' },
  input: { marginBottom: 15 },
  button: { marginTop: 20, padding: 8, backgroundColor: "#005bb5", borderRadius: 10 },
  registerButton: { marginTop: 10, alignSelf: "center", color: "#005bb5" },
  productImage: { width: 80, height: 80, alignSelf: "center", marginBottom: 20, borderRadius: 40 },
});
