/**
 * Controleert of een datum binnen het opgegeven aantal dagen valt.
 */
export function isExpiringSoon(date, days = 30) {
  if (!date) return false
  const target = new Date(date)
  const now = new Date()
  const diffMs = target.getTime() - now.getTime()
  const diffDays = diffMs / (1000 * 60 * 60 * 24)
  return diffDays >= 0 && diffDays <= days
}

/**
 * Formatteert een datum naar DD-MM-YYYY (Nederlandse notatie).
 */
export function formatDate(date) {
  if (!date) return ''
  const d = new Date(date)
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  return `${day}-${month}-${year}`
}

/**
 * Geeft een einddatum die 1 jaar na de startdatum ligt.
 */
export function defaultEndDate(startDate) {
  if (!startDate) return null
  const d = new Date(startDate)
  d.setFullYear(d.getFullYear() + 1)
  return d
}
