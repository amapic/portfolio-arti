# Installation Strapi sur serveur Ubuntu

## 1. Connexion SSH et installation
```bash
ssh votre_user@votre_serveur_ip

# Installation Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Vérifier les versions
node --version
npm --version
```

## 2. Installation Strapi
```bash
# Aller dans votre dossier web
cd /var/www/
# ou cd /home/votre_user/

# Créer le projet Strapi
npx create-strapi-app@latest romain-cms --quickstart

cd romain-cms
```

## 3. Configuration pour développement
```bash
# Modifier le fichier de config
nano config/server.js
```

Contenu du fichier `config/server.js` :
```javascript
module.exports = ({ env }) => ({
  host: env('HOST', '0.0.0.0'), // Écoute sur toutes les interfaces
  port: env.int('PORT', 1337),
  app: {
    keys: env.array('APP_KEYS'),
  },
  webhooks: {
    populateRelations: env.bool('WEBHOOKS_POPULATE_RELATIONS', false),
  },
});
```

## 4. Configuration CORS pour votre PC
```bash
nano config/middlewares.js
```

Contenu du fichier `config/middlewares.js` :
```javascript
module.exports = [
  'strapi::logger',
  'strapi::errors',
  'strapi::security',
  {
    name: 'strapi::cors',
    config: {
      origin: ['http://localhost:3000', 'http://127.0.0.1:3000'], // Votre Next.js local
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      headers: ['Content-Type', 'Authorization', 'Origin', 'Accept'],
      keepHeaderOnError: true,
    },
  },
  'strapi::poweredBy',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];
```

## 5. Lancement du serveur
```bash
# En développement
npm run develop

# En production
npm run build
NODE_ENV=production npm start
```

## 6. Ouvrir le port dans le firewall
```bash
sudo ufw allow 1337
```

## 7. Accès depuis votre PC
- Admin Strapi : `http://VOTRE_IP_SERVEUR:1337/admin`
- API Strapi : `http://VOTRE_IP_SERVEUR:1337/api`
```
