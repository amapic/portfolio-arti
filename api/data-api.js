const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const fs2 = require('fs');
const path = require('path');
const authRoutes = require('./routes/auth');

// const experiencesRouter = require('./routes/experiences');
// import cookieParser from 'cookie-parser';

const app = express();

// Middleware
app.use(cors({credentials: true,origin: true}	));
// app.use(cors({
  // origin: '*', // Permet toutes les origines
  // methods: ['GET', 'POST', 'DELETE', 'UPDATE', 'PUT', 'PATCH'],
  // allowedHeaders: ['Content-Type', 'Authorization']
// }));
app.use(express.json());

// Chemin vers le fichier JSON
const dataPath = path.join(__dirname, 'data', 'sections.json');
const TEXTS_FILE = path.join(__dirname, 'data', 'texts.json');
const DATA_FILE = path.join(__dirname, 'data', 'experience.json');

async function readDataExp() {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading data:', error);
    throw error;
  }
}

// Fonction utilitaire pour écrire dans le fichier JSON
async function writeDataExp(data) {
  try {
    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error('Error writing data:', error);
    throw error;
  }
}
// Fonction utilitaire pour lire/écrire le fichier JSON
async function readData() {
  try {
    const data = await fs.readFile(dataPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return { sections: [] };
  }
}

async function writeData(data) {
  await fs.writeFile(dataPath, JSON.stringify(data, null, 2));
}

// Routes


// Lire les textes
app.get('/api/texts', async (req, res) => {
	console.log("get text")
  try {
    const data = await fs.readFile(TEXTS_FILE, 'utf8');
    const jsonData = JSON.parse(data);
    res.json(jsonData.texts);
  } catch (error) {
    console.error('Error reading texts:', error);
    res.status(500).json({ error: 'Failed to read texts' });
  }
});

// Mettre à jour un texte
app.post('/api/texts', async (req, res) => {
	console.log("post text")
  try {
    const { key, value } = req.body;
    const data = await fs.readFile(TEXTS_FILE, 'utf8');
    const jsonData = JSON.parse(data);
    
    if (!(key in jsonData.texts)) {
      return res.status(400).json({ error: 'Invalid text key' });
    }
    
    jsonData.texts[key] = value;
    await fs.writeFile(TEXTS_FILE, JSON.stringify(jsonData, null, 2), 'utf8');
    
    res.json(jsonData.texts);
  } catch (error) {
    console.error('Error updating texts:', error);
    res.status(500).json({ error: 'Failed to update texts' });
  }
});

// Récupérer toutes les cartes
app.get('/api/cards', async (req, res) => {
	console.log("get cards")
  try {
    const data = await fs.readFile(TEXTS_FILE, 'utf8');
    const jsonData = JSON.parse(data);
    res.json(jsonData.cards);
  } catch (error) {
    console.error('Error reading cards:', error);
    res.status(500).json({ error: 'Failed to read cards' });
  }
});

// Ajouter une nouvelle carte
app.post('/api/cards', async (req, res) => {
  try {
    const { icon, title, content } = req.body;
    const data = await fs.readFile(TEXTS_FILE, 'utf8');
    const jsonData = JSON.parse(data);
    
    const newCard = {
      id: Date.now().toString(), // Génère un ID unique
      icon,
      title,
      content
    };
    
    jsonData.cards.push(newCard);
    await fs.writeFile(TEXTS_FILE, JSON.stringify(jsonData, null, 2), 'utf8');
    
    res.json(newCard);
  } catch (error) {
    console.error('Error adding card:', error);
    res.status(500).json({ error: 'Failed to add card' });
  }
});

// Supprimer une carte
app.delete('/api/cards/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const data = await fs.readFile(TEXTS_FILE, 'utf8');
    const jsonData = JSON.parse(data);
    
    // S'assurer que cards existe
    if (!jsonData.cards) {
      return res.status(404).json({ error: 'No cards found' });
    }
    
    // Vérifier si la carte existe
    const cardIndex = jsonData.cards.findIndex(card => card.id === id);
    if (cardIndex === -1) {
      return res.status(404).json({ error: 'Card not found' });
    }
    
    // Supprimer la carte
    jsonData.cards = jsonData.cards.filter(card => card.id !== id);
    await fs.writeFile(TEXTS_FILE, JSON.stringify(jsonData, null, 2), 'utf8');
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting card:', error);
    res.status(500).json({ error: 'Failed to delete card' });
  }
});


app.get('/api/experiences' , async (req, res) => {
console.log("get")
  try {

    const data = await readDataExp();
    res.json(data.experiences || []);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read experiences' });
  }
});

// Ajouter une nouvelle expérience
app.post('/api/experiences' , async (req, res) => {
	console.log("ajout")
  try {
    const data = await readDataExp();
    console.log(data)
    const newExperience = {
      id: Date.now().toString(), // Génère un ID unique
      ...req.body
    };
		
    // Initialise le tableau s'il n'existe pas
    if (!data.experiences) {
      data.experiences = [];
    }
	console.log(newExperience)
    data.experiences.push(newExperience);
    await writeDataExp(data);

    res.status(201).json(newExperience);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add experience' });
  }
});

// Supprimer une expérience
app.delete('/api/experiences/:id', async (req, res) => {
	console.log("del")
  try {
    const { id } = req.params;
    const data = await readDataExp();

    if (!data.experiences) {
      return res.status(404).json({ error: 'No experiences found' });
    }

    const experienceIndex = data.experiences.findIndex(exp => exp.id === id);
    if (experienceIndex === -1) {
      return res.status(404).json({ error: 'Experience not found' });
    }

    data.experiences = data.experiences.filter(exp => exp.id !== id);
    await writeDataExp(data);

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete experience' });
  }
});

// Mettre à jour une expérience
app.put('/api/experiences/:id', async (req, res) => {
	console.log("maj")
  try {
	  
    const { id } = req.params;
    const data = await readDataExp();

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
      id // Préserve l'ID original
    };

    await writeDataExp(data);
    res.json(data.experiences[experienceIndex]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update experience' });
  }
});

const uploadRouter = require('./routes/upload');
// const authRoutes = require('./routes/auth');

// ... autres configurations ...
app.use('/api', authRoutes);
app.use('/api/upload', uploadRouter);

app.use(express.json());


var env = process.env.NODE_ENV || 'development';
// console.log(env)
app.listen(5000, () => console.log("Server ready on port 5000."));

// Chemins vers les fichiers originaux
const file1Original = 'data/sections_exemple';
const file2Original = 'data/texts_exemple';
const file3Original = 'data/experience_exemple';

// Chemins vers les fichiers à écraser
const file1Target = 'data/sections.json';
const file2Target = 'data/texts.json';
const file3Target = 'data/experience.json';

async function copierEtRenommerFichiers() {
  const timestamp = Date.now();

  try {
    // Copier les fichiers originaux avec un timestamp
    // await fs.copyFile(`${file1Original}.json`, `${file1Original}_${timestamp}.json`);
    // await fs.copyFile(`${file2Original}.json`, `${file2Original}_${timestamp}.json`);
	// await fs.copyFile(`${file3Original}.json`, `${file3Original}_${timestamp}.json`);
	await fs.copyFile(`${file1Original}.json`, file1Target);
    await fs.copyFile(`${file2Original}.json`, file2Target);
	await fs.copyFile(`${file3Original}.json`, file3Target);
	
	// await fs.unlink(file1Target);
    // await fs.unlink(file2Target);
	// await fs.unlink(file3Target);

    // Écraser les fichiers cibles avec les copies
    // await fs.copyFile(`${file1Original}_${timestamp}.json`, file1Target);
    // await fs.copyFile(`${file2Original}_${timestamp}.json`, file2Target);
	// await fs.copyFile(`${file3Original}_${timestamp}.json`, file3Target);
	
	// await fs.unlink(`${file1Original}_${timestamp}.json`);
    // await fs.unlink(`${file2Original}_${timestamp}.json`);
	// await fs.unlink(`${file3Original}_${timestamp}.json`);

    // console.log('Fichiers copiés, renommés et écrasés avec succès à', new Date().toLocaleString());
  } catch (err) {
    console.error('Erreur lors du traitement des fichiers:', err);
  }
}

// Exécuter la fonction toutes les 10 minutes
setInterval(copierEtRenommerFichiers, 10 * 60 * 1000); // 10 minutes en millisecondes

// Exécuter la fonction une première fois au démarrage
// copierEtRenommerFichiers();

// Vercel serverless function handler
module.exports = app;