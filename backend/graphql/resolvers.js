const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Product = require("../models/Product");
const Role = require("../models/Role");

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      roles: user.roles.map(role => role.name), // 🔹 Renvoyer les noms des rôles
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

module.exports = {
  register: async ({ username, email, password, profileImage }) => {
    const existingUser = await User.findOne({ username });
    if (existingUser) throw new Error("L'utilisateur existe déjà.");

    const hashedPassword = await bcrypt.hash(password, 10);

    // 🔹 Récupérer le rôle USER par défaut
    let userRole = await Role.findOne({ name: "USER" });
    if (!userRole) throw new Error("Le rôle USER n'existe pas. Crée-le d'abord !");

    const user = new User({
      username,
      email,
      password: hashedPassword,
      profileImage,
      roles: [userRole._id] // 🔹 Assignation automatique du rôle USER
    });

    await user.save();

    return {
      id: user.id,
      username,
      email,
      profileImage: user.profileImage,
      token: generateToken({ id: user.id, username, roles: [userRole] }),
      roles: [userRole.name] // 🔹 Retourne les noms des rôles
    };
  },

  login: async ({ username, password }) => {
    const user = await User.findOne({ username })
      .populate({ path: "roles", select: "name" }) // 🔹 Sélectionner uniquement le champ "name"
      .lean();
      
    if (!user) throw new Error("Utilisateur non trouvé.");
  
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) throw new Error("Mot de passe incorrect.");
  
    // 🔹 Vérifier que "roles" est un tableau et s'assurer que "name" est bien accessible
    const roles = user.roles.map(role => role.name);
  
    return {
      id: user._id,
      username: user.username,
      email: user.email,
      token: generateToken(user),
      profileImage: user.profileImage,
      roles
    };
  },
 // 🔹 Ajout de la requête pour récupérer tous les utilisateurs
users: async () => {
  const users = await User.find().populate("roles", "name");

  return users.map(user => ({
    id: user.id,
    username: user.username,
    email: user.email,
    profileImage: user.profileImage,
    roles: user.roles.map(role => role.name), // 🔹 Convertir en tableau de strings
    token: user.token
  }));
},



  products: async () => await Product.find(),

  addProduct: async ({ name, price, images }, context) => {
    if (!context.user) throw new Error("Accès refusé : Authentification requise.");

    if (!context.user.roles.includes("AJOUT-PROD")) {
      throw new Error("Accès refusé : Vous n'êtes pas autorisé à ajouter un produit.");
    }

    const newProduct = new Product({ name, price, images });
    await newProduct.save();
    return newProduct;
  },

  updateUser: async ({ username, email, roles }, context) => {
    if (!context.user) throw new Error("Accès refusé : Authentification requise.");

    const user = await User.findOne({ username });
    if (!user) throw new Error("Utilisateur non trouvé.");

    // 🔹 Vérifier si l'utilisateur connecté est admin ou s'il met à jour son propre compte
    const isAdmin = context.user.roles.includes("ADMIN");
    if (!isAdmin && context.user.username !== username) {
      throw new Error("Accès refusé : Vous ne pouvez modifier que votre propre compte.");
    }

    // 🔹 Convertir les noms des rôles en IDs
    let roleObjects = [];
    if (roles && roles.length > 0) {
      roleObjects = await Role.find({ name: { $in: roles } });
      if (roleObjects.length !== roles.length) {
        throw new Error("Un ou plusieurs rôles sont invalides.");
      }
    }

    // 🔹 Mettre à jour l'utilisateur
    Object.assign(user, {
      email: email ?? user.email,
      roles: roleObjects.length > 0 ? roleObjects.map(role => role._id) : user.roles
    });

    console.log(`✅ Utilisateur mis à jour : ${user.username} (roles: ${user.roles})`);

    await user.save();

    return {
      username: user.username,
      email: user.email,
      roles: roleObjects.map(role => role.name) // 🔹 Retourner les noms des rôles
    };
  }
,

  addRole: async ({ name }) => {
    const existingRole = await Role.findOne({ name });
    if (existingRole) throw new Error("Ce rôle existe déjà.");

    const role = new Role({ name });
    await role.save();
    return role;
  },

  roles: async () => {
    return await Role.find();
  },

  updateProfileImage: async ({ username, profileImage }, context) => {
    if (!context.user) throw new Error("Accès refusé : Authentification requise.");

    const user = await User.findOne({ username });
    if (!user) throw new Error("Utilisateur non trouvé.");

    // Vérifier si l'utilisateur connecté met à jour son propre profil ou s'il est admin
    const isAdmin = context.user.roles.includes("ADMIN");
    if (!isAdmin && context.user.username !== username) {
      throw new Error("Accès refusé : Vous ne pouvez modifier que votre propre profil.");
    }

    // Mise à jour de l'image de profil
    user.profileImage = profileImage;
    await user.save();

    return user;
  }
};
