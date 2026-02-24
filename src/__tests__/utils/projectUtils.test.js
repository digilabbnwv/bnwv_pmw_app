import {
  getActiveProjects,
  getStatusColor,
  getExpiringProjects,
  countByStatus,
} from '../../lib/utils/projectUtils'

const mockProjects = [
  { id: '1', name: 'Project A', status: 'In uitvoering', end_date: null },
  { id: '2', name: 'Project B', status: 'Afgerond', end_date: '2025-01-01' },
  { id: '3', name: 'Project C', status: 'Niet gestart', end_date: null },
  { id: '4', name: 'Project D', status: 'Gearchiveerd', end_date: '2024-06-01' },
  { id: '5', name: 'Project E', status: 'In opstart', end_date: null },
]

function createExpiringProjects() {
  const soon = new Date()
  soon.setDate(soon.getDate() + 10)
  const far = new Date()
  far.setDate(far.getDate() + 60)
  return [
    { id: '1', name: 'Bijna verlopen', status: 'In uitvoering', end_date: soon.toISOString() },
    { id: '2', name: 'Nog lang', status: 'In uitvoering', end_date: far.toISOString() },
    { id: '3', name: 'Geen datum', status: 'Niet gestart', end_date: null },
  ]
}

describe('getActiveProjects', () => {
  it('filters out Afgerond and Gearchiveerd projects', () => {
    const result = getActiveProjects(mockProjects)
    expect(result).toHaveLength(3)
    expect(result.map((p) => p.name)).toEqual(['Project A', 'Project C', 'Project E'])
  })

  it('returns empty array when all projects are finished', () => {
    const finished = [
      { id: '1', status: 'Afgerond' },
      { id: '2', status: 'Gearchiveerd' },
    ]
    expect(getActiveProjects(finished)).toHaveLength(0)
  })

  it('returns all when no projects are finished', () => {
    const active = [
      { id: '1', status: 'In uitvoering' },
      { id: '2', status: 'In opstart' },
    ]
    expect(getActiveProjects(active)).toHaveLength(2)
  })
})

describe('getStatusColor', () => {
  it('returns correct colors for each status', () => {
    expect(getStatusColor('Niet gestart')).toBe('gray')
    expect(getStatusColor('In opstart')).toBe('blue')
    expect(getStatusColor('In uitvoering')).toBe('brand')
    expect(getStatusColor('In afronding')).toBe('yellow')
    expect(getStatusColor('Afgerond')).toBe('green')
    expect(getStatusColor('Gearchiveerd')).toBe('gray.4')
  })

  it('returns gray for unknown status', () => {
    expect(getStatusColor('Onbekend')).toBe('gray')
  })
})

describe('getExpiringProjects', () => {
  it('returns projects expiring within 30 days', () => {
    const projects = createExpiringProjects()
    const result = getExpiringProjects(projects)
    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('Bijna verlopen')
  })

  it('returns empty array when no projects are expiring', () => {
    const far = new Date()
    far.setDate(far.getDate() + 60)
    const projects = [{ id: '1', status: 'In uitvoering', end_date: far.toISOString() }]
    expect(getExpiringProjects(projects)).toHaveLength(0)
  })

  it('respects custom days parameter', () => {
    const projects = createExpiringProjects()
    expect(getExpiringProjects(projects, 5)).toHaveLength(0)
    expect(getExpiringProjects(projects, 90)).toHaveLength(2)
  })
})

describe('countByStatus', () => {
  it('counts projects per status', () => {
    const result = countByStatus(mockProjects)
    const inUitvoering = result.find((r) => r.name === 'In uitvoering')
    expect(inUitvoering.value).toBe(1)
    const afgerond = result.find((r) => r.name === 'Afgerond')
    expect(afgerond.value).toBe(1)
  })

  it('includes color for each status', () => {
    const result = countByStatus(mockProjects)
    const inOpstart = result.find((r) => r.name === 'In opstart')
    expect(inOpstart.color).toBe('blue')
  })

  it('returns empty array for empty input', () => {
    expect(countByStatus([])).toHaveLength(0)
  })

  it('counts multiple projects with same status', () => {
    const projects = [
      { id: '1', status: 'In uitvoering' },
      { id: '2', status: 'In uitvoering' },
      { id: '3', status: 'Afgerond' },
    ]
    const result = countByStatus(projects)
    const inUitvoering = result.find((r) => r.name === 'In uitvoering')
    expect(inUitvoering.value).toBe(2)
  })
})
