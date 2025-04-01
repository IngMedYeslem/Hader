import React, { useState } from "react";
import { View, Text, ImageBackground } from "react-native";
import { useMutation, gql } from "@apollo/client";
import { Card, Button, TextInput, Snackbar } from "react-native-paper";
import Navbar from "./Navbar";
import styles from "./styles";
import { useTranslation } from "react-i18next";  // Importer la traduction

// 🔹 Mutation GraphQL pour ajouter un rôle
const ADD_ROLE_MUTATION = gql`
  mutation AddRole($name: String!) {
    addRole(name: $name) {
      id
      name
    }
  }
`;

const AddRole = () => {
  const [roleName, setRoleName] = useState("");
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarError, setSnackbarError] = useState(false);
  const [addRole, { loading, error }] = useMutation(ADD_ROLE_MUTATION);
  const { t } = useTranslation(); // Hook de traduction

  const handleSubmit = async () => {
    if (!roleName.trim()) {
      setSnackbarMessage(t("RoleRequis"));
      setSnackbarError(true);
      setSnackbarVisible(true);
      return;
    }

    try {
      await addRole({ variables: { name: roleName } });
      setSnackbarMessage(`${t("RoleAjouteSucces")} "${roleName}"`);
      setSnackbarError(false);
      setSnackbarVisible(true);
      setRoleName(""); // Réinitialiser le champ
    } catch (err) {
      setSnackbarMessage(`${t("ErreurAjoutRole")}: ${err.message}`);
      setSnackbarError(true);
      setSnackbarVisible(true);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <Navbar />
      <ImageBackground source={require("../../assets/b2.jpeg")} style={styles.background} resizeMode="cover">
        <View style={styles.container}>
          <Text style={styles.title}>{t("AjouterRole")}</Text>
          <Card style={styles.card}>
            <TextInput
              label={t("NomRole")}
              mode="outlined"
              value={roleName}
              onChangeText={setRoleName}
              style={styles.input}
            />
            <Button mode="contained" onPress={handleSubmit} loading={loading} style={styles.button}>
              {loading ? t("AjoutEnCours") : t("AjoutRole")}
            </Button>
            {error && <Text style={{ color: "red", marginTop: 10 }}>{error.message}</Text>}
          </Card>
        </View>
      </ImageBackground>
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        style={snackbarError ? styles.snackbarError : styles.snackbarSuccess}
      >
        {snackbarMessage}
      </Snackbar>
    </View>
  );
};

export default AddRole;
