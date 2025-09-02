# Instructions pour construire le Dev Build

## Étapes manuelles requises :

### 1. Construction Android
```bash
eas build --profile development --platform android
```
Quand demandé "Generate a new Android Keystore?" → Répondre **Y** (Yes)

### 2. Construction iOS  
```bash
eas build --profile development --platform ios
```
Quand demandé "Do you want to log in to your Apple account?" → Répondre **Y** (Yes)
Puis entrer vos identifiants Apple Developer

### 3. Alternative : Construction simultanée
```bash
eas build --profile development --platform all
```

## Configuration actuelle :
- ✅ Notifications push configurées
- ✅ Project ID défini
- ✅ Plugins requis ajoutés
- ✅ Permissions Android configurées
- ✅ Configuration iOS mise à jour

## Après le build :
1. Télécharger l'APK/IPA depuis le dashboard EAS
2. Installer sur appareil physique
3. Tester les notifications avec le composant NotificationTest

## URLs utiles :
- Dashboard EAS : https://expo.dev/accounts/medbit/projects/my-ecommerce-app/builds
- Logs de build : Disponibles dans le dashboard