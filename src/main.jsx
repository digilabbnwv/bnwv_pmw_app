import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { MantineProvider, createTheme } from '@mantine/core'
import '@mantine/core/styles.css'
import '@mantine/notifications/styles.css'
import '@mantine/charts/styles.css'
import '@mantine/dates/styles.css'
import App from './App.jsx'

const theme = createTheme({
  primaryColor: 'brand',
  colors: {
    brand: [
      '#fff1e6',
      '#ffe0cc',
      '#ffc299',
      '#ffa366',
      '#ff8533',
      '#F06418',
      '#cc5214',
      '#993d0f',
      '#66290a',
      '#331405',
    ],
  },
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <MantineProvider theme={theme} defaultColorScheme="light">
      <App />
    </MantineProvider>
  </StrictMode>
)
