import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { ApolloClient, InMemoryCache, ApolloProvider, createHttpLink } from "@apollo/client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { setContext } from "@apollo/client/link/context";

import LoginScreen from "./src/components/LoginScreen";  // Écran de connexion
import ProductList from "./src/components/ProductList";  // Écran de liste des produits
import AddProductForm from "./src/components/AddProductForm";  // Écran de ajout des produits
import HomeScreen from "./src/components/HomeScreen";  // Écran de HomeScreen

const Stack = createStackNavigator();

// 🔹 Configuration du lien Apollo avec l'authentification JWT
const httpLink = createHttpLink({
  uri: "http://192.168.0.125:4000/graphql",
});

const authLink = setContext(async (_, { headers }) => {
  const token = await AsyncStorage.getItem("token");
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    },
  };
});

// ✅ Initialisation d'Apollo Client
const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

export default function App() {
  return (
    <ApolloProvider client={client}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login">
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
          
          <Stack.Screen name="HomeScreen" component={HomeScreen} options={{ title: "Home" }} />
          <Stack.Screen name="addProduct" component={AddProductForm} options={{ title: "Ajout des Produits" }} />
          <Stack.Screen name="Products" component={ProductList} options={{ title: "Gestion des Produits" }} />
        </Stack.Navigator>
      </NavigationContainer>
    </ApolloProvider>
  );
}
