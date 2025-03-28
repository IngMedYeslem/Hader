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
import "./src/i18n";

const Stack = createStackNavigator();



// Récupérer l'API_URL définie dans app.json
const API_URL = Constants.expoConfig?.extra?.API_URL || "http://localhost:4000";

export default function App() {
  const [client, setClient] = useState(null);

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
        <Stack.Navigator initialRouteName="Login">
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
          <Stack.Screen name="HomeScreen" component={HomeScreen} options={{ headerShown: false }} />
          <Stack.Screen name="addProduct" component={AddProductForm} options={{ headerShown: false }} />
          <Stack.Screen name="Products" component={ProductList} options={{ headerShown: false }} />
          <Stack.Screen name="RegisterScreen" component={RegisterScreen} options={{ headerShown: false }} />
          <Stack.Screen name="UpdateUserScreen" component={UpdateUserScreen} options={{ headerShown: false }} />
          <Stack.Screen name="AddRole" component={AddRole} options={{ headerShown: false }} />
        </Stack.Navigator>
      </NavigationContainer>
    </ApolloProvider>
  );
}
