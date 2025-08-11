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
    isApproved: Boolean!
    approvedAt: String
    approvedBy: String
  }

  type Product {
    id: ID!
    name: String!
    price: Float!
    images: String
  }

  type ProductWithShop {
    id: ID!
    name: String!
    price: Float!
    images: [String]
    shop: User
  }

  type Query {
    products: [Product]
    productsWithShops: [ProductWithShop]
    roles: [Role]
    users: [User]
  }

  type Mutation {
    register(username: String!, email: String!, password: String!, profileImage: String): User  
    login(username: String!, password: String!): User
    addRole(name: String!): Role
    updateRole(id: ID!, name: String!): Role
    deleteRole(id: ID!): String
    addProduct(name: String!, price: Float!, images: String): Product
    updateUser(username: String!, email: String!, roles: [String]!): User  
    deleteUser(id: ID!): String
    updateProfileImage(username: String!, profileImage: String!): User
    approveUser(userId: ID!): User
    rejectUser(userId: ID!): String
  }
`);
