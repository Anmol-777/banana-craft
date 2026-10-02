import { z } from 'zod';
import mongoose from 'mongoose';
import { asyncHandler } from '../utils/asyncHandler.js';
import { buildPageMeta, resolvePagination, sendCreated, sendData } from '../utils/response.js';
import { Product } from '../models/index.js';
import { ApiError } from '../utils/ApiError.js';
import { applySort, findByIdOrSlug, parseBoolean, textFilter } from '../utils/query.js';
import { slugify } from '../utils/text.js';

const imageSchema = z.object({
  url: z.string().trim().min(1, 'Image url is required').max(2048),
  alt: z.string().trim().max(300).optional().default(''),
  caption: z.string().trim().max(500).optional().default(''),
});

const dimensionSchema = z.object({
  width: z.number().min(0).nullable().optional(),
  height: z.number().min(0).nullable().optional(),
  depth: z.number().min(0).nullable().optional(),
  unit: z.string().trim().max(12).optional().default('cm'),
});

const baseFields = {
  name: z.string().trim().min(1, 'Name is required').max(200),
  slug: z.string().trim().toLowerCase().min(1).max(220).optional(),
  shortDescription: z.string().trim().max(400).optional(),
  description: z.string().trim().max(20000).optional(),
  sku: z.string().trim().max(80).optional(),
  category: z.string().trim().max(80).optional(),
  materials: z.array(z.string().trim().max(80)).max(30).optional(),
  dimensions: dimensionSchema.optional(),
  price: z.number().min(0).nullable().optional(),
  currency: z.string().trim().toUpperCase().max(8).optional(),
  inStock: z.boolean().optional(),
  featured: z.boolean().optional(),
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

const SORTS = ['order', 'name', 'createdAt', 'updatedAt', 'price'];
const canSeeInactive = (req, query) => Boolean(req.admin) && parseBoolean(query.includeInactive, false) === true;

export const listProducts = asyncHandler(async (req, res) => {
  const query = req.query ?? {};
  const { page, limit, skip } = resolvePagination(query, { defaultLimit: 50 });
  const filter = {};

  if (!canSeeInactive(req, query)) filter.active = { $ne: false };
  if (query.category) filter.category = String(query.category).trim().toLowerCase();
  if (query.featured !== undefined) {
    const featured = parseBoolean(query.featured, undefined);
    if (featured !== undefined) filter.featured = featured;
  }
  if (query.inStock !== undefined) {
    const inStock = parseBoolean(query.inStock, undefined);
    if (inStock !== undefined) filter.inStock = inStock;
  }
  const search = textFilter(query.search, ['name', 'shortDescription', 'description', 'materials']);
  if (search) Object.assign(filter, search);

  const sort = applySort(query.sort, SORTS, [['order', 1], ['createdAt', 1]]);

  const [products, total] = await Promise.all([
    Product.find(filter).sort(sort).skip(skip).limit(limit),
    Product.countDocuments(filter),
  ]);

  sendData(res, products, { meta: buildPageMeta({ total, page, limit }) });
});

export const getProduct = asyncHandler(async (req, res) => {
  const includeInactive = canSeeInactive(req, req.query ?? {});
  const product = await findByIdOrSlug(Product, req.params.id, { includeInactive });
  if (!product) throw ApiError.notFound('Product not found');
  sendData(res, product);
});

export const createProduct = asyncHandler(async (req, res) => {
  const payload = createSchema.parse(req.body);
  const slug = payload.slug || slugify(payload.name, `product-${Date.now()}`);
  if (await Product.exists({ slug })) throw ApiError.conflict(`Product slug "${slug}" is already in use`, { code: 'DUPLICATE_KEY' });

  const product = await Product.create({ ...payload, slug });
  sendCreated(res, product);
});

export const updateProduct = asyncHandler(async (req, res) => {
  const payload = updateSchema.parse(req.body);
  const product = await Product.findById(req.params.id);
  if (!product) throw ApiError.notFound('Product not found');

  if (payload.slug && payload.slug !== product.slug) {
    if (await Product.exists({ slug: payload.slug, _id: { $ne: product._id } })) {
      throw ApiError.conflict(`Product slug "${payload.slug}" is already in use`, { code: 'DUPLICATE_KEY' });
    }
  }
  Object.assign(product, payload);
  await product.save();
  sendData(res, product);
});

export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) throw ApiError.notFound('Product not found');
  sendData(res, { deleted: true, id: product.id, slug: product.slug });
});

export const reorderProducts = asyncHandler(async (req, res) => {
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

  const result = await Product.bulkWrite(operations);
  const products = await Product.find().sort({ order: 1, createdAt: 1 });
  sendData(res, products, { meta: { updated: result.modifiedCount ?? 0 } });
});
