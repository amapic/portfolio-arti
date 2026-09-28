# Documentation des Animations - Galerie d'Images

## 🎯 Animation d'Apparition des Images (IMPORTANT À RETENIR)

### Code Principal - ImageComponent.tsx

```css
@keyframes scaleIn {
  from { 
    transform: scale(0);    /* Ratio 0% - Image invisible */
    opacity: 0;
  }
  to { 
    transform: scale(1);    /* Ratio 100% - Image pleine taille */
    opacity: 1;
  }
}

.entering-animation {
  animation: scaleIn 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}
```

### Fonctionnement
- **État initial** : `scale(0)` = 0% de la taille
- **État final** : `scale(1)` = 100% de la taille
- **Progression** : Le ratio augmente progressivement de 0% à 100% sur 0.5 secondes
- **Easing** : `cubic-bezier(0.4, 0, 0.2, 1)` pour un effet fluide
- **Mode** : `forwards` pour maintenir l'état final

## 🔄 Types d'Animation

### 1. Apparition (`entering`)
- **Trigger** : Nouvelles images lors du changement de filtre
- **Effet** : Scale de 0 à 1 + Fade in
- **Durée** : 0.5s

### 2. Migration (`moving`) 
- **Trigger** : Une seule image présente dans les 2 filtres
- **Effet** : Translation fluide avec `transform: translate()`
- **Durée** : 0.5s
- **Limite** : Une seule image peut migrer (flag `hasMovingImage`)

### 3. Sortie (`exiting`)
- **Trigger** : Images qui disparaissent
- **Effet** : Scale de 1 à 0 + Fade out
- **Durée** : 0.3s

### 4. Stable (`stable`)
- **Trigger** : Images qui ne bougent pas
- **Effet** : Aucune animation

## 🏗️ Architecture

### LegoGallery.tsx
```typescript
// Une seule image peut migrer
let hasMovingImage = false;

if (hasPositionChanged && !hasMovingImage) {
  // Animation de migration
  transitionState: 'moving'
  hasMovingImage = true;
} else {
  // Animation d'apparition classique
  transitionState: 'entering'
}
```

### ImageComponent.tsx
```typescript
// Classes selon l'état
case 'entering':
  return 'entering-animation';  // Scale 0→1
case 'moving':
  return 'moveSmooth_X_Y_to_X_Y';  // Translate fluide
case 'exiting':
  return 'exiting-animation';  // Scale 1→0
```

## 🐛 Corrections Importantes

### 1. Bug ID tronqué
- **Problème** : `parseInt("img_1732716593081")` tronquait l'ID
- **Solution** : Garder les IDs comme `string`
- **Impact** : Mapping correct pour les animations de migration

### 2. Animation par à-coups
- **Problème** : `grid-column/grid-row` non animables fluidement
- **Solution** : `transform: translate()` pour animation pixel par pixel
- **Calcul** : `deltaX = (toCol - fromCol) * cellSize`

## 📝 Notes pour Plus Tard

- **Taille cellule** : `cellSize = 150px` (ajustable)
- **Courbe d'animation** : `cubic-bezier(0.4, 0, 0.2, 1)` (Material Design)
- **ID mapping** : Essentiel de garder les IDs comme strings
- **Une seule migration** : Évite la confusion visuelle
- **Scale vs Translate** : Scale pour apparition/disparition, Translate pour migration

## 🔧 Paramètres Ajustables

```typescript
// Durées d'animation
entering: 0.5s
moving: 0.5s  
exiting: 0.3s

// Taille des cellules de grille
cellSize: 150px

// Courbe d'easing
cubic-bezier(0.4, 0, 0.2, 1)
```

<!-- Mise � jour test Vercel - 2026-09-28 19:39:48 -->
