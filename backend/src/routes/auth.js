import { Router } from 'express';
import bcrypt from 'bcryptjs';
import rateLimit from 'express-rate-limit';
import { getAdmin, saveAdmin } from '../db.js';
import { signToken, requireAdmin } from '../middleware/auth.js';
import { str } from '../utils.js';

const router = Router();

const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 20, standardHeaders: true, legacyHeaders: false, message: { error: 'Too many sign-in attempts. Try again in 15 minutes.' } });

router.post('/login', loginLimiter, async (req, res) => {
  const email = str(req.body?.email, 160).toLowerCase();
  const password = typeof req.body?.password === 'string' ? req.body.password : '';
  const admin = await getAdmin();
  if (!admin || !email || !password || email !== admin.email || !bcrypt.compareSync(password, admin.passwordHash)) {
    return res.status(401).json({ error: 'The email or password is wrong.' });
  }
  res.json({ token: signToken(admin), email: admin.email });
});

router.get('/me', requireAdmin, (req, res) => res.json({ email: req.admin.sub }));

router.post('/account', requireAdmin, async (req, res) => {
  const admin = await getAdmin();
  const current = typeof req.body?.currentPassword === 'string' ? req.body.currentPassword : '';
  const next = typeof req.body?.newPassword === 'string' ? req.body.newPassword : '';
  const email = str(req.body?.email, 160).toLowerCase();
  if (!bcrypt.compareSync(current, admin.passwordHash)) return res.status(400).json({ error: 'The current password is wrong.', fields: { currentPassword: 'The current password is wrong.' } });
  if (next && next.length < 8) return res.status(400).json({ error: 'Use at least 8 characters for the new password.', fields: { newPassword: 'Use at least 8 characters.' } });
  if (email && !/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ error: 'Write an email address with an @.', fields: { email: 'Write an email address with an @.' } });
  if (email) admin.email = email;
  if (next) admin.passwordHash = bcrypt.hashSync(next, 10);
  await saveAdmin(admin);
  res.json({ token: signToken(admin), email: admin.email });
});

export default router;
