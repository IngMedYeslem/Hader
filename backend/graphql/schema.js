const { buildSchema } = require("graphql");

module.exports = buildSchema(`
  type User {
    id: ID!
    username: String!
    email: String!
    profileImage: String
    role: String
    token: String
  }

  type Product {
    id: ID!
    name: String!
    price: Float!
    image: String
  }

  type Query {
    products: [Product]
  }

  type Mutation {
    register(username: String!, email: String!, password: String!, profileImage: String, role: String): User
    login(username: String!, password: String!): User
    addProduct(name: String!, price: Float!, image: String): Product
  }
`);
