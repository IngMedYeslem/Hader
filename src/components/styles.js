import { StyleSheet } from "react-native";

// Définir un fichier de styles commun pour toute l'application
const styles = StyleSheet.create({
  
    navbar: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#005bb5",
        paddingVertical: 12,
        paddingHorizontal: 15,
      },
      navItem: {
        flexDirection: "column",
        alignItems: "center",
        marginHorizontal: 5,
        marginVertical: 15,
      },
      navText: {
        fontSize: 12,
        fontWeight: "bold",
        color: "white",
        marginTop: 5,
      },
      rightContainer: {
        flexDirection: "row",
        alignItems: "center",
      },
      profileContainer: {
        marginLeft: 15,
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
        marginHorizontal: 20,
        borderRadius: 10,
        elevation: 5,
      },
      title: {
        fontSize: 35,
        color: "rgba(4, 66, 200, 0.9)",
        marginBottom: 20,
        textAlign: "center",
        fontWeight: "bold",
        textShadowColor: "rgba(0, 0, 0, 0.9)",
        textShadowOffset: { width: 3, height: 3 },
        textShadowRadius: 5,
      },
      input: {
        marginBottom: 15,
      },
      button: {
        marginTop: 10,
        backgroundColor: "#005bb5",
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
    
      keyboardAvoidingView: { flex: 1, justifyContent: "center", padding: 20 },
  card: {
    padding: 20, 
    borderRadius: 15, 
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    borderWidth: 0,
  },
  titleContainer: { flexDirection: 'row', justifyContent: 'center', marginBottom: 10 },
  englishTitle: { fontSize: 24, fontWeight: 'bold', color: '#005bb5' },
  arabicTitle: { fontSize: 24, fontWeight: 'bold', color: '#005bb5', marginLeft: 5 },
  authTitle: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 20, color: '#005bb5' },
  buttonlogin: { marginTop: 20, padding: 8, backgroundColor: "#005bb5", borderRadius: 30 },
  registerButton: { marginTop: 10, alignSelf: "center", color: "#005bb5" },
  productImage: { width: 80, height: 80, alignSelf: "center", marginBottom: 20, borderRadius: 40 },
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

  createAccountText: { fontSize: 22, fontWeight: "bold", textAlign: "center", marginBottom: 10, color: "#005bb5" },


  // Autres styles globaux
});

export default styles;
