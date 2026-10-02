import { z } from 'zod';
import mongoose from 'mongoose';
import { asyncHandler } from '../utils/asyncHandler.js';
import { buildPageMeta, resolvePagination, sendCreated, sendData } from '../utils/response.js';
import { Media } from '../models/index.js';
import { ApiError } from '../utils/ApiError.js';
import { applySort, parseBoolean } from '../utils/query.js';
import { createUploader } from '../middleware/upload.js';
import { config } from '../config/env.js';
import { deleteMediaRecord } from '../services/media.service.js';

const uploader = createUploader({ maxFiles: 10 });

const SORTS = ['createdAt', 'filename', 'size'];
const canSeeInactive = (req, query) => Boolean(req.admin) && parseBoolean(query.includeInactive, false) === true;

export const listMedia = asyncHandler(async (req, res) => {
  const query = req.query ?? {};
  const { page, limit, skip } = resolvePagination(query, { defaultLimit: 50 });
  const filter = {};
  if (!canSeeInactive(req, query)) filter.active = { $ne: false };
  if (query.folder) filter.folder = String(query.folder).trim().toLowerCase();
  if (query.tags) {
    const tags = String(query.tags).split(',').map(t => t.trim()).filter(Boolean);
    if (tags.length) filter.tags = { $in: tags };
  }
  const sort = applySort(query.sort, SORTS, [['createdAt', -1]]);
  const [media, total] = await Promise.all([
    Media.find(filter).sort(sort).skip(skip).limit(limit),
    Media.countDocuments(filter),
  ]);
  sendData(res, media, { meta: buildPageMeta({ total, page, limit }) });
});

export const getMedia = asyncHandler(async (req, res) => {
  const media = await Media.findById(req.params.id);
  if (!media) throw ApiError.notFound('Media not found');
  if (media.active === false && !req.admin) throw ApiError.notFound('Media not found');
  sendData(res, media);
});

export const uploadMedia = asyncHandler(async (req, res) => {
  const files = req.files ?? [];
  if (!files.length) throw ApiError.badRequest('No files uploaded', { code: 'NO_FILES' });

  const folder = String(req.body.folder ?? 'general').trim().toLowerCase();
  const tags = String(req.body.tags ?? '').split(',').map(t => t.trim()).filter(Boolean);

  const created = await Promise.all(files.map(async (file) => {
    const media = await Media.create({
      filename: file.filename,
      originalName: file.originalname,
      url: `${req.protocol}://${req.get('host')}${config.uploadPath}/${file.filename}`,
      mimeType: file.mimetype,
      size: file.size,
      storage: 'local',
      alt: String(req.body.alt ?? '').trim().slice(0, 300),
      caption: String(req.body.caption ?? '').trim().slice(0, 500),
      folder,
      tags,
      uploadedBy: req.admin?._id ?? null,
    });
    return media;
  }));

  sendCreated(res, created.length === 1 ? created[0] : created);
});

export const updateMedia = asyncHandler(async (req, res) => {
  const schema = z.object({
    alt: z.string().trim().max(300).optional(),
    caption: z.string().trim().max(500).optional(),
    folder: z.string().trim().lowercase().max(60).optional(),
    tags: z.array(z.string().trim().max(80)).optional(),
    active: z.boolean().optional(),
  });
  const payload = schema.parse(req.body);
  const media = await Media.findByIdAndUpdate(req.params.id, { $set: payload }, { new: true, runValidators: true });
  if (!media) throw ApiError.notFound('Media not found');
  sendData(res, media);
});

export const deleteMedia = asyncHandler(async (req, res) => {
  const { force } = req.query;
  const media = await Media.findById(req.params.id);
  if (!media) throw ApiError.notFound('Media not found');
  const result = await deleteMediaRecord(media, { force: force === 'true' });
  sendData(res, result);
});

export const mediaUploadMiddleware = uploader.array('files', 10);