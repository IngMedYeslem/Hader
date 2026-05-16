// Configuration des devises
const CURRENCIES = {
  MRU: 'MRU',
  EUR: 'EUR',
  USD: 'USD'
};

let currentCurrency = CURRENCIES.MRU; // Devise par défaut MRU

const translations = {
  fr: {
    loading: 'Chargement...',
    error: 'Erreur',
    contactAdminAfter24h: 'Si votre compte n\'est pas validé après 24h, contactez le service client',
    contactAdmin: 'Contacter le service client',
    callAdmin: 'Appeler par téléphone',
    addProducts: 'Ajouter des Produits',
    product: 'Produit',
    productName: 'Nom du produit',
    description: 'Description',
    price: 'Prix',
    category: 'Catégorie',
    stock: 'Stock disponible',
    addImage: '📷 Ajouter une image',
    imageSelected: '✓ Image sélectionnée',
    addAnother: '+ Ajouter un autre produit',
    saveProducts: 'Enregistrer les Produits',
    back: '← Retour',
    success: 'Succès',
    productsAdded: 'Produits ajoutés avec succès',
    selectImage: 'Sélectionner une image',
    chooseOption: 'Choisissez une option',
    gallery: 'Galerie',
    camera: 'Appareil photo',
    cancel: 'Annuler',
    permissionRequired: 'Permission requise',
    galleryAccess: 'Accès à la galerie nécessaire',
    cameraAccess: 'Accès à l\'appareil photo nécessaire',
    locationRequired: 'Localisation requise',
    chooseFile: 'Choisir un fichier',
    // Admin
    createAdmin: 'Créer un Admin',
    newAdminAccount: 'Nouveau Compte Admin',
    username: 'Nom d\'utilisateur',
    email: 'Email',
    password: 'Mot de passe',
    confirmPassword: 'Confirmer le mot de passe',
    creating: 'Création...',
    createAdminAccount: 'Créer le compte admin',
    important: 'Important',
    adminRights: 'Le nouveau compte aura tous les droits d\'administration',
    fillAllFields: 'Veuillez remplir tous les champs',
    passwordsDontMatch: 'Les mots de passe ne correspondent pas',
    passwordTooShort: 'Le mot de passe doit contenir au moins 6 caractères',
    adminCreated: 'Compte admin créé avec succès',
    connectionError: 'Erreur de connexion au serveur',
    // Shop
    shop: 'Boutique',
    valid: 'Validee',
    shopLogin: 'Connexion Boutique',
    createShop: 'Créer une Boutique',
    shopRegistration: 'Inscription Boutique',
    shopName: 'Nom de la boutique',
    address: 'Adresse complète',
    maxCharacters: 'max 200 caractères',
    phone: 'Numéro de téléphone',
    whatsapp: 'WhatsApp',
    latitude: 'Latitude',
    longitude: 'Longitude',
    getLocation: 'Obtenir ma localisation',
    login: 'Login',
    connect: 'Se connecter',
    create: 'Créer',
    alreadyAccount: 'Déjà un compte ?',
    createShopAccount: 'Créer une boutique',
    allFieldsRequired: 'Tous les champs marqués d\'un * sont obligatoires',
    accountPending: 'Votre compte sera en attente d\'approbation par un administrateur avant de pouvoir ajouter des produits.',
    // Dashboard
    administration: 'Administration - Validation des comptes',
    accountValidation: 'Validation Comptes',
    pendingApproval: 'En attente d\'approbation',
    approved: 'Approuvé',
    approve: 'Approuver',
    reject: 'Rejeter',
    roles: 'Rôles',
    linkedTo: 'Lié à',
    standardUser: 'Utilisateur standard',
    unlinkFrom: 'Délier de',
    shopsWaiting: 'boutique(s) en attente d\'approbation',
    testAccounts: 'Comptes Test',
    accountWaitingApproval: 'Compte en attente d\'approbation',
    accountValidatedIn24h: 'Votre compte sera validé sous 24 heures',
    contactAdminAfter24h: 'Si votre compte n\'est pas validé après 24h, contactez centre d\'aide',
    contactAdmin: 'Contacter centre d\'aide',
    contactWhatsApp: 'Contacter via WhatsApp',
    callAdmin: 'Appeler l\'administrateur',
    // Navbar
    globalMarketplace: 'Okaadh',
    products: 'produits',
    shops: 'boutiques',
    admin: 'Admin',
    shopSpace: 'Espace Boutique',
    logout: 'Déconnexion',
    backToMarketplace: 'Retour au Marché',
    noProductsInShop: 'Aucun produit dans votre boutique',
    tapPlusToAdd: 'Appuyez sur + pour ajouter des produits',
    // Shop Info
    shopInfo: 'Informations de la boutique',
    loginLabel: 'Login',
    addressLabel: 'Adresse',
    phoneLabel: 'Téléphone',
    whatsappLabel: 'WhatsApp',
    viewOnMap: 'Voir sur la carte',
    close: 'Fermer',
    locationNotAvailable: 'Localisation non disponible',
    info: 'Info',
    loadingProducts: 'Chargement des produits...',
    // Shop Summary
    shopSummary: 'Résumé par boutique',
    product: 'produit',
    products: 'produits',
    fromPrice: 'À partir de',
    noShop: 'Sans boutique',
    // Search
    searchProduct: 'Rechercher un produit...',
    all: 'Toutes',
    autres: 'Autres',
    // Categories
    food: 'Nourriture',
    grocery: 'Épicerie',
    pharmacy: 'Pharmacie',
    electronics: 'Électronique',
    fashion: 'Mode',
    other: 'Autre',
    // Admin Dashboard
    userAndShopManagement: 'Gestion des utilisateurs et boutiques',
    users: 'Utilisateurs',
    validated: 'Validées',
    pending: 'En attente',
    // Admin Login
    adminLogin: 'Connexion Admin',
    incorrectCredentials: 'Identifiants incorrects',
    connecting: 'Connexion...',
    adminLoginInfo: 'Connectez-vous avec votre compte administrateur',
    // Product Modal
    productDetails: 'Détails du produit',
    soldBy: 'Vendu par',
    shopNotSpecified: 'Boutique non spécifiée',
    call: 'Appeler',
    whatsappNotInstalled: 'WhatsApp n\'est pas installé sur cet appareil',
    emailSubject: 'Demande d\'information',
    emailBody: 'Bonjour, je suis intéressé(e) par le produit. Merci de me contacter.',
    whatsappMessage: 'Bonjour, je suis intéressé(e) par le produit:',
    checking: 'Vérification...',
    newShopRegistration: 'Nouvelle inscription boutique',
    welcome: 'Bienvenue',
    shopCreatedSuccessfully: 'Votre boutique a été créée avec succès',
    congratulations: 'Félicitations',
    shopCreatedWaitingValidation: 'Votre boutique a été créée et est maintenant en attente de validation par notre équipe.',
    validationProcess: 'Processus de validation',
    adminWillReview: 'Un administrateur va examiner votre boutique',
    validationWithin24h: 'La validation se fait généralement sous 24h',
    canAddProductsAfterValidation: 'Vous pourrez ajouter des produits après validation',
    needHelp: 'Besoin d\'aide',
    understood: 'J\'ai compris',
    locationSet: 'Localisation définie avec succès',
    shopValidationMessage: 'Bonjour, je viens de créer ma boutique et j\'aimerais des informations sur la validation.',
    shopAccountValidationMessage: 'Bonjour, je souhaite faire valider mon compte boutique.',
    viewOnMapCoords: 'Voir sur la carte',
    accountRejected: 'Compte rejeté',
    rejectionReason: 'Raison du rejet',
    noReasonProvided: 'Aucune raison fournie',
    contactAdminForClarification: 'Contactez l\'administrateur pour plus d\'informations',
    enterRejectionReason: 'Saisir une raison',
    rejectionReasonPlaceholder: 'Informations incomplètes ou incorrectes',
    confirmReject: 'Confirmer le rejet',
    save: 'Sauvegarder',
    edit: 'Modifier',
    editInfo: 'Modifier les informations',
    mainImage: 'Image principale',
    changeImage: "Changer l'image",
    addImage2: 'Ajouter une image',
    imageUpdated: 'Image mise à jour',
    editLocation: 'Modifier localisation sur carte',
    setLocation: 'Définir localisation sur carte',
    newPassword: 'Nouveau mot de passe',
    newPasswordPlaceholder: 'Laisser vide pour ne pas changer',
    bankAccountsTitle: 'Comptes bancaires',
    addBankAccount: '+ Ajouter',
    closeBankEditor: '× Fermer',
    saveBankAccount: '+ Enregistrer le compte',
    bankNamePlaceholder: 'Nom de la banque *',
    accountNumberPlaceholder: 'Numéro de compte *',
    accountHolderPlaceholder: 'Titulaire du compte (optionnel)',
    validateShop: 'Valider la boutique',
    confirmValidateShop: 'Êtes-vous sûr de vouloir valider ce magasin?',
    editSuccess: 'Modifié avec succès',
    passwordChanged: 'Mot de passe changé avec succès',
    wrongOldPassword: 'Ancien mot de passe incorrect',
    deliveryTime: 'Délai de livraison',
    deliveryLabel: 'Livraison',
    notDefined: 'N/A',
    minutes: 'min',
    ratingTitle: 'Évaluer la boutique',
    ratingSuccess: 'Votre avis a été enregistré',
    alreadyRated: 'Cette commande a déjà été évaluée',
    delete: 'Supprimer',
    confirmDelete: 'Confirmer la suppression',
    // AdminDashboard messages
    shopValidated: 'Boutique "%s" validée',
    shopRejected: 'Boutique "%s" rejetée',
    accountApproved: 'Compte de %s approuvé',
    accountRejectedMsg: 'Compte de %s rejeté',
    shopLinked: 'Boutique liée à %s',
    shopUnlinked: 'Boutique déliée de %s',
    validationError: 'Erreur lors de la validation',
    rejectionError: 'Erreur lors du rejet',
    linkedUserNotFound: 'Utilisateur lié non trouvé',
    noShopValidated: 'Aucune boutique validée',
    noShopPending: 'Aucune boutique en attente',
    noShopRejected: 'Aucune boutique rejetée',
    noShopFound: 'Aucune boutique trouvée',
    noUserFound: 'Aucun utilisateur trouvé',
    productsCount: 'produits',
    map: 'Carte',
    reason: 'Raison',
    validate: 'Valider',
    reactivate: 'Réactiver',
    rejectShop: 'Rejeter la boutique',
    rejectAccount: 'Rejeter le compte',
    shopNonCompliant: 'Boutique non conforme aux critères',
    incompleteInfo: 'Informations incomplètes ou incorrectes',
    rejectReasonFor: 'Raison du rejet pour',
    wantToReject: 'Voulez-vous rejeter',
    wantToRejectShop: 'Voulez-vous rejeter la boutique'
  },
  en: {
    shop: 'Shop',
    valid: 'Valid',
    loading: 'Loading...',
    error: 'Error',
    addProducts: 'Add Products',
    product: 'Product',
    productName: 'Product name',
    description: 'Description',
    price: 'Price',
    category: 'Category',
    stock: 'Available stock',
    addImage: '📷 Add image',
    imageSelected: '✓ Image selected',
    addAnother: '+ Add another product',
    saveProducts: 'Save Products',
    back: '← Back',
    success: 'Success',
    productsAdded: 'Products added successfully',
    selectImage: 'Select image',
    chooseOption: 'Choose an option',
    gallery: 'Gallery',
    camera: 'Camera',
    cancel: 'Cancel',
    permissionRequired: 'Permission required',
    galleryAccess: 'Gallery access required',
    cameraAccess: 'Camera access required',
    locationRequired: 'Location required',
    chooseFile: 'Choose file',
    // Admin
    createAdmin: 'Create Admin',
    newAdminAccount: 'New Admin Account',
    username: 'Username',
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Confirm password',
    creating: 'Creating...',
    createAdminAccount: 'Create admin account',
    important: 'Important',
    adminRights: 'The new account will have all administration rights',
    fillAllFields: 'Please fill all fields',
    passwordsDontMatch: 'Passwords do not match',
    passwordTooShort: 'Password must contain at least 6 characters',
    adminCreated: 'Admin account created successfully',
    connectionError: 'Server connection error',
    // Shop
    shopLogin: 'Shop Login',
    createShop: 'Create Shop',
    shopRegistration: 'Shop Registration',
    shopName: 'Shop name',
    address: 'Complete address',
    maxCharacters: 'max 200 characters',
    phone: 'Phone number',
    whatsapp: 'WhatsApp',
    latitude: 'Latitude',
    longitude: 'Longitude',
    getLocation: 'Get my location',
    login: 'Login',
    connect: 'Connect',
    create: 'Create',
    alreadyAccount: 'Already have an account?',
    createShopAccount: 'Create a shop',
    allFieldsRequired: 'All fields marked with * are required',
    accountPending: 'Your account will be pending approval by an administrator before you can add products.',
    // Dashboard
    administration: 'Administration - Account Validation',
    accountValidation: 'Account Validation',
    pendingApproval: 'Pending approval',
    approved: 'Approved',
    approve: 'Approve',
    reject: 'Reject',
    roles: 'Roles',
    linkedTo: 'Linked to',
    standardUser: 'Standard user',
    unlinkFrom: 'Unlink from',
    shopsWaiting: 'shop(s) waiting for approval',
    testAccounts: 'Test Accounts',
    accountWaitingApproval: 'Account waiting for approval',
    accountValidatedIn24h: 'Your account will be validated within 24 hours',
    contactAdminAfter24h: 'If your account is not validated after 24h, contact customer service',
    contactAdmin: 'Contact customer service',
    contactWhatsApp: 'Contact via WhatsApp',
    callAdmin: 'Call by phone',
    // Navbar
    globalMarketplace: 'Okaadh',
    products: 'products',
    shops: 'shops',
    admin: 'Admin',
    shopSpace: 'Shop Space',
    logout: 'Logout',
    backToMarketplace: 'Back to Marketplace',
    noProductsInShop: 'No products in your shop',
    tapPlusToAdd: 'Tap + to add products',
    // Shop Info
    shopInfo: 'Shop Information',
    loginLabel: 'Login',
    addressLabel: 'Address',
    phoneLabel: 'Phone',
    whatsappLabel: 'WhatsApp',
    viewOnMap: 'View on map',
    close: 'Close',
    locationNotAvailable: 'Location not available',
    info: 'Info',
    loadingProducts: 'Loading products...',
    // Shop Summary
    shopSummary: 'Summary by shop',
    product: 'product',
    products: 'products',
    fromPrice: 'From',
    noShop: 'No shop',
    // Search
    searchProduct: 'Search for a product...',
    all: 'All',
    autres: 'Others',
    // Categories
    food: 'Food',
    grocery: 'Grocery',
    pharmacy: 'Pharmacy',
    electronics: 'Electronics',
    fashion: 'Fashion',
    other: 'Other',
    // Admin Dashboard
    userAndShopManagement: 'User and shop management',
    users: 'Users',
    validated: 'Validated',
    pending: 'Pending',
    // Admin Login
    adminLogin: 'Admin Login',
    incorrectCredentials: 'Incorrect credentials',
    connecting: 'Connecting...',
    adminLoginInfo: 'Login with your administrator account',
    // Product Modal
    productDetails: 'Product Details',
    soldBy: 'Sold by',
    shopNotSpecified: 'Shop not specified',
    call: 'Call',
    whatsappNotInstalled: 'WhatsApp is not installed on this device',
    emailSubject: 'Information request',
    emailBody: 'Hello, I am interested in the product. Please contact me.',
    whatsappMessage: 'Hello, I am interested in the product:',
    checking: 'Checking...',
    newShopRegistration: 'New shop registration',
    welcome: 'Welcome',
    shopCreatedSuccessfully: 'Your shop has been created successfully',
    congratulations: 'Congratulations',
    shopCreatedWaitingValidation: 'Your shop has been created and is now awaiting validation by our team.',
    validationProcess: 'Validation process',
    adminWillReview: 'An administrator will review your shop',
    validationWithin24h: 'Validation is usually done within 24h',
    canAddProductsAfterValidation: 'You can add products after validation',
    needHelp: 'Need help',
    understood: 'I understand',
    locationSet: 'Location set successfully',
    shopValidationMessage: 'Hello, I just created my shop and would like information about validation.',
    shopAccountValidationMessage: 'Hello, I would like to validate my shop account.',
    viewOnMapCoords: 'View on map',
    accountRejected: 'Account rejected',
    rejectionReason: 'Rejection reason',
    noReasonProvided: 'No reason provided',
    contactAdminForClarification: 'Contact administrator for more information',
    enterRejectionReason: 'Enter rejection reason',
    rejectionReasonPlaceholder: 'Incomplete or incorrect information',
    confirmReject: 'Confirm rejection',
    save: 'Save',
    edit: 'Edit',
    editInfo: 'Edit information',
    mainImage: 'Main image',
    changeImage: 'Change image',
    addImage2: 'Add image',
    imageUpdated: 'Image updated',
    editLocation: 'Edit location on map',
    setLocation: 'Set location on map',
    newPassword: 'New password',
    newPasswordPlaceholder: 'Leave empty to keep current',
    bankAccountsTitle: 'Bank accounts',
    addBankAccount: '+ Add',
    closeBankEditor: '× Close',
    saveBankAccount: '+ Save account',
    bankNamePlaceholder: 'Bank name *',
    accountNumberPlaceholder: 'Account number *',
    accountHolderPlaceholder: 'Account holder (optional)',
    validateShop: 'Validate shop',
    confirmValidateShop: 'Are you sure you want to validate this shop?',
    editSuccess: 'Updated successfully',
    passwordChanged: 'Password changed successfully',
    wrongOldPassword: 'Old password is incorrect',
    deliveryTime: 'Delivery time',
    deliveryLabel: 'Delivery',
    notDefined: 'N/A',
    minutes: 'min',
    ratingTitle: 'Rate the shop',
    ratingSuccess: 'Your rating has been saved',
    alreadyRated: 'This order has already been rated',
    delete: 'Delete',
    confirmDelete: 'Confirm deletion',
    // AdminDashboard messages
    shopValidated: 'Shop "%s" validated',
    shopRejected: 'Shop "%s" rejected',
    accountApproved: 'Account of %s approved',
    accountRejectedMsg: 'Account of %s rejected',
    shopLinked: 'Shop linked to %s',
    shopUnlinked: 'Shop unlinked from %s',
    validationError: 'Error during validation',
    rejectionError: 'Error during rejection',
    linkedUserNotFound: 'Linked user not found',
    noShopValidated: 'No validated shop',
    noShopPending: 'No pending shop',
    noShopRejected: 'No rejected shop',
    noShopFound: 'No shop found',
    noUserFound: 'No user found',
    productsCount: 'products',
    map: 'Map',
    reason: 'Reason',
    validate: 'Validate',
    reactivate: 'Reactivate',
    rejectShop: 'Reject shop',
    rejectAccount: 'Reject account',
    shopNonCompliant: 'Shop does not meet criteria',
    incompleteInfo: 'Incomplete or incorrect information',
    rejectReasonFor: 'Rejection reason for',
    wantToReject: 'Do you want to reject',
    wantToRejectShop: 'Do you want to reject the shop'
  },
  ar: {
    shop: 'المتجر',
    valid: 'مصدق عليها',
    loading: 'جاري التحميل...',
    error: 'خطأ',
    addProducts: 'إضافة المنتجات',
    product: 'المنتج',
    productName: 'اسم المنتج',
    description: 'الوصف',
    price: 'السعر',
    category: 'الفئة',
    stock: 'المخزون المتاح',
    addImage: '📷 إضافة صورة',
    imageSelected: '✓ تم اختيار الصورة',
    addAnother: '+ إضافة منتج آخر',
    saveProducts: 'حفظ المنتجات',
    back: '← رجوع',
    success: 'نجح',
    productsAdded: 'تم إضافة المنتجات بنجاح',
    selectImage: 'اختيار صورة',
    chooseOption: 'اختر خياراً',
    gallery: 'المعرض',
    camera: 'الكاميرا',
    cancel: 'إلغاء',
    permissionRequired: 'إذن مطلوب',
    galleryAccess: 'الوصول إلى المعرض مطلوب',
    cameraAccess: 'الوصول إلى الكاميرا مطلوب',
    locationRequired: 'الموقع مطلوب',
    chooseFile: 'اختيار ملف',
    // Admin
    createAdmin: 'إنشاء مدير',
    newAdminAccount: 'حساب مدير جديد',
    username: 'اسم المستخدم',
    email: 'البريد الإلكتروني',
    password: 'كلمة المرور',
    confirmPassword: 'تأكيد كلمة المرور',
    creating: 'جاري الإنشاء...',
    createAdminAccount: 'إنشاء حساب المدير',
    important: 'مهم',
    adminRights: 'الحساب الجديد سيحصل على جميع صلاحيات الإدارة',
    fillAllFields: 'يرجى ملء جميع الحقول',
    passwordsDontMatch: 'كلمات المرور غير متطابقة',
    passwordTooShort: 'يجب أن تحتوي كلمة المرور على 6 أحرف على الأقل',
    adminCreated: 'تم إنشاء حساب المدير بنجاح',
    connectionError: 'خطأ في الاتصال بالخادم',
    // Shop
    shopLogin: 'تسجيل دخول المتجر',
    createShop: 'إنشاء متجر',
    shopRegistration: 'تسجيل المتجر',
    shopName: 'اسم المتجر',
    address: 'العنوان الكامل',
    maxCharacters: 'الحد الأقصى 200 حرف',
    phone: 'رقم الهاتف',
    whatsapp: 'واتساب',
    latitude: 'خط العرض',
    longitude: 'خط الطول',
    getLocation: 'الحصول على موقعي',
    login: 'تسجيل الدخول',
    connect: 'اتصال',
    create: 'إنشاء',
    alreadyAccount: 'لديك حساب بالفعل؟',
    createShopAccount: 'إنشاء متجر',
    allFieldsRequired: 'جميع الحقول المميزة بـ * مطلوبة',
    accountPending: 'سيكون حسابك في انتظار الموافقة من قبل المدير قبل أن تتمكن من إضافة المنتجات.',
    // Dashboard
    administration: 'الإدارة - التحقق من الحسابات',
    accountValidation: 'التحقق من الحسابات',
    pendingApproval: 'في انتظار الموافقة',
    approved: 'موافق عليه',
    approve: 'موافقة',
    reject: 'رفض',
    roles: 'الأدوار',
    linkedTo: 'مرتبط بـ',
    standardUser: 'مستخدم عادي',
    unlinkFrom: 'إلغاء الربط من',
    shopsWaiting: 'متجر (متاجر) في انتظار الموافقة',
    testAccounts: 'حسابات تجريبية',
    accountWaitingApproval: 'حساب في انتظار الموافقة',
    accountValidatedIn24h: 'سيتم التحقق من حسابك خلال 24 ساعة',
    contactAdminAfter24h: 'إذا لم يتم التحقق من حسابك بعد 24 ساعة، يرجى التواصل مع خدمة الزبناء',
    contactAdmin: 'اتصل بخدمة الزبناء',
    contactWhatsApp: 'اتصل عبر واتساب',
    callAdmin: 'اتصل عبر  الهاتف',
    // Navbar
    globalMarketplace: 'عُكَـــــــاظْ',
    products: 'منتجات',
    shops: 'متاجر',
    admin: 'مدير',
    shopSpace: 'مساحة المتجر',
    logout: 'تسجيل خروج',
    backToMarketplace: 'العودة إلى السوق',
    noProductsInShop: 'لا توجد منتجات في متجرك',
    tapPlusToAdd: 'اضغط على + لإضافة منتجات',
    // Shop Info
    shopInfo: 'معلومات المتجر',
    loginLabel: 'تسجيل الدخول',
    addressLabel: 'العنوان',
    phoneLabel: 'الهاتف',
    whatsappLabel: 'واتساب',
    viewOnMap: 'عرض على الخريطة',
    close: 'إغلاق',
    locationNotAvailable: 'الموقع غير متاح',
    info: 'معلومات',
    loadingProducts: 'جاري تحميل المنتجات...',
    // Shop Summary
    shopSummary: 'ملخص حسب المتجر',
    product: 'منتج',
    products: 'منتجات',
    fromPrice: 'ابتداء من',
    noShop: 'بدون متجر',
    // Search
    searchProduct: 'ابحث عن منتج...',
    all: 'الكل',
    autres: 'أخرى',
    // Categories
    food: 'طعام',
    grocery: 'بقالة',
    pharmacy: 'صيدلية',
    electronics: 'إلكترونيات',
    fashion: 'أزياء',
    other: 'أخرى',
    // Admin Dashboard
    userAndShopManagement: 'إدارة المستخدمين والمتاجر',
    users: 'المستخدمون',
    validated: 'مصدق عليها',
    pending: 'في الانتظار',
    // Admin Login
    adminLogin: 'تسجيل دخول المدير',
    incorrectCredentials: 'بيانات اعتماد غير صحيحة',
    connecting: 'جاري الاتصال...',
    adminLoginInfo: 'قم بتسجيل الدخول بحساب المدير',
    // Product Modal
    productDetails: 'تفاصيل المنتج',
    soldBy: 'يباع من قبل',
    shopNotSpecified: 'متجر غير محدد',
    call: 'اتصال',
    whatsappNotInstalled: 'واتساب غير مثبت على هذا الجهاز',
    emailSubject: 'طلب معلومات',
    emailBody: 'مرحبا، أنا مهتم بالمنتج. يرجى التواصل معي.',
    whatsappMessage: 'مرحبا، أنا مهتم بالمنتج:',
    checking: 'جاري التحقق...',
    newShopRegistration: 'تسجيل متجر جديد',
    welcome: 'مرحباً',
    shopCreatedSuccessfully: 'تم إنشاء متجرك بنجاح',
    congratulations: 'تهانينا',
    shopCreatedWaitingValidation: 'تم إنشاء متجرك وهو الآن في انتظار التحقق من قبل فريقنا.',
    validationProcess: 'عملية التحقق',
    adminWillReview: 'سيقوم المدير بمراجعة متجرك',
    validationWithin24h: 'يتم التحقق عادة خلال 24 ساعة',
    canAddProductsAfterValidation: 'يمكنك إضافة المنتجات بعد التحقق',
    needHelp: 'تحتاج مساعدة',
    understood: 'فهمت',
    locationSet: 'تم تحديد الموقع بنجاح',
    shopValidationMessage: 'مرحباً، لقد أنشأت متجري للتو وأود الحصول على معلومات حول التحقق.',
    shopAccountValidationMessage: 'مرحباً، أود التحقق من حساب متجري.',
    viewOnMapCoords: 'عرض على الخريطة',
    accountRejected: 'تم رفض الحساب',
    rejectionReason: 'سبب الرفض',
    noReasonProvided: 'لم يتم تقديم سبب',
    contactAdminForClarification: 'اتصل بالمدير للحصول على مزيد من المعلومات',
    enterRejectionReason: 'أدخل سبب الرفض',
    rejectionReasonPlaceholder: 'معلومات غير مكتملة أو غير صحيحة',
    confirmReject: 'تأكيد الرفض',
    save: 'حفظ',
    edit: 'تعديل',
    editInfo: 'تعديل المعلومات',
    mainImage: 'الصورة الرئيسية',
    changeImage: 'تغيير الصورة',
    addImage2: 'إضافة صورة',
    imageUpdated: 'تم تحديث الصورة',
    editLocation: 'تعديل الموقع على الخريطة',
    setLocation: 'تحديد الموقع على الخريطة',
    newPassword: 'كلمة مرور جديدة',
    newPasswordPlaceholder: 'اتركها فارغة للإبقاء على الحالية',
    bankAccountsTitle: 'أرقام الحسابات البنكية',
    addBankAccount: '+ إضافة',
    closeBankEditor: '× إغلاق',
    saveBankAccount: '+ حفظ الحساب',
    bankNamePlaceholder: 'اسم البنك *',
    accountNumberPlaceholder: 'رقم الحساب *',
    accountHolderPlaceholder: 'اسم صاحب الحساب (اختياري)',
    validateShop: 'اعتماد المتجر',
    confirmValidateShop: 'هل أنت متأكد أنك تريد اعتماد المتجر؟',
    editSuccess: 'تم التعديل بنجاح',
    passwordChanged: 'تم تغيير كلمة المرور بنجاح',
    wrongOldPassword: 'كلمة المرور القديمة غير صحيحة',
    deliveryTime: 'وقت التوصيل',
    deliveryLabel: 'التوصيل',
    notDefined: 'غير محدد',
    minutes: 'دقيقة',
    ratingTitle: 'تقييم المتجر',
    ratingSuccess: 'تم حفظ تقييمك بنجاح',
    alreadyRated: 'تم تقييم هذه الطلبية مسبقاً',
    delete: 'حذف',
    confirmDelete: 'تأكيد الحذف',
    // AdminDashboard messages
    shopValidated: 'تم اعتماد المتجر "%s"',
    shopRejected: 'تم رفض المتجر "%s"',
    accountApproved: 'تمت الموافقة على حساب %s',
    accountRejectedMsg: 'تم رفض حساب %s',
    shopLinked: 'تم ربط المتجر بـ %s',
    shopUnlinked: 'تم إلغاء ربط المتجر من %s',
    validationError: 'خطأ أثناء الاعتماد',
    rejectionError: 'خطأ أثناء الرفض',
    linkedUserNotFound: 'المستخدم المرتبط غير موجود',
    noShopValidated: 'لا توجد متاجر معتمدة',
    noShopPending: 'لا توجد متاجر في الانتظار',
    noShopRejected: 'لا توجد متاجر مرفوضة',
    noShopFound: 'لا توجد متاجر',
    noUserFound: 'لا يوجد مستخدمون',
    productsCount: 'منتجات',
    map: 'خريطة',
    reason: 'السبب',
    validate: 'اعتماد',
    reactivate: 'إعادة تفعيل',
    rejectShop: 'رفض المتجر',
    rejectAccount: 'رفض الحساب',
    shopNonCompliant: 'المتجر لا يستوفي المعايير',
    incompleteInfo: 'معلومات غير مكتملة أو غير صحيحة',
    rejectReasonFor: 'سبب الرفض لـ',
    wantToReject: 'هل تريد رفض',
    wantToRejectShop: 'هل تريد رفض المتجر'
  }
};

import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, I18nManager } from 'react-native';
import { useRTL } from './hooks/useRTL';

// Langues RTL supportées
const RTL_LANGUAGES = ['ar', 'he', 'fa', 'ur'];

let currentLanguage = 'fr';
let languageChangeListeners = [];

// Fonction utilitaire pour vérifier si une langue est RTL
const isRTLLanguage = (lang) => RTL_LANGUAGES.includes(lang);

// Fonction pour appliquer la direction RTL/LTR
const applyDirection = (language) => {
  const shouldBeRTL = isRTLLanguage(language);
  
  if (Platform.OS === 'web') {
    // Pour le web, utiliser CSS direction
    if (typeof document !== 'undefined') {
      document.documentElement.dir = shouldBeRTL ? 'rtl' : 'ltr';
      document.documentElement.style.direction = shouldBeRTL ? 'rtl' : 'ltr';
    }
  } else {
    // Pour React Native, utiliser I18nManager
    if (shouldBeRTL !== I18nManager.isRTL) {
      I18nManager.allowRTL(shouldBeRTL);
      I18nManager.forceRTL(shouldBeRTL);
    }
  }
};

export const useTranslation = () => {
  const [updateCounter, setUpdateCounter] = useState(0);
  
  useEffect(() => {
    loadSavedSettings();
    
    const listener = () => {
      console.log('🔄 Language changed, forcing update');
      setUpdateCounter(prev => prev + 1);
    };
    languageChangeListeners.push(listener);
    
    return () => {
      languageChangeListeners = languageChangeListeners.filter(l => l !== listener);
    };
  }, []);
  
  const loadSavedSettings = async () => {
    try {
      let savedLang, savedCurrency;
      if (Platform.OS === 'web') {
        savedLang = localStorage.getItem('selectedLanguage');
        savedCurrency = localStorage.getItem('selectedCurrency');
      } else {
        savedLang = await AsyncStorage.getItem('selectedLanguage');
        savedCurrency = await AsyncStorage.getItem('selectedCurrency');
      }
      
      if (savedLang && savedLang !== currentLanguage) {
        currentLanguage = savedLang;
      }
      if (savedCurrency && savedCurrency !== currentCurrency) {
        currentCurrency = savedCurrency;
      }
      setUpdateCounter(prev => prev + 1);
    } catch (error) {
      console.log('Erreur chargement paramètres:', error);
    }
  };
  
  const setLanguage = async (lang) => {
    if (translations[lang] && lang !== currentLanguage) {
      console.log('🌐 Changing language from', currentLanguage, 'to', lang);
      currentLanguage = lang;
      
      // Appliquer automatiquement la direction RTL/LTR
      applyDirection(lang);
      
      try {
        if (Platform.OS === 'web') {
          localStorage.setItem('selectedLanguage', lang);
        } else {
          await AsyncStorage.setItem('selectedLanguage', lang);
        }
        console.log('📢 Notifying', languageChangeListeners.length, 'listeners');
        languageChangeListeners.forEach(listener => listener());
      } catch (error) {
        console.log('Erreur sauvegarde langue:', error);
      }
    }
  };
  
  const setCurrency = async (currency) => {
    if (CURRENCIES[currency] && currency !== currentCurrency) {
      currentCurrency = currency;
      
      try {
        if (Platform.OS === 'web') {
          localStorage.setItem('selectedCurrency', currency);
        } else {
          await AsyncStorage.setItem('selectedCurrency', currency);
        }
        languageChangeListeners.forEach(listener => listener());
      } catch (error) {
        console.log('Erreur sauvegarde devise:', error);
      }
    }
  };
  
  const t = (key) => {
    return translations[currentLanguage]?.[key] || key;
  };
  
  const formatPrice = (price) => {
    return `${price} ${currentCurrency}`;
  };
  
  return { t, setLanguage, setCurrency, currentLanguage, currentCurrency, formatPrice };
};

export const t = (key) => translations[currentLanguage]?.[key] || key;
export const setLanguage = async (lang) => {
  if (translations[lang] && lang !== currentLanguage) {
    currentLanguage = lang;
    
    // Appliquer automatiquement la direction RTL/LTR
    applyDirection(lang);
    
    try {
      if (Platform.OS === 'web') {
        localStorage.setItem('selectedLanguage', lang);
      } else {
        await AsyncStorage.setItem('selectedLanguage', lang);
      }
      languageChangeListeners.forEach(listener => listener());
    } catch (error) {
      console.log('Erreur sauvegarde langue:', error);
    }
  }
};
export const setCurrency = async (currency) => {
  if (CURRENCIES[currency] && currency !== currentCurrency) {
    currentCurrency = currency;
    
    try {
      if (Platform.OS === 'web') {
        localStorage.setItem('selectedCurrency', currency);
      } else {
        await AsyncStorage.setItem('selectedCurrency', currency);
      }
      languageChangeListeners.forEach(listener => listener());
    } catch (error) {
      console.log('Erreur sauvegarde devise:', error);
    }
  }
};
export const getLanguage = () => currentLanguage;
export const getCurrency = () => currentCurrency;
export const formatPrice = (price) => `${price} ${currentCurrency}`;
export const isCurrentLanguageRTL = () => isRTLLanguage(currentLanguage);
export { CURRENCIES, RTL_LANGUAGES, isRTLLanguage };