#!/bin/bash

echo "🚀 Démarrage du serveur API..."

# Aller dans le dossier backend
cd backend

# Vérifier si le serveur est déjà en cours
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  Le port 3000 est déjà utilisé. Arrêt du processus existant..."
    kill $(lsof -t -i:3000)
    sleep 2
fi

# Démarrer le serveur en arrière-plan
echo "🌟 Démarrage du serveur sur toutes les interfaces réseau..."
node server-simple.js &

# Sauvegarder le PID
echo $! > server.pid

echo "✅ Serveur démarré en arrière-plan"
echo "📱 Accessible depuis iOS sur: http://192.168.0.146:3000/api"
echo "💻 Accessible depuis le web sur: http://localhost:3000/api"
echo ""
echo "Pour arrêter le serveur: ./stop-api.sh"