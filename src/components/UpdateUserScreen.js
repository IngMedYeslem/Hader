import React, { useState, useEffect } from "react";
import { ScrollView } from "react-native";
import { Card, TextInput, Button, Snackbar } from "react-native-paper";
import { useMutation } from "@apollo/client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { UPDATE_USER_MUTATION } from "../graphql/UpdateUser";

export default function UpdateUserScreen({ navigation }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState(""); // ✅ Stocker sous forme de chaîne pour l'affichage
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  // 🔹 Charger les données utilisateur depuis AsyncStorage
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const savedUser = await AsyncStorage.getItem("user");
        if (savedUser) {
          const userData = JSON.parse(savedUser);
          setUsername(userData.username || "");
          setEmail(userData.email || "");

          // ✅ Vérifie si `role` est un tableau et le convertit en chaîne
          setRole(userData.role ? (Array.isArray(userData.role) ? userData.role.join(", ") : userData.role) : "");
        }
      } catch (error) {
        console.error("Erreur lors du chargement des données utilisateur :", error);
      }
    };

    loadUserData();
  }, []);

  // 🔹 Mutation GraphQL pour mettre à jour l'utilisateur
  const [updateUser, { loading }] = useMutation(UPDATE_USER_MUTATION, {
    onCompleted: () => {
      setSnackbarMessage("Utilisateur mis à jour avec succès");
      setSnackbarVisible(true);
      navigation.replace("HomeScreen");
    },
    onError: () => {
      setSnackbarMessage("Erreur lors de la mise à jour de l'utilisateur");
      setSnackbarVisible(true);
    },
  });

  // 🔹 Fonction de mise à jour
  const handleUpdateUser = () => {
    if (!username || !email || !role) { 
      setSnackbarMessage("Veuillez remplir tous les champs.");
      setSnackbarVisible(true);
      return;
    }

    // ✅ Vérifie si `role` est un tableau ou une chaîne avant `split()`
    const rolesArray = Array.isArray(role) ? role : role.split(",").map(r => r.trim());

    updateUser({ variables: { username, email, roles: rolesArray } }); // ✅ Envoyer `roles` en tant que tableau
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Card>
        <Card.Title title="Mettre à jour l'utilisateur" />
        <Card.Content>
          <TextInput
            label="Nom d'utilisateur"
            mode="outlined"
            value={username}
            onChangeText={setUsername}
            style={{ marginBottom: 16 }}
          />

          <TextInput
            label="Email"
            mode="outlined"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            style={{ marginBottom: 16 }}
          />

          <TextInput
            label="Roles"
            mode="outlined"
            value={role}
            onChangeText={setRole} // ✅ Stocke `role` en chaîne pour l'affichage
            style={{ marginBottom: 16 }}
          />

          <Button mode="contained" onPress={handleUpdateUser} loading={loading} style={{ marginTop: 16 }}>
            Mettre à jour
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
    </ScrollView>
  );
}
