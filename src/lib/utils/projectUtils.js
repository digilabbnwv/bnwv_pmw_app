import { isExpiringSoon } from './dateUtils'
import { getPhaseColor as phaseColor, getPhaseLabel, PHASES } from './phaseConfig'

const STATUS_COLORS = {
  'Niet gestart': 'gray',
  'In opstart': 'blue',
  'In uitvoering': 'brand',
  'In afronding': 'yellow',
  Afgerond: 'green',
  Gearchiveerd: 'gray.4',
}

export function getActiveProjects(projects) {
  return projects.filter(
    (p) => p.status !== 'Afgerond' && p.status !== 'Gearchiveerd' && p.current_phase !== 'afgerond'
  )
}

export function getStatusColor(status) {
  return STATUS_COLORS[status] || 'gray'
}

export function getExpiringProjects(projects, days = 30) {
  return projects.filter((p) => isExpiringSoon(p.end_date, days))
}

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

export function countByPhase(projects) {
  const counts = {}
  for (const p of projects) {
    const phase = p.current_phase || 'initiatief'
    const label = phase === 'afgerond' ? 'Afgerond' : getPhaseLabel(phase)
    counts[label] = (counts[label] || 0) + 1
  }
  return Object.entries(counts).map(([name, value]) => ({
    name,
    value,
    color: name === 'Afgerond' ? 'green' : phaseColor(
      PHASES.find((p) => p.label === name)?.key || 'gray'
    ),
  }))
}

export { phaseColor as getProjectPhaseColor }
