import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import AsyncStorage from "@react-native-async-storage/async-storage";

// 🔹 Création du lien HTTP pour les requêtes GraphQL
const httpLink = new HttpLink({
  uri: "http://192.168.100.121:4000/graphql", // URL de ton serveur GraphQL
});

// 🔹 Ajout de l'authentification avec le token
const authLink = setContext(async (_, { headers }) => {
  const token = await AsyncStorage.getItem("token"); // Récupère le token stocké
  return {
    headers: {
      ...headers,
      Authorization: token ? `Bearer ${token}` : "", // Ajoute le token si disponible
    },
  };
});

// 🔹 Création du client Apollo avec le lien d'authentification
const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

export default client;
