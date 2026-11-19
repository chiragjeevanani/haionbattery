/** The three specs that sell a pack, in one line. */
export function specSummary(product) {
  const pick = label => product.specs?.find(s => s.label.toLowerCase() === label)?.value
  return [pick('nominal voltage'), pick('capacity'), pick('chemistry')].filter(Boolean).join(' · ')
}
