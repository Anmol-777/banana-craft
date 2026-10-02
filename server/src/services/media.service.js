import fs from 'node:fs/promises';
import { config } from '../config/env.js';
import { safeUploadPath } from '../middleware/upload.js';
import { GalleryItem, Innovation, Media, PageContent, Product, SiteSettings, StorySection } from '../models/index.js';

export async function deleteStoredFile(filename) {
  if (!filename) return false;
  const target = safeUploadPath(filename);
  try {
    await fs.unlink(target);
    return true;
  } catch (error) {
    if (error.code === 'ENOENT') return false;
    throw error;
  }
}

export async function removeFiles(filenames) {
  const results = await Promise.allSettled((filenames ?? []).map((filename) => deleteStoredFile(filename)));
  return results.filter((result) => result.status === 'fulfilled' && result.value === true).length;
}

export async function collectMediaReferences(url) {
  const [pages, products, innovations, story, gallery, settings] = await Promise.all([
    PageContent.find({ 'images.url': url }).select('key page section').lean(),
    Product.find({ 'images.url': url }).select('name slug').lean(),
    Innovation.find({ $or: [{ image: url }, { 'images.url': url }] }).select('name slug').lean(),
    StorySection.find({ image: url }).select('key title').lean(),
    GalleryItem.find({ image: url }).select('title').lean(),
    SiteSettings.find({
      $or: [{ logo: url }, { 'contact.mapImage': url }, { 'seo.ogImage': url }],
    })
      .select('key')
      .lean(),
  ]);

  const references = [];
  const push = (collection, label, docs) => {
    for (const doc of docs) {
      references.push({ collection, id: String(doc._id), label });
    }
  };

  push('PageContent', 'key', pages);
  push('Product', 'name', products);
  push('Innovation', 'name', innovations);
  push('StorySection', 'key', story);
  push('GalleryItem', 'title', gallery);
  push('SiteSettings', 'key', settings);

  return references;
}

export async function scrubMediaReferences(url) {
  const results = await Promise.all([
    PageContent.updateMany({ 'images.url': url }, { $pull: { images: { url } } }),
    Product.updateMany({ 'images.url': url }, { $pull: { images: { url } } }),
    Innovation.updateMany({ 'images.url': url }, { $pull: { images: { url } } }),
    Innovation.updateMany({ image: url }, { $set: { image: '' } }),
    StorySection.updateMany({ image: url }, { $set: { image: '' } }),
    GalleryItem.updateMany({ image: url }, { $unset: { image: '' } }),
    SiteSettings.updateMany(
      { $or: [{ logo: url }, { 'contact.mapImage': url }, { 'seo.ogImage': url }] },
      { $unset: { logo: '', 'contact.mapImage': '', 'seo.ogImage': '' } },
    ),
  ]);

  const scrubbed = {};
  const names = ['pageContent', 'products', 'innovationImages', 'innovationImage', 'storySections', 'galleryItems', 'siteSettings'];
  names.forEach((name, index) => {
    const count = results[index]?.modifiedCount ?? 0;
    if (count > 0) scrubbed[name] = count;
  });
  return scrubbed;
}

export async function deleteMediaRecord(media, { force = false } = {}) {
  const references = await collectMediaReferences(media.url);
  let scrubbed = null;

  if (references.length > 0) {
    if (!force) {
      const error = new Error('This file is still used by content. Remove the references first or repeat the request with ?force=true');
      error.code = 'MEDIA_IN_USE';
      error.references = references;
      throw error;
    }
    scrubbed = await scrubMediaReferences(media.url);
  }

  const fileRemoved = await deleteStoredFile(media.filename);
  await Media.deleteOne({ _id: media._id });

  return { fileRemoved, scrubbed, referencesRemoved: references.length };
}

export function isManagedUpload(url) {
  return typeof url === 'string' && url.includes(config.uploadPath);
}
