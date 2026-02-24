import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Notifications } from '@mantine/notifications'
import { ModalsProvider } from '@mantine/modals'
import LoginPage from './pages/LoginPage'
import SetupTOTPPage from './pages/SetupTOTPPage'
import ProtectedRoute from './components/ProtectedRoute'
import { Text, Container, Title } from '@mantine/core'

function DashboardPlaceholder() {
  return (
    <Container size="sm" py="xl">
      <Title order={1}>BNWV Projectbeheer</Title>
      <Text mt="md">Dashboard wordt gebouwd.</Text>
    </Container>
  )
}

function App() {
  return (
    <BrowserRouter basename="/bnwv_pmw_app">
      <Notifications position="top-right" />
      <ModalsProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/setup-totp" element={<SetupTOTPPage />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <Routes>
                  <Route path="/" element={<DashboardPlaceholder />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </ProtectedRoute>
            }
          />
        </Routes>
      </ModalsProvider>
    </BrowserRouter>
  )
}

export default App
