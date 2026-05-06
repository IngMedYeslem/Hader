import { StyleSheet, Platform } from "react-native";

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
    backgroundColor: '#FF6B35',
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
        color: '#FF6B35',
         marginTop: 5,
      },
      language: {
       color: "#FFD700"
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
        color: '#FF6B35',
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
        color: '#FF6B35',
        marginBottom: 20,
        textAlign: "center",
        fontWeight: "bold",
        textShadowColor: "rgba(0, 0, 0, 0.9)",
        textShadowOffset: { width: 3, height: 3 },
        textShadowRadius: 5,
      },
      titleprofil: {
        fontSize: 30,
        color: "white",
        marginBottom: 20,
        textAlign: "center",
        fontWeight: "bold",
        textShadowColor: "rgba(0, 0, 0, 0.9)",
        textShadowOffset: { width: 3, height: 3 },
        textShadowRadius: 5,
      },
      colorText: {
        color: '#FF6B35',
        fontSize: 16,
        fontWeight: '500',
        textAlign: 'center',
      },

      input: {
        color: '#333',
        marginBottom: 15 ,
            
       },
      button: {
        marginTop: 10,
        backgroundColor: '#FF6B35',
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
    padding: 25, 
    borderRadius: 20, 
    backgroundColor: 'white',
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    borderWidth: 0,
    maxWidth: 400,
    width: '100%',
    alignSelf: 'center',
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
  authTitle: { 
    fontSize: 22, 
    textAlign: 'center', 
    marginBottom: 25, 
    color: '#FF6B35',
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  buttonlogin: { marginTop: 20, padding: 8, backgroundColor: '#FF6B35', borderRadius: 30 },
  registerButton: { 
    marginVertical: 20, 
    alignSelf: "center",
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
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
    color: '#FF6B35'

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
    minHeight: '100%',
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
   
    color: '#FF6B35',
   

  },
  backButtonModern: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,

  },
  
  backButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#FF6B35',
    fontWeight: "500",
  },

  backHistoryBtn: {
    padding: 10,
    borderRadius: 50,
    alignSelf: "flex-start",
    marginLeft: 16,
    marginTop: 40,
    backgroundColor: '#FF6B35', // ou "transparent" si tu veux juste l'icône
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
    paddingHorizontal: 8,
  },  

  headerGlobal: {
    backgroundColor: '#FF6B35',
    fontSize: 18,
    color: 'white',
    textAlign: "center",
    fontWeight: "bold",
    textShadowColor: "rgba(0, 0, 0, 0.9)",
    textShadowOffset: { width: 3, height: 3 },
    textShadowRadius: 5,
    minHeight: 50,
  },  
  textcoprit: { 
    color: 'white', 
    fontSize: 14, 
    textAlign: "center",
    fontWeight: "bold",
    padding: 8,
  },

  // Styles Global Interface
  globalGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    padding: 12,
    paddingBottom: 100,
  },
  globalCard: {
    backgroundColor: "white",
    borderRadius: 16,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
    overflow: "hidden",
  },
  alibabaImage: {
    width: '100%',
    height: '100%',
    position: 'relative',
    overflow: 'hidden',
  },
  imageContainer: {
    width: "100%",
    height: 170,
    backgroundColor: "#FFF0EB",
  },
  globalImage: {
    width: "100%",
    height: "100%",
  },
  placeholderImage: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF0EB",
  },
  placeholderText: {
    fontSize: 40,
    color: "#FF6B35",
  },
  productInfo: {
    padding: 10,
  },
  globalProductName: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1a1a2e",
    marginBottom: 5,
    lineHeight: 18,
  },
  globalPrice: {
    fontSize: 15,
    fontWeight: "bold",
    color: '#FF6B35',
    backgroundColor: "rgba(255,107,53,0.08)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  addToCartBtn: {
    marginTop: 8,
    backgroundColor: '#FF6B35',
    borderRadius: 8,
    paddingVertical: 7,
    alignItems: "center",
  },
  addToCartText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  shopBadge: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  shopBadgeText: {
    fontSize: 11,
    color: "#888",
    flex: 1,
  },
  editBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(44,62,80,0.85)",
    borderRadius: 14,
    width: 28,
    height: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    textAlign: "center",
    marginTop: 50,
    fontSize: 16,
    color: '#FF6B35',
  },
  errorText: {
    textAlign: "center",
    marginTop: 50,
    fontSize: 16,
    color: "red",
  },
  shopInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  shopName: {
    fontSize: 11,
    color: "#888",
    flex: 1,
  },
  shopAvatar: {
    width: 22,
    height: 22,
    borderRadius: 11,
    marginLeft: 5,
    borderWidth: 1,
    borderColor: '#FF6B35',
  },
  searchContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    margin: 15,
    borderRadius: 10,
    padding: 15,
  },
  searchInput: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 10,
  },
  filterContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  filterBtn: {
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginRight: 5,
    marginBottom: 5,
  },
  filterBtnActive: {
    backgroundColor: '#FF6B35',
  },
  filterText: {
    fontSize: 12,
    color: "#666",
  },
  filterTextActive: {
    color: "white",
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "white",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    backgroundColor: '#FF6B35',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: '#FF6B35',
  },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(255,107,53,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  closeBtnText: {
    fontSize: 16,
    color: '#FF6B35',
    fontWeight: "bold",
  },
  modalContent: {
    flex: 1,
  },
  productImageLarge: {
    height: 300,
    backgroundColor: "#f5f5f5",
  },
  modalImage: {
    width: "100%",
    height: "100%",
  },
  placeholderImageLarge: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
  },
  placeholderTextLarge: {
    fontSize: 80,
    color: "#ccc",
  },
  productDetails: {
    padding: 20,
  },
  productNameLarge: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  productPriceLarge: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#ff6b35",
    marginBottom: 20,
  },
  shopInfoLarge: {
    backgroundColor: "#f9f9f9",
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  shopLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 10,
  },
  shopDetails: {
    flexDirection: "row",
    alignItems: "center",
  },
  shopAvatarLarge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  shopNameLarge: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  shopAddress: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  shopContact: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  actionButtons: {
    marginTop: 20,
    gap: 10,
  },
  contactBtn: {
    backgroundColor: "#25D366",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 10,
  },
  callBtn: {
    backgroundColor: "#007AFF",
  },
  emailBtn: {
    backgroundColor: "#FF6B35",
  },
  contactBtnText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  shopSummaryContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    margin: 15,
    borderRadius: 10,
    padding: 15,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: '#333',
    marginBottom: 10,
  },
  shopSummaryCard: {
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    padding: 12,
    marginRight: 10,
    minWidth: 120,
    borderLeftWidth: 3,
    borderLeftColor: "#C8A55F",
  },
  shopSummaryName: {
    fontSize: 12,
    fontWeight: "bold",
    color: '#333',
    marginBottom: 4,
  },
  shopSummaryCount: {
    fontSize: 11,
    color: "#666",
    marginBottom: 2,
  },
  shopSummaryPrice: {
    fontSize: 10,
    color: '#FF6B35',
    fontWeight: "bold",
  },
  mediaCounter: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  mediaCounterText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  mediaThumbnails: {
    marginTop: 10,
  },
  thumbnailsContainer: {
    paddingHorizontal: 20,
    gap: 8,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "transparent",
    marginRight: 8,
  },
  thumbnailActive: {
    borderColor: '#FF6B35',
  },
  thumbnailImage: {
    width: "100%",
    height: "100%",
  },
  mediaIndicator: {
    position: "absolute",
    bottom: 5,
    right: 5,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  mediaIndicatorText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
  },
  galleryOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
  },
  galleryHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
    backgroundColor: "rgba(44, 62, 80, 0.95)",
  },
  galleryTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: '#FF6B35',
    textShadowColor: "rgba(0, 0, 0, 0.8)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  mainImageContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  singleImageContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  mainImage: {
    width: "100%",
    height: "100%",
  },
  imageIndicators: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  imageCounter: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
  },

  // Styles pour AddProduct
  addProductContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  addProductTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: '#FF6B35',
    textAlign: "center",
    marginBottom: 20,
    textShadowColor: "rgba(0, 0, 0, 0.9)",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 3,
  },
  productForm: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  formHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  productNumber: {
    fontSize: 16,
    fontWeight: "bold",
    color: '#333',
  },
  removeBtn: {
    fontSize: 20,
    color: "red",
    fontWeight: "bold",
  },
  addProductInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
    backgroundColor: "white",
    fontSize: 14,
    minHeight: 40,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  addMoreBtn: {
    backgroundColor: '#FF6B35',
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 15,
  },
  addMoreText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  submitBtn: {
    backgroundColor: '#FF6B35',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    minHeight: 55,
    justifyContent: 'center',
  },
  submitText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: 'center',
  },
  floatingBtn: {
    position: "absolute",
    bottom: 100,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FF6B35',
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  floatingBtnText: {
    fontSize: 30,
    color: "white",
    fontWeight: "bold",
  },
  backBtn: {
    alignSelf: "flex-start",
    marginBottom: 10,
    padding: 10,
  },
  backBtnText: {
    fontSize: 18,
    color: '#FF6B35',
    fontWeight: "bold",
  },
  rtlText: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  imagePickerBtn: {
    borderWidth: 2,
    borderColor: '#FF6B35',
    borderStyle: "dashed",
    borderRadius: 8,
    padding: 15,
    alignItems: "center",
    marginBottom: 10,
    backgroundColor: "#f9f9f9",
  },
  imagePickerText: {
    fontSize: 16,
    color: "#666",
  },
  previewImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginBottom: 5,
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 10,
  },
  imageWrapper: {
    position: 'relative',
    margin: 5,
  },
  removeImageBtn: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: 'red',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeImageText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  imageCount: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  imageCountText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },

  // Styles pour ImageGallery
  galleryOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
  },
  galleryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  galleryTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtnText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  mainImageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  singleImageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },

  imageSlide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainImage: {
    width: '85%',
    height: '70%',
  },

  // Styles spécifiques pour web/ordinateur
  webImageSlide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
  webImageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  webMainImage: {
    width: '60%',
    height: '60%',
    maxWidth: '500px',
    maxHeight: '400px',
  },
  imageCounter: {
    color: 'white',
    fontSize: 16,
    marginTop: 10,
    textAlign: 'center',
  },
  imageIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    marginHorizontal: 4,
  },
  activeIndicator: {
    backgroundColor: '#FF6B35',
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  thumbnailContainer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    maxHeight: 100,
  },
  thumbnail: {
    width: 70,
    height: 70,
    marginRight: 10,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  activeThumbnail: {
    borderColor: '#FF6B35',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },


  arabicText: {
    fontFamily: 'System',
    textAlign: 'right',
  },
  shopHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 10,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  syncBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 8,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#FF6B35',
    marginRight: 10,
    width: 35,
    height: 35,
    justifyContent: 'center',
    alignItems: 'center',
  },
  syncText: {
    color: '#FF6B35',
    fontSize: 16,
    fontWeight: 'bold',
  },
  shopTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6B35',
    textShadowColor: 'rgba(0, 0, 0, 0.9)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 3,
  },
  logoutBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 8,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#FF6B35',
  },
  logoutText: {
    color: '#FF6B35',
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#FF6B35',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  emptySubText: {
    fontSize: 14,
    color: 'rgba(255,107,53,0.8)',
    textAlign: 'center',
  },

  // Styles pour MediaPicker
  mediaPicker: {
    marginBottom: 15,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  mediaButton: {
    flex: 1,
    backgroundColor: '#FF6B35',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  mediaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  mediaItem: {
    position: 'relative',
    margin: 5,
  },
  mediaPreview: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  removeButton: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: 'red',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },

  // Styles pour MediaManager
  mediaManagerContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  mediaManagerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FF6B35',
    textAlign: 'center',
    marginBottom: 20,
  },
  mediaSection: {
    marginBottom: 25,
  },
  mediaSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  deleteButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#ff4444',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyMediaContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyMediaText: {
    fontSize: 16,
    color: '#555',
    fontStyle: 'italic',
  },

  // Styles pour ShopInfo
  shopInfoOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shopInfoContainer: {
    backgroundColor: 'white',
    margin: 20,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    maxWidth: '90%',
    width: 300,
  },
  shopInfoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  shopInfoItem: {
    marginBottom: 15,
  },
  shopInfoLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#555',
    marginBottom: 5,
  },
  shopInfoValue: {
    fontSize: 16,
    color: '#333',
  },
  locationBtn: {
    backgroundColor: '#FF6B35',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  locationBtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  closeInfoBtn: {
    backgroundColor: '#FF6B35',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  closeInfoBtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },

  // Styles pour ShopLogin responsive
  shopLoginContainer: {
    flex: 1,
  },
  shopLoginHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingTop: Platform.OS === 'ios' ? 45 : 15,
    paddingBottom: 10,
    backgroundColor: 'rgba(44, 62, 80, 0.9)',
  },
  shopLoginScrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    paddingBottom: 30,
  },
  shopLoginFormCard: {
    backgroundColor: 'rgba(44, 62, 80, 0.95)',
    borderRadius: 10,
    padding: 10,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    maxWidth: 400,
    alignSelf: 'center',
    width: '100%',
  },

  // Styles pour NotificationCenter
  notificationCenter: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 15,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  refreshButton: {
    fontSize: 20,
    color: '#FF6B35',
  },
  notificationItem: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    position: 'relative',
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  notificationBody: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  notificationTime: {
    fontSize: 12,
    color: '#777',
  },
  unreadIndicator: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ff4444',
  },
  loadingText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#555',
    marginTop: 50,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#777',
    marginTop: 50,
    fontStyle: 'italic',
  },
});

export default styles;
