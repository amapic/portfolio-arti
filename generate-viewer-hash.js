const bcrypt = require('bcrypt');

// Génération du hash pour le mot de passe viewer
const viewerPassword = 'viewer2024'; // Changez ce mot de passe selon vos préférences
const saltRounds = 10;

async function generateHash() {
  try {
    const hash = await bcrypt.hash(viewerPassword, saltRounds);
    console.log('=== CONFIGURATION DES VARIABLES D\'ENVIRONNEMENT ===\n');
    console.log('Ajoutez ces variables dans votre fichier .env :\n');
    console.log(`HASHED_PASSWORD_VIEWER=${hash}`);
    console.log('\n=== INFORMATIONS DE CONNEXION ===\n');
    console.log('Compte Admin :');
    console.log('  Username: admin');
    console.log('  Password: [votre mot de passe admin actuel]');
    console.log('\nCompte Viewer (lecture seule) :');
    console.log('  Username: viewer');
    console.log(`  Password: ${viewerPassword}`);
    console.log('\n=== UTILISATION ===\n');
    console.log('- Admin : Accès complet (lecture + écriture)');
    console.log('- Viewer : Accès en lecture seule (peut voir mais pas modifier)');
  } catch (error) {
    console.error('Erreur lors de la génération du hash:', error);
  }
}

generateHash();
