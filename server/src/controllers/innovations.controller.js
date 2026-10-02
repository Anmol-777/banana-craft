import { z } from 'zod';
import mongoose from 'mongoose';
import { asyncHandler } from '../utils/asyncHandler.js';
import { buildPageMeta, resolvePagination, sendCreated, sendData } from '../utils/response.js';
import { Innovation } from '../models/index.js';
import { ApiError } from '../utils/ApiError.js';
import { applySort, findByIdOrSlug, parseBoolean, textFilter } from '../utils/query.js';
import { slugify } from '../utils/text.js';

const imageSchema = z.object({
  url: z.string().trim().min(1, 'Image url is required').max(2048),
  alt: z.string().trim().max(300).optional().default(''),
  caption: z.string().trim().max(500).optional().default(''),
});

const baseFields = {
  name: z.string().trim().min(1, 'Name is required').max(200),
  slug: z.string().trim().toLowerCase().min(1).max(220).optional(),
  summary: z.string().trim().max(500).optional(),
  body: z.string().trim().max(20000).optional(),
  image: z.string().trim().max(2048).optional(),
  imageAlt: z.string().trim().max(300).optional(),
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
        id: z.string().trim().optional(),
        slug: z.string().trim().toLowerCase().optional(),
        order: z.number().int().min(0).max(100000),
      }),
    )
    .min(1)
    .max(500),
});

const SORTS = ['order', 'name', 'createdAt', 'updatedAt'];
const canSeeInactive = (req, query) => Boolean(req.admin) && parseBoolean(query.includeInactive, false) === true;

export const listInnovations = asyncHandler(async (req, res) => {
  const query = req.query ?? {};
  const { page, limit, skip } = resolvePagination(query, { defaultLimit: 50 });
  const filter = {};

  if (!canSeeInactive(req, query)) filter.active = { $ne: false };
  const search = textFilter(query.search, ['name', 'summary', 'body']);
  if (search) Object.assign(filter, search);

  const sort = applySort(query.sort, SORTS, [['order', 1], ['createdAt', 1]]);

  const [innovations, total] = await Promise.all([
    Innovation.find(filter).sort(sort).skip(skip).limit(limit),
    Innovation.countDocuments(filter),
  ]);

  sendData(res, innovations, { meta: buildPageMeta({ total, page, limit }) });
});

export const getInnovation = asyncHandler(async (req, res) => {
  const includeInactive = canSeeInactive(req, req.query ?? {});
  const innovation = await findByIdOrSlug(Innovation, req.params.id, { includeInactive });
  if (!innovation) throw ApiError.notFound('Innovation not found');
  sendData(res, innovation);
});

export const createInnovation = asyncHandler(async (req, res) => {
  const payload = createSchema.parse(req.body);
  const slug = payload.slug || slugify(payload.name, `innovation-${Date.now()}`);
  if (await Innovation.exists({ slug })) throw ApiError.conflict(`Innovation slug "${slug}" is already in use`, { code: 'DUPLICATE_KEY' });

  const innovation = await Innovation.create({ ...payload, slug });
  sendCreated(res, innovation);
});

export const updateInnovation = asyncHandler(async (req, res) => {
  const payload = updateSchema.parse(req.body);
  const innovation = await Innovation.findById(req.params.id);
  if (!innovation) throw ApiError.notFound('Innovation not found');

  if (payload.slug && payload.slug !== innovation.slug) {
    if (await Innovation.exists({ slug: payload.slug, _id: { $ne: innovation._id } })) {
      throw ApiError.conflict(`Innovation slug "${payload.slug}" is already in use`, { code: 'DUPLICATE_KEY' });
    }
  }
  Object.assign(innovation, payload);
  await innovation.save();
  sendData(res, innovation);
});

export const deleteInnovation = asyncHandler(async (req, res) => {
  const innovation = await Innovation.findByIdAndDelete(req.params.id);
  if (!innovation) throw ApiError.notFound('Innovation not found');
  sendData(res, { deleted: true, id: innovation.id, slug: innovation.slug });
});

export const reorderInnovations = asyncHandler(async (req, res) => {
  const { items } = reorderSchema.parse(req.body);
  const operations = items
    .filter((item) => (item.id && mongoose.isObjectIdOrHexString(item.id)) || item.slug)
    .map((item) => ({
      updateOne: {
        filter: item.id && mongoose.isObjectIdOrHexString(item.id) ? { _id: item.id } : { slug: item.slug },
        update: { $set: { order: item.order } },
      },
    }));

  if (operations.length === 0) throw ApiError.badRequest('No valid items to reorder');

  const result = await Innovation.bulkWrite(operations);
  const innovations = await Innovation.find().sort({ order: 1, createdAt: 1 });
  sendData(res, innovations, { meta: { updated: result.modifiedCount ?? 0 } });
});