const fs = require('fs');
const https = require('https');
const path = require('path');

// Créer le dossier images s'il n'existe pas
const imagesDir = path.join(__dirname, '..', 'public', 'images');
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

// Fonction pour télécharger une image
function downloadImage(url, filename) {
  return new Promise((resolve, reject) => {
    const filePath = path.join(imagesDir, filename);
    const file = fs.createWriteStream(filePath);
    
    https.get(url, (response) => {
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        console.log(`✅ Téléchargé: ${filename}`);
        resolve();
      });
      
      file.on('error', (err) => {
        fs.unlink(filePath, () => {}); // Supprimer le fichier en cas d'erreur
        reject(err);
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

// Configuration des images à télécharger
const imageConfigs = [
  // Images carrées (400x400)
  { width: 400, height: 400, count: 10 },
  // Images rectangulaires horizontales (600x400)
  { width: 600, height: 400, count: 8 },
  // Images rectangulaires verticales (400x600)
  { width: 400, height: 600, count: 7 }
];

async function downloadAllImages() {
  let imageIndex = 1;
  
  console.log('🚀 Début du téléchargement des images Picsum...');
  console.log(`📁 Dossier de destination: ${imagesDir}`);
  
  try {
    for (const config of imageConfigs) {
      console.log(`\n📸 Téléchargement des images ${config.width}x${config.height}...`);
      
      for (let i = 0; i < config.count; i++) {
        const randomId = Math.floor(Math.random() * 1000) + 1;
        const url = `https://picsum.photos/${config.width}/${config.height}?random=${randomId}`;
        const filename = `image-${imageIndex}-${config.width}x${config.height}.jpg`;
        
        await downloadImage(url, filename);
        imageIndex++;
      }
    }
    
    console.log('\n🎉 Toutes les images ont été téléchargées avec succès !');
    console.log(`📊 Total: ${imageIndex - 1} images téléchargées`);
    
    // Générer un fichier JSON avec la liste des images
    const imageList = [];
    for (let i = 1; i < imageIndex; i++) {
      const files = fs.readdirSync(imagesDir).filter(f => f.startsWith(`image-${i}-`));
      if (files.length > 0) {
        const filename = files[0];
        const dimensions = filename.match(/(\d+)x(\d+)/);
        imageList.push({
          id: i,
          filename: filename,
          path: `/images/${filename}`,
          width: parseInt(dimensions[1]),
          height: parseInt(dimensions[2])
        });
      }
    }
    
    fs.writeFileSync(
      path.join(__dirname, '..', 'public', 'images', 'images-list.json'),
      JSON.stringify(imageList, null, 2)
    );
    
    console.log('📝 Fichier images-list.json créé avec la liste des images');
    
  } catch (error) {
    console.error('❌ Erreur lors du téléchargement:', error.message);
  }
}

// Lancer le téléchargement
downloadAllImages();
