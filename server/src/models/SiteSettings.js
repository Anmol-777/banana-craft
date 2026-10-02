import mongoose from 'mongoose';
import { navItemSchema, socialLinkSchema, toJSONOptions } from './shared.js';

const addressSchema = new mongoose.Schema(
  {
    line1: { type: String, default: '', trim: true, maxlength: 200 },
    line2: { type: String, default: '', trim: true, maxlength: 200 },
    city: { type: String, default: '', trim: true, maxlength: 100 },
    state: { type: String, default: '', trim: true, maxlength: 100 },
    country: { type: String, default: '', trim: true, maxlength: 100 },
    postalCode: { type: String, default: '', trim: true, maxlength: 20 },
  },
  { _id: false },
);

const textField = (max) => ({ type: String, default: '', trim: true, maxlength: max });
const imageField = (max = 2048) => ({ type: String, default: '', trim: true, maxlength: max });

const heroSchema = new mongoose.Schema(
  {
    heading: textField(500),
    defaultImage: imageField(),
    hoverImage: imageField(),
    imageAlt: textField(300),
  },
  { _id: false },
);

const collectionProductSchema = new mongoose.Schema(
  {
    title: textField(200),
    description: textField(600),
    image: imageField(),
    link: textField(300),
  },
  { _id: false },
);

const collectionSchema = new mongoose.Schema(
  {
    heading: textField(300),
    subtitle: textField(1000),
    products: { type: [collectionProductSchema], default: [] },
  },
  { _id: false },
);

const homepageStorySchema = new mongoose.Schema(
  {
    heading: textField(300),
    body: textField(4000),
    buttonText: textField(120),
    buttonLink: textField(300),
    image: imageField(),
    imageAlt: textField(300),
  },
  { _id: false },
);

const awardsSchema = new mongoose.Schema(
  {
    heading: textField(300),
    subtitle: textField(1000),
    image: imageField(),
    imageAlt: textField(300),
  },
  { _id: false },
);

const homepageInnovationsSchema = new mongoose.Schema(
  {
    heading: textField(300),
    body: textField(4000),
    buttonText: textField(120),
    buttonLink: textField(300),
    image: imageField(),
    imageAlt: textField(300),
  },
  { _id: false },
);

const statSchema = new mongoose.Schema(
  {
    number: textField(40),
    label: textField(200),
    image: { type: String, default: null, trim: true, maxlength: 2048 },
  },
  { _id: false },
);

const statisticsSchema = new mongoose.Schema(
  {
    stat1: { type: statSchema, default: () => ({}) },
    stat2: { type: statSchema, default: () => ({}) },
    stat3: { type: statSchema, default: () => ({}) },
  },
  { _id: false },
);

const homepageSchema = new mongoose.Schema(
  {
    hero: { type: heroSchema, default: () => ({}) },
    collectionSection: { type: collectionSchema, default: () => ({ products: [] }) },
    story: { type: homepageStorySchema, default: () => ({}) },
    awards: { type: awardsSchema, default: () => ({}) },
    innovations: { type: homepageInnovationsSchema, default: () => ({}) },
    statistics: { type: statisticsSchema, default: () => ({}) },
  },
  { _id: false },
);

const siteSettingsSchema = new mongoose.Schema(
  {
    key: { type: String, default: 'main', unique: true, immutable: true, trim: true },
    brandName: { type: String, default: 'Om Banana Crafts', trim: true, maxlength: 120 },
    logo: { type: String, default: '', trim: true, maxlength: 2048 },
    logoAlt: { type: String, default: 'Om Banana Crafts', trim: true, maxlength: 200 },
    tagline: { type: String, default: '', trim: true, maxlength: 300 },
    contact: {
      phone: { type: String, default: '', trim: true, maxlength: 40 },
      whatsapp: { type: String, default: '', trim: true, maxlength: 40 },
      email: { type: String, default: '', trim: true, lowercase: true, maxlength: 200 },
      address: { type: addressSchema, default: () => ({}) },
      mapImage: { type: String, default: '', trim: true, maxlength: 2048 },
      mapAlt: { type: String, default: '', trim: true, maxlength: 300 },
      workingHours: { type: String, default: '', trim: true, maxlength: 200 },
    },
    contactPageHeading: textField(300),
    contactPageSubtitle: textField(1000),
    nav: { type: [navItemSchema], default: [] },
    social: { type: [socialLinkSchema], default: [] },
    footer: {
      description: { type: String, default: '', trim: true, maxlength: 600 },
      copyright: { type: String, default: '', trim: true, maxlength: 300 },
      showSocial: { type: Boolean, default: true },
    },
    seo: {
      title: { type: String, default: '', trim: true, maxlength: 200 },
      description: { type: String, default: '', trim: true, maxlength: 500 },
      keywords: { type: [String], default: [] },
      ogImage: { type: String, default: '', trim: true, maxlength: 2048 },
    },
    homepage: { type: homepageSchema, default: () => ({}) },
  },
  { timestamps: true, toJSON: toJSONOptions },
);

siteSettingsSchema.statics.defaults = function defaults() {
  return {
    key: 'main',
    brandName: 'Om Banana Crafts',
    nav: [
      { label: 'Home', path: '/', order: 1 },
      { label: 'Products', path: '/products', order: 2 },
      { label: 'Our Story', path: '/our-story', order: 3 },
      { label: 'Innovations', path: '/innovations', order: 4 },
      { label: 'Contact us', path: '/contact', order: 5 },
    ],
    footer: {
      description: 'Transforming agro-waste into timeless handcrafted pieces for a sustainable future.',
      copyright: 'Om Banana Crafts',
      showSocial: true,
    },
  };
};

siteSettingsSchema.statics.getSingleton = async function getSingleton() {
  const existing = await this.findOne({ key: 'main' });
  if (existing) return existing;
  return this.create(this.defaults());
};

export const SiteSettings = mongoose.model('SiteSettings', siteSettingsSchema);
