import { useState, useEffect } from 'react'
import { NavLink, Stack, Divider, Text, Group, Badge, Box } from '@mantine/core'
import {
  IconDashboard,
  IconFolders,
  IconUsers,
  IconSettings,
  IconFolder,
} from '@tabler/icons-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import EmployeeAvatar from '../common/EmployeeAvatar'

const navItems = [
  { label: 'Dashboard', icon: IconDashboard, path: '/' },
  { label: 'Alle Projecten', icon: IconFolders, path: '/projects' },
  { label: 'Medewerkers', icon: IconUsers, path: '/medewerkers' },
  { label: 'Instellingen', icon: IconSettings, path: '/settings' },
]

export default function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const [recentProjects, setRecentProjects] = useState([])
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    const fetch = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const [profileRes, projectsRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase
          .from('projects')
          .select('id, name, current_phase')
          .order('updated_at', { ascending: false })
          .limit(5),
      ])

      setProfile(profileRes.data)
      setRecentProjects(projectsRes.data || [])
    }
    fetch()
  }, [])

  const ROLE_LABELS = {
    projectleider: 'Projectleider',
    projectlid: 'Projectlid',
    manager: 'Manager',
  }

  return (
    <Stack gap={0} justify="space-between" style={{ height: '100%' }}>
      <div>
        <Stack gap={0}>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              label={item.label}
              leftSection={<item.icon size={20} stroke={1.5} />}
              active={
                item.path === '/'
                  ? location.pathname === '/'
                  : location.pathname.startsWith(item.path)
              }
              onClick={() => navigate(item.path)}
            />
          ))}
        </Stack>

        {recentProjects.length > 0 && (
          <>
            <Divider my="sm" />
            <Text size="xs" c="dimmed" fw={600} tt="uppercase" px="sm" mb={4}>
              Recente projecten
            </Text>
            <Stack gap={0}>
              {recentProjects.map((p) => (
                <NavLink
                  key={p.id}
                  label={p.name}
                  leftSection={<IconFolder size={16} stroke={1.5} />}
                  active={location.pathname === `/projects/${p.id}`}
                  onClick={() => navigate(`/projects/${p.id}`)}
                  styles={{ label: { fontSize: 13 } }}
                />
              ))}
            </Stack>
          </>
        )}
      </div>

      {profile && (
        <Box p="sm" style={{ borderTop: '1px solid var(--mantine-color-default-border)' }}>
          <Group gap="sm">
            <EmployeeAvatar profile={profile} size="sm" />
            <div style={{ flex: 1, minWidth: 0 }}>
              <Text size="sm" fw={500} lineClamp={1}>
                {profile.full_name || 'Gebruiker'}
              </Text>
              {profile.role && (
                <Badge size="xs" variant="light" color="brand">
                  {ROLE_LABELS[profile.role] || profile.role}
                </Badge>
              )}
            </div>
          </Group>
        </Box>
      )}
    </Stack>
  )
}
