import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";
import { API_URL } from './config/api';

const httpLink = new HttpLink({
  uri: `${API_URL}/graphql`,
});

const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
});

export default client;