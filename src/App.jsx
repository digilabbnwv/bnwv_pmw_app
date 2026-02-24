import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Notifications } from '@mantine/notifications'
import { ModalsProvider } from '@mantine/modals'
import LoginPage from './pages/LoginPage'
import SetupTOTPPage from './pages/SetupTOTPPage'
import DashboardPage from './pages/DashboardPage'
import AllProjectsPage from './pages/AllProjectsPage'
import ProjectDetailPage from './pages/ProjectDetailPage'
import ProjectFormPage from './pages/ProjectFormPage'
import SettingsPage from './pages/SettingsPage'
import ProtectedRoute from './components/ProtectedRoute'
import AppShellLayout from './components/layout/AppShell'

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
                <AppShellLayout>
                  <Routes>
                    <Route path="/" element={<DashboardPage />} />
                    <Route path="/projects" element={<AllProjectsPage />} />
                    <Route path="/projects/new" element={<ProjectFormPage />} />
                    <Route path="/projects/:id" element={<ProjectDetailPage />} />
                    <Route path="/projects/:id/edit" element={<ProjectFormPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </AppShellLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </ModalsProvider>
    </BrowserRouter>
  )
}

export default App
