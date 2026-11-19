import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { connect, col, isSeeded } from './db.js';
import { seedDatabase } from './seed.js';
import publicRoutes from './routes/public.js';
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';

const PORT = Number(process.env.PORT) || 5000;
const origins = (process.env.CLIENT_ORIGIN || 'http://localhost:5173').split(',').map(s => s.trim());
if (!process.env.JWT_SECRET) console.warn('Warning: JWT_SECRET is not set. Set one before going live.');

const dbName = await connect();
console.log(`Connected to MongoDB database "${dbName}".`);
// First start with an empty database: write the starter content (the admin sign-in comes from ADMIN_EMAIL / ADMIN_PASSWORD).
if (!(await isSeeded())) await seedDatabase();

const app = express();
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: origins }));
app.use(express.json({ limit: '1mb' }));

// Pictures uploaded in the admin live in the database; their names are unique, so they can be cached for good.
app.get('/uploads/:name', async (req, res) => {
  const file = await col('uploads').findOne({ name: req.params.name });
  if (!file) return res.status(404).end();
  res.set('Content-Type', file.contentType);
  res.set('Cache-Control', 'public, max-age=31536000, immutable');
  res.send(Buffer.from(file.data.buffer));
});

app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.use('/api', publicRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

app.use('/api', (_req, res) => res.status(404).json({ error: 'Not found.' }));
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Something went wrong on the server.' });
});

app.listen(PORT, () => console.log(`Aexto API running on http://localhost:${PORT}`));
