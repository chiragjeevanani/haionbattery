const find = (product, labels) => product.specs?.find(s => labels.includes(s.label.toLowerCase()))?.value

/** The two figures set large on a card: voltage and capacity, or the nearest equivalents (a BMS: cells and current). */
export function headlineSpecs(product) {
  const a = find(product, ['nominal voltage', 'voltage', 'cells in series']) || product.specs?.[0]?.value || ''
  const b = find(product, ['capacity', 'continuous current']) || product.specs?.[1]?.value || ''
  return [a, b]
}

/** The three specs that sell a pack, in one line. */
export function specSummary(product) {
  const pick = label => product.specs?.find(s => s.label.toLowerCase() === label)?.value
  return [pick('nominal voltage'), pick('capacity'), pick('chemistry')].filter(Boolean).join(' · ')
}
