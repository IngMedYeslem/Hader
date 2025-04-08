import React, { useMemo } from "react";
import { View, Text, TouchableOpacity, ImageBackground } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { Card } from "react-native-paper";

import Navbar from "./Navbar";
import styles from "./styles"; // Réutilise les styles communs

const NavigationListScreen = ({ route }) => {
  const navigation = useNavigation();
  const { t, i18n } = useTranslation();
  const { role } = route.params;

  const navItems = useMemo(() => {
    const items = [];

    if (role.includes("ADMIN")) {
      items.push({ id: "1", name: t("GestionRoles"), icon: "shield", screen: "AddRole" });
      items.push({ id: "2", name: t("GestionUsers"), icon: "users", screen: "UserAdminScreen" });
    }

    if (role.includes("LIST-PROD")) {
      items.push({ id: "3", name: t("Produits"), icon: "package", screen: "Products" });
    }

    if (role.includes("AJOUT-PROD")) {
      items.push({ id: "4", name: t("AjouterProd"), icon: "plus-circle", screen: "addProduct" });
    }

    return items;
  }, [role, t]);

  return (
    <View style={{ flex: 1 }}>
      <Navbar />

      <ImageBackground
        source={require("../../assets/b2.jpeg")}
        style={styles.background}
        resizeMode="cover"
      >
        <View style={styles.container}>
          {/* <Text style={styles.title}>{t("mainMenu")}</Text> */}

          <Card style={styles.card}>
            {navItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={{
                  flexDirection: i18n.language === "ar" ? "row-reverse" : "row", // Change la direction en fonction de la langue
                  alignItems: "center",
                  paddingVertical: 12,
                  borderBottomColor: "#ddd",
                  borderBottomWidth: 1,
                }}
                onPress={() => navigation.navigate(item.screen)}
              >
                <Feather
                  name={item.icon}
                  size={22}
                  color="#C8A55F"
                  style={{ marginRight: 10 }} // Espace à droite de l'icône
                />

                <Text
                  style={{
                    color: "white",
                    fontWeight: "bold",
                    fontSize: 16,
                    textAlign: i18n.language === "ar" ? "right" : "left", // Alignement du texte
                    // marginLeft: i18n.language === "ar" ? 0 : 10, // Ajoute un espace à gauche du texte (si pas en arabe)
                    marginRight: i18n.language === "ar" ? 10 : 0, // Ajoute un espace à droite du texte (si en arabe)
                  }}
                >
                  {item.name}
                </Text>
              </TouchableOpacity>
            ))}
          </Card>
        </View>
      </ImageBackground>
    </View>
  );
};

export default NavigationListScreen;
