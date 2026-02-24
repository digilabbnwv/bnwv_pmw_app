import { Paper, Title, Text, Stack, Group, Badge, Anchor } from '@mantine/core'
import { useNavigate } from 'react-router-dom'
import { getActiveProjects, getStatusColor } from '../../lib/utils/projectUtils'
import { formatDate } from '../../lib/utils/dateUtils'

export default function ActiveProjectsTile({ projects }) {
  const navigate = useNavigate()
  const active = getActiveProjects(projects).slice(0, 5)

  return (
    <Paper withBorder p="md" radius="md">
      <Title order={4} mb="sm">
        Actieve Projecten
      </Title>

      {active.length === 0 ? (
        <Text c="dimmed" size="sm">
          Er zijn geen actieve projecten.
        </Text>
      ) : (
        <Stack gap="xs">
          {active.map((project) => (
            <Group key={project.id} justify="space-between" wrap="nowrap">
              <div>
                <Text size="sm" fw={500} lineClamp={1}>
                  {project.name}
                </Text>
                {project.end_date && (
                  <Text size="xs" c="dimmed">
                    Einddatum: {formatDate(project.end_date)}
                  </Text>
                )}
              </div>
              <Badge color={getStatusColor(project.status)} variant="light" size="sm">
                {project.status}
              </Badge>
            </Group>
          ))}
        </Stack>
      )}

      <Anchor
        size="sm"
        mt="md"
        component="button"
        onClick={() => navigate('/projects')}
      >
        Alle projecten bekijken
      </Anchor>
    </Paper>
  )
}
