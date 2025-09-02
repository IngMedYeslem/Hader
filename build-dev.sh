#!/bin/bash

echo "🚀 Construction du Dev Build..."

# Vérifier si on est connecté à Expo
echo "📱 Vérification de la connexion Expo..."
eas whoami

# Construire pour iOS
echo "🍎 Construction iOS Dev Build..."
eas build --profile development --platform ios --auto-submit-with-profile=development || echo "❌ Échec iOS"

# Construire pour Android  
echo "🤖 Construction Android Dev Build..."
eas build --profile development --platform android --auto-submit-with-profile=development || echo "❌ Échec Android"

echo "✅ Builds terminés!"