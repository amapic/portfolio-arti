# Documentation - Structure des données textes

## Fichier : texts.json

Ce fichier contient toutes les données textuelles pour les pages **Contact** et **À propos** du portfolio.

### Structure générale

```json
{
  "id": "identifiant_unique",
  "projet": "numéro_du_projet",
  "contact": { ... },
  "about": { ... },
  "created_at": "date_iso",
  "updated_at": "date_iso"
}
```

### Section Contact

```json
"contact": {
  "email": "adresse@email.com",
  "phone": "+33 X XX XX XX XX",
  "address": "numéro rue",
  "name": "Prénom Nom",
  "city": "code_postal - Ville",
  "country": "Pays",
  "image_url": "/chemin/vers/image-contact.jpg",
  "image_alt": "Description alternative de l'image de contact"
}
```

### Section À propos

```json
"about": {
  "image_url": "/chemin/vers/image.jpg",
  "image_alt": "Description alternative de l'image",
  "main_text": "Texte principal (peut contenir \\n pour les retours à la ligne)",
  "quote": "Citation inspirante",
  "quote_author": "Auteur de la citation",
  "links": {
    "instagram": "https://instagram.com/username",
    "facebook": "https://facebook.com/username", 
    "linkedin": "https://linkedin.com/in/username",
    "website1": "https://site1.com",
    "website2": "https://site2.com"
  }
}
```

## Utilisation avec FileZilla

1. **Emplacement du fichier** : `/api/data/3/texts.json`
2. **Format** : JSON valide (vérifier avec un validateur JSON)
3. **Encodage** : UTF-8
4. **Sauvegarde** : Toujours faire une sauvegarde avant modification

## Points importants

- **Échappement** : Utiliser `\\n` pour les retours à la ligne dans le texte
- **URLs** : Toujours inclure `https://` pour les liens externes
- **Images** : Chemin relatif depuis la racine publique (`/images/...`)
- **Dates** : Format ISO 8601 (`2025-07-23T15:30:00.000Z`)
- **Projet** : Garder la même valeur que l'ID du projet (ici "3")

## Exemples fournis

1. **exemple_texts_complet.json** : Exemple avec toutes les données remplies
2. **exemple_texts_alternatif.json** : Version alternative avec d'autres données
3. **exemple_texts_minimal.json** : Structure minimale pour comprendre les champs obligatoires

## Test

Après modification du fichier, vérifier que :
- Les pages `/romain/contact` et `/romain/a-propos` s'affichent correctement
- L'interface d'administration `/admin/texts` peut charger et sauvegarder les données
- Aucune erreur dans la console du navigateur
