const express = require('express');
const multer = require('multer');

// Middleware de debug pour voir ce qui arrive au serveur
const debugUpload = (req, res, next) => {
  console.log('🔍 DEBUG UPLOAD:');
  console.log('Headers:', req.headers);
  console.log('Content-Type:', req.get('Content-Type'));
  console.log('Content-Length:', req.get('Content-Length'));
  
  // Capturer les données brutes
  let rawData = '';
  req.on('data', chunk => {
    rawData += chunk;
    console.log('📦 Chunk reçu:', chunk.length, 'bytes');
  });
  
  req.on('end', () => {
    console.log('📊 Total données reçues:', rawData.length, 'bytes');
    console.log('🔍 Début des données:', rawData.substring(0, 200));
  });
  
  next();
};

// Ajouter ce middleware avant multer dans server.js
console.log('Ajoutez ce middleware dans server.js avant les routes d\'upload:');
console.log('app.use(\'/api/upload-media\', debugUpload);');