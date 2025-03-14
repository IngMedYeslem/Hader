require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { buildSchema } = require("graphql");
const { createHandler } = require("graphql-http/lib/use/express");
const expressPlayground = require("graphql-playground-middleware-express").default;
const os = require("os"); // 📌 Pour récupérer l'IP locale
const path = require("path");

const app = express();

// ✅ Fonction pour récupérer l'IP locale
const getLocalIp = () => {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === "IPv4" && !net.internal) {
        return net.address;
      }
    }
  }
  return "127.0.0.1"; // Retourne localhost si aucune IP trouvée
};

const ipAddress = getLocalIp();


// ✅ Middleware CORS
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));

app.use(express.json());

// ✅ Vérification de la variable d'environnement
if (!process.env.MONGO_URI) {
  console.error("❌ Erreur : MONGO_URI non défini dans .env !");
  process.exit(1);
}

// ✅ Connexion MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connecté à MongoDB"))
  .catch((err) => {
    console.error("❌ Erreur MongoDB:", err.message);
    process.exit(1);
  });

// 🔹 Modèles Mongoose
const UserSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
});
const User = mongoose.model("User", UserSchema);

const ProductSchema = new mongoose.Schema({
  name: String,
  price: Number,
  image: String,
});
const Product = mongoose.model("Product", ProductSchema);

// 🔹 Schéma GraphQL
const schema = buildSchema(`
  type User {
    id: ID!
    username: String!
    email: String!
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
    register(username: String!, email: String!, password: String!): User
    login(username: String!, password: String!): User
    addProduct(name: String!, price: Float!, image: String): Product
  }
`);

// 🔹 Génération du Token JWT
const generateToken = (user) => {
  return jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// 🔹 Middleware d'authentification
const authMiddleware = (req) => {
  if (!req || !req.headers || !req.headers.authorization) {
    return {};
  }

  const token = req.headers.authorization.split(" ")[1]; // "Bearer TOKEN"
  if (!token) return {};

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    return { user };
  } catch (err) {
    console.error("❌ JWT invalide :", err.message);
    return {};
  }
};

// 🔹 Résolveurs GraphQL
const root = {
  register: async ({ username, email, password }) => {
    const existingUser = await User.findOne({ email });
    if (existingUser) throw new Error("L'utilisateur existe déjà.");

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashedPassword });
    await user.save();

    return { id: user.id, username, email, token: generateToken(user) };
  },

  login: async ({ username, password }) => {
    const user = await User.findOne({ username });
    if (!user) throw new Error("Utilisateur non trouvé.");

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) throw new Error("Mot de passe incorrect.");

    return { id: user.id, username, email: user.email, token: generateToken(user) };
  },

  products: async () => await Product.find(),

  addProduct: async ({ name, price, image }) => {
    const newProduct = new Product({ name, price, image });
    await newProduct.save();
    return newProduct;
  },
};

// ✅ Configuration GraphQL
app.all(
  "/graphql",
  (req, res, next) => {
    req.context = authMiddleware(req);
    next();
  },
  createHandler({
    schema,
    rootValue: root,
    context: (req) => req.context,
  })
);

// ✅ Ajout de GraphQL Playground
app.get("/playground", expressPlayground({ endpoint: "/graphql" }));

// ✅ Servir les images du dossier "assets"
app.use("/assets", express.static(path.join(__dirname, "assets")));

// ✅ Démarrage du serveur avec IP dynamique
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 Serveur lancé sur http://${ipAddress}:${PORT}/playground`));
// ✅ Route pour récupérer l'IP et le port du serveur
app.get("/api/ip", (req, res) => {
  res.json({ ip: ipAddress, port: process.env.PORT || 4000 });
});