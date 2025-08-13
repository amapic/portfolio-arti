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

// Fonction pour générer un ID unique
function generateUniqueId() {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

// Routes pour les textes
app.get('/api/texts', async (req, res) => {
  console.log("get text");
  try {
    const projectId = req.query.projectId;
    if (!projectId) {
      return res.status(400).json({ error: 'ProjectId manquant' });
    }

    const { textsPath } = getProjectPaths(projectId);
    const data = await fs.readFile(textsPath, 'utf8');
    const jsonData = JSON.parse(data);
    // Log pour débogage
    // console.log("get text", jsonData, textsPath);
    res.json(jsonData.texts);
  } catch (error) {
    console.error('Error reading texts:', error);
    res.status(500).json({ error: 'Failed to read texts' });
  }
});

// Fonction pour définir une propriété imbriquée ou plate
function setProperty(obj, key, value) {
  // Si la clé existe directement (clé plate), l'utiliser
  if (key in obj) {
    obj[key] = value;
    return true;
  }
  
  // Sinon, essayer de naviguer dans l'objet imbriqué (ancien format)
  if (key.includes('.')) {
    const keys = key.split('.');
    let current = obj;
    
    // Naviguer jusqu'à l'avant-dernière clé
    for (let i = 0; i < keys.length - 1; i++) {
      if (current[keys[i]] === undefined || current[keys[i]] === null) {
        return false; // Chemin inexistant
      }
      current = current[keys[i]];
    }
    
    // Définir la valeur finale
    const lastKey = keys[keys.length - 1];
    if (current && typeof current === 'object') {
      current[lastKey] = value;
      return true;
    }
  }
  
  return false;
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
    
    const data = await fs.readFile(textsPath, 'utf8');
    const jsonData = JSON.parse(data);
    console.log("update text", textsPath, key, value);
    console.log("jsonData.texts",jsonData.texts);
    
    // Utiliser la fonction intelligente pour définir la propriété
    const success = setProperty(jsonData.texts, key, value);
    
    if (!success) {
      return res.status(400).json({ error: 'Invalid text key: ' + key });
    }
    
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

    const { image_url, position, selected, category, alt, titre, sousTitre, dimension, crop, cropData, displayDimensions } = req.body;
    
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
      crop: crop || { x: 0, y: 0, size: 100 }, // Image entière par défaut
      cropData: cropData || null, // Données de crop détaillées
      displayDimensions: displayDimensions || null, // Dimensions d'affichage
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

// ==================== ROUTES POUR LES CATÉGORIES ====================

// Fonctions utilitaires pour les catégories
async function readCategoriesData(projectId) {
  try {
    const projectDir = path.join(__dirname, 'data', `${projectId}`);
    const categoriesPath = path.join(projectDir, 'categories.json');
    const data = await fs.readFile(categoriesPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading categories data:', error);
    return { categories: [] };
  }
}

async function writeCategoriesData(projectId, data) {
  try {
    await ensureProjectDirectory(projectId);
    const projectDir = path.join(__dirname, 'data', `${projectId}`);
    const categoriesPath = path.join(projectDir, 'categories.json');
    await fs.writeFile(categoriesPath, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error('Error writing categories data:', error);
    throw error;
  }
}

// Fonction pour mettre à jour les catégories dans les images
async function updateImagesCategories(projectId, oldCategoryValue, newCategoryValue) {
  try {
    const imagesData = await readImagesData(projectId);
    let hasChanges = false;

    if (imagesData.images) {
      imagesData.images.forEach(image => {
        if (image.category) {
          if (Array.isArray(image.category)) {
            // Cas multivalué : remplacer l'ancienne valeur par la nouvelle
            const index = image.category.indexOf(oldCategoryValue);
            if (index !== -1) {
              image.category[index] = newCategoryValue;
              image.updated_at = new Date().toISOString();
              hasChanges = true;
            }
          } else if (image.category === oldCategoryValue) {
            // Cas valeur unique : remplacer directement
            image.category = newCategoryValue;
            image.updated_at = new Date().toISOString();
            hasChanges = true;
          }
        }
      });

      if (hasChanges) {
        await writeImagesData(projectId, imagesData);
        console.log(`Updated images categories from "${oldCategoryValue}" to "${newCategoryValue}"`);
      }
    }

    return hasChanges;
  } catch (error) {
    console.error('Error updating images categories:', error);
    throw error;
  }
}

// GET /api/categories - Récupérer toutes les catégories d'un projet
app.get('/api/categories', async (req, res) => {
  try {
    const projectId = req.query.projectId;
    if (!projectId) {
      return res.status(400).json({ error: 'ProjectId manquant' });
    }

    const data = await readCategoriesData(projectId);
    const categories = data.categories || [];
    
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// POST /api/categories - Créer une nouvelle catégorie
app.post('/api/categories', async (req, res) => {
  try {
    const projectId = req.query.projectId;
    if (!projectId) {
      return res.status(400).json({ error: 'ProjectId manquant' });
    }

    const { value, label, isActive } = req.body;
    
    if (!value || !label) {
      return res.status(400).json({ error: 'value et label sont requis' });
    }

    const data = await readCategoriesData(projectId);
    if (!data.categories) {
      data.categories = [];
    }

    // Vérifier l'unicité de la valeur
    const existingCategory = data.categories.find(cat => cat.value.toLowerCase() === value.toLowerCase());
    if (existingCategory) {
      return res.status(400).json({ error: 'Cette valeur de catégorie existe déjà' });
    }

    const newCategory = {
      id: generateUniqueId(),
      value,
      label,
      order: data.categories.length,
      isActive: isActive !== undefined ? isActive : true
    };

    data.categories.push(newCategory);
    await writeCategoriesData(projectId, data);

    res.status(201).json(newCategory);
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: 'Failed to create category' });
  }
});

// PUT /api/categories/:id - Mettre à jour une catégorie
app.put('/api/categories/:id', async (req, res) => {
  try {
    const projectId = req.query.projectId;
    if (!projectId) {
      return res.status(400).json({ error: 'ProjectId manquant' });
    }

    const { id } = req.params;
    const { action } = req.query;
    
    // Cas spécial : réorganisation multiple
    if (action === 'reorder') {
      const categories = req.body;
      const data = await readCategoriesData(projectId);
      data.categories = categories;
      await writeCategoriesData(projectId, data);
      return res.json({ success: true });
    }

    // Cas normal : mise à jour d'une catégorie
    const updates = req.body;
    const data = await readCategoriesData(projectId);
    
    if (!data.categories) {
      return res.status(404).json({ error: 'No categories found' });
    }

    const categoryIndex = data.categories.findIndex(cat => cat.id === id);
    if (categoryIndex === -1) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const oldCategory = data.categories[categoryIndex];
    const oldValue = oldCategory.value;
    
    // Mettre à jour les champs autorisés
    const allowedFields = ['value', 'label', 'order', 'isActive'];
    const updatedCategory = { ...oldCategory };
    
    allowedFields.forEach(field => {
      if (updates[field] !== undefined) {
        updatedCategory[field] = updates[field];
      }
    });

    // Si la valeur a changé, mettre à jour les images
    if (updates.value && updates.value !== oldValue) {
      // Vérifier l'unicité de la nouvelle valeur
      const existingCategory = data.categories.find(cat => 
        cat.id !== id && cat.value.toLowerCase() === updates.value.toLowerCase()
      );
      if (existingCategory) {
        return res.status(400).json({ error: 'Cette valeur de catégorie existe déjà' });
      }

      // Mettre à jour les images qui utilisent cette catégorie
      await updateImagesCategories(projectId, oldValue, updates.value);
    }
    
    data.categories[categoryIndex] = updatedCategory;
    await writeCategoriesData(projectId, data);

    res.json(updatedCategory);
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ error: 'Failed to update category' });
  }
});

// DELETE /api/categories/:id - Supprimer une catégorie
app.delete('/api/categories/:id', async (req, res) => {
  try {
    const projectId = req.query.projectId;
    if (!projectId) {
      return res.status(400).json({ error: 'ProjectId manquant' });
    }

    const { id } = req.params;
    const data = await readCategoriesData(projectId);

    if (!data.categories) {
      return res.status(404).json({ error: 'No categories found' });
    }

    const categoryIndex = data.categories.findIndex(cat => cat.id === id);
    if (categoryIndex === -1) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const categoryToDelete = data.categories[categoryIndex];
    
    // Vérifier si des images utilisent cette catégorie
    const imagesData = await readImagesData(projectId);
    const hasImagesWithCategory = imagesData.images && imagesData.images.some(image => {
      if (!image.category) return false;
      if (Array.isArray(image.category)) {
        return image.category.includes(categoryToDelete.value);
      }
      return image.category === categoryToDelete.value;
    });

    if (hasImagesWithCategory) {
      return res.status(400).json({ 
        error: 'Impossible de supprimer cette catégorie car elle est utilisée par des images' 
      });
    }

    data.categories = data.categories.filter(cat => cat.id !== id);
    await writeCategoriesData(projectId, data);

    res.json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

// ==================== FIN DES ROUTES CATÉGORIES ====================

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