// import bcrypt from 'bcrypt';
const bcrypt = require('bcrypt');
const password = 'votre_mot_de_passe';
bcrypt.hash(password, 10).then(hash => {
  console.log('Mot de passe hashé:', hash);
}); 