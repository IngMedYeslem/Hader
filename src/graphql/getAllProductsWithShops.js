import { gql } from "@apollo/client";

export const GET_ALL_PRODUCTS_WITH_SHOPS = gql`
  query {
    productsWithShops {
      id
      name
      price
      images
      shop {
        id
        username
        profileImage
      }
    }
  }
`;