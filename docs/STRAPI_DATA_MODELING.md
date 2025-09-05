# Guide de modélisation des données dans Strapi

## 🎨 Content Types à créer via l'interface Strapi Admin

### 1. Collection Type "Project"
- Aller dans Content-Types Builder
- Créer "Project" (Collection Type)
- Champs :
  - `name` : Text (required)
  - `slug` : UID (required) 
  - `description` : Rich Text
  - `active` : Boolean (default: true)

### 2. Collection Type "Image"  
- Créer "Image" (Collection Type)
- Champs :
  - `url` : Media (Single media, required)
  - `projet` : Relation (Many to One with Project)
  - `position` : Number (Integer)
  - `selected` : Boolean (default: false)
  - `category` : Text
  - `alt` : Text
  - `titre` : Text
  - `sousTitre` : Text
  - `dimension` : JSON
  - `displayDimensions` : JSON

### 3. Collection Type "Experience"
- Créer "Experience" (Collection Type) 
- Champs :
  - `projet` : Relation (Many to One with Project)
  - `title` : Text (required)
  - `description` : Rich Text
  - `startDate` : Date
  - `endDate` : Date
  - `company` : Text
  - `position` : Number (Integer)
  - `skills` : JSON

### 4. Collection Type "TextContent"
- Créer "TextContent" (Collection Type)
- Champs :
  - `projet` : Relation (Many to One with Project)
  - `key` : Text (required, unique)
  - `value` : JSON (pour stocker les objets complexes)
  - `type` : Enumeration (contact, about, general)

### 5. Single Type "About" (optionnel)
- Créer "About" (Single Type)
- Champs :
  - `projet` : Relation (One to One with Project)
  - `mainText` : Rich Text
  - `quote` : Text
  - `quoteAuthor` : Text
  - `profileImage` : Media (Single media)
  - `links` : JSON (pour les réseaux sociaux)

## 🔧 Configuration des relations

### Project → Images (One to Many)
```
Project.images → Image.projet
```

### Project → Experiences (One to Many)  
```
Project.experiences → Experience.projet
```

### Project → TextContents (One to Many)
```
Project.textContents → TextContent.projet
```

## ⚙️ Configuration des permissions API

1. Aller dans Settings → Users & Permissions Plugin → Roles
2. Pour "Public" role :
   - Project : find, findOne
   - Image : find, findOne  
   - Experience : find, findOne
   - TextContent : find, findOne
   - About : find

3. Pour "Authenticated" role :
   - Ajouter create, update, delete selon vos besoins

## 📝 Après création des Content Types

Les APIs seront automatiquement disponibles :
- GET `/api/projects`
- GET `/api/images?filters[projet][id][$eq]=3`
- GET `/api/experiences?filters[projet][id][$eq]=3`
- GET `/api/text-contents?filters[projet][id][$eq]=3`
- GET `/api/about`

## 🔄 Migration de vos données JSON

Utiliser le script `migrate-to-strapi.js` que j'ai créé pour transférer vos données existantes.
