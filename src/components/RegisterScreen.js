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
import { launchImageLibrary } from 'react-native-image-picker'; // Utiliser launchImageLibrary

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
  const [profileImage, setProfileImage] = useState(null); // Ajoute un état pour l'image du profil

  const [register, { loading }] = useMutation(REGISTER_MUTATION, {
    onCompleted: async (data) => {
      if (data.register.token) {
        await AsyncStorage.setItem("token", data.register.token);
        navigation.replace("HomeScreen");
      }
    },
    onError: () => {
      setSnackbarMessage("L'inscription a échoué. Essayez un autre username ou email.");
      setSnackbarVisible(true);
    },
  });

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
        profileImage 
      } 
    });
  };

  const selectProfileImage = () => {
    const options = {
      mediaType: 'photo', // S'assurer que seul les fichiers image sont sélectionnés
      quality: 1, // Qualité de l'image
    };

    launchImageLibrary(options, response => { // Remplacer showImagePicker par launchImageLibrary
      if (response.didCancel) {
        console.log('User canceled image picker');
      } else if (response.errorCode) {
        console.log('ImagePicker Error: ', response.errorMessage);
      } else {
        setProfileImage(response.assets[0].uri); // Stocke l'URI de l'image
      }
    });
  };

  const screenWidth = Dimensions.get('window').width;
  const isSmallScreen = screenWidth < 375; 
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
        <Image 
          source={require('../../assets/logo.jpeg')}
          style={styles.productImage} 
        />

        <Card style={styles.card}>
          <View style={styles.titleContainer}>
            <Text style={stylesToApply.englishTitle}>Capital Market -</Text>  
            <Text style={stylesToApply.arabicTitle}>  سوق كبتال</Text>
          </View>

          <Card.Content>
            <TextInput
              label="Nom d'utilisateur"
              mode="outlined"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              style={styles.input}
            />

            <TextInput
              label="Email"
              mode="outlined"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
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

            <TextInput
              label="Confirmer le mot de passe"
              mode="outlined"
              secureTextEntry={secureText}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              right={
                <TextInput.Icon 
                  icon={secureText ? "eye-off" : "eye"} 
                  onPress={() => setSecureText(!secureText)}
                />
              }
              style={styles.input}
            />

            {/* Ajouter un bouton pour sélectionner une image */}
            <Button 
              mode="contained" 
              onPress={selectProfileImage}
              style={styles.button}
            >
              Sélectionner une image de profil
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
              S'inscrire
            </Button>

            <Button 
              mode="text" 
              onPress={() => navigation.navigate("Login")}
              style={styles.loginButton}
            >
  <Text style={{ fontSize: 10 }}>Vous avez déjà un compte ? Connectez-vous</Text>
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
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    elevation: 0,
    shadowOpacity: 0,
  },
  titleContainer: {
    flexDirection: 'row', 
    justifyContent: 'center',
    marginBottom: 10,
  },
  englishTitle: {
    fontSize: 20, 
    fontWeight: 'bold',
    color: '#005bb5',
  },
  arabicTitle: {
    fontSize: 20, 
    fontWeight: 'bold',
    color: '#005bb5',
    marginLeft: 5, 
  },
  input: {
    marginBottom: 10,
  },
  button: {
    marginTop: 20,
    padding: 8,
    backgroundColor: "#005bb5",
  },
  loginButton: {
    marginTop: 10,
    alignSelf: "center",
    color: '#005bb5',

  },
  productImage: {
    width: 100,
    height: 100,
    alignSelf: "center",
    marginBottom: 0,
    borderRadius: 50,
  },
  profileImagePreview: {
    width: 100,
    height: 100,
    alignSelf: "center",
    marginTop: 10,
    borderRadius: 50,
    
  },
});

const responsiveStyles = StyleSheet.create({
  englishTitle: {
    fontSize: 18,
  },
  arabicTitle: {
    fontSize: 18,
    textAlign: 'center',
  },
});
