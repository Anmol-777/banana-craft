import { config } from '../config/env.js';
import { connectMongo, disconnectMongo } from '../config/db.js';
import { Admin } from '../models/Admin.js';
import { Product } from '../models/Product.js';
import { Innovation } from '../models/Innovation.js';
import { StorySection } from '../models/StorySection.js';
import { GalleryItem } from '../models/GalleryItem.js';
import { SiteSettings } from '../models/SiteSettings.js';
import { PageContent } from '../models/PageContent.js';
import { slugify } from '../utils/text.js';

// Bundled client assets live in `client/public/images`, so store them as
// root-relative paths. They resolve against the client origin in dev (Vite)
// and in production (Express serves the built SPA). Uploaded media keeps using
// the absolute API URL returned by the media controller.

async function seedProducts() {
  const products = [
    { name: 'Sphere lamp shade', shortDescription: 'Handcrafted spherical lamp shade from banana fiber', description: 'Beautiful handcrafted sphere lamp shade made from sustainable banana fiber. Perfect for adding warm, natural light to any space.', images: [{ url: `/images/sphere.png`, alt: 'Sphere lamp shade', caption: 'Sphere lamp shade' }], category: 'Lighting', materials: ['Banana fiber'], order: 1 },
    { name: 'Mini storage box', shortDescription: 'Compact storage box woven from banana fiber', description: 'Small but sturdy storage box perfect for organizing small items. Handwoven from natural banana fiber.', images: [{ url: `/images/mini.png`, alt: 'Mini storage box', caption: 'Mini storage box' }], category: 'Storage', materials: ['Banana fiber'], order: 2 },
    { name: 'Bottle lamp shade', shortDescription: 'Elegant bottle-shaped lamp shade', description: 'Unique bottle-shaped lamp shade crafted from banana fiber. Creates beautiful light patterns.', images: [{ url: `/images/bottle shade.png`, alt: 'Bottle lamp shade', caption: 'Bottle lamp shade' }], category: 'Lighting', materials: ['Banana fiber'], order: 3 },
    { name: 'Hand basket', shortDescription: 'Traditional hand-woven basket', description: 'Classic hand basket woven using traditional techniques. Strong, durable, and beautiful.', images: [{ url: `/images/hand.png`, alt: 'Hand basket', caption: 'Hand basket' }], category: 'Baskets', materials: ['Banana fiber'], order: 4 },
    { name: 'Storage box', shortDescription: 'Large storage box for home organization', description: 'Spacious storage box handwoven from banana fiber. Ideal for blankets, toys, or household items.', images: [{ url: `/images/storage.png`, alt: 'Storage box', caption: 'Storage box' }], category: 'Storage', materials: ['Banana fiber'], order: 5 },
    { name: 'Pencil stand', shortDescription: 'Desk organizer for pens and pencils', description: 'Neat pencil stand made from banana fiber. Keeps your desk organized with natural style.', images: [{ url: `/images/pencil.png`, alt: 'Pencil stand', caption: 'Pencil stand' }], category: 'Office', materials: ['Banana fiber'], order: 6 },
    { name: 'Square pooja basket', shortDescription: 'Square basket for prayer items', description: 'Traditional square pooja basket for holding prayer essentials. Handcrafted with care.', images: [{ url: `/images/pooja.png`, alt: 'Square pooja basket', caption: 'Square pooja basket' }], category: 'Spiritual', materials: ['Banana fiber'], order: 7 },
    { name: 'Laundry basket', shortDescription: 'Large laundry basket with handles', description: 'Sturdy laundry basket woven from banana fiber. Strong enough for heavy loads.', images: [{ url: `/images/laundry.png`, alt: 'Laundry basket', caption: 'Laundry basket' }], category: 'Home', materials: ['Banana fiber'], order: 8 },
    { name: 'Woven plant pot', shortDescription: 'Decorative plant pot cover', description: 'Beautiful woven plant pot cover made from banana fiber. Adds natural texture to your plants.', images: [{ url: `/images/woven plant.png`, alt: 'Woven plant pot', caption: 'Woven plant pot' }], category: 'Planters', materials: ['Banana fiber'], order: 9 },
    { name: 'Ribbon fruit tray', shortDescription: 'Elegant fruit serving tray', description: 'Handwoven fruit tray with ribbon details. Perfect for serving or display.', images: [{ url: `/images/ribbon.png`, alt: 'Ribbon fruit tray', caption: 'Ribbon fruit tray' }], category: 'Serveware', materials: ['Banana fiber'], order: 10 },
    { name: 'Crochet basket', shortDescription: 'Crochet-style woven basket', description: 'Unique crochet-pattern basket made from banana fiber. Soft texture with sturdy construction.', images: [{ url: `/images/crochet.png`, alt: 'Crochet basket', caption: 'Crochet basket' }], category: 'Baskets', materials: ['Banana fiber'], order: 11 },
  ];

  if (config.seedMode === 'overwrite') await Product.deleteMany({});

  for (const p of products) {
    const slug = slugify(p.name, `product-${Date.now()}`);
    await Product.findOneAndUpdate(
      { slug },
      { $set: { ...p, slug, active: true, featured: p.order <= 4 } },
      { upsert: true, new: true, runValidators: true },
    );
  }
  console.log('[seed] Products seeded');
}

async function seedInnovations() {
  const innovations = [
    { name: 'Power rope machine', summary: 'High-capacity rope production machine', body: 'The machine produces 3,000 meters of rope per 8-hour shift, maintaining a consistent output. It supports adjustable diameter ranging from 2mm to 5mm banana fiber ropes.', image: `/images/power rope machine.png`, imageAlt: 'Power rope machine', order: 1 },
    { name: 'Cutting machine', summary: 'Precision cutting for banana fiber sheaths', body: 'The machine supports cutting banana fiber sheaths into smaller strips which help in effective crafting of basket braiding.', image: `/images/cutting.png`, imageAlt: 'Cutting machine', order: 2 },
    { name: 'Double twist rope machine', summary: 'Automated double-twisted rope production', body: 'The automated machine produces about 5000 to 6000 meters double twisted rope per 8 hr shift.', image: `/images/twist.png`, imageAlt: 'Double twist rope machine', order: 3 },
    { name: 'Single rope machine', summary: 'High-output single twisted rope machine', body: 'The automated machine produces about 5000 to 6000 meters single twisted rope per 8 hr shift.', image: `/images/single.png`, imageAlt: 'Single rope machine', order: 4 },
    { name: 'Fiber extraction machine', summary: 'Efficient banana fiber extraction', body: 'The machine is employed to extract banana fiber. An 8hr shift yields about 4 to 5 Kg of fiber utilizing agriculture waste from over 100 banana trees.', image: `/images/fiber.png`, imageAlt: 'Fiber extraction machine', order: 5 },
  ];

  if (config.seedMode === 'overwrite') await Innovation.deleteMany({});

  for (const i of innovations) {
    const slug = slugify(i.name, `innovation-${Date.now()}`);
    await Innovation.findOneAndUpdate(
      { slug },
      { $set: { ...i, slug, active: true } },
      { upsert: true, new: true, runValidators: true },
    );
  }
  console.log('[seed] Innovations seeded');
}

async function seedStorySections() {
  const sections = [
    { key: 'natures-gift', title: "The nature's gift", body: "The banana plant is considered nature's gift. From the fruit we eat to the flowers and stems cooked in traditional dishes, green leaves used serve food, almost every inch of the plant serves a purpose, except for the other sheaths of the stem. Despite the plant's utility, the outermost layers remained as a burden on farmers and our environment.", image: `/images/tree.png`, imageAlt: 'Banana tree illustration', layout: 'image-left', order: 1 },
    { key: 'waste-or-wealth', title: 'A waste or a wealth?', body: 'India is a large producer of bananas resulting in large quantities of wastage. On many farms, these sheaths were seen as useless, lacking a purpose, they were either left to rot in heaps or, more commonly, burnt. This practice turned a potential resource into ash and smoke, creating a cycle of waste.', image: `/images/fire.png`, imageAlt: 'Burning banana sheaths illustration', layout: 'image-right', order: 2 },
    { key: 'spark-difference', title: 'The spark that made a difference', body: 'The turning point came nearly two decades ago in the village of Melakkal. Mr. Murugesan, a humble farmer from the village along with his wife Mrs. Makaradi and village elders started seeking a solution to utilizing the waste. He saw the waste a raw material and perhaps they could be woven into something much stronger.', image: `/images/speak.png`, imageAlt: 'Mr. Murugesan illustration', layout: 'image-left', order: 3 },
    { key: 'struggles-hands', title: 'The struggles of hands', body: 'In the beginning, Murugesan attempted to weave the fibers manually, but that was not easy. The ropes would split, lose their grip, and fail to stay connected. Without the right tension or technique, creating a durable product by hand seemed nearly impossible.', image: `/images/tie.png`, imageAlt: 'Hands tying fibers illustration', layout: 'image-right', order: 4 },
    { key: 'innovation-transformed', title: 'An innovation that transformed', body: 'That led him to his first breakthrough, a spinning machine built from bicycle wheel rims and pulleys. This "trial-and-error" invention allowed him to braid strands together to achieve high tensile strength. But this method required hard labour but only produced small quantities. Not satisfied with that, he eventually developed and patent an automated rope-making machine. This machine performed a dual functions, simultaneously spinning the rope and braiding it for maximum durability.', image: `/images/wheel.png`, imageAlt: 'Spinning machine illustration', layout: 'image-left', order: 5 },
    { key: 'result-hardwork', title: 'The result of hard work', body: "Today, OM banana crafts is a beacon of rural success. What started as a struggle has scaled into a thriving company employing over 400 people, primarily women from his local village. By turning discarded sheaths into bags, mats, and high-quality ropes, Mr. Murugesan didn't just solve a waste problem he built a patented industry that provides dignity and a livelihood to hundreds.", image: `/images/old woman.png`, imageAlt: 'Woman weaving illustration', layout: 'image-right', order: 6 },
  ];

  if (config.seedMode === 'overwrite') await StorySection.deleteMany({});

  for (const s of sections) {
    await StorySection.findOneAndUpdate(
      { key: s.key },
      { $set: { ...s, active: true } },
      { upsert: true, new: true, runValidators: true },
    );
  }
  console.log('[seed] Story sections seeded');
}

async function seedGallery() {
  const items = [
    { title: 'Man operating machine', caption: 'Man operating power rope machine', image: `/images/1.png`, imageAlt: 'Gallery 1 - Man operating machine', layout: 'large', order: 1 },
    { title: 'Workshop with baskets', caption: 'Workshop filled with handcrafted baskets', image: `/images/2.png`, imageAlt: 'Gallery 2 - Workshop with baskets', layout: 'small', order: 2 },
    { title: 'Women with baskets', caption: 'Rural women artisans with finished baskets', image: `/images/3.png`, imageAlt: 'Gallery 3 - Women with baskets', layout: 'small', order: 3 },
    { title: 'Banana fiber rope machine banner', caption: 'Banner showing banana fiber rope machine', image: `/images/4.png`, imageAlt: 'Gallery 4 - Banana fiber rope machine banner', layout: 'small', order: 4 },
    { title: 'Woman with fiber', caption: 'Woman processing banana fiber', image: `/images/5.png`, imageAlt: 'Gallery 5 - Woman with fiber', layout: 'small', order: 5 },
  ];

  if (config.seedMode === 'overwrite') await GalleryItem.deleteMany({});

  for (const g of items) {
    await GalleryItem.findOneAndUpdate(
      { title: g.title },
      { $set: { ...g, active: true } },
      { upsert: true, new: true, runValidators: true },
    );
  }
  console.log('[seed] Gallery items seeded');
}

async function seedSettings() {
  const defaults = {
    key: 'main',
    brandName: 'Om Banana Crafts',
    logo: `/images/logo.jpg`,
    logoAlt: 'Om Banana Crafts',
    tagline: 'Turning Agro-waste to fine crafts',
    contact: {
      phone: '+91 93605 97884',
      whatsapp: '+91 93605 97884',
      email: 'bananafibermdu@gmail.com',
      address: {
        line1: '3/43, Melakkal',
        line2: '',
        city: 'Madurai',
        state: 'Tamil Nadu',
        postalCode: '625234',
        country: 'India',
      },
      mapImage: `/images/map.png`,
      mapAlt: 'Map showing Om Banana Crafts in Melakkal, Madurai',
      workingHours: 'Mon-Sat 9:00 AM - 6:00 PM',
    },
    nav: [
      { label: 'Home', path: '/', order: 1 },
      { label: 'Products', path: '/products', order: 2 },
      { label: 'Our Story', path: '/our-story', order: 3 },
      { label: 'Innovations', path: '/innovations', order: 4 },
      { label: 'Contact us', path: '/contact', order: 5 },
    ],
    social: [],
    footer: {
      description: 'Transforming agro-waste into timeless handcrafted pieces for a sustainable future.',
      copyright: 'Om Banana Crafts',
      showSocial: true,
    },
    seo: {
      title: 'Om Banana Crafts - Handcrafted from Agro-waste',
      description: 'Sustainable handcrafted products made from banana fiber. Eco-friendly baskets, planters, lighting, and more.',
      keywords: ['banana fiber', 'handcrafted', 'sustainable', 'eco-friendly', 'agro-waste'],
      ogImage: `/images/logo.jpg`,
    },
    contactPageHeading: 'Contact us',
    contactPageSubtitle: 'We serve both B2B and B2C clients globally,\nReach out to place orders',
    homepage: {
      hero: {
        heading: 'Turning Agro-waste<br />to fine crafts',
        defaultImage: '/images/grey.jpg',
        hoverImage: '/images/brown.jpg',
        imageAlt: 'Turning Agro-waste to fine crafts',
      },
      collectionSection: {
        heading: 'The Collection',
        subtitle: 'Thoughtfully crafted pieces made from upcycled agro-waste, designed to bring warmth and purpose to your space.',
        products: [
          { title: 'Elliptical Planter', description: 'Handcrafted from banana fiber with a sleek elliptical silhouette.', image: '/images/elliptical.jpg' },
          { title: 'Square Basket', description: 'Premium woven square basket for storage and decor.', image: '/images/square.jpg' },
          { title: 'Bottle Vase', description: 'Elegant bottle-shaped vase for fresh or dried arrangements.', image: '/images/bottle.jpg' },
          { title: 'Woven Tray', description: 'Versatile handwoven tray, perfect for serving and display.', image: '/images/woven.jpg' },
        ],
      },
      story: {
        heading: 'Our Story',
        body: 'At Om Banana Crafts, we transform agricultural waste into exquisite handmade products. What began as a vision to reduce farm waste has grown into a movement that empowers rural artisans and brings sustainable craftsmanship to your home. Every piece tells a story of renewal, skill, and a deep respect for nature.',
        buttonText: 'Know our full story',
        buttonLink: '/our-story',
        image: '/images/man.png',
        imageAlt: 'Founder',
      },
      awards: {
        heading: 'Award and recognition',
        subtitle: 'Our commitment to sustainability and craftsmanship has been recognized globally.',
        image: '/images/awards.png',
        imageAlt: 'Awards and recognition',
      },
      innovations: {
        heading: 'Innovations',
        body: 'Our core innovation lies in the mechanical mastery of natural fiber extraction. Driven by the vision of turning &ldquo;waste to wealth,&rdquo; our founder Mr.&nbsp;Murugesan has developed specialized machines designed to efficiently process discarded banana stems into high-quality, durable fiber.',
        buttonText: 'Know More',
        buttonLink: '/innovations',
        image: '/images/machine.png',
        imageAlt: 'Innovation machine',
      },
      statistics: {
        stat1: { number: '50+', label: 'Agro-waste repurposed annually', image: '/images/50.png' },
        stat2: { number: '10%', label: 'Profit reaches farmers', image: null },
        stat3: { number: '350+', label: 'Rural women employed', image: null },
      },
    },
  };

  if (config.seedMode === 'overwrite') {
    await SiteSettings.deleteOne({ key: 'main' });
  }
  await SiteSettings.getSingleton().then(s => {
    Object.assign(s, defaults);
    return s.save();
  });
  console.log('[seed] Site settings seeded');
}

async function seedPageContent() {
  const pages = [
    { key: 'home-hero', page: 'home', section: 'hero', title: 'Turning Agro-waste to fine crafts', body: '', order: 1 },
    { key: 'home-collection', page: 'home', section: 'collection', title: 'The Collection', subtitle: 'Thoughtfully crafted pieces made from upcycled agro-waste, designed to bring warmth and purpose to your space.', body: '', order: 2 },
    { key: 'home-story', page: 'home', section: 'story', title: 'Our Story', body: 'At Om Banana Crafts, we transform agricultural waste into exquisite handmade products. What began as a vision to reduce farm waste has grown into a movement that empowers rural artisans and brings sustainable craftsmanship to your home. Every piece tells a story of renewal, skill, and a deep respect for nature.', order: 3 },
    { key: 'home-awards', page: 'home', section: 'awards', title: 'Award and recognition', subtitle: 'Our commitment to sustainability and craftsmanship has been recognized globally.', order: 4 },
    { key: 'home-innovations', page: 'home', section: 'innovations', title: 'Innovations', body: 'Our core innovation lies in the mechanical mastery of natural fiber extraction. Driven by the vision of turning "waste to wealth," our founder Mr. Murugesan has developed specialized machines designed to efficiently process discarded banana stems into high-quality, durable fiber.', order: 5 },
    { key: 'home-stats', page: 'home', section: 'stats', title: 'Impact', content: { stats50: '50+', stats50Label: 'Agro-waste repurposed annually', stats10: '10%', stats10Label: 'Profit reaches farmers', stats350: '350+', stats350Label: 'Rural women employed' }, order: 6 },
    { key: 'products-hero', page: 'products', section: 'hero', title: 'Handcrafted with purpose', subtitle: 'A waste to wealth initiative', body: '', images: [{ url: `/images/prod main.png`, alt: 'Handcrafted products' }], order: 1 },
    { key: 'products-support', page: 'products', section: 'support', title: 'Your purchase supports', content: { items: [{ icon: `/images/eco.png`, label: 'Eco-friendly' }, { icon: `/images/crafted.png`, label: 'Handcrafted' }, { icon: `/images/community.png`, label: 'Community Empowerment' }] }, order: 2 },
    { key: 'our-story-intro', page: 'our-story', section: 'intro', title: 'Our Journey', subtitle: 'A path of struggles and success', order: 1 },
    { key: 'our-story-impact', page: 'our-story', section: 'impact', content: { stats50: '50+', stats50Label: 'Agro-waste repurposed annually', stats10: '10%', stats10Label: 'Profit reaches farmers', stats350: '350+', stats350Label: 'Rural women employed' }, order: 2 },
    { key: 'innovations-hero', page: 'innovations', section: 'hero', title: 'Ideas in Motion.', subtitle: 'Specialized machines innovations made to efficiently process discarded banana stems into high-quality, durable fiber.', images: [{ url: `/images/page 4 man.png`, alt: 'Man operating machine' }], order: 1 },
    { key: 'innovations-gallery', page: 'innovations', section: 'gallery', title: 'Gallery', order: 2 },
    { key: 'contact-main', page: 'contact', section: 'main', title: 'Extend an Enquiry', subtitle: 'We serve both B2B and B2C clients globally,\nReach out to place orders', order: 1 },
  ];

  if (config.seedMode === 'overwrite') await PageContent.deleteMany({});

  for (const p of pages) {
    await PageContent.findOneAndUpdate(
      { key: p.key },
      { $set: { ...p, active: true } },
      { upsert: true, new: true, runValidators: true },
    );
  }
  console.log('[seed] Page content seeded');
}

async function runSeed() {
  try {
    await connectMongo();
    console.log('[seed] Connected to MongoDB');

    await seedSettings();
    await seedProducts();
    await seedInnovations();
    await seedStorySections();
    await seedGallery();
    await seedPageContent();

    console.log('[seed] All data seeded successfully!');
  } catch (error) {
    console.error('[seed] Error:', error);
    throw error;
  } finally {
    await disconnectMongo();
  }
}

runSeed().catch(() => process.exit(1));