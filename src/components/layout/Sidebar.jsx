import { NavLink, Stack } from '@mantine/core'
import { IconDashboard, IconFolders, IconSettings } from '@tabler/icons-react'
import { useLocation, useNavigate } from 'react-router-dom'

const navItems = [
  { label: 'Dashboard', icon: IconDashboard, path: '/' },
  { label: 'Alle Projecten', icon: IconFolders, path: '/projects' },
  { label: 'Instellingen', icon: IconSettings, path: '/settings' },
]

export default function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <Stack gap={0} mt="md">
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          label={item.label}
          leftSection={<item.icon size={20} stroke={1.5} />}
          active={location.pathname === item.path}
          onClick={() => navigate(item.path)}
        />
      ))}
    </Stack>
  )
}
