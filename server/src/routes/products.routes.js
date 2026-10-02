import { Router } from 'express';
import { validateBody, validateQuery, validateParams } from '../middleware/validate.js';
import { protect, optionalAuth } from '../middleware/auth.js';
import { z } from 'zod';
import {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  reorderProducts,
} from '../controllers/products.controller.js';

const idParam = z.object({ id: z.string().trim().min(1) });
const reorderSchema = z.object({
  items: z.array(z.object({ id: z.string().optional(), slug: z.string().optional(), order: z.number().int().min(0) })).min(1).max(500),
});

export const productsRouter = Router();

productsRouter.get('/', optionalAuth, validateQuery(z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  search: z.string().optional(),
  category: z.string().optional(),
  featured: z.string().optional(),
  inStock: z.string().optional(),
  includeInactive: z.string().optional(),
  sort: z.string().optional(),
})), listProducts);

productsRouter.get('/:id', optionalAuth, validateParams(idParam), getProduct);

productsRouter.post('/', protect, validateBody(z.object({
  name: z.string().trim().min(1).max(200),
  slug: z.string().trim().toLowerCase().max(220).optional(),
  shortDescription: z.string().trim().max(400).optional(),
  description: z.string().trim().max(20000).optional(),
  sku: z.string().trim().max(80).optional(),
  category: z.string().trim().max(80).optional(),
  materials: z.array(z.string().trim().max(80)).max(30).optional(),
  dimensions: z.object({ width: z.number().min(0).nullable().optional(), height: z.number().min(0).nullable().optional(), depth: z.number().min(0).nullable().optional(), unit: z.string().trim().max(12).optional() }).optional(),
  price: z.number().min(0).nullable().optional(),
  currency: z.string().trim().toUpperCase().max(8).optional(),
  inStock: z.boolean().optional(),
  featured: z.boolean().optional(),
  images: z.array(z.object({ url: z.string().trim().min(1).max(2048), alt: z.string().trim().max(300).optional(), caption: z.string().trim().max(500).optional() })).max(30).optional(),
  order: z.number().int().min(0).max(100000).optional(),
  active: z.boolean().optional(),
})), createProduct);

productsRouter.patch('/:id', protect, validateParams(idParam), validateBody(z.object({
  name: z.string().trim().min(1).max(200).optional(),
  slug: z.string().trim().toLowerCase().max(220).optional(),
  shortDescription: z.string().trim().max(400).optional(),
  description: z.string().trim().max(20000).optional(),
  sku: z.string().trim().max(80).optional(),
  category: z.string().trim().max(80).optional(),
  materials: z.array(z.string().trim().max(80)).max(30).optional(),
  dimensions: z.object({ width: z.number().min(0).nullable().optional(), height: z.number().min(0).nullable().optional(), depth: z.number().min(0).nullable().optional(), unit: z.string().trim().max(12).optional() }).optional(),
  price: z.number().min(0).nullable().optional(),
  currency: z.string().trim().toUpperCase().max(8).optional(),
  inStock: z.boolean().optional(),
  featured: z.boolean().optional(),
  images: z.array(z.object({ url: z.string().trim().min(1).max(2048), alt: z.string().trim().max(300).optional(), caption: z.string().trim().max(500).optional() })).max(30).optional(),
  order: z.number().int().min(0).max(100000).optional(),
  active: z.boolean().optional(),
})), updateProduct);

productsRouter.delete('/:id', protect, validateParams(idParam), deleteProduct);

productsRouter.post('/reorder', protect, validateBody(reorderSchema), reorderProducts);