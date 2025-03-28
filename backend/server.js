require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { createHandler } = require("graphql-http/lib/use/express");
const expressPlayground = require("graphql-playground-middleware-express").default;
const os = require("os");
const fs = require("fs");
const path = require("path");

const connectDB = require("./config/db");
const schema = require("./graphql/schema");
const resolvers = require("./graphql/resolvers");
const authMiddleware = require("./middlewares/auth");
const uploadRoutes = require("./routes/upload");

const app = express();

// ✅ Fonction pour récupérer l'adresse IP locale
const getLocalIp = () => {
  return Object.values(os.networkInterfaces())
    .flat()
    .find(net => net.family === "IPv4" && !net.internal)?.address || "127.0.0.1";
};



// ✅ Connexion à MongoDB
connectDB();

// ✅ Vérifier si le dossier 'uploads/' existe, sinon le créer
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// ✅ Configuration CORS
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

app.use(express.json({ limit: "10mb" }));

// ✅ Configuration GraphQL
app.all(
  "/graphql",
  createHandler({
    schema,
    rootValue: resolvers,
    context: (req) => authMiddleware(req) // 👉 Passe directement `authMiddleware(req)`
  })
);


// ✅ Ajout de GraphQL Playground
app.get("/playground", expressPlayground({ endpoint: "/graphql" }));

// ✅ Routes d'upload
app.use("/api", uploadRoutes);

// ✅ Démarrage du serveur
const PORT = process.env.PORT || 4000;
const localIp = getLocalIp();
const frontendEnvPath = path.join(__dirname, "../.env"); // Adapte le chemin si nécessaire

fs.writeFileSync(frontendEnvPath, `API_URL=http://${localIp}:${PORT}\n`, { encoding: "utf8" });

console.log(`✅ Fichier .env mis à jour : API_URL=http://${localIp}:${PORT}`);


app.listen(PORT, () => {
  console.log(`🚀 Serveur lancé sur :`);
  console.log(`➡️  Local : http://localhost:${PORT}/playground`);
  console.log(`🌍 Réseau : http://${localIp}:${PORT}/playground`);
});
