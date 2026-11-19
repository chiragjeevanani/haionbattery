import jwt from 'jsonwebtoken';

export const JWT_SECRET = process.env.JWT_SECRET || 'dev-only-secret-change-me';

export function signToken(admin) {
  return jwt.sign({ sub: admin.email, role: 'admin' }, JWT_SECRET, { expiresIn: '7d' });
}

export function requireAdmin(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token) return res.status(401).json({ error: 'Sign in to continue.' });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    if (payload.role !== 'admin') throw new Error('role');
    req.admin = payload;
    next();
  } catch {
    res.status(401).json({ error: 'Your session has ended. Sign in again.' });
  }
}
