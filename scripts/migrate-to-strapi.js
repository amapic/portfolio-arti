const fs = require('fs').promises;
const path = require('path');

// Script de migration des données JSON vers Strapi
async function migrateToStrapi() {
  const STRAPI_API = 'http://localhost:1337/api';
  const PROJECT_ID = '3'; // Votre projet actuel

  try {
    // 1. Migrer les images
    const imagesData = await fs.readFile(path.join(__dirname, '../api/images.json'), 'utf8');
    const images = JSON.parse(imagesData).images;

    for (const image of images) {
      const strapiImage = {
        data: {
          url: image.image_url,
          projet: PROJECT_ID,
          position: image.position,
          selected: image.selected,
          category: image.category,
          alt: image.alt,
          titre: image.titre,
          sousTitre: image.sousTitre,
          dimension: image.dimension
        }
      };

      await fetch(`${STRAPI_API}/images`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(strapiImage)
      });
    }

    // 2. Migrer les textes
    const textsData = await fs.readFile(path.join(__dirname, '../api/data/3/texts.json'), 'utf8');
    const texts = JSON.parse(textsData).texts;

    for (const [key, value] of Object.entries(texts)) {
      const strapiText = {
        data: {
          key: key,
          value: JSON.stringify(value),
          projet: PROJECT_ID
        }
      };

      await fetch(`${STRAPI_API}/text-contents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(strapiText)
      });
    }

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

migrateToStrapi();
