const fs = require('fs');
const path = require('path');

const uploadsDir = path.join(__dirname, 'uploads');

console.log('🧹 Nettoyage des fichiers vides dans uploads/...');

fs.readdir(uploadsDir, (err, files) => {
  if (err) {
    console.error('❌ Erreur lecture dossier:', err);
    return;
  }

  let emptyFiles = 0;
  let totalFiles = 0;

  files.forEach(file => {
    const filePath = path.join(uploadsDir, file);
    const stats = fs.statSync(filePath);
    
    totalFiles++;
    
    if (stats.size === 0) {
      console.log(`🗑️ Suppression fichier vide: ${file}`);
      fs.unlinkSync(filePath);
      emptyFiles++;
    } else {
      console.log(`✅ Fichier OK: ${file} (${stats.size} bytes)`);
    }
  });

  console.log(`\n📊 Résumé:`);
  console.log(`   Total fichiers: ${totalFiles}`);
  console.log(`   Fichiers vides supprimés: ${emptyFiles}`);
  console.log(`   Fichiers conservés: ${totalFiles - emptyFiles}`);
});