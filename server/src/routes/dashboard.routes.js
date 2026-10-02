import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendData } from '../utils/response.js';
import { Admin } from '../models/index.js';
import { ApiError } from '../utils/ApiError.js';

export const dashboardRouter = Router();

dashboardRouter.get('/stats', protect, asyncHandler(async (req, res) => {
  const { Product, Innovation, StorySection, GalleryItem, Media, PageContent } = await import('../models/index.js');

  const [products, innovations, storySections, galleryItems, mediaCount, pageContentCount, adminCount] = await Promise.all([
    Product.countDocuments(),
    Innovation.countDocuments(),
    StorySection.countDocuments(),
    GalleryItem.countDocuments(),
    Media.countDocuments(),
    PageContent.countDocuments(),
    Admin.countDocuments(),
  ]);

  sendData(res, {
    products,
    innovations,
    storySections,
    galleryItems,
    media: mediaCount,
    pageContent: pageContentCount,
    admins: adminCount,
  });
}));

dashboardRouter.get('/recent-activity', protect, asyncHandler(async (req, res) => {
  const { Product, Innovation, StorySection, GalleryItem, Media, PageContent } = await import('../models/index.js');

  const limit = 10;
  const [products, innovations, storySections, galleryItems, media, pageContent] = await Promise.all([
    Product.find().sort({ updatedAt: -1 }).limit(limit).select('name slug updatedAt active').lean(),
    Innovation.find().sort({ updatedAt: -1 }).limit(limit).select('name slug updatedAt active').lean(),
    StorySection.find().sort({ updatedAt: -1 }).limit(limit).select('key title updatedAt active').lean(),
    GalleryItem.find().sort({ updatedAt: -1 }).limit(limit).select('title updatedAt active').lean(),
    Media.find().sort({ createdAt: -1 }).limit(limit).select('filename url createdAt').lean(),
    PageContent.find().sort({ updatedAt: -1 }).limit(limit).select('key page section updatedAt').lean(),
  ]);

  const all = [
    ...products.map(p => ({ type: 'product', id: p._id, name: p.name, slug: p.slug, updatedAt: p.updatedAt, active: p.active })),
    ...innovations.map(i => ({ type: 'innovation', id: i._id, name: i.name, slug: i.slug, updatedAt: i.updatedAt, active: i.active })),
    ...storySections.map(s => ({ type: 'story', id: s._id, name: s.title, slug: s.key, updatedAt: s.updatedAt, active: s.active })),
    ...galleryItems.map(g => ({ type: 'gallery', id: g._id, name: g.title, updatedAt: g.updatedAt, active: g.active })),
    ...media.map(m => ({ type: 'media', id: m._id, name: m.filename, updatedAt: m.createdAt })),
    ...pageContent.map(p => ({ type: 'pageContent', id: p._id, name: `${p.page}.${p.section}`, updatedAt: p.updatedAt, active: p.active })),
  ];

  all.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  sendData(res, all.slice(0, limit));
}));