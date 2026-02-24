import { render, screen } from '@testing-library/react'
import { MantineProvider } from '@mantine/core'
import { MemoryRouter } from 'react-router-dom'
import DocumentsTile from '../../components/dashboard/DocumentsTile'

const wrapper = ({ children }) => (
  <MantineProvider>
    <MemoryRouter>{children}</MemoryRouter>
  </MantineProvider>
)

describe('DocumentsTile', () => {
  it('shows empty state when no expiring documents', () => {
    render(<DocumentsTile projects={[]} />, { wrapper })
    expect(
      screen.getByText('Er zijn geen documenten die binnenkort verlopen.')
    ).toBeInTheDocument()
  })

  it('shows expiring projects', () => {
    const soon = new Date()
    soon.setDate(soon.getDate() + 10)
    const projects = [
      { id: '1', name: 'Bijna Verlopen', status: 'In uitvoering', end_date: soon.toISOString() },
    ]
    render(<DocumentsTile projects={projects} />, { wrapper })
    expect(screen.getByText('Bijna Verlopen')).toBeInTheDocument()
  })

  it('does not show projects far in the future', () => {
    const far = new Date()
    far.setDate(far.getDate() + 90)
    const projects = [
      { id: '1', name: 'Nog ver weg', status: 'In uitvoering', end_date: far.toISOString() },
    ]
    render(<DocumentsTile projects={projects} />, { wrapper })
    expect(screen.queryByText('Nog ver weg')).not.toBeInTheDocument()
    expect(
      screen.getByText('Er zijn geen documenten die binnenkort verlopen.')
    ).toBeInTheDocument()
  })
})
