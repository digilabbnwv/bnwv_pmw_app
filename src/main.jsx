import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { MantineProvider, createTheme } from '@mantine/core'
import '@mantine/core/styles.css'
import '@mantine/notifications/styles.css'
import '@mantine/charts/styles.css'
import '@mantine/dates/styles.css'
import App from './App.jsx'
import './global.css'

const theme = createTheme({
  primaryColor: 'brand',
  primaryShade: 5,
  colors: {
    brand: [
      '#fff4e6',
      '#ffe8cc',
      '#ffd8a8',
      '#ffc078',
      '#ffa94d',
      '#ec7404',
      '#d56a03',
      '#b85a03',
      '#994a02',
      '#7a3b02',
    ],
    antraciet: [
      '#f5f5f5',
      '#e0e0e0',
      '#c0bfc0',
      '#a09fa0',
      '#807f80',
      '#605f60',
      '#504f50',
      '#39373a',
      '#2a292b',
      '#1a191b',
    ],
    beige: [
      '#fffcfa',
      '#fef6ee',
      '#fde5d0',
      '#fbd5b5',
      '#f8c49a',
      '#f5b380',
      '#d49a6e',
      '#b3815c',
      '#92684a',
      '#714f38',
    ],
    ontmoet: [
      '#e6f7f3',
      '#b3e8db',
      '#80d9c3',
      '#4dcaab',
      '#26be98',
      '#009876',
      '#008a6b',
      '#00785d',
      '#00664f',
      '#005441',
    ],
    leer: [
      '#e6f6fd',
      '#b3e5f9',
      '#80d4f5',
      '#4dc3f1',
      '#26b6ed',
      '#00B6ED',
      '#009fd4',
      '#0088b8',
      '#00719c',
      '#005a80',
    ],
    lees: [
      '#fff5e6',
      '#ffe2b8',
      '#ffcf8a',
      '#ffbc5c',
      '#ffad3e',
      '#FF9E25',
      '#e68e21',
      '#cc7e1d',
      '#b36e19',
      '#995e15',
    ],
    vraag: [
      '#ebeef4',
      '#c7cfdf',
      '#a3b0ca',
      '#7f91b5',
      '#6480ab',
      '#426DB1',
      '#3b62a0',
      '#34568d',
      '#2d4a7a',
      '#263e67',
    ],
    doe: [
      '#fceaee',
      '#f6c5ce',
      '#f0a0ae',
      '#ea7b8e',
      '#e55f7a',
      '#DE4668',
      '#c83f5e',
      '#b23853',
      '#9c3148',
      '#862a3d',
    ],
  },
  defaultRadius: 'md',
  fontFamily: '"Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  headings: {
    fontFamily: '"Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontWeight: '700',
  },
  other: {
    antracietHex: '#39373a',
    beigeHex: '#fde5d0',
    orangeHex: '#ec7404',
  },
  components: {
    Paper: {
      defaultProps: {
        shadow: 'none',
      },
    },
    Button: {
      defaultProps: {
        radius: 'md',
      },
    },
    ActionIcon: {
      defaultProps: {
        radius: 'md',
      },
    },
    Title: {
      styles: {
        root: {
          letterSpacing: '-0.02em',
        },
      },
    },
  },
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <MantineProvider theme={theme} defaultColorScheme="light">
      <App />
    </MantineProvider>
  </StrictMode>
)
