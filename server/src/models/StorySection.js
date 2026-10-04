import mongoose from 'mongoose';
import { toJSONOptions } from './shared.js';

const storySectionSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, trim: true, lowercase: true, maxlength: 160 },
    title: { type: String, default: '', trim: true, maxlength: 200 },
    body: { type: String, default: '', trim: true, maxlength: 20000 },
    image: { type: String, default: '', trim: true, maxlength: 2048 },
    imageAlt: { type: String, default: '', trim: true, maxlength: 300 },
    layout: { type: String, enum: ['image-left', 'image-right'], default: 'image-left' },
    order: { type: Number, default: 0, index: true },
    active: { type: Boolean, default: true, index: true },
  },
  { timestamps: true, toJSON: toJSONOptions },
);

export const StorySection = mongoose.model('StorySection', storySectionSchema);
