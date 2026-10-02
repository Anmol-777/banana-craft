import mongoose from 'mongoose';

export const imageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true, trim: true, maxlength: 2048 },
    alt: { type: String, default: '', trim: true, maxlength: 300 },
    caption: { type: String, default: '', trim: true, maxlength: 500 },
  },
  { _id: false },
);

export const socialLinkSchema = new mongoose.Schema(
  {
    platform: { type: String, trim: true, maxlength: 40, default: '' },
    label: { type: String, trim: true, maxlength: 80, default: '' },
    url: { type: String, required: true, trim: true, maxlength: 2048 },
  },
  { _id: false },
);

export const navItemSchema = new mongoose.Schema(
  {
    label: { type: String, required: true, trim: true, maxlength: 80 },
    path: { type: String, required: true, trim: true, maxlength: 200 },
    order: { type: Number, default: 0 },
    visible: { type: Boolean, default: true },
  },
  { _id: false },
);

export const dimensionSchema = new mongoose.Schema(
  {
    width: { type: Number, default: null, min: 0 },
    height: { type: Number, default: null, min: 0 },
    depth: { type: Number, default: null, min: 0 },
    unit: { type: String, default: 'cm', trim: true, maxlength: 12 },
  },
  { _id: false },
);

export const toJSONOptions = {
  versionKey: false,
  transform(_doc, ret) {
    ret.id = String(ret._id);
    delete ret._id;
    return ret;
  },
};

export const publicFilter = (extra = {}) => ({ active: { $ne: false }, ...extra });

export const stripUndefined = (value) => {
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(Object.entries(value).filter(([, entry]) => entry !== undefined));
};
