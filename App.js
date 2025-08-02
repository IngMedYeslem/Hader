import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { ApolloClient, InMemoryCache, ApolloProvider, createHttpLink } from "@apollo/client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { setContext } from "@apollo/client/link/context";
import Constants from 'expo-constants';

import LoginScreen from "./src/components/LoginScreen";  // Écran de connexion
import ProductList from "./src/components/ProductList";  // Écran de liste des produits
import AddProductForm from "./src/components/AddProductForm";  // Écran d'ajout des produits
import HomeScreen from "./src/components/HomeScreen";  // Écran HomeScreen
import RegisterScreen from "./src/components/RegisterScreen";  // Écran RegisterScreen
import UpdateUserScreen from "./src/components/UpdateUserScreen";  // Écran UpdateUserScreen
import AddRole from "./src/components/AddRole";  // Écran AddRole
import UserAdminScreen from "./src/components/UserAdminScreen";  // Écran UserAdminScreen
import NavigationListScreen from "./src/components/NavigationListScreen";  // Écran NavigationListScreen
import "./src/i18n";
import UserMenuScreen from "./src/components/UserMenuScreen";
const Stack = createStackNavigator();
import styles from "./src/components/styles";
import { Text,Platform} from "react-native";
import { useTranslation } from "react-i18next";



// Récupérer l'API_URL définie dans app.json
const API_URL = Constants.expoConfig?.extra?.API_URL || "http://localhost:4000";

export default function App() {
  const [client, setClient] = useState(null);
  const { t } = useTranslation();

  useEffect(() => {
    const httpLink = createHttpLink({ uri: `${API_URL}/graphql` });

    const authLink = setContext(async (_, { headers }) => {
      const token = await AsyncStorage.getItem("token");
      console.log("Token récupéré :", token); // Vérifier le token récupéré

      console.log("Headers envoyés dans Apollo :", {
        ...headers,
        Authorization: token ? `Bearer ${token}` : "",
      });

      return {
        headers: {
          ...headers,
          authorization: token ? `Bearer ${token}` : "",
        },
      };
    });

    setClient(new ApolloClient({
      link: authLink.concat(httpLink),
      cache: new InMemoryCache(),
    }));
  }, []);

  if (!client) {
    return null; // Peut être remplacé par une vue de chargement
  }

  return (
    <ApolloProvider client={client}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login"  screenOptions={{
    headerShown: false,
    gestureEnabled: false, // Désactive le swipe pour tous les écrans
  }}>
          <Stack.Screen name="Login" component={LoginScreen}  />
          <Stack.Screen name="HomeScreen" component={HomeScreen}  options={{
          headerShown: true,
          headerTitle: () => ( <Text style={styles.headerGlobal}>{t("HomeScreen")}</Text>  ),
          headerStyle: {backgroundColor: styles.card.backgroundColor,  },
          headerTintColor: styles.colorText.color, // Couleur des icônes (flèche retour)
          headerBackTitle: '', // Le texte de retour pour Android et iOS
          headerLeft: () => null, // ❌ Masque la flèche de retour
        }} />
          <Stack.Screen name="addProduct" component={AddProductForm}  />
          <Stack.Screen name="Products" component={ProductList}  />
          <Stack.Screen name="RegisterScreen" component={RegisterScreen}  />
          <Stack.Screen name="UpdateUserScreen" component={UpdateUserScreen}  />
          <Stack.Screen name="AddRole" component={AddRole}  options={{
          headerShown: true,
          headerTitle: () => ( <Text style={styles.headerGlobal}>{t("AjouterRole")}</Text>  ),
          headerStyle: {backgroundColor: styles.card.backgroundColor,  },
          headerTintColor: styles.colorText.color, // Couleur des icônes (flèche retour)
          headerBackTitle: '', // Le texte de retour pour Android et iOS
        }} />
          <Stack.Screen name="UserAdminScreen" component={UserAdminScreen}  options={{
          headerShown: true,
          headerTitle: () => ( <Text style={styles.headerGlobal}>{t("GestionUsers")}</Text>  ),
          headerStyle: {backgroundColor: styles.card.backgroundColor,  },
          headerTintColor: styles.colorText.color, // Couleur des icônes (flèche retour)
          headerBackTitle: '', // Le texte de retour pour Android et iOS
        }} />
          <Stack.Screen name="NavigationListScreen" component={NavigationListScreen}   options={{
          headerShown: true,
          headerTitle: () => ( <Text style={styles.headerGlobal}>{t("mainMenu")}</Text>  ),
          headerStyle: {backgroundColor: styles.card.backgroundColor,  },
          headerTintColor: styles.colorText.color, // Couleur des icônes (flèche retour)
          headerBackTitle: '', // Le texte de retour pour Android et iOS
        }} />
          <Stack.Screen name="UserMenuScreen" component={UserMenuScreen}  options={{
          headerShown: true,
          headerTitle: () => ( <Text style={styles.headerGlobal}>{t("profile")}</Text>  ),
          headerStyle: {backgroundColor: styles.card.backgroundColor,  },
          headerTintColor: styles.colorText.color, // Couleur des icônes (flèche retour)
          // headerBackTitle: t("Retour"), // Le texte de retour pour Android et iOS
          headerBackTitle: '', // Le texte de retour pour Android et iOS

        }} />
        </Stack.Navigator>
      </NavigationContainer>
    </ApolloProvider>
  );
}
