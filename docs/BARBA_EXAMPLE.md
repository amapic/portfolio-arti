# Transitions Barba.js pour les pages Admin

Cet exemple montre comment intégrer des transitions fluides avec Barba.js dans une application Next.js pour les pages d'administration.

## 🚀 Fonctionnalités

- **Transitions fluides** entre les pages admin
- **Animations GSAP** personnalisées
- **Compatible Next.js** avec routing côté client
- **TypeScript** avec types personnalisés
- **Responsive design** avec Tailwind CSS

## 📁 Structure des fichiers

```
app/
├── components/
│   ├── BarbaTransition.tsx    # Configuration principale de Barba.js
│   └── BarbaLinks.tsx         # Composants de liens personnalisés
├── admin/
│   ├── dashboard-example/
│   │   └── page.tsx          # Page dashboard avec transitions
│   ├── images-example/
│   │   └── page.tsx          # Page images avec transitions
│   └── categories-example/
│       └── page.tsx          # Page catégories avec transitions
└── types/
    └── barba.d.ts            # Déclarations TypeScript
```

## 🎨 Types de transitions

### 1. Fade Transition (Par défaut)
- Animation de fondu avec mouvement vertical
- Durée: 400ms pour sortir, 500ms pour entrer
- Utilisée entre toutes les pages

### 2. Admin Slide
- Animation de glissement horizontal
- Du dashboard vers les sous-pages (images, catégories, textes)
- Effet de slide vers la gauche/droite

### 3. Admin Return
- Animation de zoom avec effet "bounce"
- Des sous-pages vers le dashboard
- Effet de réduction puis agrandissement

## 🛠️ Utilisation

### 1. Initialisation
```tsx
import { useBarbaInit } from '../components/BarbaTransition';

// Dans votre composant
const MyPage = () => {
  useBarbaInit(); // Initialise Barba.js une seule fois
  return <div>...</div>;
};
```

### 2. Wrapper de page
```tsx
import { BarbaPage } from '../components/BarbaTransition';

const MyAdminPage = () => {
  return (
    <BarbaPage namespace="admin-dashboard">
      {/* Votre contenu */}
    </BarbaPage>
  );
};
```

### 3. Liens avec transitions
```tsx
import { BarbaLink } from '../components/BarbaLinks';

// Lien simple
<BarbaLink href="/admin/images">
  Aller aux images
</BarbaLink>

// Lien de navigation admin avec style
<AdminNavLink 
  href="/admin/categories" 
  isActive={true}
  icon={<span>📂</span>}
>
  Catégories
</AdminNavLink>
```

## 🎯 Namespaces disponibles

- `admin-dashboard` - Page principale du dashboard
- `admin-images` - Page de gestion des images  
- `admin-categories` - Page de gestion des catégories
- `admin-texts` - Page de gestion des textes

## ⚙️ Configuration des transitions

Les transitions sont configurées dans `BarbaTransition.tsx` :

```tsx
transitions: [
  {
    name: 'fade-transition',
    leave(data) {
      return gsap.to(data.current.container, {
        opacity: 0,
        y: -30,
        duration: 0.4
      });
    },
    enter(data) {
      return gsap.to(data.next.container, {
        opacity: 1,
        y: 0,
        duration: 0.5
      });
    }
  }
]
```

## 🎨 Styles CSS

Les styles de base sont inclus dans `barbaStyles` :
- Loading spinner
- Container styles  
- Smooth transitions

## 📱 Responsive

Toutes les pages d'exemple utilisent Tailwind CSS pour un design responsive :
- Mobile first
- Grilles adaptatives
- Navigation responsive

## 🔧 Dépendances

```bash
npm install @barba/core gsap
```

## 📄 Pages d'exemple

1. **Dashboard** (`/admin/dashboard-example`)
   - Vue d'ensemble avec statistiques
   - Cards cliquables vers les sous-pages
   
2. **Images** (`/admin/images-example`)
   - Grille d'images
   - Actions de gestion
   
3. **Catégories** (`/admin/categories-example`)
   - Liste des catégories
   - Statistiques par catégorie

## 🚀 Pour aller plus loin

- Ajouter des transitions personnalisées pour chaque type de page
- Intégrer des animations de loading
- Ajouter des transitions basées sur le scroll
- Créer des transitions avec des éléments partagés

## 💡 Conseils d'optimisation

- Utiliser `prefetch={false}` sur les liens non critiques
- Lazy load les animations complexes
- Éviter les transitions trop longues (> 800ms)
- Tester sur mobile pour les performances
