// Script pour vérifier le contenu de la base MongoDB
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/ecommerce', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const productSchema = new mongoose.Schema({
  name: String,
  price: Number,
  images: [String],
  shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop' },
  createdAt: { type: Date, default: Date.now }
});

const Product = mongoose.model('Product', productSchema);

async function checkDatabase() {
  try {
    console.log('🔍 Vérification de la base de données...');
    
    const products = await Product.find().limit(10);
    console.log(`📊 ${products.length} produits trouvés`);
    
    products.forEach((product, index) => {
      console.log(`\n--- Produit ${index + 1} ---`);
      console.log('Nom:', product.name);
      console.log('Prix:', product.price);
      console.log('Images:', product.images);
      console.log('Nombre d\'images:', product.images?.length || 0);
      console.log('Type images:', typeof product.images);
      console.log('Est un tableau:', Array.isArray(product.images));
    });
    
    mongoose.disconnect();
  } catch (error) {
    console.error('❌ Erreur:', error);
    mongoose.disconnect();
  }
}

checkDatabase();