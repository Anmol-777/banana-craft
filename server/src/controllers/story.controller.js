import { z } from 'zod';
import mongoose from 'mongoose';
import { asyncHandler } from '../utils/asyncHandler.js';
import { buildPageMeta, resolvePagination, sendCreated, sendData } from '../utils/response.js';
import { StorySection } from '../models/index.js';
import { ApiError } from '../utils/ApiError.js';
import { applySort, parseBoolean } from '../utils/query.js';

const createSchema = z.object({
  key: z.string().trim().toLowerCase().min(2).max(160).regex(/^[a-z0-9]+(?:[._-][a-z0-9]+)*$/, 'Invalid key format'),
  title: z.string().trim().max(200).optional(),
  body: z.string().trim().max(20000).optional(),
  image: z.string().trim().max(2048).optional(),
  imageAlt: z.string().trim().max(300).optional(),
  layout: z.enum(['image-left', 'image-right']).optional(),
  order: z.number().int().min(0).max(100000).optional(),
  active: z.boolean().optional(),
});

const updateSchema = createSchema.partial();

const reorderSchema = z.object({
  items: z
    .array(
      z.object({
        id: z.string().trim().optional(),
        key: z.string().trim().toLowerCase().optional(),
        order: z.number().int().min(0).max(100000),
      }),
    )
    .min(1)
    .max(500),
});

const SORTS = ['order', 'title', 'createdAt', 'updatedAt'];
const canSeeInactive = (req, query) => Boolean(req.admin) && parseBoolean(query.includeInactive, false) === true;

export const listStorySections = asyncHandler(async (req, res) => {
  const query = req.query ?? {};
  const filter = {};
  if (!canSeeInactive(req, query)) filter.active = { $ne: false };
  const sections = await StorySection.find(filter).sort({ order: 1, createdAt: 1 });
  sendData(res, sections, { meta: { total: sections.length } });
});

export const getStorySection = asyncHandler(async (req, res) => {
  const includeInactive = canSeeInactive(req, req.query ?? {});
  const key = String(req.params.key).trim().toLowerCase();
  const section = await StorySection.findOne({ key });
  if (!section) throw ApiError.notFound('Story section not found');
  if (section.active === false && !req.admin) throw ApiError.notFound('Story section not found');
  sendData(res, section);
});

export const createStorySection = asyncHandler(async (req, res) => {
  const payload = createSchema.parse(req.body);
  if (await StorySection.exists({ key: payload.key })) throw ApiError.conflict(`Story section "${payload.key}" already exists`, { code: 'DUPLICATE_KEY' });
  const section = await StorySection.create(payload);
  sendCreated(res, section);
});

export const updateStorySection = asyncHandler(async (req, res) => {
  const key = String(req.params.key).trim().toLowerCase();
  const payload = updateSchema.parse(req.body);
  const section = await StorySection.findOneAndUpdate({ key }, { $set: payload }, { new: true, runValidators: true });
  if (!section) throw ApiError.notFound('Story section not found');
  sendData(res, section);
});

export const deleteStorySection = asyncHandler(async (req, res) => {
  const key = String(req.params.key).trim().toLowerCase();
  const section = await StorySection.findOneAndDelete({ key });
  if (!section) throw ApiError.notFound('Story section not found');
  sendData(res, { deleted: true, id: section.id, key: section.key });
});

export const reorderStorySections = asyncHandler(async (req, res) => {
  const { items } = reorderSchema.parse(req.body);
  const operations = items
    .filter((item) => item.key || (item.id && mongoose.isObjectIdOrHexString(item.id)))
    .map((item) => ({
      updateOne: {
        filter: item.id && mongoose.isObjectIdOrHexString(item.id) ? { _id: item.id } : { key: item.key },
        update: { $set: { order: item.order } },
      },
    }));

  if (operations.length === 0) throw ApiError.badRequest('No valid items to reorder');

  const result = await StorySection.bulkWrite(operations);
  const sections = await StorySection.find().sort({ order: 1, createdAt: 1 });
  sendData(res, sections, { meta: { updated: result.modifiedCount ?? 0 } });
});