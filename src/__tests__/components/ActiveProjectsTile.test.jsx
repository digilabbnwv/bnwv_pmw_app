import { render, screen } from '@testing-library/react'
import { MantineProvider } from '@mantine/core'
import { MemoryRouter } from 'react-router-dom'
import ActiveProjectsTile from '../../components/dashboard/ActiveProjectsTile'

const wrapper = ({ children }) => (
  <MantineProvider>
    <MemoryRouter>{children}</MemoryRouter>
  </MantineProvider>
)

describe('ActiveProjectsTile', () => {
  it('shows empty state when no active projects', () => {
    render(<ActiveProjectsTile projects={[]} />, { wrapper })
    expect(screen.getByText('Er zijn geen actieve projecten.')).toBeInTheDocument()
  })

  it('shows active projects', () => {
    const projects = [
      { id: '1', name: 'Project Alpha', status: 'In uitvoering', current_phase: 'realisatie', end_date: '2026-06-01' },
      { id: '2', name: 'Project Beta', status: 'In opstart', current_phase: 'definitie', end_date: null },
    ]
    render(<ActiveProjectsTile projects={projects} />, { wrapper })
    expect(screen.getByText('Project Alpha')).toBeInTheDocument()
    expect(screen.getByText('Project Beta')).toBeInTheDocument()
  })

  it('excludes finished projects', () => {
    const projects = [
      { id: '1', name: 'Actief', status: 'In uitvoering', current_phase: 'realisatie' },
      { id: '2', name: 'Klaar', status: 'Afgerond', current_phase: 'afgerond' },
      { id: '3', name: 'Archief', status: 'Gearchiveerd', current_phase: 'afgerond' },
    ]
    render(<ActiveProjectsTile projects={projects} />, { wrapper })
    expect(screen.getByText('Actief')).toBeInTheDocument()
    expect(screen.queryByText('Klaar')).not.toBeInTheDocument()
    expect(screen.queryByText('Archief')).not.toBeInTheDocument()
  })

  it('shows max 5 projects', () => {
    const projects = Array.from({ length: 8 }, (_, i) => ({
      id: String(i),
      name: `Project ${i}`,
      status: 'In uitvoering',
      current_phase: 'realisatie',
    }))
    render(<ActiveProjectsTile projects={projects} />, { wrapper })
    expect(screen.getByText('Project 0')).toBeInTheDocument()
    expect(screen.getByText('Project 4')).toBeInTheDocument()
    expect(screen.queryByText('Project 5')).not.toBeInTheDocument()
  })

  it('shows link to all projects', () => {
    render(<ActiveProjectsTile projects={[]} />, { wrapper })
    expect(screen.getByText('Alle projecten bekijken')).toBeInTheDocument()
  })
})
