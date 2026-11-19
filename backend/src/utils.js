import crypto from 'node:crypto';

export const uid = () => crypto.randomUUID();

export function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'item';
}

export function uniqueSlug(base, list, ownId) {
  let slug = slugify(base);
  let n = 2;
  while (list.some(x => x.slug === slug && x.id !== ownId)) slug = `${slugify(base)}-${n++}`;
  return slug;
}

export const str = (v, max = 2000) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

export function num(v) {
  if (v === '' || v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

export const bool = v => v === true || v === 'true' || v === 1 || v === '1';

export function strList(v, maxItems = 12, maxLen = 400) {
  if (!Array.isArray(v)) return [];
  return v.map(x => str(x, maxLen)).filter(Boolean).slice(0, maxItems);
}

export function specList(v) {
  if (!Array.isArray(v)) return [];
  return v
    .map(r => ({ label: str(r?.label, 60), value: str(r?.value, 160) }))
    .filter(r => r.label && r.value)
    .slice(0, 24);
}

export function digits(v) {
  return String(v || '').replace(/\D/g, '');
}
