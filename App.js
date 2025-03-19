import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { ApolloClient, InMemoryCache, ApolloProvider, createHttpLink } from "@apollo/client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { setContext } from "@apollo/client/link/context";

import LoginScreen from "./src/components/LoginScreen";  // Écran de connexion
import ProductList from "./src/components/ProductList";  // Écran de liste des produits
import AddProductForm from "./src/components/AddProductForm";  // Écran d'ajout des produits
import HomeScreen from "./src/components/HomeScreen";  // Écran HomeScreen
import RegisterScreen from "./src/components/RegisterScreen";  // Écran RegisterScreen
import ProfileScreen from "./src/components/ProfileScreen";  // Écran ProfileScreen
import "./src/i18n";

const Stack = createStackNavigator();

export default function App() {
  const [apiUrl, setApiUrl] = useState("");

  useEffect(() => {
    // Récupérer l'IP du serveur backend
    fetch("http://192.168.100.121:4000/api/ip") // URL de l'API pour récupérer l'IP du serveur
      .then((res) => res.json())
      .then((data) => {
        const serverIp = `http://${data.ip}:${data.port}`; // Exemple de structure de réponse { ip: '172.20.10.4', port: '4000' }
        console.log(`🚀 test  sur ${serverIp}`);
        setApiUrl(serverIp); // Mettre à jour l'URL de l'API avec l'IP dynamique
      })
      .catch(console.error);
  }, []);

  // 🔹 Configuration du lien Apollo avec l'authentification JWT
  const httpLink = createHttpLink({
    uri: apiUrl ? `${apiUrl}/graphql` : "", // Utilisation de l'URL dynamique de l'API
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

  return (
    <ApolloProvider client={client}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login">
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
          <Stack.Screen name="HomeScreen" component={HomeScreen} options={{ headerShown: false }} />
          <Stack.Screen name="addProduct" component={AddProductForm} options={{ headerShown: false }}  />
          <Stack.Screen name="Products" component={ProductList} options={{ headerShown: false }} />
          <Stack.Screen name="RegisterScreen" component={RegisterScreen} options={{ headerShown: false }} />
          <Stack.Screen name="ProfileScreen" component={ProfileScreen} options={{ headerShown: false }} />

        </Stack.Navigator>
      </NavigationContainer>
    </ApolloProvider>
  );
}
