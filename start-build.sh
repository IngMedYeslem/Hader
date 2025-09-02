#!/bin/bash

echo "🚀 Démarrage du Dev Build..."
echo ""
echo "Choisissez une plateforme :"
echo "1) Android uniquement"
echo "2) iOS uniquement" 
echo "3) Les deux plateformes"
echo ""

read -p "Votre choix (1-3): " choice

case $choice in
    1)
        echo "🤖 Construction Android..."
        eas build --profile development --platform android
        ;;
    2)
        echo "🍎 Construction iOS..."
        eas build --profile development --platform ios
        ;;
    3)
        echo "📱 Construction des deux plateformes..."
        eas build --profile development --platform all
        ;;
    *)
        echo "❌ Choix invalide"
        exit 1
        ;;
esac