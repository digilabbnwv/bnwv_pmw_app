import {
  AppShell as MantineAppShell,
  Group,
  Title,
  ActionIcon,
  useMantineColorScheme,
  Burger,
  Text,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { IconSun, IconMoon, IconLogout, IconFolder } from '@tabler/icons-react'
import { supabase } from '../../lib/supabaseClient'
import { useNavigate } from 'react-router-dom'
import Sidebar from './Sidebar'
import NotificationBell from '../notifications/NotificationBell'

export default function AppShellLayout({ children }) {
  const [opened, { toggle }] = useDisclosure()
  const { colorScheme, toggleColorScheme } = useMantineColorScheme()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <MantineAppShell
      header={{ height: 60 }}
      navbar={{ width: 260, breakpoint: 'sm', collapsed: { mobile: !opened } }}
      padding="md"
    >
      <MantineAppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
            <Group
              gap="xs"
              style={{ cursor: 'pointer' }}
              onClick={() => navigate('/')}
            >
              <IconFolder size={24} color="var(--mantine-color-brand-5)" />
              <Title order={3} style={{ letterSpacing: '-0.5px' }}>
                PMW
              </Title>
              <Text c="dimmed" size="sm" visibleFrom="sm">
                Projectmatig Werken
              </Text>
            </Group>
          </Group>
          <Group gap="sm">
            <NotificationBell />
            <ActionIcon
              variant="default"
              size="lg"
              onClick={toggleColorScheme}
              aria-label="Wissel thema"
            >
              {colorScheme === 'dark' ? <IconSun size={18} /> : <IconMoon size={18} />}
            </ActionIcon>
            <ActionIcon
              variant="default"
              size="lg"
              onClick={handleLogout}
              aria-label="Uitloggen"
            >
              <IconLogout size={18} />
            </ActionIcon>
          </Group>
        </Group>
      </MantineAppShell.Header>

      <MantineAppShell.Navbar p="md">
        <Sidebar />
      </MantineAppShell.Navbar>

      <MantineAppShell.Main>{children}</MantineAppShell.Main>
    </MantineAppShell>
  )
}
