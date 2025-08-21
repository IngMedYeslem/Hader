const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs');

// Configuration du chemin FFmpeg (ajustez selon votre installation)
// Sur macOS avec Homebrew: /opt/homebrew/bin/ffmpeg
// Sur Linux: /usr/bin/ffmpeg
const ffmpegPath = '/opt/homebrew/bin/ffmpeg'; // Chemin détecté automatiquement

if (fs.existsSync(ffmpegPath)) {
  ffmpeg.setFfmpegPath(ffmpegPath);
}

const convertVideo = async (inputPath, outputPath) => {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .videoCodec('libx264')
      .audioCodec('aac')
      .format('mp4')
      .outputOptions([
        '-movflags +faststart',
        '-vcodec libx264',
        '-acodec aac',
        '-profile:v baseline',
        '-level 3.0',
        '-pix_fmt yuv420p',
        '-vf scale=480:360',
        '-crf 30',
        '-preset ultrafast',
        '-tune zerolatency',
        '-f mp4'
      ])
      .on('start', (commandLine) => {
        console.log('Conversion démarrée:', commandLine);
      })
      .on('progress', (progress) => {
        console.log('Progression:', Math.round(progress.percent) + '%');
      })
      .on('end', () => {
        console.log('Conversion terminée:', outputPath);
        resolve(outputPath);
      })
      .on('error', (err) => {
        console.error('Erreur conversion:', err);
        reject(err);
      })
      .save(outputPath);
  });
};

const convertVideoFromBase64 = async (base64Data, outputPath) => {
  return new Promise((resolve, reject) => {
    try {
      // Extraire les données base64
      const base64String = base64Data.split(',')[1];
      const buffer = Buffer.from(base64String, 'base64');
      
      // Détecter le format depuis l'en-tête base64
      const mimeType = base64Data.split(',')[0];
      let tempExtension = '.mov'; // Par défaut
      
      if (mimeType.includes('mp4')) tempExtension = '.mp4';
      else if (mimeType.includes('quicktime')) tempExtension = '.mov';
      else if (mimeType.includes('webm')) tempExtension = '.webm';
      
      console.log('Format détecté:', mimeType, '-> Extension:', tempExtension);
      
      // Créer un fichier temporaire avec la bonne extension
      const tempPath = outputPath.replace('.mp4', `_temp${tempExtension}`);
      fs.writeFileSync(tempPath, buffer);
      
      // Convertir avec des paramètres spécifiques pour mobile
      ffmpeg(tempPath)
        .videoCodec('libx264')
        .audioCodec('aac')
        .format('mp4')
        .outputOptions([
          '-vcodec h264',
          '-acodec aac',
          '-strict -2',
          '-movflags +faststart',
          '-profile:v baseline',
          '-level 3.0', 
          '-pix_fmt yuv420p',
          '-preset medium'
        ])
        .on('start', (cmd) => console.log('Conversion mobile:', cmd))
        .on('end', () => {
          fs.unlinkSync(tempPath);
          resolve(outputPath);
        })
        .on('error', (err) => {
          if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
          reject(err);
        })
        .save(outputPath);
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = {
  convertVideo,
  convertVideoFromBase64
};