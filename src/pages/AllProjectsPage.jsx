import { useState, useEffect } from 'react'
import {
  Title,
  Group,
  Button,
  TextInput,
  Select,
  Stack,
  Skeleton,
  Text,
} from '@mantine/core'
import { IconPlus, IconSearch } from '@tabler/icons-react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import ProjectCard from '../components/projects/ProjectCard'

const STATUS_OPTIONS = [
  { value: '', label: 'Alle statussen' },
  { value: 'Niet gestart', label: 'Niet gestart' },
  { value: 'In opstart', label: 'In opstart' },
  { value: 'In uitvoering', label: 'In uitvoering' },
  { value: 'In afronding', label: 'In afronding' },
  { value: 'Afgerond', label: 'Afgerond' },
  { value: 'Gearchiveerd', label: 'Gearchiveerd' },
]

export default function AllProjectsPage() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const fetchProjects = async () => {
      const { data } = await supabase.from('projects').select('*').order('updated_at', { ascending: false })
      setProjects(data || [])
      setLoading(false)
    }
    fetchProjects()
  }, [])

  const filtered = projects.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = !statusFilter || p.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <>
      <Group justify="space-between" mb="lg">
        <Title order={2}>Alle Projecten</Title>
        <Button
          leftSection={<IconPlus size={16} />}
          onClick={() => navigate('/projects/new')}
        >
          Nieuw project
        </Button>
      </Group>

      <Group mb="md">
        <TextInput
          placeholder="Zoeken op naam..."
          leftSection={<IconSearch size={16} />}
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
          style={{ flex: 1 }}
        />
        <Select
          placeholder="Filter op status"
          data={STATUS_OPTIONS}
          value={statusFilter}
          onChange={(val) => setStatusFilter(val || '')}
          clearable
          w={200}
        />
      </Group>

      {loading ? (
        <Stack gap="sm">
          <Skeleton height={80} radius="md" />
          <Skeleton height={80} radius="md" />
          <Skeleton height={80} radius="md" />
        </Stack>
      ) : filtered.length === 0 ? (
        <Text c="dimmed" ta="center" mt="xl">
          Geen projecten gevonden.
        </Text>
      ) : (
        <Stack gap="sm">
          {filtered.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </Stack>
      )}
    </>
  )
}
