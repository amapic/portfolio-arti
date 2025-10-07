# Configuration Firebase Authentication

Ce guide explique comment configurer Firebase Authentication pour votre projet.

## 1. Créer un projet Firebase

1. Allez sur [Firebase Console](https://console.firebase.google.com/)
2. Cliquez sur "Ajouter un projet"
3. Donnez un nom à votre projet (ex: "romain-portfolio")
4. Suivez les étapes de configuration

## 2. Activer Authentication

1. Dans votre projet Firebase, allez dans "Authentication"
2. Cliquez sur "Commencer"
3. Dans l'onglet "Sign-in method", activez "E-mail/Mot de passe"
4. Activez aussi "Lien e-mail (connexion sans mot de passe)" si souhaité

## 3. Créer une application web

1. Dans "Paramètres du projet" > "Vos applications"
2. Cliquez sur l'icône web (</>) pour ajouter une application web
3. Donnez un nom à votre app (ex: "Portfolio Web")
4. Copiez la configuration qui s'affiche

## 4. Configurer Firestore (optionnel mais recommandé)

1. Allez dans "Firestore Database"
2. Cliquez sur "Créer une base de données"
3. Choisissez "Commencer en mode test" pour débuter
4. Sélectionnez votre région

## 5. Règles de sécurité Firestore

Ajoutez ces règles dans Firestore pour sécuriser les données utilisateurs :

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Les utilisateurs peuvent lire/écrire leurs propres données
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Lecture publique pour certaines collections si nécessaire
    match /public/{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

## 6. Variables d'environnement

Copiez votre configuration Firebase et ajoutez-la dans votre fichier `.env.local` :

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=votre_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=votre_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=votre_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=votre_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=votre_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=votre_app_id
```

## 7. Installation

Installez Firebase dans votre projet :

```bash
npm install firebase
```

## 8. Utilisation

Le système d'authentification Firebase est maintenant configuré. Les utilisateurs peuvent :

- S'inscrire avec email/mot de passe
- Se connecter
- Avoir des rôles (admin/viewer)
- Les admins ont accès en écriture, les viewers en lecture seule

## Migration depuis l'ancien système

Pour migrer depuis l'ancien système d'authentification :

1. Configurez Firebase comme décrit ci-dessus
2. Remplacez `AuthProvider` par `FirebaseAuthProvider` dans vos layouts
3. Les utilisateurs devront créer de nouveaux comptes Firebase
4. Vous pouvez importer les utilisateurs existants via l'Admin SDK si nécessaire

## Sécurité

- Les mots de passe sont gérés par Firebase (hachage sécurisé)
- Les sessions sont automatiquement gérées
- Les tokens d'authentification expirent automatiquement
- Les règles Firestore protègent les données utilisateurs