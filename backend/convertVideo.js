const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

const convertVideo = (inputPath, outputPath) => {
  return new Promise((resolve, reject) => {
    const command = `ffmpeg -i "${inputPath}" -c:v libx264 -profile:v baseline -level 3.0 -pix_fmt yuv420p -c:a aac -b:a 128k -movflags +faststart "${outputPath}"`;
    
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else {
        resolve(outputPath);
      }
    });
  });
};

const processVideoUpload = async (originalPath) => {
  const ext = path.extname(originalPath);
  const baseName = path.basename(originalPath, ext);
  const dir = path.dirname(originalPath);
  const convertedPath = path.join(dir, `${baseName}_converted.mp4`);
  
  try {
    console.log(`Conversion vidéo: ${originalPath} -> ${convertedPath}`);
    await convertVideo(originalPath, convertedPath);
    console.log('Conversion réussie, remplacement du fichier original');
    fs.unlinkSync(originalPath);
    fs.renameSync(convertedPath, originalPath);
    console.log(`Vidéo convertie sauvegardée: ${originalPath}`);
    return originalPath;
  } catch (error) {
    console.error('Erreur conversion vidéo:', error);
    if (fs.existsSync(convertedPath)) {
      fs.unlinkSync(convertedPath);
    }
    return originalPath;
  }
};

module.exports = { convertVideo, processVideoUpload };