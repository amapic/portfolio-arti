# Architecture d'authentification

## Structure actuelle

### Pages publiques (app/page.tsx, app/contact/, app/a-propos/)
- **Pas d'authentification** requise
- Accès libre pour tous les visiteurs
- Pas de AuthProvider dans le layout principal

### Pages admin (app/admin/**)
- **Authentification Firebase** requise
- AuthProvider dans `app/admin/layout.tsx`
- Protection automatique via `AdminProtectedRoute`
- Header avec informations de connexion

## Composants d'authentification

### `FirebaseAuthProvider.tsx`
- Gestion complète de l'authentification Firebase
- Connexion/inscription avec email/mot de passe
- Gestion des rôles (admin/viewer) dans Firestore
- États : `isLoggedIn`, `user`, `hasWriteAccess`, `loading`

### `AdminProtectedRoute.tsx`
- Composant de protection pour les pages admin
- Affiche un écran de connexion si non authentifié
- Affiche un loader pendant la vérification
- Permet l'accès au contenu si connecté

### `FirebaseLoginModal.tsx`
- Interface de connexion/inscription
- Validation des formulaires
- Gestion des erreurs
- Choix du rôle lors de l'inscription

## Utilisation

### Dans les pages admin
```tsx
import { useAuth } from '../components/FirebaseAuthProvider';

function AdminPage() {
  const { user, isLoggedIn, hasWriteAccess, logout } = useAuth();
  
  if (!hasWriteAccess) {
    return <div>Accès en lecture seule</div>;
  }
  
  return <div>Interface admin complète</div>;
}
```

### Flow d'authentification
1. Utilisateur accède à `/admin/*`
2. `AdminProtectedRoute` vérifie l'authentification
3. Si non connecté → Affiche écran de connexion
4. Si connecté → Affiche le contenu admin
5. Header affiche les infos utilisateur et bouton déconnexion

## Rôles utilisateurs

### Admin
- `hasWriteAccess = true`
- Peut modifier les données (images, textes, etc.)
- Accès complet à toutes les fonctionnalités

### Viewer  
- `hasWriteAccess = false`
- Accès en lecture seule
- Peut voir l'admin mais pas modifier

## Sécurité

- Authentification gérée par Firebase
- Sessions persistantes automatiques
- Tokens sécurisés
- Règles Firestore pour protéger les données utilisateurs
- Pas d'authentification sur les pages publiques (performance optimale)