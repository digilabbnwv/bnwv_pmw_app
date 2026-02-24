import { render, screen } from '@testing-library/react'
import { MantineProvider } from '@mantine/core'
import StatusChartTile from '../../components/dashboard/StatusChartTile'

const wrapper = ({ children }) => <MantineProvider>{children}</MantineProvider>

describe('StatusChartTile', () => {
  it('shows empty state when no projects', () => {
    render(<StatusChartTile projects={[]} />, { wrapper })
    expect(screen.getByText('Er zijn geen projecten om weer te geven.')).toBeInTheDocument()
  })

  it('renders chart when projects exist', () => {
    const projects = [
      { id: '1', status: 'In uitvoering' },
      { id: '2', status: 'Afgerond' },
      { id: '3', status: 'In uitvoering' },
    ]
    render(<StatusChartTile projects={projects} />, { wrapper })
    expect(screen.getByText('Statusverdeling')).toBeInTheDocument()
    expect(
      screen.queryByText('Er zijn geen projecten om weer te geven.')
    ).not.toBeInTheDocument()
  })
})
