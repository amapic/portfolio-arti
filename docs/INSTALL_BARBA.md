# Installation des dépendances Barba.js

Pour utiliser les transitions Barba.js, vous devez installer les dépendances suivantes :

## 1. Installer les packages

```bash
npm install @barba/core gsap
```

ou avec yarn :

```bash
yarn add @barba/core gsap
```

## 2. Types TypeScript (optionnel)

Si vous utilisez TypeScript, les types sont déjà définis dans `types/barba.d.ts`.

## 3. Utilisation

### Dans votre layout principal (si souhaité) :

```tsx
// app/layout.tsx
import { useBarbaInit } from './components/BarbaTransition';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Initialise Barba.js si vous voulez des transitions globales
  useBarbaInit();
  
  return (
    <html>
      <body>
        {children}
      </body>
    </html>
  );
}
```

### Dans une page avec transitions :

```tsx
import { BarbaPage } from '../components/BarbaTransition';

export default function MyPage() {
  return (
    <BarbaPage namespace="my-page">
      <div>
        <h1>Ma page</h1>
        {/* Contenu de la page */}
      </div>
    </BarbaPage>
  );
}
```

### Avec des liens de navigation :

```tsx
import { BarbaLink } from '../components/BarbaLinks';

export default function Navigation() {
  return (
    <nav>
      <BarbaLink href="/dashboard">Dashboard</BarbaLink>
      <BarbaLink href="/images">Images</BarbaLink>
    </nav>
  );
}
```

## 4. Pages d'exemple

Regardez les pages d'exemple dans :
- `app/admin/dashboard-example/`
- `app/admin/images-example/`
- `app/admin/categories-example/`

Ces pages montrent comment utiliser les transitions Barba.js avec des namespaces spécifiques.

## 5. Personnalisation

Vous pouvez modifier les transitions dans `app/components/BarbaTransition.tsx` :
- Durée des animations
- Types d'animations (fade, slide, scale, etc.)
- Conditions de déclenchement (from/to namespaces)
- Callbacks pour des actions spécifiques

## 6. Debug

Les transitions incluent des console.log pour le debug. Pour les désactiver, changez `debug: true` en `debug: false` dans la configuration Barba.js.
