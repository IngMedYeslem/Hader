import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialIcons, Feather } from "@expo/vector-icons";

export default function Navbar() {
  const navigation = useNavigation();

  // Fonction pour gérer la déconnexion
  const handleLogout = async () => {
    await AsyncStorage.removeItem("token"); // Suppression du token
    navigation.replace("Login"); // Redirection vers l'écran de connexion
  };

  // Liste des éléments de la navbar
  const navItems = [
    { id: "1", name: "Produits", icon: "list", screen: "Products" },
    { id: "2", name: "Ajouter", icon: "plus-circle", screen: "addProduct" },
  ];

  return (
    <View style={styles.navbar}>
      <FlatList
        data={navItems}
        horizontal
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.navItem}
            onPress={() => navigation.navigate(item.screen)}
          >
            <Feather name={item.icon} size={24} color="white" />
            <Text style={styles.navText}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />
      
      {/* Bouton de déconnexion placé à droite */}
      <TouchableOpacity style={styles.navItem} onPress={handleLogout}>
        <MaterialIcons name="logout" size={24} color="white" />
        <Text style={styles.navText}>Déconnexion</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  navbar: {
    flexDirection: "row",
    justifyContent: "space-between", // Alignement des éléments
    backgroundColor: "#005bb5",
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  navItem: {
    flexDirection: "column",
    alignItems: "center",
    marginHorizontal: 15,
  },
  navText: {
    color: "white",
    fontSize: 14,
    marginTop: 5,
  },
});
