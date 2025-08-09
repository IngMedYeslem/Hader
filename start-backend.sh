#!/bin/bash

echo "🚀 Démarrage du serveur backend..."

# Vérifier si Node.js est installé
if ! command -v node &> /dev/null; then
    echo "❌ Node.js n'est pas installé. Veuillez l'installer d'abord."
    exit 1
fi

# Aller dans le dossier backend
cd backend

# Vérifier si les dépendances sont installées
if [ ! -d "node_modules" ]; then
    echo "📦 Installation des dépendances..."
    npm install
fi

# Vérifier si le fichier .env existe
if [ ! -f ".env" ]; then
    echo "⚠️  Fichier .env manquant. Création d'un fichier .env par défaut..."
    cat > .env << EOL
MONGODB_URI=mongodb://localhost:27017/ecommerce
JWT_SECRET=your-secret-key-here
PORT=4000
EOL
fi

# Démarrer le serveur
echo "🌟 Serveur backend démarré sur http://localhost:4000"
echo "📊 GraphQL Playground disponible sur http://localhost:4000/graphql"
npm start