import React, { useState } from "react";
import { View, Text } from "react-native";
import { useMutation, gql } from "@apollo/client";
import { Card, Button, TextInput } from "react-native-paper";

// 🔹 Mutation GraphQL pour ajouter un rôle
const ADD_ROLE_MUTATION = gql`
  mutation AddRole($name: String!) {
    addRole(name: $name) {
      id
      name
    }
  }
`;

const AddRole = () => {
  const [roleName, setRoleName] = useState("");
  const [addRole, { loading, error }] = useMutation(ADD_ROLE_MUTATION);

  const handleSubmit = async () => {
    if (!roleName.trim()) {
      console.error("Le nom du rôle est requis !");
      return;
    }

    try {
      await addRole({ variables: { name: roleName } });
      console.log(`✅ Rôle "${roleName}" ajouté avec succès !`);
      setRoleName(""); // Réinitialiser le champ
    } catch (err) {
      console.error("❌ Erreur lors de l'ajout du rôle :", err.message);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Card style={{ padding: 20 }}>
        <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}>
          Ajouter un Rôle
        </Text>
        <TextInput
          label="Nom du rôle (ex: ADMIN)"
          mode="outlined"
          value={roleName}
          onChangeText={setRoleName}
          style={{ marginBottom: 10 }}
        />
        <Button mode="contained" onPress={handleSubmit} loading={loading}>
          {loading ? "Ajout..." : "Ajouter"}
        </Button>
        {error && <Text style={{ color: "red", marginTop: 10 }}>{error.message}</Text>}
      </Card>
    </View>
  );
};

export default AddRole;
