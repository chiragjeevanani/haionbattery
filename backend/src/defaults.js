// Starter content for the site's editable settings. Used by the seed and merged under saved
// settings on every load, so a setting added in a later version always has a value.
const img = id => `/assets/img/photo-${id}-960.jpg`;

export const PHOTO = {
  bank: '/assets/img/photo-f78835636-1280.jpg',
  terminal: img('f78835637'),
  evPack: img('f23083583'),
  storage: img('f159414990'),
  rickshaw: img('f71573466'),
  bms: img('f112489495'),
  solar: img('f123189212'),
};

export const DEFAULT_SETTINGS = {
  siteName: 'Aexto',
  tagline: 'Inspiring Innovation',
  phone: '+91 00000 00000',
  whatsappNumber: '910000000000',
  whatsappProductMessage: 'Hello Aexto, I would like a quote for {product}.',
  whatsappGeneralMessage: 'Hello Aexto, I would like a quote for a vehicle battery.',
  email: '',
  address: '',
  hours: '',
  social: { instagram: '', facebook: '', youtube: '', linkedin: '' },
  hero: {
    headline: 'Batteries for electric vehicles',
    lead: 'LiFePO4 and NMC battery packs from 12 V to 72 V for e-bikes, e-rickshaws, scooters and solar storage, made to your voltage, capacity and size.',
    image: PHOTO.bank,
    imageAlt: 'A bank of yellow LiFePO4 cells joined by aluminium busbars',
  },
  statement: {
    heading: 'Built around the vehicle.',
    text: 'Voltage, current, size and BMS are set by what you ride, not by what is on a shelf.',
  },
  process: {
    heading: 'How a pack is made',
    steps: [
      { title: 'Choose the cells', text: 'LiFePO4 or NMC, picked for the current the vehicle draws and the range it needs.', image: PHOTO.terminal, imageAlt: 'Copper terminals and bolted busbars on LiFePO4 cells' },
      { title: 'Fit the BMS', text: 'A battery management board guards every cell against over-charge, over-discharge, short circuit and heat.', image: PHOTO.bms, imageAlt: 'Two green BMS circuit boards beside a ruler' },
      { title: 'Build it to the vehicle', text: 'The pack is assembled to the tray, the connectors and the controller it will meet.', image: PHOTO.evPack, imageAlt: 'An open EV battery pack with cells, busbars and wiring' },
    ],
  },
  custom: {
    heading: 'Custom battery packs',
    text: 'Tell us the voltage, capacity, peak current and the space in your vehicle. We choose the cells and the BMS and quote a pack that fits.',
    image: PHOTO.evPack,
    imageAlt: 'An open EV battery pack with cells, busbars and wiring',
  },
  closing: {
    image: PHOTO.storage,
    imageAlt: 'Rows of white battery storage containers beside a solar field',
  },
  about: {
    heading: 'About Aexto',
    body: 'Aexto designs and assembles lithium battery packs for electric vehicles and energy storage.\n\nEach pack is built around a choice of cells and a battery management system that suits the vehicle.',
    image: PHOTO.terminal,
    imageAlt: 'Copper and aluminium terminals on LiFePO4 cells',
  },
  footerLede: 'Lithium battery packs for electric vehicles and solar storage.',
  seo: {
    title: 'Aexto: lithium batteries for electric vehicles',
    description: 'LiFePO4 and NMC battery packs for e-bikes, e-rickshaws, scooters and solar storage, made to your voltage and size.',
  },
};

/** Saved values win; anything missing falls back to the default. Arrays and strings are taken as saved. */
export function withDefaults(saved, base = DEFAULT_SETTINGS) {
  const out = {};
  for (const key of Object.keys(base)) {
    const b = base[key];
    const s = saved?.[key];
    if (b && typeof b === 'object' && !Array.isArray(b)) out[key] = withDefaults(s && typeof s === 'object' ? s : {}, b);
    else out[key] = s === undefined || s === null ? b : s;
  }
  return out;
}
