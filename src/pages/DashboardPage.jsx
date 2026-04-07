import { useState, useEffect } from 'react'
import {
  Title,
  SimpleGrid,
  Skeleton,
  Group,
  Button,
  Text,
  Paper,
  Stack,
  ThemeIcon,
} from '@mantine/core'
import { IconPlus, IconChecklist, IconRocket } from '@tabler/icons-react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import ActiveProjectsTile from '../components/dashboard/ActiveProjectsTile'
import DocumentsTile from '../components/dashboard/DocumentsTile'
import PhaseChartTile from '../components/dashboard/PhaseChartTile'
import MyTasksTile from '../components/dashboard/MyTasksTile'
import RecentActivityTile from '../components/dashboard/RecentActivityTile'

export default function DashboardPage() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [userName, setUserName] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const fetchData = async () => {
      const [projectsRes, userRes] = await Promise.all([
        supabase.from('projects').select('*'),
        supabase.auth.getUser(),
      ])

      setProjects(projectsRes.data || [])

      if (userRes.data?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', userRes.data.user.id)
          .single()

        setUserName(profile?.full_name || '')
      }

      setLoading(false)
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <Stack gap="lg">
        <Skeleton height={80} radius="md" />
        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
          <Skeleton height={250} radius="md" />
          <Skeleton height={250} radius="md" />
          <Skeleton height={250} radius="md" />
          <Skeleton height={250} radius="md" />
        </SimpleGrid>
      </Stack>
    )
  }

  return (
    <Stack gap="lg">
      {/* Welcome header */}
      <Paper p="xl" radius="md" style={{ backgroundColor: 'light-dark(var(--mantine-color-beige-1), var(--mantine-color-dark-7))' }}>
        <Group justify="space-between" wrap="wrap">
          <div>
            <Group gap="sm" mb={4}>
              <ThemeIcon size="lg" radius="md" color="brand" variant="light">
                <IconRocket size={20} />
              </ThemeIcon>
              <Title order={2}>
                {userName ? `Welkom, ${userName.split(' ')[0]}` : 'Dashboard'}
              </Title>
            </Group>
            <Text c="dimmed" size="sm">
              {projects.length} project{projects.length !== 1 ? 'en' : ''} in beheer
            </Text>
          </div>
          <Group>
            <Button
              variant="light"
              leftSection={<IconChecklist size={16} />}
              onClick={() => navigate('/projects')}
            >
              Alle projecten
            </Button>
            <Button
              leftSection={<IconPlus size={16} />}
              onClick={() => navigate('/projects/new')}
            >
              Nieuw project
            </Button>
          </Group>
        </Group>
      </Paper>

      {/* Main grid */}
      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
        <ActiveProjectsTile projects={projects} />
        <MyTasksTile />
        <PhaseChartTile projects={projects} />
        <DocumentsTile projects={projects} />
      </SimpleGrid>

      {/* Bottom: activity */}
      <RecentActivityTile />
    </Stack>
  )
}
