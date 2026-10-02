import { z } from 'zod';
import mongoose from 'mongoose';
import { asyncHandler } from '../utils/asyncHandler.js';
import { buildPageMeta, resolvePagination, sendCreated, sendData } from '../utils/response.js';
import { GalleryItem } from '../models/index.js';
import { ApiError } from '../utils/ApiError.js';
import { applySort, parseBoolean } from '../utils/query.js';

const imageSchema = z.object({
  url: z.string().trim().min(1, 'Image url is required').max(2048),
  alt: z.string().trim().max(300).optional().default(''),
  caption: z.string().trim().max(500).optional().default(''),
});

const baseFields = {
  title: z.string().trim().max(200).optional(),
  caption: z.string().trim().max(500).optional(),
  image: z.string().trim().min(1, 'Image is required').max(2048),
  imageAlt: z.string().trim().max(300).optional(),
  layout: z.enum(['large', 'small']).optional(),
  order: z.number().int().min(0).max(100000).optional(),
  active: z.boolean().optional(),
};

const createSchema = z.object(baseFields);
const updateSchema = z.object(baseFields).partial();
const reorderSchema = z.object({
  items: z
    .array(
      z.object({
        id: z.string().trim().optional(),
        order: z.number().int().min(0).max(100000),
      }),
    )
    .min(1)
    .max(500),
});

const SORTS = ['order', 'title', 'createdAt', 'updatedAt'];
const canSeeInactive = (req, query) => Boolean(req.admin) && parseBoolean(query.includeInactive, false) === true;

export const listGallery = asyncHandler(async (req, res) => {
  const query = req.query ?? {};
  const { page, limit, skip } = resolvePagination(query, { defaultLimit: 50 });
  const filter = {};

  if (!canSeeInactive(req, query)) filter.active = { $ne: false };
  const sort = applySort(query.sort, SORTS, [['order', 1], ['createdAt', 1]]);

  const [items, total] = await Promise.all([
    GalleryItem.find(filter).sort(sort).skip(skip).limit(limit),
    GalleryItem.countDocuments(filter),
  ]);

  sendData(res, items, { meta: buildPageMeta({ total, page, limit }) });
});

export const getGalleryItem = asyncHandler(async (req, res) => {
  const includeInactive = canSeeInactive(req, req.query ?? {});
  const item = await GalleryItem.findOne({ ...idOrSlugFilter(req.params.id) });
  if (!item) throw ApiError.notFound('Gallery item not found');
  if (item.active === false && !req.admin) throw ApiError.notFound('Gallery item not found');
  sendData(res, item);
});

function idOrSlugFilter(identifier) {
  const value = String(identifier ?? '').trim();
  const clauses = [{ slug: value }];
  if (mongoose.isObjectIdOrHexString(value)) clauses.unshift({ _id: value });
  return { $or: clauses };
}

export const createGalleryItem = asyncHandler(async (req, res) => {
  const payload = createSchema.parse(req.body);
  const item = await GalleryItem.create(payload);
  sendCreated(res, item);
});

export const updateGalleryItem = asyncHandler(async (req, res) => {
  const payload = updateSchema.parse(req.body);
  const item = await GalleryItem.findById(req.params.id);
  if (!item) throw ApiError.notFound('Gallery item not found');
  Object.assign(item, payload);
  await item.save();
  sendData(res, item);
});

export const deleteGalleryItem = asyncHandler(async (req, res) => {
  const item = await GalleryItem.findByIdAndDelete(req.params.id);
  if (!item) throw ApiError.notFound('Gallery item not found');
  sendData(res, { deleted: true, id: item.id });
});

export const reorderGallery = asyncHandler(async (req, res) => {
  const { items } = reorderSchema.parse(req.body);
  const operations = items
    .filter((item) => item.id && mongoose.isObjectIdOrHexString(item.id))
    .map((item) => ({
      updateOne: {
        filter: { _id: item.id },
        update: { $set: { order: item.order } },
      },
    }));

  if (operations.length === 0) throw ApiError.badRequest('No valid items to reorder');

  const result = await GalleryItem.bulkWrite(operations);
  const gallery = await GalleryItem.find().sort({ order: 1, createdAt: 1 });
  sendData(res, gallery, { meta: { updated: result.modifiedCount ?? 0 } });
});