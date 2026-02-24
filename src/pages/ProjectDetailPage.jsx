import { useState, useEffect } from 'react'
import {
  Title,
  Text,
  Group,
  Button,
  Select,
  Stack,
  Paper,
  Anchor,
  Loader,
  Center,
} from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { IconEdit, IconExternalLink } from '@tabler/icons-react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { formatDate } from '../lib/utils/dateUtils'
import { getStatusColor } from '../lib/utils/projectUtils'
import QualityChecklist from '../components/projects/QualityChecklist'
import ProjectMembersList from '../components/projects/ProjectMembersList'

const STATUS_OPTIONS = [
  'Niet gestart',
  'In opstart',
  'In uitvoering',
  'In afronding',
  'Afgerond',
  'Gearchiveerd',
]

export default function ProjectDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [project, setProject] = useState(null)
  const [qualityCheck, setQualityCheck] = useState(null)
  const [members, setMembers] = useState([])
  const [profiles, setProfiles] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      const [projectRes, qcRes, membersRes, profilesRes] = await Promise.all([
        supabase.from('projects').select('*').eq('id', id).single(),
        supabase.from('quality_checks').select('*').eq('project_id', id).single(),
        supabase.from('project_members').select('*').eq('project_id', id),
        supabase.from('profiles').select('*'),
      ])

      setProject(projectRes.data)
      setQualityCheck(qcRes.data)
      setMembers(membersRes.data || [])
      setProfiles(profilesRes.data || [])
      setLoading(false)
    }
    fetch()
  }, [id])

  const handleStatusChange = async (status) => {
    const { error } = await supabase
      .from('projects')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (error) {
      notifications.show({ title: 'Fout', message: 'Status wijzigen mislukt.', color: 'red' })
    } else {
      setProject((prev) => ({ ...prev, status }))
      notifications.show({ title: 'Opgeslagen', message: 'Status bijgewerkt.', color: 'green' })
    }
  }

  const handleQualityUpdate = async (updated) => {
    const { error } = await supabase.from('quality_checks').update(updated).eq('id', updated.id)

    if (error) {
      notifications.show({ title: 'Fout', message: 'Opslaan mislukt.', color: 'red' })
    } else {
      setQualityCheck(updated)
    }
  }

  const handleAddMember = async (profileId) => {
    const { data, error } = await supabase
      .from('project_members')
      .insert({ project_id: id, profile_id: profileId })
      .select()
      .single()

    if (error) {
      notifications.show({ title: 'Fout', message: 'Lid toevoegen mislukt.', color: 'red' })
    } else {
      setMembers((prev) => [...prev, data])
    }
  }

  const handleRemoveMember = async (memberId) => {
    const { error } = await supabase.from('project_members').delete().eq('id', memberId)

    if (error) {
      notifications.show({ title: 'Fout', message: 'Lid verwijderen mislukt.', color: 'red' })
    } else {
      setMembers((prev) => prev.filter((m) => m.id !== memberId))
    }
  }

  if (loading) {
    return (
      <Center py="xl">
        <Loader />
      </Center>
    )
  }

  if (!project) {
    return (
      <Text c="dimmed" ta="center" mt="xl">
        Project niet gevonden.
      </Text>
    )
  }

  return (
    <Stack gap="lg">
      <Group justify="space-between">
        <div>
          <Title order={2}>{project.name}</Title>
          <Group gap="xs" mt="xs">
            {project.start_date && (
              <Text size="sm" c="dimmed">
                Start: {formatDate(project.start_date)}
              </Text>
            )}
            {project.end_date && (
              <Text size="sm" c="dimmed">
                Eind: {formatDate(project.end_date)}
              </Text>
            )}
          </Group>
        </div>
        <Group>
          <Select
            data={STATUS_OPTIONS}
            value={project.status}
            onChange={handleStatusChange}
            w={180}
            styles={{
              input: { color: `var(--mantine-color-${getStatusColor(project.status)}-6)` },
            }}
          />
          <Button
            variant="light"
            leftSection={<IconEdit size={16} />}
            onClick={() => navigate(`/projects/${id}/edit`)}
          >
            Bewerken
          </Button>
        </Group>
      </Group>

      {project.description && (
        <Paper withBorder p="md" radius="md">
          <Title order={4} mb="xs">
            Omschrijving
          </Title>
          <Text size="sm">{project.description}</Text>
        </Paper>
      )}

      {(project.sharepoint_project_url || project.sharepoint_actions_url) && (
        <Paper withBorder p="md" radius="md">
          <Title order={4} mb="xs">
            SharePoint links
          </Title>
          <Stack gap="xs">
            {project.sharepoint_project_url && (
              <Anchor
                href={project.sharepoint_project_url}
                target="_blank"
                size="sm"
              >
                <Group gap={4}>
                  <IconExternalLink size={14} />
                  Projectmap openen
                </Group>
              </Anchor>
            )}
            {project.sharepoint_actions_url && (
              <Anchor
                href={project.sharepoint_actions_url}
                target="_blank"
                size="sm"
              >
                <Group gap={4}>
                  <IconExternalLink size={14} />
                  Actielijst openen
                </Group>
              </Anchor>
            )}
          </Stack>
        </Paper>
      )}

      <QualityChecklist qualityCheck={qualityCheck} onUpdate={handleQualityUpdate} />

      <ProjectMembersList
        members={members}
        profiles={profiles}
        onAdd={handleAddMember}
        onRemove={handleRemoveMember}
      />
    </Stack>
  )
}
