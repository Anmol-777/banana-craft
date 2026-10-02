import mongoose from 'mongoose';
import { toJSONOptions } from './shared.js';

const mediaSchema = new mongoose.Schema(
  {
    filename: { type: String, required: true, trim: true, maxlength: 255 },
    originalName: { type: String, default: '', trim: true, maxlength: 255 },
    url: { type: String, required: true, trim: true, maxlength: 2048 },
    mimeType: { type: String, required: true, trim: true, maxlength: 120 },
    size: { type: Number, required: true, min: 0 },
    storage: { type: String, enum: ['local'], default: 'local' },
    alt: { type: String, default: '', trim: true, maxlength: 300 },
    caption: { type: String, default: '', trim: true, maxlength: 500 },
    folder: { type: String, default: 'general', trim: true, lowercase: true, maxlength: 60 },
    tags: { type: [String], default: [] },
    active: { type: Boolean, default: true, index: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', default: null },
  },
  { timestamps: true, toJSON: toJSONOptions },
);

mediaSchema.index({ createdAt: -1 });
mediaSchema.index({ folder: 1, createdAt: -1 });

mediaSchema.methods.publicView = function publicView() {
  return {
    id: String(this._id),
    url: this.url,
    alt: this.alt,
    caption: this.caption,
    mimeType: this.mimeType,
    size: this.size,
  };
};

export const Media = mongoose.model('Media', mediaSchema);
