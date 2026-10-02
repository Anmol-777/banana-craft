import { Router } from 'express';
import { validateBody, validateQuery, validateParams } from '../middleware/validate.js';
import { protect, optionalAuth } from '../middleware/auth.js';
import { z } from 'zod';
import {
  listGallery,
  getGalleryItem,
  createGalleryItem,
  updateGalleryItem,
  deleteGalleryItem,
  reorderGallery,
} from '../controllers/gallery.controller.js';

const idParam = z.object({ id: z.string().trim().min(1) });
const reorderSchema = z.object({
  items: z.array(z.object({ id: z.string().trim().optional(), order: z.number().int().min(0) })).min(1).max(500),
});

export const galleryRouter = Router();

galleryRouter.get('/', optionalAuth, validateQuery(z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  includeInactive: z.string().optional(),
  sort: z.string().optional(),
})), listGallery);

galleryRouter.get('/:id', optionalAuth, validateParams(idParam), getGalleryItem);

galleryRouter.post('/', protect, validateBody(z.object({
  title: z.string().trim().max(200).optional(),
  caption: z.string().trim().max(500).optional(),
  image: z.string().trim().min(1).max(2048),
  imageAlt: z.string().trim().max(300).optional(),
  layout: z.enum(['large', 'small']).optional(),
  order: z.number().int().min(0).max(100000).optional(),
  active: z.boolean().optional(),
})), createGalleryItem);

galleryRouter.patch('/:id', protect, validateParams(idParam), validateBody(z.object({
  title: z.string().trim().max(200).optional(),
  caption: z.string().trim().max(500).optional(),
  image: z.string().trim().min(1).max(2048).optional(),
  imageAlt: z.string().trim().max(300).optional(),
  layout: z.enum(['large', 'small']).optional(),
  order: z.number().int().min(0).max(100000).optional(),
  active: z.boolean().optional(),
})), updateGalleryItem);

galleryRouter.delete('/:id', protect, validateParams(idParam), deleteGalleryItem);

galleryRouter.post('/reorder', protect, validateBody(reorderSchema), reorderGallery);