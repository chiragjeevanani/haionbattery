import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { all, col, getSettings } from '../db.js';
import { uid, str } from '../utils.js';

const router = Router();

const publicProduct = (p, categories) => ({
  ...p,
  category: categories.find(c => c.id === p.categoryId) || null,
});

/** Everything the website shell needs in one request. */
router.get('/site', async (_req, res) => {
  const [settings, categories, brands, faqs, products] = await Promise.all([
    getSettings(), all('categories'), all('brands'), all('faqs'), all('products', { active: true }),
  ]);
  const byOrder = (a, b) => a.sortOrder - b.sortOrder;
  res.json({
    settings,
    categories: categories.sort(byOrder),
    brands: brands.sort(byOrder),
    faqs: faqs.sort(byOrder),
    stats: { products: products.length, categories: categories.length },
  });
});

router.get('/products', async (req, res) => {
  const { category, q, featured, limit } = req.query;
  const [products, categories] = await Promise.all([all('products', { active: true }), all('categories')]);
  let list = products;
  if (category) {
    const cat = categories.find(c => c.slug === category);
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
  res.json(list.map(p => publicProduct(p, categories)));
});

router.get('/products/:slug', async (req, res) => {
  const [products, categories] = await Promise.all([all('products', { active: true }), all('categories')]);
  const product = products.find(p => p.slug === req.params.slug);
  if (!product) return res.status(404).json({ error: 'Product not found.' });
  const related = products
    .filter(p => p.id !== product.id && p.categoryId === product.categoryId)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .slice(0, 3)
    .map(p => publicProduct(p, categories));
  res.json({ product: publicProduct(product, categories), related });
});

const enquiryLimiter = rateLimit({ windowMs: 10 * 60 * 1000, limit: 12, standardHeaders: true, legacyHeaders: false, message: { error: 'Too many requests. Try again in a few minutes.' } });

router.post('/enquiries', enquiryLimiter, async (req, res) => {
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

  await col('enquiries').insertOne({
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
  });
  res.status(201).json({ ok: true });
});

export default router;
