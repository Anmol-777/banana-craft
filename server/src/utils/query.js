import mongoose from 'mongoose';
import { escapeRegExp } from './text.js';

export function parseBoolean(value, fallback = undefined) {
  if (value === undefined || value === null || value === '') return fallback;
  if (typeof value === 'boolean') return value;
  const text = String(value).toLowerCase();
  if (['true', '1', 'yes', 'on'].includes(text)) return true;
  if (['false', '0', 'no', 'off'].includes(text)) return false;
  return fallback;
}

export function applySort(sort, allowed, fallback) {
  if (!sort) return fallback;
  const fields = String(sort)
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean)
    .filter((entry) => allowed.includes(entry.replace(/^-/, '')))
    .map((entry) => {
      const field = entry.replace(/^-/, '');
      const direction = entry.startsWith('-') ? -1 : 1;
      return [field, direction];
    });
  return fields.length > 0 ? fields : fallback;
}

export function textFilter(search, fields) {
  const term = String(search ?? '').trim();
  if (!term) return undefined;
  const pattern = new RegExp(escapeRegExp(term), 'i');
  return { $or: fields.map((field) => ({ [field]: pattern })) };
}

export function idOrSlugFilter(identifier) {
  const value = String(identifier ?? '').trim();
  const clauses = [{ slug: value }];
  if (mongoose.isObjectIdOrHexString(value)) clauses.unshift({ _id: value });
  return { $or: clauses };
}

export function findByIdOrSlug(Model, identifier, { includeInactive = false } = {}) {
  const filter = { ...idOrSlugFilter(identifier) };
  if (!includeInactive) filter.active = { $ne: false };
  return Model.findOne(filter);
}
