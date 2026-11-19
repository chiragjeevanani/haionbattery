/*
  A pack is S cells in series (for the voltage) times P cells in parallel (for the capacity).
  The layout is indicative: one reference cell per chemistry and plain arithmetic.
  The final design is always confirmed with the customer.
*/
export const CHEM = {
  lfp: { label: 'LiFePO4', cellV: 3.2, cellAh: 6, cell: '32700 cell of 6 Ah' },
  nmc: { label: 'NMC', cellV: 3.7, cellAh: 5, cell: '21700 cell of 5 Ah' },
}

export const VEHICLES = [
  { id: 'car', label: 'Car', v: 96, ah: 100, chem: 'nmc' },
  { id: 'bike', label: 'Motorbike or scooter', v: 72, ah: 30, chem: 'nmc' },
  { id: 'ebike', label: 'E-bike', v: 48, ah: 15, chem: 'nmc' },
  { id: 'rickshaw', label: 'E-rickshaw', v: 48, ah: 40, chem: 'lfp' },
  { id: 'solar', label: 'Solar storage', v: 51.2, ah: 100, chem: 'lfp' },
]

export const VOLTS = [12, 24, 36, 48, 51.2, 60, 72, 96]

export function planPack({ v, ah, chem }) {
  const c = CHEM[chem]
  const s = Math.max(1, Math.round(v / c.cellV))
  const p = Math.max(1, Math.ceil(ah / c.cellAh))
  const packV = +(s * c.cellV).toFixed(1)
  const packAh = p * c.cellAh
  return { s, p, cells: s * p, packV, packAh, kwh: +((packV * packAh) / 1000).toFixed(2), chem: c }
}
