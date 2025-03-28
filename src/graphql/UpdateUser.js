import { gql } from "@apollo/client";

export const UPDATE_USER_MUTATION = gql`
  mutation UpdateUser($username: String!, $email: String!, $roles: [String]!) {
    updateUser(username: $username, email: $email, roles: $roles) {
      username
      email
      roles 
    }
  }
`;
