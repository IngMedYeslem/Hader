import { StyleSheet } from "react-native";

// Définir un fichier de styles commun pour toute l'application
const styles = StyleSheet.create({
  
  navbar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#2C3E50",
    paddingVertical: 0,
    paddingHorizontal: 10,
    width: "100%",
    height: 80, // Ajuste la hauteur selon tes besoins
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    // borderBottomLeftRadius: 30,
    // borderBottomRightRadius: 30,
    elevation: 5, // Ajoute une ombre sur Android
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    zIndex: 1000, // Assurez-vous qu'elle est visible

    }
,  
      navItem: {
        flexDirection: "column",
        // alignItems: "center",
        marginHorizontal: 5,
        marginVertical: 15,
      },
      navText: {
        fontSize: 12,
        fontWeight: "bold",
        color: "#005bb5",
         marginTop: 5,
      },
      language: {
       color: "#005bb5"
      },
      rightContainer: {
        flexDirection: "row",
        alignItems: "center",
      },
      profileContainer: {
        // marginLeft: 15,
        marginLeft: 'auto',  // Pousse l'élément complètement à droite

      },
      profileImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
      },
      initialsContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#fff",
        justifyContent: "center",
        alignItems: "center",
      },
      profileInitials: {
        fontWeight: "bold",
        color: "#005bb5",
        fontSize: 16,
      },
      loginText: {
        fontSize: 12,
        fontWeight: "bold",
        color: "white",
      },
      username: {
        fontSize: 14,
        fontWeight: "bold",
        padding: 10,
      },
      logoutText: {
        fontSize: 14,
        marginLeft: 10,
      },
      profileMenuWrapper: {
        position: "absolute",
        bottom: 20, // Positionné en bas
        right: 15, // Aligné à droite
        backgroundColor: "white",
        borderRadius: 10,
        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 5, // Ombre pour Android
      },
      menuContainer: {
        alignSelf: "flex-end", // S'assure que le menu reste aligné à droite
      },
      background: {
        flex: 1,
        justifyContent: "center",
        width: "100%",
        height: "100%",
      },
      container: {
        padding: 20,
        backgroundColor: "rgba(255, 255, 255, 0.2)",
        // marginHorizontal: 20,
        borderRadius: 10,
        elevation: 5,
      },
      title: {
        fontSize: 35,
        color: "#C8A55F",
        marginBottom: 20,
        textAlign: "center",
        fontWeight: "bold",
        textShadowColor: "rgba(0, 0, 0, 0.9)",
        textShadowOffset: { width: 3, height: 3 },
        textShadowRadius: 5,
      },
      colorText: {
        color: "#C8A55F",
      },

      input: {
        color: "#C8A55F", // Couleur du texte saisi
        marginBottom: 15 ,
            
       },
      button: {
        marginTop: 10,
        backgroundColor: "#C8A55F",
      },
      loader: {
        marginTop: 10,
      },
      snackbarSuccess: {
        backgroundColor: "green",
      },
      snackbarError: {
        backgroundColor: "red",
      },

      containerhomscreen: {
         flex: 1, 
         justifyContent: "center",
          alignItems: "center" },
      text: { 
        color: "#fff", 
        fontSize: 24, 
        fontWeight: "bold",
         backgroundColor: "rgba(0, 0, 0, 0.5)",
          padding: 10, borderRadius: 8 },
    
  
  keyboardAvoidingView: { 
    flex: 1, 
    justifyContent: "center", 
    padding: 20,
    // Empêche le défilement indésirable
    width: '100%',
  },
  card: {
    padding: 20, 
    borderRadius: 20, 
    backgroundColor: "#2C3E50",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    borderWidth: 0,
  },

  cardusergestion: {
    padding: 20,
    borderRadius: 20,
    backgroundColor: "#FFFFFF", // Intérieur blanc
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    borderWidth: 1,             // Bordure visible
    borderColor: "#2C3E50",         // Couleur de la bordure
    marginBottom: 20, // ✅ espace entre les cards

  },
  titleContainer: { flexDirection: 'row', justifyContent: 'center', marginBottom: 10 },
  englishTitle: { fontSize: 30, fontWeight: 'bold', textAlign: 'center', marginBottom: 20, color: 'white', textShadowRadius: 5, },
  arabicTitle: { fontSize: 24, fontWeight: 'bold', color: 'white', marginLeft: 5 },
  authTitle: { fontSize: 20, 
     textAlign: 'center', marginBottom: 20, color: '#C8A55F' },
  buttonlogin: { marginTop: 20, padding: 8, backgroundColor: "#C8A55F", borderRadius: 30 },
  registerButton: { marginTop: 10, alignSelf: "center",  color: '#C8A55F'  },
  productImage: { width: 70, height: 70, alignSelf: "center", marginBottom: 8, borderRadius: 40 },
  wrapper: {
    flex: 1, 
  },
  scrollContainer: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1, 
    paddingBottom: 20, // Ajout d'un espace en bas
  },

  productCard: {
    borderWidth: 3,
    borderColor: "#ddd",
    padding: 10,
    marginVertical: 10,
    borderRadius: 5,
    backgroundColor: "rgba(255, 255, 255, 0.7)", // ✅ Amélioration pour une meilleure lisibilité
  },
  productName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 1,
  },
  

  loginButton: { marginTop: 10, alignSelf: "center" },
  profileImagePreview: { width: 100, height: 100, alignSelf: "center", marginTop: 10, borderRadius: 50 },

  createAccountText: { fontSize: 22, fontWeight: "bold", textAlign: "center", marginBottom: 10 },


  profileMenuWrapper: {
    position: "absolute",
    top: 50,
    right: 10,
  },
  menuContainer: {
    borderRadius: 10,
    padding: 10,
  },
  profileHeader: {
    alignItems: "center",
    paddingBottom: 10,
  },
  profileImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginBottom: 5,
  },
  username: {
    fontWeight: "bold",
    fontSize: 16,
  },
  menuText: {
    marginLeft: 10,
    color: "#005bb5"

  },
  logoutText: {
    marginLeft: 10,
    color: "red",
  },
  logoContainer: {
    
    
    width: 50, height: 50, alignSelf: "center", marginBottom: 2, borderRadius: 40 

  },
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  
  logoImage: {
    width: 50,
    height: 50,
    borderRadius: 25, // La moitié de la width/height pour un cercle parfait
  },
  
 
  logoButton: {
    position: 'absolute',
    left: '50%',
    right: '50%',
    alignItems: 'center',
  },
  userImage: {
   
    color: "#C8A55F",
   

  },
  backButtonModern: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,

  },
  
  backButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: "#C8A55F",
    fontWeight: "500",
  },

  backHistoryBtn: {
    padding: 10,
    borderRadius: 50,
    alignSelf: "flex-start",
    marginLeft: 16,
    marginTop: 40,
    backgroundColor: "#C8A55F", // ou "transparent" si tu veux juste l'icône
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
    paddingHorizontal: 8,
  },  

  headerGlobal: {
    // backgroundColor: "#C8A55F", 
    // headerTintColor: "#C8A55F", 
    backgroundColor: "#2C3E50",

    fontSize: 18,
        color: "#C8A55F",
        // marginBottom: 20,
        textAlign: "center",
        fontWeight: "bold",
        textShadowColor: "rgba(0, 0, 0, 0.9)",
        textShadowOffset: { width: 3, height: 3 },
        textShadowRadius: 5,
  },  
  
  
  
  // Autres styles globaux
});

export default styles;
