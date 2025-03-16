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
const multer = require("multer"); // 📌 Importation de multer

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

// ✅ Augmentation de la limite de taille pour JSON (utile pour des objets volumineux)
app.use(express.json({ limit: "10mb" })); // Limite de 10 Mo pour les données JSON

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
  profileImage: { type: String, required: false }, // Ajout du champ profileImage
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
    profileImage: String
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
    register(username: String!, email: String!, password: String!, profileImage: String): User
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

// 📌 Configuration de Multer pour gérer les fichiers
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Spécifie le dossier où les fichiers seront stockés
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    // Détermine le nom du fichier (par exemple, avec un timestamp pour éviter les collisions)
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Limite de 10 Mo pour les fichiers téléchargés
}); // Création du middleware multer avec la configuration

// 🔹 Résolveurs GraphQL
const root = {
  register: async ({ username, email, password, profileImage }) => {
    const existingUser = await User.findOne({ email });
    if (existingUser) throw new Error("L'utilisateur existe déjà.");

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashedPassword, profileImage });
    await user.save();

    return { id: user.id, username, email, profileImage: user.profileImage, token: generateToken(user) };
  },

  login: async ({ username, password }) => {
    const user = await User.findOne({ username });
    if (!user) throw new Error("Utilisateur non trouvé.");

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) throw new Error("Mot de passe incorrect.");

    return { id: user.id, username, email: user.email, token: generateToken(user), profileImage: user.profileImage };
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

// ✅ Servir les fichiers statiques (images)
app.use("/assets", express.static(path.join(__dirname, "uploads")));

// ✅ Route pour le téléchargement d'image (exemple pour enregistrer une image de profil utilisateur)
app.post("/upload-profile-image", upload.single("profileImage"), (req, res) => {
  if (!req.file) {
    return res.status(400).send("Aucun fichier téléchargé.");
  }

  const imagePath = `/assets/${req.file.filename}`; // Chemin de l'image dans le dossier 'uploads'
  res.json({ imagePath });
});

// ✅ Démarrage du serveur avec IP dynamique
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 Serveur lancé sur http://${ipAddress}:${PORT}/playground`));

// ✅ Route pour récupérer l'IP et le port du serveur
app.get("/api/ip", (req, res) => {
  res.json({ ip: ipAddress, port: process.env.PORT || 4000 });
});
