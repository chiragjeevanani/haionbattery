import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { load, save } from '../db.js';
import { uid, str } from '../utils.js';

const router = Router();

const publicProduct = (p, categories) => ({
  ...p,
  category: categories.find(c => c.id === p.categoryId) || null,
});

/** Everything the website shell needs in one request. */
router.get('/site', (_req, res) => {
  const db = load();
  const activeProducts = db.products.filter(p => p.active);
  res.json({
    settings: db.settings,
    categories: [...db.categories].sort((a, b) => a.sortOrder - b.sortOrder),
    brands: [...db.brands].sort((a, b) => a.sortOrder - b.sortOrder),
    faqs: [...db.faqs].sort((a, b) => a.sortOrder - b.sortOrder),
    stats: { products: activeProducts.length, categories: db.categories.length },
  });
});

router.get('/products', (req, res) => {
  const db = load();
  const { category, q, featured, limit } = req.query;
  let list = db.products.filter(p => p.active);
  if (category) {
    const cat = db.categories.find(c => c.slug === category);
    list = cat ? list.filter(p => p.categoryId === cat.id) : [];
  }
  if (featured === '1' || featured === 'true') list = list.filter(p => p.featured);
  if (q) {
    const needle = String(q).toLowerCase();
    list = list.filter(p => `${p.name} ${p.shortDescription} ${p.specs.map(s => s.value).join(' ')}`.toLowerCase().includes(needle));
  }
  list.sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));
  const max = Number(limit);
  if (Number.isFinite(max) && max > 0) list = list.slice(0, max);
  res.json(list.map(p => publicProduct(p, db.categories)));
});

router.get('/products/:slug', (req, res) => {
  const db = load();
  const product = db.products.find(p => p.slug === req.params.slug && p.active);
  if (!product) return res.status(404).json({ error: 'Product not found.' });
  const related = db.products
    .filter(p => p.active && p.id !== product.id && p.categoryId === product.categoryId)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .slice(0, 3)
    .map(p => publicProduct(p, db.categories));
  res.json({ product: publicProduct(product, db.categories), related });
});

const enquiryLimiter = rateLimit({ windowMs: 10 * 60 * 1000, limit: 12, standardHeaders: true, legacyHeaders: false, message: { error: 'Too many requests. Try again in a few minutes.' } });

router.post('/enquiries', enquiryLimiter, (req, res) => {
  const b = req.body || {};
  const name = str(b.name, 120);
  const phone = str(b.phone, 40);
  const email = str(b.email, 160);
  const message = str(b.message, 3000);
  const errors = {};
  if (!name) errors.name = 'Write your name.';
  if (!phone && !email) errors.phone = 'Write a phone number or an email address so we can reply.';
  if (email && !/^\S+@\S+\.\S+$/.test(email)) errors.email = 'Write an email address with an @, like name@example.com.';
  if (phone && phone.replace(/\D/g, '').length < 7) errors.phone = 'Write a phone number with at least 7 digits.';
  if (Object.keys(errors).length) return res.status(400).json({ error: 'Check the highlighted fields.', fields: errors });

  const db = load();
  const enquiry = {
    id: uid(),
    type: ['quote', 'custom', 'contact'].includes(b.type) ? b.type : 'contact',
    name, phone, email, message,
    product: str(b.product, 200),
    vehicle: str(b.vehicle, 120),
    voltage: str(b.voltage, 40),
    capacity: str(b.capacity, 40),
    status: 'new',
    notes: '',
    createdAt: new Date().toISOString(),
  };
  db.enquiries.unshift(enquiry);
  save(db);
  res.status(201).json({ ok: true });
});

export default router;
