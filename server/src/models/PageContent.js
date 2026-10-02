import mongoose from 'mongoose';
import { imageSchema, toJSONOptions } from './shared.js';

const pageContentSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: [true, 'Key is required'],
      unique: true,
      trim: true,
      lowercase: true,
      maxlength: 120,
      match: [/^[a-z0-9]+(?:[._-][a-z0-9]+)*$/, 'Key may only contain lowercase letters, numbers, dot, dash or underscore'],
    },
    page: { type: String, required: true, trim: true, lowercase: true, maxlength: 60 },
    section: { type: String, required: true, trim: true, lowercase: true, maxlength: 60 },
    title: { type: String, default: '', trim: true, maxlength: 200 },
    subtitle: { type: String, default: '', trim: true, maxlength: 500 },
    body: { type: String, default: '', trim: true, maxlength: 20000 },
    content: { type: mongoose.Schema.Types.Mixed, default: {} },
    images: { type: [imageSchema], default: [] },
    order: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true, toJSON: toJSONOptions },
);

pageContentSchema.index({ page: 1, order: 1 });
pageContentSchema.index({ page: 1, section: 1 });

export const PageContent = mongoose.model('PageContent', pageContentSchema);
