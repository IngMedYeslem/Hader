import { gql } from "@apollo/client";

export const ADD_PRODUCT = gql`
mutation AddProduct($name: String!, $price: Float!, $image: String) {
  addProduct(name: $name, price: $price, image: $image) {
    id
    name
    price
    image
  }
}
`;
