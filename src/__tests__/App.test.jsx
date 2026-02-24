import { render, screen } from '@testing-library/react'
import { MantineProvider } from '@mantine/core'
import App from '../App'

describe('App', () => {
  it('renders the app title', () => {
    render(
      <MantineProvider>
        <App />
      </MantineProvider>
    )
    expect(screen.getByText('BNWV Projectbeheer')).toBeInTheDocument()
  })
})
