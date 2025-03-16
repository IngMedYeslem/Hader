import React, { useState, useEffect } from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

export default function ProfileScreen() {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const savedUser = await AsyncStorage.getItem("user");
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        }
      } catch (error) {
        console.error("Erreur lors du chargement de l'utilisateur :", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      await AsyncStorage.clear();
      navigation.replace("Login");
    } catch (error) {
      console.error("Erreur lors de la déconnexion :", error);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#005bb5" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Profil */}
      <View style={styles.profileContainer}>
        {user?.profileImage ? (
          <Image source={{ uri: user.profileImage }} style={styles.profileImage} />
        ) : (
          <View style={styles.initialsContainer}>
            <Text style={styles.profileInitials}>{user?.username?.charAt(0).toUpperCase()}</Text>
          </View>
        )}
        <Text style={styles.username}>{user?.username || "Utilisateur"}</Text>
        <Text style={styles.email}>{user?.email || "Email inconnu"}</Text>
      </View>

      {/* Boutons d'action */}
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("EditProfile")}>
        <MaterialIcons name="edit" size={24} color="white" />
        <Text style={styles.buttonText}>{t("Modifier le profil")}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, styles.logoutButton]} onPress={handleLogout}>
        <MaterialIcons name="logout" size={24} color="white" />
        <Text style={styles.buttonText}>{t("Déconnexion")}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    padding: 20,
  },
  profileContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  initialsContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#005bb5",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  profileInitials: {
    fontSize: 40,
    fontWeight: "bold",
    color: "white",
  },
  username: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  email: {
    fontSize: 14,
    color: "#666",
    marginTop: 5,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#005bb5",
    padding: 15,
    borderRadius: 8,
    marginTop: 15,
    width: "80%",
    justifyContent: "center",
  },
  logoutButton: {
    backgroundColor: "#d9534f",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    marginLeft: 10,
  },
});
