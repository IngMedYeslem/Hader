import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";

export default function Navbar() {
  const navigation = useNavigation();

  return (
    <View style={styles.navbar}>
      <TouchableOpacity onPress={() => navigation.navigate("Products")}>
        <Text style={styles.navText}>🏠 Produits</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate("addProduct")}>
        <Text style={styles.navText}>➕ Ajouter</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  navbar: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 15,
    backgroundColor: "#007bff",
  },
  navText: {
    color: "white",
    fontSize: 16,
  },
});
