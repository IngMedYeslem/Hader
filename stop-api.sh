#!/bin/bash

echo "🛑 Arrêt du serveur API..."

# Arrêter le processus par PID si le fichier existe
if [ -f "backend/server.pid" ]; then
    PID=$(cat backend/server.pid)
    if kill -0 $PID 2>/dev/null; then
        kill $PID
        echo "✅ Serveur arrêté (PID: $PID)"
    else
        echo "⚠️  Processus déjà arrêté"
    fi
    rm backend/server.pid
else
    # Arrêter par port si pas de PID
    if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
        kill $(lsof -t -i:3000)
        echo "✅ Serveur arrêté (port 3000)"
    else
        echo "ℹ️  Aucun serveur en cours sur le port 3000"
    fi
fi