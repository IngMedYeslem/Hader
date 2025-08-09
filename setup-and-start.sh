#!/bin/bash

echo "🚀 Configuration et démarrage de l'application e-commerce"
echo "=================================================="

# Vérifier si MongoDB est en cours d'exécution
if ! pgrep -x "mongod" > /dev/null; then
    echo "⚠️  MongoDB n'est pas démarré. Tentative de démarrage..."
    # Essayer de démarrer MongoDB
    if command -v brew &> /dev/null; then
        brew services start mongodb-community
    else
        echo "❌ Veuillez démarrer MongoDB manuellement"
        echo "   Commande: sudo systemctl start mongod"
        exit 1
    fi
    sleep 3
fi

# Aller dans le dossier backend
cd backend

# Installer les dépendances si nécessaire
if [ ! -d "node_modules" ]; then
    echo "📦 Installation des dépendances backend..."
    npm install
fi

# Initialiser la base de données
echo "🔄 Initialisation de la base de données..."
node init-db.js

# Démarrer le serveur
echo "🌟 Démarrage du serveur backend..."
echo "📊 API disponible sur: http://localhost:3000/api"
echo "🔍 Debug produits: http://localhost:3000/api/debug/products"
echo ""
echo "Appuyez sur Ctrl+C pour arrêter le serveur"
node server.js