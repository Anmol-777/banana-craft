import fs from 'node:fs';
import path from 'node:path';
import { randomBytes } from 'node:crypto';
import multer from 'multer';
import { config } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

export const ALLOWED_MIME_TYPES = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'image/avif': '.avif',
};

export const ALLOWED_MIME_LIST = Object.keys(ALLOWED_MIME_TYPES).join(', ');

export function ensureUploadDir() {
  fs.mkdirSync(config.uploadDir, { recursive: true });
  return config.uploadDir;
}

export function extensionForMime(mimeType) {
  return ALLOWED_MIME_TYPES[String(mimeType ?? '').toLowerCase()] ?? null;
}

export function buildStoredFilename(mimeType) {
  const extension = extensionForMime(mimeType);
  if (!extension) {
    throw ApiError.badRequest(`Unsupported image type. Allowed types: ${ALLOWED_MIME_LIST}`, { code: 'UNSUPPORTED_FILE_TYPE' });
  }
  return `${Date.now().toString(36)}-${randomBytes(8).toString('hex')}${extension}`;
}

export function buildPublicUrl(filename) {
  return `${config.publicUrl}${config.uploadPath}/${filename}`;
}

function fileFilter(_req, file, callback) {
  const extension = extensionForMime(file.mimetype);
  if (!extension) {
    callback(
      ApiError.badRequest(`Unsupported image type "${file.mimetype}". Allowed types: ${ALLOWED_MIME_LIST}`, {
        code: 'UNSUPPORTED_FILE_TYPE',
      }),
    );
    return;
  }
  callback(null, true);
}

export function createUploader({ maxFiles = 10 } = {}) {
  ensureUploadDir();

  return multer({
    storage: multer.diskStorage({
      destination: (_req, _file, callback) => callback(null, config.uploadDir),
      filename: (_req, file, callback) => {
        try {
          callback(null, buildStoredFilename(file.mimetype));
        } catch (error) {
          callback(error);
        }
      },
    }),
    fileFilter,
    limits: {
      fileSize: config.maxUploadBytes,
      files: maxFiles,
      fields: 20,
    },
  });
}

export function safeUploadPath(filename) {
  const root = path.resolve(config.uploadDir);
  const target = path.resolve(root, path.basename(String(filename ?? '')));
  if (target !== root && !target.startsWith(root + path.sep)) {
    throw ApiError.badRequest('Invalid file reference', { code: 'INVALID_FILE_REFERENCE' });
  }
  return target;
}
