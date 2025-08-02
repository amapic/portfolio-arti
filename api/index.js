const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const fs2 = require('fs');
const path = require('path');
const authRoutes = require('./routes/auth');

const app = express();

// Middleware
app.use(cors({credentials: true,origin: true}));
app.use(express.json());

// Fonctions utilitaires pour gérer les chemins de projet
function getProjectPaths(projectId) {
  const projectDir = path.join(__dirname, 'data', `${projectId}`);
  return {
    sectionsPath: path.join(projectDir, 'sections.json'),
    textsPath: path.join(projectDir, 'texts.json'),
    experiencePath: path.join(projectDir, 'experience.json'),
    imagesPath: path.join(projectDir, 'images.json'), // Ajout du chemin pour les images
    aboutPath: path.join(projectDir, 'about.json'), // Ajout du chemin pour les données à propos
    projectDir: projectDir
  };
}

// Fonction pour s'assurer que le dossier du projet existe
async function ensureProjectDirectory(projectId) {
  const { projectDir } = getProjectPaths(projectId);
  try {
    await fs.mkdir(projectDir, { recursive: true });
  } catch (error) {
    console.error('Error creating project directory:', error);
  }
}

// Fonctions utilitaires pour les expériences
async function readDataExp(projectId) {
  try {
    const { experiencePath } = getProjectPaths(projectId);
    const data = await fs.readFile(experiencePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading data:', error);
    return { experiences: [] };
  }
}

async function writeDataExp(projectId, data) {
  try {
    await ensureProjectDirectory(projectId);
    const { experiencePath } = getProjectPaths(projectId);
    await fs.writeFile(experiencePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error('Error writing data:', error);
    throw error;
  }
}

// Fonctions utilitaires pour les sections
async function readData(projectId) {
  try {
    const { sectionsPath } = getProjectPaths(projectId);
    const data = await fs.readFile(sectionsPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return { sections: [] };
  }
}

async function writeData(projectId, data) {
  await ensureProjectDirectory(projectId);
  const { sectionsPath } = getProjectPaths(projectId);
  await fs.writeFile(sectionsPath, JSON.stringify(data, null, 2));
}

// Fonctions utilitaires pour les images
async function readImagesData(projectId) {
  try {
    const { imagesPath } = getProjectPaths(projectId);
    const data = await fs.readFile(imagesPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading images data:', error);
    return { images: [] };
  }
}

async function writeImagesData(projectId, data) {
  try {
    await ensureProjectDirectory(projectId);
    const { imagesPath } = getProjectPaths(projectId);
    await fs.writeFile(imagesPath, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error('Error writing images data:', error);
    throw error;
  }
}

// Fonctions utilitaires pour les données "à propos"
async function readAboutData(projectId) {
  try {
    const { aboutPath } = getProjectPaths(projectId);
    const data = await fs.readFile(aboutPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading about data:', error);
    // Retourner des données par défaut si le fichier n'existe pas
    return {
      id: generateUniqueId(),
      projet: projectId,
      image_url: "/placeholder-portrait.jpg",
      image_alt: "Portrait de Romain de Lagarde",
      main_text: "Texte de présentation à configurer...",
      quote: "Citation à configurer...",
      quote_author: "Auteur à configurer...",
      links: {
        instagram: "",
        facebook: "",
        linkedin: "",
        website1: "",
        website2: ""
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }
}

async function writeAboutData(projectId, data) {
  try {
    await ensureProjectDirectory(projectId);
    const { aboutPath } = getProjectPaths(projectId);
    await fs.writeFile(aboutPath, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error('Error writing about data:', error);
    throw error;
  }
}

// Fonction pour générer un ID unique
function generateUniqueId() {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

// Routes pour les textes
app.get('/api/texts', async (req, res) => {
  
  try {
    const projectId = req.query.projectId;
    if (!projectId) {
      return res.status(400).json({ error: 'ProjectId manquant' });
    }

    await ensureProjectDirectory(projectId);
    const { textsPath } = getProjectPaths(projectId);
    
    // Créer le fichier par défaut s'il n'existe pas
    try {
      await fs.access(textsPath);
    } catch {
      const defaultTexts = {
        texts: {
          contact: {
            id: `contact_${projectId}_default`,
            projet: projectId,
            type: "contact",
            nom: "Romain de Lagarde",
            email: "contact@romaindelagarde.fr",
            telephone: "+336 22 42 23 32",
            adresse: "1 rue Dumont d'Urville\n69004 - Lyon\nFrance",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          about: {
            id: `about_${projectId}_default`,
            projet: projectId,
            title: "À propos",
            type: "about",
            main_text: "Refléter, éblouir, éteindre, estomper, suggérer, diffracter, découper, briller, brouiller : la lumière est l'outil qui me permet de sculpter un volume, une expression artistique...",
            quote: "Le monde y recommençait tous les jours dans une lumière toujours neuve. Ô lumière ! C'est le cri de tous les personnages placés (...) devant leur destin.",
            quote_author: "Albert Camus, L'été.",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        }
      };
      await fs.writeFile(textsPath, JSON.stringify(defaultTexts, null, 2), 'utf8');
    }

    const data = await fs.readFile(textsPath, 'utf8');
    const jsonData = JSON.parse(data);
    console.log("get text", jsonData.texts,textsPath);
    res.json(jsonData.texts);
  } catch (error) {
    console.error('Error reading texts:', error);
    res.status(500).json({ error: 'Failed to read texts' });
  }
});

// Fonction utilitaire pour gérer les clés avec notation pointée
function setNestedValue(obj, path, value) {
  const keys = path.split('.');
  let current = obj;
  
  // Naviguer jusqu'à l'avant-dernière clé
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (!(key in current) || typeof current[key] !== 'object' || current[key] === null) {
      current[key] = {};
    }
    current = current[key];
  }
  
  // Définir la valeur finale
  const lastKey = keys[keys.length - 1];
  current[lastKey] = value;
}

app.post('/api/texts', async (req, res) => {
  console.log("post text");
  try {
    const projectId = req.query.projectId;
    if (!projectId) {
      return res.status(400).json({ error: 'ProjectId manquant' });
    }

    await ensureProjectDirectory(projectId);
    const { textsPath } = getProjectPaths(projectId);
    
    const { key, value } = req.body;
    
    // Créer le fichier par défaut s'il n'existe pas
    let jsonData;
    try {
      const data = await fs.readFile(textsPath, 'utf8');
      jsonData = JSON.parse(data);
    } catch {
      jsonData = { texts: {} };
    }
    
    // Mettre à jour avec la notation pointée
    setNestedValue(jsonData.texts, key, value);
    await fs.writeFile(textsPath, JSON.stringify(jsonData, null, 2), 'utf8');
    
    res.json(jsonData.texts);
  } catch (error) {
    console.error('Error updating texts:', error);
    res.status(500).json({ error: 'Failed to update texts' });
  }
});

// Routes pour les cartes
app.get('/api/cards', async (req, res) => {
  console.log("get cards");
  try {
    const projectId = req.query.projectId;
    if (!projectId) {
      return res.status(400).json({ error: 'ProjectId manquant' });
    }

    const { textsPath } = getProjectPaths(projectId);
    const data = await fs.readFile(textsPath, 'utf8');
    const jsonData = JSON.parse(data);
    res.json(jsonData.cards);
  } catch (error) {
    console.error('Error reading cards:', error);
    res.status(500).json({ error: 'Failed to read cards' });
  }
});

app.post('/api/cards', async (req, res) => {
  try {
    const projectId = req.query.projectId;
    if (!projectId) {
      return res.status(400).json({ error: 'ProjectId manquant' });
    }

    await ensureProjectDirectory(projectId);
    const { textsPath } = getProjectPaths(projectId);
    
    const { icon, title, content } = req.body;
    const data = await fs.readFile(textsPath, 'utf8');
    const jsonData = JSON.parse(data);
    
    const newCard = {
      id: Date.now().toString(),
      icon,
      title,
      content
    };
    
    if (!jsonData.cards) {
      jsonData.cards = [];
    }
    
    jsonData.cards.push(newCard);
    await fs.writeFile(textsPath, JSON.stringify(jsonData, null, 2), 'utf8');
    
    res.json(newCard);
  } catch (error) {
    console.error('Error adding card:', error);
    res.status(500).json({ error: 'Failed to add card' });
  }
});

app.delete('/api/cards/:id', async (req, res) => {
  try {
    const projectId = req.query.projectId;
    if (!projectId) {
      return res.status(400).json({ error: 'ProjectId manquant' });
    }

    const { id } = req.params;
    const { textsPath } = getProjectPaths(projectId);
    const data = await fs.readFile(textsPath, 'utf8');
    const jsonData = JSON.parse(data);
    
    if (!jsonData.cards) {
      return res.status(404).json({ error: 'No cards found' });
    }
    
    const cardIndex = jsonData.cards.findIndex(card => card.id === id);
    if (cardIndex === -1) {
      return res.status(404).json({ error: 'Card not found' });
    }
    
    jsonData.cards = jsonData.cards.filter(card => card.id !== id);
    await fs.writeFile(textsPath, JSON.stringify(jsonData, null, 2), 'utf8');
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting card:', error);
    res.status(500).json({ error: 'Failed to delete card' });
  }
});

// Routes pour les expériences
app.get('/api/experiences', async (req, res) => {
  console.log("get experiences");
  try {
    const projectId = req.query.projectId;
    if (!projectId) {
      return res.status(400).json({ error: 'ProjectId manquant' });
    }

    const data = await readDataExp(projectId);
    res.json(data.experiences || []);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read experiences' });
  }
});

app.post('/api/experiences', async (req, res) => {
  console.log("ajout experience");
  try {
    const projectId = req.query.projectId;
    if (!projectId) {
      return res.status(400).json({ error: 'ProjectId manquant' });
    }

    const data = await readDataExp(projectId);
    const newExperience = {
      id: Date.now().toString(),
      ...req.body
    };
    
    if (!data.experiences) {
      data.experiences = [];
    }
    
    data.experiences.push(newExperience);
    await writeDataExp(projectId, data);

    res.status(201).json(newExperience);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add experience' });
  }
});

app.delete('/api/experiences/:id', async (req, res) => {
  console.log("delete experience");
  try {
    const projectId = req.query.projectId;
    if (!projectId) {
      return res.status(400).json({ error: 'ProjectId manquant' });
    }

    const { id } = req.params;
    const data = await readDataExp(projectId);

    if (!data.experiences) {
      return res.status(404).json({ error: 'No experiences found' });
    }

    const experienceIndex = data.experiences.findIndex(exp => exp.id === id);
    if (experienceIndex === -1) {
      return res.status(404).json({ error: 'Experience not found' });
    }

    data.experiences = data.experiences.filter(exp => exp.id !== id);
    await writeDataExp(projectId, data);

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete experience' });
  }
});

app.put('/api/experiences/:id', async (req, res) => {
  console.log("update experience");
  try {
    const projectId = req.query.projectId;
    if (!projectId) {
      return res.status(400).json({ error: 'ProjectId manquant' });
    }

    const { id } = req.params;
    const data = await readDataExp(projectId);

    if (!data.experiences) {
      return res.status(404).json({ error: 'No experiences found' });
    }

    const experienceIndex = data.experiences.findIndex(exp => exp.id === id);
    if (experienceIndex === -1) {
      return res.status(404).json({ error: 'Experience not found' });
    }

    data.experiences[experienceIndex] = {
      ...data.experiences[experienceIndex],
      ...req.body,
      id
    };

    await writeDataExp(projectId, data);
    res.json(data.experiences[experienceIndex]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update experience' });
  }
});

// Routes pour les sections (si nécessaires)
app.get('/sections', async (req, res) => {
  try {
    const projectId = req.query.projectId;
    if (!projectId) {
      return res.status(400).json({ error: 'ProjectId manquant' });
    }

    const data = await readData(projectId);
    res.json(data.sections || []);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read sections' });
  }
});

app.post('/sections', async (req, res) => {
  try {
    const projectId = req.query.projectId;
    if (!projectId) {
      return res.status(400).json({ error: 'ProjectId manquant' });
    }

    const data = await readData(projectId);
    const newSection = {
      id: Date.now().toString(),
      ...req.body,
      createdAt: new Date().toISOString()
    };
    
    if (!data.sections) {
      data.sections = [];
    }
    
    data.sections.push(newSection);
    await writeData(projectId, data);

    res.status(201).json(newSection);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add section' });
  }
});

app.delete('/sections/:id', async (req, res) => {
  try {
    const projectId = req.query.projectId;
    if (!projectId) {
      return res.status(400).json({ error: 'ProjectId manquant' });
    }

    const { id } = req.params;
    const data = await readData(projectId);

    if (!data.sections) {
      return res.status(404).json({ error: 'No sections found' });
    }

    data.sections = data.sections.filter(section => section.id !== id);
    await writeData(projectId, data);

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete section' });
  }
});

// ==================== ROUTES POUR LES IMAGES ====================

// GET /api/images - Récupérer toutes les images d'un projet
app.get('/api/images', async (req, res) => {
  try {
    const projectId = req.query.projectId;
    if (!projectId) {
      return res.status(400).json({ error: 'ProjectId manquant' });
    }

    const data = await readImagesData(projectId);
    const images = data.images || [];
    
    res.json(images);
  } catch (error) {
    console.error('Error fetching images:', error);
    res.status(500).json({ error: 'Failed to fetch images' });
  }
});

// POST /api/images - Créer une nouvelle image metadata
app.post('/api/images', async (req, res) => {
  try {
    const projectId = req.query.projectId;
    if (!projectId) {
      return res.status(400).json({ error: 'ProjectId manquant' });
    }

    const { image_url, position, selected, category, alt, titre, sousTitre, dimension, displayDimensions, cropData } = req.body;
    
    if (!image_url || !category) {
      return res.status(400).json({ error: 'image_url et category sont requis' });
    }

    const data = await readImagesData(projectId);
    if (!data.images) {
      data.images = [];
    }

    const newImage = {
      id: generateUniqueId(),
      projet: projectId,
      image_url,
      position: position !== undefined ? position : data.images.length,
      selected: selected !== undefined ? selected : false,
      category,
      alt: alt || `Image ${category}`,
      titre: titre || `Titre ${category}`,
      sousTitre: sousTitre || '',
      dimension: dimension || [1, 1],
      crop: { x: 0, y: 0, size: 100 },
      cropData: cropData || null,
      displayDimensions: displayDimensions || { cropWidthPercent: 50, cropHeightPercent: 50 },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    data.images.push(newImage);
    await writeImagesData(projectId, data);

    res.status(201).json(newImage);
  } catch (error) {
    console.error('Error creating image:', error);
    res.status(500).json({ error: 'Failed to create image' });
  }
});

// PUT /api/images/:id - Mettre à jour une image metadata
app.put('/api/images/:id', async (req, res) => {
  try {
    const projectId = req.query.projectId;
    if (!projectId) {
      return res.status(400).json({ error: 'ProjectId manquant' });
    }

    const { id } = req.params;
    const updates = req.body;

    const data = await readImagesData(projectId);
    if (!data.images) {
      return res.status(404).json({ error: 'No images found' });
    }

    const imageIndex = data.images.findIndex(img => img.id === id && img.projet === projectId);
    if (imageIndex === -1) {
      return res.status(404).json({ error: 'Image not found' });
    }

    // Mettre à jour les champs autorisés
    const allowedFields = ['position', 'selected', 'category', 'alt', 'titre', 'sousTitre', 'dimension', 'crop', 'cropData', 'displayDimensions'];
    const updatedImage = { ...data.images[imageIndex] };
    
    allowedFields.forEach(field => {
      if (updates[field] !== undefined) {
        updatedImage[field] = updates[field];
      }
    });
    
    updatedImage.updated_at = new Date().toISOString();
    data.images[imageIndex] = updatedImage;

    await writeImagesData(projectId, data);

    res.json(updatedImage);
  } catch (error) {
    console.error('Error updating image:', error);
    res.status(500).json({ error: 'Failed to update image' });
  }
});

// DELETE /api/images/:id - Supprimer une image metadata
app.delete('/api/images/:id', async (req, res) => {
  try {
    const projectId = req.query.projectId;
    if (!projectId) {
      return res.status(400).json({ error: 'ProjectId manquant' });
    }

    const { id } = req.params;
    const data = await readImagesData(projectId);

    if (!data.images) {
      return res.status(404).json({ error: 'No images found' });
    }

    const initialLength = data.images.length;
    data.images = data.images.filter(img => !(img.id === id && img.projet === projectId));

    if (data.images.length === initialLength) {
      return res.status(404).json({ error: 'Image not found' });
    }

    await writeImagesData(projectId, data);

    res.json({ success: true, message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({ error: 'Failed to delete image' });
  }
});

// ==================== FIN DES ROUTES IMAGES ====================

// Route pour la déconnexion
app.post('/api/logout', async (req, res) => {
  try {
    const projectId = req.query.projectId;
    console.log('Logout for project:', projectId);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to logout' });
  }
});

// Routes pour les données "à propos"

// GET /api/about - Récupérer les données à propos d'un projet
app.get('/api/about', async (req, res) => {
  try {
    const projectId = req.query.projectId;
    if (!projectId) {
      return res.status(400).json({ error: 'ProjectId manquant' });
    }

    const data = await readAboutData(projectId);
    res.json(data);
  } catch (error) {
    console.error('Error fetching about data:', error);
    res.status(500).json({ error: 'Failed to fetch about data' });
  }
});

// PUT /api/about - Mettre à jour les données à propos d'un projet
app.put('/api/about', async (req, res) => {
  try {
    const projectId = req.query.projectId;
    if (!projectId) {
      return res.status(400).json({ error: 'ProjectId manquant' });
    }

    const updates = req.body;
    const currentData = await readAboutData(projectId);
    
    // Fusionner les nouvelles données avec les existantes
    const updatedData = {
      ...currentData,
      ...updates,
      projet: projectId,
      updated_at: new Date().toISOString()
    };

    await writeAboutData(projectId, updatedData);
    res.json(updatedData);
  } catch (error) {
    console.error('Error updating about data:', error);
    res.status(500).json({ error: 'Failed to update about data' });
  }
});

// Import des routes
const uploadRouter = require('./routes/upload');
app.use('/api', authRoutes);
app.use('/api/upload', uploadRouter);

// Configuration du serveur
var env = process.env.NODE_ENV || 'development';
app.listen(5000, () => console.log("Server ready on port 5000."));

// Fonction de copie des fichiers d'exemple (à adapter si nécessaire)
async function copierEtRenommerFichiers() {
  const projectId = 1; // ID du projet par défaut
  const { projectDir, sectionsPath, textsPath, experiencePath, imagesPath } = getProjectPaths(projectId);
  
  try {
    // S'assurer que le dossier existe
    await ensureProjectDirectory(projectId);
    
    // Chemins vers les fichiers d'exemple
    const sectionsExample = path.join(__dirname, 'data', 'sections_exemple.json');
    const textsExample = path.join(__dirname, 'data', 'texts_exemple.json');
    const experienceExample = path.join(__dirname, 'data', 'experience_exemple.json');
    const imagesExample = path.join(__dirname, 'data', 'images_exemple.json');
    
    // Copier les fichiers d'exemple vers le dossier du projet
    await fs.copyFile(sectionsExample, sectionsPath);
    await fs.copyFile(textsExample, textsPath);
    await fs.copyFile(experienceExample, experiencePath);
    
    // Copier le fichier d'exemple des images s'il existe
    if (fs2.existsSync(imagesExample)) {
      await fs.copyFile(imagesExample, imagesPath);
    } else {
      // Créer un fichier images vide s'il n'existe pas
      const defaultImagesData = { images: [] };
      await fs.writeFile(imagesPath, JSON.stringify(defaultImagesData, null, 2), 'utf8');
    }
    
    console.log(`Fichiers copiés pour le projet ${projectId} à`, new Date().toLocaleString());
  } catch (err) {
    console.error('Erreur lors du traitement des fichiers:', err);
  }
}

// Exécuter la fonction toutes les 10 minutes
setInterval(copierEtRenommerFichiers, 10 * 60 * 1000);

// Vercel serverless function handler
module.exports = app;