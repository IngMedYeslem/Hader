const { buildSchema } = require("graphql");

module.exports = buildSchema(`
  type Role {
    id: ID!
    name: String!
  }

  type User {
    id: ID!
    username: String!
    email: String!
    profileImage: String
    roles: [String]!  
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
    roles: [Role]
    users: [User]
  }

  type Mutation {
    register(username: String!, email: String!, password: String!, profileImage: String): User  
    login(username: String!, password: String!): User
    addRole(name: String!): Role
    addProduct(name: String!, price: Float!, image: String): Product
    updateUser(username: String!, email: String!, roles: [String]!): User  
  }
`);
