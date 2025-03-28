export default {
    expo: {
      name: "my-ecommerce-app",
      slug: "my-ecommerce-app",
      version: "1.0.0",
      orientation: "portrait",
      platforms: ["ios", "android", "web"],
      newArchEnabled: true,
      plugins: [
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
          NSCameraUsageDescription: "L'application a besoin d'accéder à votre appareil photo."
        }
      },
      android: {
        package: "com.mycompany.myecommerceapp",
        permissions: [
          "CAMERA",
          "READ_EXTERNAL_STORAGE"
        ],
        adaptiveIcon: {
          foregroundImage: "./assets/logo.jpeg",
          backgroundColor: "#FFFFFF"
        },
        useNextNotificationsApi: true
      },
      web: {
        favicon: "./assets/logo.jpeg"
      },
      extra: {
        API_URL: process.env.API_URL || "http://172.20.10.4:4000" // Utilisation d'une variable d'environnement si elle est définie
      }
    }
  };
  