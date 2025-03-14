import { useState, useEffect } from "react";
import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NetworkInfo } from "react-native-network-info";

const useApolloClient = () => {
  const [client, setClient] = useState(null);

  useEffect(() => {
    // Récupérer l'adresse IP de l'appareil
    NetworkInfo.getIPV4Address().then(ipAddress => {
      if (ipAddress) {
        console.log("Adresse IP détectée :", ipAddress);
        
        // Création du lien HTTP avec l'adresse IP récupérée
        const httpLink = new HttpLink({
          uri: `http://${ipAddress}:4000/graphql`, // Utilisation de l'IP dynamique
        });

        // Ajout de l'authentification avec le token
        const authLink = setContext(async (_, { headers }) => {
          const token = await AsyncStorage.getItem("token"); // Récupère le token stocké
          return {
            headers: {
              ...headers,
              Authorization: token ? `Bearer ${token}` : "", // Ajoute le token si disponible
            },
          };
        });

        // Création du client Apollo
        setClient(
          new ApolloClient({
            link: authLink.concat(httpLink),
            cache: new InMemoryCache(),
          })
        );
      }
    });
  }, []);

  return client; // Retourne le client Apollo une fois prêt
};

export default useApolloClient;
