const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Product = require("../models/Product");

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

module.exports = {
  register: async ({ username, email, password, profileImage, role }) => {
    const existingUser = await User.findOne({ username });
    if (existingUser) throw new Error("L'utilisateur existe déjà.");

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashedPassword, profileImage, role: role || "user" });
    await user.save();

    return { id: user.id, username, email, profileImage: user.profileImage, token: generateToken(user), role: user.role };
  },

  login: async ({ username, password }) => {
    const user = await User.findOne({ username });
    if (!user) throw new Error("Utilisateur non trouvé.");

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) throw new Error("Mot de passe incorrect.");

    return { id: user.id, username, email: user.email, token: generateToken(user), profileImage: user.profileImage, role: user.role };
  },

  products: async () => await Product.find(),

  addProduct: async ({ name, price, image }, context) => {
    if (!context.user || context.user.role !== "AjouterProd") {
      throw new Error("Accès refusé : Vous n'êtes pas autorisé à effectuer cette action.");
    }

    const newProduct = new Product({ name, price, image });
    await newProduct.save();
    return newProduct;
  },
};
