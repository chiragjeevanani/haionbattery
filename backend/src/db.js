import { MongoClient } from 'mongodb';
import { withDefaults } from './defaults.js';

/*
  MongoDB data layer. The app owns ONE database (MONGODB_DB, default "aexto_website") and only ever
  reads or writes the collections listed below inside it. It never lists, drops or edits any other
  database on the cluster, and it refuses to start against a database name that belongs to something else.
*/
const COLLECTIONS = ['settings', 'admin', 'categories', 'products', 'brands', 'faqs', 'enquiries', 'uploads'];
const NOT_OURS = ['admin', 'local', 'config', 'test', 'haion_erp'];

let client = null;
let database = null;

export async function connect() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is not set. Add it to backend/.env (or the host\'s environment settings).');
  const name = (process.env.MONGODB_DB || 'aexto_website').trim();
  if (!/^[A-Za-z0-9_-]{3,60}$/.test(name) || NOT_OURS.includes(name)) {
    throw new Error(`Refusing to use "${name}" as the database name: choose a name of its own, like aexto_website.`);
  }
  client = new MongoClient(uri, { serverSelectionTimeoutMS: 20000 });
  await client.connect();
  database = client.db(name);
  await ensureIndexes();
  return name;
}

export async function disconnect() {
  await client?.close();
  client = null;
  database = null;
}

export function col(name) {
  if (!database) throw new Error('The database is not connected yet.');
  if (!COLLECTIONS.includes(name)) throw new Error(`Unknown collection: ${name}`);
  return database.collection(name);
}

async function ensureIndexes() {
  await Promise.all([
    col('categories').createIndex({ id: 1 }, { unique: true }),
    col('categories').createIndex({ slug: 1 }, { unique: true }),
    col('products').createIndex({ id: 1 }, { unique: true }),
    col('products').createIndex({ slug: 1 }, { unique: true }),
    col('products').createIndex({ categoryId: 1 }),
    col('brands').createIndex({ id: 1 }, { unique: true }),
    col('faqs').createIndex({ id: 1 }, { unique: true }),
    col('enquiries').createIndex({ id: 1 }, { unique: true }),
    col('enquiries').createIndex({ createdAt: -1 }),
    col('uploads').createIndex({ name: 1 }, { unique: true }),
  ]);
}

const NO_ID = { projection: { _id: 0 } };
export const all = (name, filter = {}) => col(name).find(filter, NO_ID).toArray();
export const one = (name, filter) => col(name).findOne(filter, NO_ID);

/** The lists the validators need to check names, categories and slugs. */
export async function snapshot() {
  const [categories, products, brands, faqs] = await Promise.all([all('categories'), all('products'), all('brands'), all('faqs')]);
  return { categories, products, brands, faqs };
}

/* Settings and the admin login are one document each. */
export async function getSettings() {
  const d = await col('settings').findOne({ _id: 'main' });
  return withDefaults(d?.data);
}
export const saveSettings = data => col('settings').replaceOne({ _id: 'main' }, { _id: 'main', data }, { upsert: true });

export async function getAdmin() {
  return (await col('admin').findOne({ _id: 'main' }))?.data || null;
}
export const saveAdmin = data => col('admin').replaceOne({ _id: 'main' }, { _id: 'main', data }, { upsert: true });

export async function isSeeded() {
  return (await col('settings').countDocuments({ _id: 'main' })) > 0;
}
