import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { dbExists, save } from './db.js';
import { uid } from './utils.js';
import { DEFAULT_SETTINGS, PHOTO } from './defaults.js';

const force = process.argv.includes('--force');
if (dbExists() && !force) {
  console.log('Database already exists. Use "npm run seed" to reset it (this erases all data).');
  process.exit(0);
}


const cat = (slug, name, description, image, sortOrder) => ({ id: uid(), slug, name, description, image, sortOrder });
const categories = [
  cat('car-batteries', 'Car batteries', 'LiFePO4 and NMC packs for electric cars and car conversions, built to the voltage your motor and controller need.', PHOTO.evPack, 1),
  cat('scooter-batteries', 'Bike and scooter batteries', 'High-discharge packs for electric motorbikes and scooters, 48 V to 72 V.', PHOTO.terminal, 2),
  cat('e-bike-batteries', 'E-bike batteries', 'NMC and LiFePO4 packs for e-bikes and e-cycles, with a matching charger.', PHOTO.bank, 3),
  cat('e-rickshaw-batteries', 'E-rickshaw and loader batteries', 'LiFePO4 packs for passenger and cargo e-rickshaws and loaders, sized to the existing tray.', PHOTO.rickshaw, 4),
  cat('solar-inverter-batteries', 'Solar and inverter batteries', 'LiFePO4 storage for homes, shops and solar systems.', PHOTO.storage, 5),
  cat('bms-and-parts', 'BMS and parts', 'Battery management boards, balancers and pack hardware.', PHOTO.bms, 6),
];
const c = slug => categories.find(x => x.slug === slug).id;

const prod = (slug, name, category, shortDescription, description, images, specs, extra = {}) => ({
  id: uid(), slug, name, categoryId: c(category), shortDescription, description, images,
  specs, price: null, mrp: null, featured: false, active: true, inStock: true, sortOrder: 0,
  createdAt: new Date().toISOString(), ...extra,
});

const products = [
  prod('nmc-96v-100ah-car-pack', 'NMC car battery pack', 'car-batteries',
    'Energy-dense pack for electric cars and conversions.',
    'An NMC pack for electric cars and car conversions. Cylindrical cells in a rigid case, with a BMS that reports cell voltages and temperature. Built to the voltage and the space of your vehicle.',
    [PHOTO.evPack, PHOTO.terminal],
    [{ label: 'Chemistry', value: 'NMC' }, { label: 'Nominal voltage', value: '96 V' }, { label: 'Capacity', value: '100 Ah' }, { label: 'Protection', value: 'Smart BMS' }, { label: 'Vehicle', value: 'Electric car, conversion' }],
    { featured: true, sortOrder: 0 }),
  prod('lifepo4-72v-120ah-car-pack', 'LiFePO4 car battery pack', 'car-batteries',
    'Long-life pack for cars that charge every day.',
    'A LiFePO4 pack for electric cars, taxis and conversions that charge every day. Prismatic cells on copper busbars with a BMS, built to your voltage and fit.',
    [PHOTO.bank, PHOTO.evPack],
    [{ label: 'Chemistry', value: 'LiFePO4' }, { label: 'Nominal voltage', value: '72 V' }, { label: 'Capacity', value: '120 Ah' }, { label: 'Cell format', value: 'Prismatic' }, { label: 'Vehicle', value: 'Electric car, taxi' }],
    { sortOrder: 0 }),
  prod('lifepo4-60v-30ah-e-rickshaw-pack', 'LiFePO4 e-rickshaw pack', 'e-rickshaw-batteries',
    'Drop-in pack for passenger e-rickshaws, with a smart BMS.',
    'A LiFePO4 pack for passenger e-rickshaws. It replaces a lead-acid set in the same tray, weighs a fraction of it and holds its capacity through daily deep cycles. The BMS protects against over-charge, over-discharge, short circuit and over-temperature.',
    [PHOTO.rickshaw, PHOTO.bank],
    [{ label: 'Chemistry', value: 'LiFePO4' }, { label: 'Nominal voltage', value: '60 V' }, { label: 'Capacity', value: '30 Ah' }, { label: 'Protection', value: 'Smart BMS' }, { label: 'Vehicle', value: 'E-rickshaw' }],
    { featured: true, sortOrder: 1 }),
  prod('lifepo4-48v-40ah-e-rickshaw-pack', 'LiFePO4 e-rickshaw loader pack', 'e-rickshaw-batteries',
    'A longer-range pack for cargo and passenger loaders.',
    'A 48 V LiFePO4 pack for loaders and passenger e-rickshaws that run long shifts. Built from prismatic cells with copper busbars and a BMS rated for the controller current.',
    [PHOTO.bank, PHOTO.terminal],
    [{ label: 'Chemistry', value: 'LiFePO4' }, { label: 'Nominal voltage', value: '48 V' }, { label: 'Capacity', value: '40 Ah' }, { label: 'Cell format', value: 'Prismatic' }, { label: 'Vehicle', value: 'E-rickshaw, loader' }],
    { sortOrder: 2 }),
  prod('nmc-48v-24ah-e-bike-pack', 'NMC e-bike pack', 'e-bike-batteries',
    'A compact pack for e-bikes with a hub or mid-drive motor.',
    'An NMC pack for e-bikes and e-cycles. Cylindrical cells in a rigid case, a BMS with charge and discharge protection, and a connector matched to your controller.',
    [PHOTO.bank, PHOTO.terminal],
    [{ label: 'Chemistry', value: 'NMC' }, { label: 'Nominal voltage', value: '48 V' }, { label: 'Capacity', value: '24 Ah' }, { label: 'Cell format', value: 'Cylindrical' }, { label: 'Vehicle', value: 'E-bike' }],
    { featured: true, sortOrder: 3 }),
  prod('lifepo4-51v-30ah-e-bike-pack', 'LiFePO4 e-bike pack', 'e-bike-batteries',
    'LiFePO4 pack for e-bikes that need long cycle life.',
    'A 16-cell LiFePO4 pack for e-bikes and cargo cycles. Lower energy density than NMC, but far more charge cycles and better heat tolerance.',
    [PHOTO.solar, PHOTO.terminal],
    [{ label: 'Chemistry', value: 'LiFePO4' }, { label: 'Nominal voltage', value: '51.2 V' }, { label: 'Capacity', value: '30 Ah' }, { label: 'Vehicle', value: 'E-bike, cargo cycle' }],
    { sortOrder: 4 }),
  prod('nmc-72v-30ah-scooter-pack', 'NMC scooter pack', 'scooter-batteries',
    'High-discharge pack for electric motorbikes and scooters.',
    'A high-discharge NMC pack for electric motorbikes and scooters. Sized for 72 V controllers, with a BMS rated for the peak current of the motor.',
    [PHOTO.terminal, PHOTO.evPack],
    [{ label: 'Chemistry', value: 'NMC' }, { label: 'Nominal voltage', value: '72 V' }, { label: 'Capacity', value: '30 Ah' }, { label: 'Discharge', value: 'High-current BMS' }, { label: 'Vehicle', value: 'Scooter, motorcycle' }],
    { featured: true, sortOrder: 5 }),
  prod('lifepo4-51v-100ah-storage-rack', 'LiFePO4 storage battery', 'solar-inverter-batteries',
    'Rack battery for home solar and shop backup.',
    'A 16-cell LiFePO4 storage battery for solar systems and backup. It works with 48 V inverters, reports state of charge over its communication port and can be paralleled for more capacity.',
    [PHOTO.storage, PHOTO.solar, PHOTO.bank],
    [{ label: 'Chemistry', value: 'LiFePO4' }, { label: 'Nominal voltage', value: '51.2 V' }, { label: 'Capacity', value: '100 Ah' }, { label: 'Communication', value: 'RS485 / CAN' }, { label: 'Use', value: 'Solar storage, backup' }],
    { featured: true, sortOrder: 6 }),
  prod('lifepo4-12v-100ah-inverter-battery', 'LiFePO4 inverter battery', 'solar-inverter-batteries',
    'Replaces a lead-acid inverter battery in the same space.',
    'A 12.8 V LiFePO4 battery for home inverters and small solar setups. Built-in BMS, no water top-ups and no acid fumes.',
    [PHOTO.solar, PHOTO.storage],
    [{ label: 'Chemistry', value: 'LiFePO4' }, { label: 'Nominal voltage', value: '12.8 V' }, { label: 'Capacity', value: '100 Ah' }, { label: 'Use', value: 'Home inverter' }],
    { sortOrder: 7 }),
  prod('smart-bms-16s-100a', 'Smart BMS for 16-cell packs', 'bms-and-parts',
    'Battery management board for 16-cell LiFePO4 packs.',
    'A 16-series BMS for 51.2 V LiFePO4 packs, with cell balancing, temperature sensing and a communication port for monitoring.',
    [PHOTO.bms],
    [{ label: 'Cells in series', value: '16S' }, { label: 'Continuous current', value: '100 A' }, { label: 'Chemistry', value: 'LiFePO4' }, { label: 'Communication', value: 'UART / RS485' }],
    { sortOrder: 8 }),
];

const faqs = [
  { id: uid(), question: 'Can you build a pack to my voltage and size?', answer: 'Yes. Send the voltage, capacity, peak current and the space you have, and we quote a pack made to those figures.', sortOrder: 1 },
  { id: uid(), question: 'LiFePO4 or NMC: which do I need?', answer: 'LiFePO4 lasts more charge cycles and handles heat better. NMC is lighter for the same range. We recommend one after hearing how the vehicle is used.', sortOrder: 2 },
  { id: uid(), question: 'Does every pack have a BMS?', answer: 'Yes. Each pack has a battery management system that guards against over-charge, over-discharge, short circuit and over-temperature.', sortOrder: 3 },
  { id: uid(), question: 'How do I get a price?', answer: 'Press Get a quote on any product, or message us on WhatsApp. Tell us the vehicle and we reply with a price.', sortOrder: 4 },
];

const adminEmail = (process.env.ADMIN_EMAIL || 'admin@aexto.com').toLowerCase();
const adminPassword = process.env.ADMIN_PASSWORD || 'Aexto@12345';

const db = {
  admin: { email: adminEmail, passwordHash: bcrypt.hashSync(adminPassword, 10) },
  settings: DEFAULT_SETTINGS,
  categories,
  products,
  brands: [],
  faqs,
  enquiries: [],
};

save(db);
console.log('Database created.');
console.log(`  Admin sign-in: ${adminEmail}`);
console.log(`  Admin password: ${process.env.ADMIN_PASSWORD ? '(from .env)' : adminPassword}`);
console.log('  Change the password in Admin > Account after the first sign-in.');
