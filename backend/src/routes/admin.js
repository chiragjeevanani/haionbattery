import { Router } from 'express';
import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { load, save } from '../db.js';
import { requireAdmin } from '../middleware/auth.js';
import { uid, str, num, bool, strList, specList, uniqueSlug, digits } from '../utils.js';

const router = Router();
router.use(requireAdmin);

const here = path.dirname(fileURLToPath(import.meta.url));
// UPLOAD_DIR lets a host point uploaded pictures at a persistent disk.
export const UPLOAD_DIR = process.env.UPLOAD_DIR ? path.resolve(process.env.UPLOAD_DIR) : path.resolve(here, '..', '..', 'uploads');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

/* ------------------------------------------------------------ uploads */
const ALLOWED = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp', 'image/avif': '.avif' };
const upload = multer({
  storage: multer.diskStorage({
    destination: UPLOAD_DIR,
    filename: (_req, file, cb) => cb(null, `${Date.now()}-${uid().slice(0, 8)}${ALLOWED[file.mimetype] || '.bin'}`),
  }),
  limits: { fileSize: 6 * 1024 * 1024, files: 10 },
  fileFilter: (_req, file, cb) => (ALLOWED[file.mimetype] ? cb(null, true) : cb(new Error('Upload a JPG, PNG, WebP or AVIF picture.'))),
});

router.post('/upload', (req, res) => {
  upload.array('files', 10)(req, res, err => {
    if (err) return res.status(400).json({ error: err.code === 'LIMIT_FILE_SIZE' ? 'Each picture must be 6 MB or smaller.' : err.message });
    res.json({ urls: (req.files || []).map(f => `/uploads/${f.filename}`) });
  });
});

/* ------------------------------------------------------------ stats */
router.get('/stats', (_req, res) => {
  const db = load();
  const s = db.settings;
  res.json({
    products: db.products.length,
    activeProducts: db.products.filter(p => p.active).length,
    categories: db.categories.length,
    enquiries: db.enquiries.length,
    newEnquiries: db.enquiries.filter(e => e.status === 'new').length,
    recent: db.enquiries.slice(0, 5),
    // The seeded placeholder is a country code followed by zeros; a real number never ends in seven zeros.
    contactReady: digits(s.whatsappNumber).length >= 8 && !/0{7,}$/.test(digits(s.whatsappNumber)),
  });
});

/* ------------------------------------------------------------ categories */
const cleanCategory = (b, db, existing) => {
  const name = str(b.name, 120);
  if (!name) return { error: 'Write a category name.', fields: { name: 'Write a category name.' } };
  return {
    value: {
      ...(existing || { id: uid() }),
      name,
      slug: uniqueSlug(name, db.categories, existing?.id),
      description: str(b.description, 400),
      image: str(b.image, 500),
      sortOrder: num(b.sortOrder) ?? (existing?.sortOrder ?? db.categories.length + 1),
    },
  };
};

/* ------------------------------------------------------------ products */
const cleanProduct = (b, db, existing) => {
  const name = str(b.name, 160);
  const fields = {};
  if (!name) fields.name = 'Write a product name.';
  if (!db.categories.some(c => c.id === b.categoryId)) fields.categoryId = 'Choose a category.';
  if (Object.keys(fields).length) return { error: 'Check the highlighted fields.', fields };
  return {
    value: {
      ...(existing || { id: uid(), createdAt: new Date().toISOString() }),
      name,
      slug: uniqueSlug(name, db.products, existing?.id),
      categoryId: b.categoryId,
      shortDescription: str(b.shortDescription, 220),
      description: str(b.description, 6000),
      images: strList(b.images, 10, 500),
      specs: specList(b.specs),
      price: num(b.price),
      mrp: num(b.mrp),
      featured: bool(b.featured),
      active: b.active === undefined ? true : bool(b.active),
      inStock: b.inStock === undefined ? true : bool(b.inStock),
      sortOrder: num(b.sortOrder) ?? (existing?.sortOrder ?? db.products.length + 1),
    },
  };
};

/* ------------------------------------------------------------ brands, faqs */
const cleanBrand = (b, db, existing) => {
  const name = str(b.name, 80);
  if (!name) return { error: 'Write a brand name.', fields: { name: 'Write a brand name.' } };
  return { value: { ...(existing || { id: uid() }), name, url: str(b.url, 300), sortOrder: num(b.sortOrder) ?? (existing?.sortOrder ?? db.brands.length + 1) } };
};
const cleanFaq = (b, db, existing) => {
  const question = str(b.question, 240);
  const answer = str(b.answer, 1200);
  const fields = {};
  if (!question) fields.question = 'Write the question.';
  if (!answer) fields.answer = 'Write the answer.';
  if (Object.keys(fields).length) return { error: 'Check the highlighted fields.', fields };
  return { value: { ...(existing || { id: uid() }), question, answer, sortOrder: num(b.sortOrder) ?? (existing?.sortOrder ?? db.faqs.length + 1) } };
};

/** One CRUD router for each simple collection. */
function crud(name, clean, { sort } = {}) {
  router.get(`/${name}`, (_req, res) => {
    const list = [...load()[name]];
    if (sort) list.sort(sort);
    res.json(list);
  });
  router.get(`/${name}/:id`, (req, res) => {
    const item = load()[name].find(x => x.id === req.params.id);
    item ? res.json(item) : res.status(404).json({ error: 'Not found.' });
  });
  router.post(`/${name}`, (req, res) => {
    const db = load();
    const out = clean(req.body || {}, db, null);
    if (out.error) return res.status(400).json(out);
    db[name].push(out.value);
    save(db);
    res.status(201).json(out.value);
  });
  router.put(`/${name}/:id`, (req, res) => {
    const db = load();
    const i = db[name].findIndex(x => x.id === req.params.id);
    if (i < 0) return res.status(404).json({ error: 'Not found.' });
    const out = clean(req.body || {}, db, db[name][i]);
    if (out.error) return res.status(400).json(out);
    db[name][i] = out.value;
    save(db);
    res.json(out.value);
  });
  router.delete(`/${name}/:id`, (req, res) => {
    const db = load();
    if (name === 'categories' && db.products.some(p => p.categoryId === req.params.id)) {
      return res.status(409).json({ error: 'This category still has products. Move or delete them first.' });
    }
    const before = db[name].length;
    db[name] = db[name].filter(x => x.id !== req.params.id);
    if (db[name].length === before) return res.status(404).json({ error: 'Not found.' });
    save(db);
    res.json({ ok: true });
  });
}

crud('products', cleanProduct, { sort: (a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name) });
crud('categories', cleanCategory, { sort: (a, b) => a.sortOrder - b.sortOrder });
crud('brands', cleanBrand, { sort: (a, b) => a.sortOrder - b.sortOrder });
crud('faqs', cleanFaq, { sort: (a, b) => a.sortOrder - b.sortOrder });

/* ------------------------------------------------------------ settings */
const obj = (v) => (v && typeof v === 'object' ? v : {});
const block = (v, keys, caps = {}) => Object.fromEntries(keys.map(k => [k, str(obj(v)[k], caps[k] || 600)]));

router.get('/settings', (_req, res) => res.json(load().settings));

router.put('/settings', (req, res) => {
  const b = obj(req.body);
  const db = load();
  const fields = {};
  const whatsappNumber = digits(b.whatsappNumber);
  if (whatsappNumber && (whatsappNumber.length < 8 || whatsappNumber.length > 15)) {
    fields.whatsappNumber = 'Write the WhatsApp number with country code, digits only, like 919876543210.';
  }
  const email = str(b.email, 160);
  if (email && !/^\S+@\S+\.\S+$/.test(email)) fields.email = 'Write an email address with an @.';
  if (!str(b.siteName, 80)) fields.siteName = 'Write the business name.';
  if (Object.keys(fields).length) return res.status(400).json({ error: 'Check the highlighted fields.', fields });

  db.settings = {
    siteName: str(b.siteName, 80),
    tagline: str(b.tagline, 120),
    phone: str(b.phone, 40),
    whatsappNumber,
    whatsappProductMessage: str(b.whatsappProductMessage, 400) || 'Hello, I would like a quote for {product}.',
    whatsappGeneralMessage: str(b.whatsappGeneralMessage, 400) || 'Hello, I would like a quote.',
    email,
    address: str(b.address, 240),
    hours: str(b.hours, 160),
    social: block(b.social, ['instagram', 'facebook', 'youtube', 'linkedin'], { instagram: 300, facebook: 300, youtube: 300, linkedin: 300 }),
    hero: block(b.hero, ['headline', 'lead', 'image', 'imageAlt'], { headline: 40, lead: 300, image: 500, imageAlt: 200 }),
    custom: block(b.custom, ['heading', 'text', 'image', 'imageAlt'], { heading: 80, text: 400, image: 500, imageAlt: 200 }),
    process: {
      heading: str(obj(b.process).heading, 80),
      steps: (Array.isArray(obj(b.process).steps) ? b.process.steps : []).slice(0, 3).map(st => block(st, ['title', 'text', 'image', 'imageAlt'], { title: 60, text: 240, image: 500, imageAlt: 200 })),
    },
    statement: block(b.statement, ['heading', 'text'], { heading: 40, text: 240 }),
    closing: block(b.closing, ['image', 'imageAlt'], { image: 500, imageAlt: 200 }),
    about: block(b.about, ['heading', 'body', 'image', 'imageAlt'], { heading: 80, body: 3000, image: 500, imageAlt: 200 }),
    footerLede: str(b.footerLede, 200),
    seo: block(b.seo, ['title', 'description'], { title: 90, description: 200 }),
  };
  save(db);
  res.json(db.settings);
});

/* ------------------------------------------------------------ enquiries */
router.get('/enquiries', (_req, res) => res.json(load().enquiries));

router.patch('/enquiries/:id', (req, res) => {
  const db = load();
  const e = db.enquiries.find(x => x.id === req.params.id);
  if (!e) return res.status(404).json({ error: 'Not found.' });
  if (['new', 'contacted', 'closed'].includes(req.body?.status)) e.status = req.body.status;
  if (typeof req.body?.notes === 'string') e.notes = str(req.body.notes, 2000);
  save(db);
  res.json(e);
});

router.delete('/enquiries/:id', (req, res) => {
  const db = load();
  const before = db.enquiries.length;
  db.enquiries = db.enquiries.filter(x => x.id !== req.params.id);
  if (db.enquiries.length === before) return res.status(404).json({ error: 'Not found.' });
  save(db);
  res.json({ ok: true });
});

export default router;
