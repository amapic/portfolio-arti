// Example API for images metadata - à implémenter côté serveur
// GET /api/images?projectId=${PROJECT_ID}
// POST /api/images?projectId=${PROJECT_ID}
// PUT /api/images/${id}?projectId=${PROJECT_ID}
// DELETE /api/images/${id}?projectId=${PROJECT_ID}

import { ImageMeta } from '../app/types/imageMeta';

export interface ImageMetaAPI {
  // GET - Récupérer toutes les images
  getImages(projectId: string): Promise<ImageMeta[]>;
  
  // POST - Créer une nouvelle image metadata
  createImage(projectId: string, imageMeta: Omit<ImageMeta, 'id'>): Promise<ImageMeta>;
  
  // PUT - Mettre à jour une image metadata
  updateImage(projectId: string, id: string, imageMeta: Partial<ImageMeta>): Promise<ImageMeta>;
  
  // DELETE - Supprimer une image metadata
  deleteImage(projectId: string, id: string): Promise<void>;
}

/*
Structure de base de données suggérée pour les métadonnées d'images :

CREATE TABLE image_metas (
  id VARCHAR(255) PRIMARY KEY,
  project_id VARCHAR(255) NOT NULL,
  image_url TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  selected BOOLEAN NOT NULL DEFAULT false,
  category VARCHAR(100) NOT NULL,
  alt TEXT,
  dimension_width INTEGER NOT NULL DEFAULT 1,
  dimension_height INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_project_id (project_id),
  INDEX idx_position (position),
  INDEX idx_selected (selected)
);

Exemples de requêtes :

1. Récupérer toutes les images d'un projet :
   SELECT * FROM image_metas WHERE project_id = ? ORDER BY position ASC

2. Récupérer seulement les images sélectionnées :
   SELECT * FROM image_metas WHERE project_id = ? AND selected = true ORDER BY position ASC

3. Créer une nouvelle image :
   INSERT INTO image_metas (id, project_id, image_url, position, selected, category, alt, dimension_width, dimension_height) 
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)

4. Mettre à jour une image :
   UPDATE image_metas SET selected = ?, position = ?, category = ?, alt = ?, updated_at = CURRENT_TIMESTAMP 
   WHERE id = ? AND project_id = ?

5. Supprimer une image :
   DELETE FROM image_metas WHERE id = ? AND project_id = ?
*/

// Exemple d'implémentation avec Express.js et TypeScript
/*
import express from 'express';
import { Request, Response } from 'express';
const router = express.Router();

// GET /api/images
router.get('/images', async (req: Request, res: Response) => {
  try {
    const { projectId } = req.query;
    const images = await db.query(
      'SELECT * FROM image_metas WHERE project_id = ? ORDER BY position ASC',
      [projectId]
    );
    res.json(images.map((img: any) => ({
      ...img,
      dimension: [img.dimension_width, img.dimension_height]
    })));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/images
router.post('/images', async (req: Request, res: Response) => {
  try {
    const { projectId } = req.query;
    const { image_url, position, selected, category, alt, dimension } = req.body;
    
    const id = generateUniqueId();
    const [width, height] = dimension;
    
    await db.query(
      'INSERT INTO image_metas (id, project_id, image_url, position, selected, category, alt, dimension_width, dimension_height) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, projectId, image_url, position, selected, category, alt, width, height]
    );
    
    const newImage: ImageMeta = {
      id,
      image_url,
      position,
      selected,
      category,
      alt,
      dimension: [width, height]
    };
    
    res.status(201).json(newImage);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/images/:id
router.put('/images/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { projectId } = req.query;
    const { position, selected, category, alt, dimension } = req.body;
    
    const [width, height] = dimension || [1, 1];
    
    await db.query(
      'UPDATE image_metas SET position = ?, selected = ?, category = ?, alt = ?, dimension_width = ?, dimension_height = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND project_id = ?',
      [position, selected, category, alt, width, height, id, projectId]
    );
    
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/images/:id
router.delete('/images/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { projectId } = req.query;
    
    await db.query(
      'DELETE FROM image_metas WHERE id = ? AND project_id = ?',
      [id, projectId]
    );
    
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
*/
