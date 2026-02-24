export default {
    expo: {
      name: "my-ecommerce-app",
      slug: "my-ecommerce-app",
      version: "1.0.0",
      projectId: "f4c5d89a-8df8-42e8-85d1-19deee902f1a",
      orientation: "portrait",
      platforms: ["ios", "android", "web"],
      newArchEnabled: false,
      plugins: [
        "expo-video",
        "expo-audio",
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
        bundleIdentifier: "com.mycompany.myecommerceapp",
        supportsTablet: true,
        infoPlist: {
          NSPhotoLibraryUsageDescription: "L'application a besoin d'accéder à votre galerie pour sélectionner des images.",
          NSCameraUsageDescription: "L'application a besoin d'accéder à votre appareil photo.",
          ITSAppUsesNonExemptEncryption: false
        }
      },
      android: {
        package: "com.mycompany.myecommerceapp",
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
          foregroundImage: "./assets/logof.png",
          backgroundColor: "#FFFFFF"
        },
        useNextNotificationsApi: true
      },
      web: {
        favicon: "./assets/logof.png"
      },
      extra: {
        API_URL: process.env.API_URL || "http://192.168.0.138:3000", // Utilisation d'une variable d'environnement si elle est définie
        eas: {
          projectId: "f4c5d89a-8df8-42e8-85d1-19deee902f1a"
        }
      }
    }
  };
  