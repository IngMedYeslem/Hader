import React from "react";
import { View, Text, StyleSheet, ImageBackground } from "react-native";
import Navbar from "./Navbar";  // Assure-toi que le chemin est correct

export default function HomeScreen() {
  return (
    <View style={{ flex: 1 }}>
        {/* ✅ Intégration correcte de Navbar */}
        <Navbar />

    <ImageBackground 
  source={require('../../assets/background.webp')} 
  style={styles.background}
  resizeMode="cover"
>
  {/* <View style={styles.container}>
    <Text style={styles.text}>Bienvenue !</Text>
  </View> */}
</ImageBackground>
</View>

  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  text: { color: "#fff", fontSize: 24, fontWeight: "bold", backgroundColor: "rgba(0, 0, 0, 0.5)", padding: 10, borderRadius: 8 },
});
