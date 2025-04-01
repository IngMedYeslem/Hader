import React, { useState } from "react";
import { ScrollView, View, ImageBackground, Text } from "react-native";
import { Card, TextInput, Button, Snackbar, ActivityIndicator } from "react-native-paper";
import { useQuery, useMutation } from "@apollo/client";
import { GET_USERS } from "../graphql/GetUsers";
import { UPDATE_USER_MUTATION } from "../graphql/UpdateUser";
import Navbar from "./Navbar";
import { useTranslation } from "react-i18next";
import styles from "./styles";
import { useNavigation } from "@react-navigation/native";

export default function UserAdminScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { data, loading, error, refetch } = useQuery(GET_USERS);
  const [updateUser, { loading: updating }] = useMutation(UPDATE_USER_MUTATION);
  const [editingUser, setEditingUser] = useState(null);
  const [updatedData, setUpdatedData] = useState({});
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  if (loading) return <ActivityIndicator animating={true} color="#6200ee" style={styles.loader} />;
  if (error) return <Text style={styles.errorText}>{t("Erreur")}: {error.message}</Text>;

  const handleEdit = (user) => {
    setEditingUser(user);
    setUpdatedData({ ...user, roles: user.roles.join(", ") });
  };

  const handleChange = (field, value) => {
    setUpdatedData({ ...updatedData, [field]: value });
  };

  const handleSave = async () => {
    await updateUser({
      variables: {
        username: updatedData.username,
        email: updatedData.email,
        roles: updatedData.roles.split(",").map(r => r.trim())
      },
    });
    setEditingUser(null);
    setSnackbarMessage(t("Utilisateur mis à jour avec succès"));
    setSnackbarVisible(true);
    refetch();
  };

  return (
    <View style={{ flex: 1 }}>
      <Navbar />
      <ImageBackground source={require("../../assets/b2.jpeg")} style={styles.background} resizeMode="cover">
        <ScrollView contentContainerStyle={styles.container}>
          <Button mode="contained" onPress={() => navigation.goBack()} style={styles.button}>
            {t("Retour")}
          </Button>
          <Text style={styles.title}>{t("Gestion des utilisateurs")}</Text>
          {data.users.map((user) => (
            <Card key={user.id} style={styles.card}>
              <Card.Title title={user.username} subtitle={user.email} />
              <Card.Content>
                {editingUser?.id === user.id ? (
                  <>
                    <TextInput label={t("Nom")}
                      value={updatedData.username}
                      onChangeText={(text) => handleChange("username", text)}
                      style={styles.input}
                    />
                    <TextInput label={t("Email")}
                      value={updatedData.email}
                      onChangeText={(text) => handleChange("email", text)}
                      style={styles.input}
                    />
                    <TextInput label={t("Roles")}
                      value={updatedData.roles}
                      onChangeText={(text) => handleChange("roles", text)}
                      style={styles.input}
                    />
                    <Button mode="contained" onPress={handleSave} loading={updating} style={styles.button}>
                      {t("Enregistrer")}
                    </Button>
                  </>
                ) : (
                  <Button mode="contained" onPress={() => handleEdit(user)} style={styles.button}>
                    {t("Modifier")}
                  </Button>
                )}
              </Card.Content>
            </Card>
          ))}
        </ScrollView>
      </ImageBackground>
      <Snackbar visible={snackbarVisible} onDismiss={() => setSnackbarVisible(false)} duration={3000}>
        {snackbarMessage}
      </Snackbar>
    </View>
  );
}
