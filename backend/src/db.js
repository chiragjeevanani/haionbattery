import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { withDefaults } from './defaults.js';

const here = path.dirname(fileURLToPath(import.meta.url));
// DATA_DIR lets a host point the database at a persistent disk.
export const DATA_DIR = process.env.DATA_DIR ? path.resolve(process.env.DATA_DIR) : path.resolve(here, '..', 'data');
const FILE = path.join(DATA_DIR, 'db.json');

let cache = null;

export function dbExists() {
  return fs.existsSync(FILE);
}

export function load() {
  if (cache) return cache;
  if (!fs.existsSync(FILE)) throw new Error('Database not found. Run "npm run seed" in /backend first.');
  cache = JSON.parse(fs.readFileSync(FILE, 'utf8'));
  cache.settings = withDefaults(cache.settings);
  return cache;
}

/** Atomic write: write a temp file, then rename over the real one. */
export function save(next = cache) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const tmp = FILE + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(next, null, 2));
  fs.renameSync(tmp, FILE);
  cache = next;
}

export function replaceAll(next) {
  save(next);
}
