import { gql } from '@apollo/client';

export const ADD_PRODUCT = gql`
  mutation AddProduct($name: String!, $price: Float!, $images: String) {
    addProduct(name: $name, price: $price, images: $images) {
      id
      name
      price
      images
    }
  }
`;