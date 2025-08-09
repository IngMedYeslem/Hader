const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Démarrage du serveur backend...');

// Démarrer le serveur backend
const serverProcess = spawn('node', ['server.js'], {
  cwd: path.join(__dirname, 'backend'),
  stdio: 'inherit'
});

serverProcess.on('error', (error) => {
  console.error('❌ Erreur démarrage serveur:', error);
});

serverProcess.on('close', (code) => {
  console.log(`🔴 Serveur arrêté avec le code ${code}`);
});

// Gérer l'arrêt propre
process.on('SIGINT', () => {
  console.log('\n🛑 Arrêt du serveur...');
  serverProcess.kill('SIGINT');
  process.exit(0);
});

console.log('✅ Serveur démarré sur http://localhost:3000');
console.log('📊 API disponible sur http://localhost:3000/api');
console.log('🔍 Debug produits: http://localhost:3000/api/debug/products');
console.log('\nAppuyez sur Ctrl+C pour arrêter le serveur');