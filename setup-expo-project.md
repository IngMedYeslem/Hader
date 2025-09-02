# Configuration Notifications Push Expo

## Problème actuel
Les notifications push distantes ne fonctionnent pas dans Expo Go.

## Solutions

### Option 1: Créer un projet Expo (Recommandé)
```bash
# 1. Créer un compte Expo
npx expo register

# 2. Se connecter
npx expo login

# 3. Créer le projet
npx expo init --template blank

# 4. Obtenir le projectId
npx expo whoami
```

### Option 2: Development Build
```bash
# 1. Installer EAS CLI
npm install -g @expo/eas-cli

# 2. Configurer EAS
eas build:configure

# 3. Créer un development build
eas build --profile development --platform android
```

### Option 3: Mode Production
```bash
# Build pour production avec notifications push
eas build --profile production --platform android
```

## Configuration actuelle
- ✅ Plugin expo-notifications configuré
- ✅ Service push notifications créé
- ❌ ProjectId manquant (requis pour push notifications)
- ❌ Expo Go ne supporte pas les push notifications

## Étapes suivantes
1. Créer un projet Expo
2. Remplacer "your-project-id-here" par le vrai projectId
3. Tester avec un development build