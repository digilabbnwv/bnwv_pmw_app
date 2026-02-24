import { isExpiringSoon } from './dateUtils'

const STATUS_COLORS = {
  'Niet gestart': 'gray',
  'In opstart': 'blue',
  'In uitvoering': 'brand',
  'In afronding': 'yellow',
  Afgerond: 'green',
  Gearchiveerd: 'gray.4',
}

/**
 * Filtert projecten met status Afgerond en Gearchiveerd eruit.
 */
export function getActiveProjects(projects) {
  return projects.filter((p) => p.status !== 'Afgerond' && p.status !== 'Gearchiveerd')
}

/**
 * Geeft de Mantine kleurstring voor een projectstatus.
 */
export function getStatusColor(status) {
  return STATUS_COLORS[status] || 'gray'
}

/**
 * Geeft projecten waarvan end_date binnen het opgegeven aantal dagen valt.
 */
export function getExpiringProjects(projects, days = 30) {
  return projects.filter((p) => isExpiringSoon(p.end_date, days))
}

/**
 * Telt projecten per status voor gebruik in een PieChart.
 */
export function countByStatus(projects) {
  const counts = {}
  for (const p of projects) {
    counts[p.status] = (counts[p.status] || 0) + 1
  }
  return Object.entries(counts).map(([name, value]) => ({
    name,
    value,
    color: getStatusColor(name),
  }))
}
