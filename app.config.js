export default {
    expo: {
      name: "Hader",
      slug: "my-hader-app",
      owner: "medbit",
      version: "1.0.0",
      projectId: "705c711c-8f51-485d-844b-c066b53cb16b",
      icon: "./assets/icon.png",
      orientation: "portrait",
      platforms: ["ios", "android", "web"],
      newArchEnabled: false,
      plugins: [
        [
          "expo-notifications",
          {
            icon: "./assets/logof.png",
            color: "#C8A55F"
          }
        ],
        [
          "expo-image-picker",
          {
            photosPermission: "L'application a besoin d'accéder à votre galerie pour sélectionner des images.",
            cameraPermission: "L'application a besoin d'accéder à votre appareil photo."
          }
        ]
      ],
      ios: {
        bundleIdentifier: "com.hader.app",
        supportsTablet: true,
        infoPlist: {
          NSPhotoLibraryUsageDescription: "L'application a besoin d'accéder à votre galerie pour sélectionner des images.",
          NSCameraUsageDescription: "L'application a besoin d'accéder à votre appareil photo.",
          ITSAppUsesNonExemptEncryption: false
        }
      },
      android: {
        package: "com.hader.app",
        compileSdkVersion: 34,
        targetSdkVersion: 34,
        permissions: [
          "CAMERA",
          "READ_EXTERNAL_STORAGE",
          "RECEIVE_BOOT_COMPLETED",
          "VIBRATE",
          "WAKE_LOCK"
        ],
        adaptiveIcon: {
          foregroundImage: "./assets/adaptive-icon.png",
          backgroundColor: "#FFFFFF"
        },
        useNextNotificationsApi: true
      },
      web: {
        favicon: "./assets/logof.png"
      },
      extra: {
        API_URL: process.env.API_URL || "http://172.20.10.8:3000", // Utilisation d'une variable d'environnement si elle est définie
        eas: {
          projectId: "705c711c-8f51-485d-844b-c066b53cb16b"
        }
      }
    }
  };
  