import { z } from 'zod';
import mongoose from 'mongoose';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendCreated, sendData } from '../utils/response.js';
import { PageContent } from '../models/index.js';
import { ApiError } from '../utils/ApiError.js';
import { parseBoolean } from '../utils/query.js';

const imageSchema = z.object({
  url: z.string().trim().min(1, 'Image url is required').max(2048),
  alt: z.string().trim().max(300).optional().default(''),
  caption: z.string().trim().max(500).optional().default(''),
});

const keyPattern = /^[a-z0-9]+(?:[._-][a-z0-9]+)*$/;

const baseFields = {
  key: z
    .string()
    .trim()
    .toLowerCase()
    .min(2)
    .max(120)
    .regex(keyPattern, 'Key may only contain lowercase letters, numbers, dot, dash or underscore'),
  page: z.string().trim().toLowerCase().min(1).max(60),
  section: z.string().trim().toLowerCase().min(1).max(60),
  title: z.string().trim().max(200).optional(),
  subtitle: z.string().trim().max(500).optional(),
  body: z.string().trim().max(20000).optional(),
  content: z.record(z.string(), z.any()).optional(),
  images: z.array(imageSchema).max(30).optional(),
  order: z.number().int().min(0).max(100000).optional(),
  active: z.boolean().optional(),
};

const createSchema = z.object(baseFields);
const updateSchema = z.object(baseFields).partial();
const reorderSchema = z.object({
  items: z
    .array(
      z.object({
        key: z.string().trim().toLowerCase().optional(),
        id: z.string().trim().optional(),
        order: z.number().int().min(0).max(100000),
      }),
    )
    .min(1)
    .max(500),
});

const canSeeInactive = (req, query) => Boolean(req.admin) && parseBoolean(query.includeInactive, false) === true;

export const listPages = asyncHandler(async (req, res) => {
  const query = req.query ?? {};
  const filter = {};
  if (!canSeeInactive(req, query)) filter.active = { $ne: false };
  if (query.page) filter.page = String(query.page).trim().toLowerCase();
  if (query.section) filter.section = String(query.section).trim().toLowerCase();

  const pages = await PageContent.find(filter).sort({ order: 1, createdAt: 1 });
  sendData(res, pages, { meta: { total: pages.length } });
});

export const getPage = asyncHandler(async (req, res) => {
  const page = await PageContent.findOne({ key: String(req.params.key).trim().toLowerCase() });
  if (!page) throw ApiError.notFound('Page content not found');
  if (page.active === false && !req.admin) throw ApiError.notFound('Page content not found');
  sendData(res, page);
});

export const createPage = asyncHandler(async (req, res) => {
  const payload = createSchema.parse(req.body);
  const exists = await PageContent.exists({ key: payload.key });
  if (exists) throw ApiError.conflict(`Page content "${payload.key}" already exists`, { code: 'DUPLICATE_KEY' });

  const page = await PageContent.create(payload);
  sendCreated(res, page);
});

export const updatePage = asyncHandler(async (req, res) => {
  const key = String(req.params.key).trim().toLowerCase();
  const payload = updateSchema.parse(req.body);
  const page = await PageContent.findOneAndUpdate({ key }, { $set: payload }, { new: true, runValidators: true });
  if (!page) throw ApiError.notFound('Page content not found');
  sendData(res, page);
});

export const upsertPage = asyncHandler(async (req, res) => {
  const key = String(req.params.key).trim().toLowerCase();
  const payload = createSchema.omit({ key: true }).parse(req.body);
  const page = await PageContent.findOneAndUpdate(
    { key },
    { $set: { ...payload, key } },
    { new: true, runValidators: true, upsert: true, setDefaultsOnInsert: true },
  );
  sendData(res, page);
});

export const deletePage = asyncHandler(async (req, res) => {
  const key = String(req.params.key).trim().toLowerCase();
  const page = await PageContent.findOneAndDelete({ key });
  if (!page) throw ApiError.notFound('Page content not found');
  sendData(res, { deleted: true, id: page.id, key: page.key });
});

export const reorderPages = asyncHandler(async (req, res) => {
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

  const result = await PageContent.bulkWrite(operations);
  const pages = await PageContent.find().sort({ order: 1, createdAt: 1 });
  sendData(res, pages, { meta: { updated: result.modifiedCount ?? 0 } });
});
