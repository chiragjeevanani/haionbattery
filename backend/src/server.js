import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { dbExists } from './db.js';
import publicRoutes from './routes/public.js';
import authRoutes from './routes/auth.js';
import adminRoutes, { UPLOAD_DIR } from './routes/admin.js';

// First boot on a new host: create the starter data (admin sign-in comes from ADMIN_EMAIL / ADMIN_PASSWORD).
if (!dbExists()) await import('./seed.js');
if (!process.env.JWT_SECRET) console.warn('Warning: JWT_SECRET is not set in backend/.env. Set one before going live.');

const app = express();
const PORT = Number(process.env.PORT) || 5000;
const origins = (process.env.CLIENT_ORIGIN || 'http://localhost:5173').split(',').map(s => s.trim());

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: origins }));
app.use(express.json({ limit: '1mb' }));
app.use('/uploads', express.static(UPLOAD_DIR, { maxAge: '7d' }));

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
