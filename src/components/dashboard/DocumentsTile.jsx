import { Paper, Title, Text, Stack, Group } from '@mantine/core'
import { useNavigate } from 'react-router-dom'
import { getExpiringProjects } from '../../lib/utils/projectUtils'
import { formatDate } from '../../lib/utils/dateUtils'

export default function DocumentsTile({ projects }) {
  const navigate = useNavigate()
  const expiring = getExpiringProjects(projects)

  return (
    <Paper withBorder p="md" radius="md">
      <Title order={4} mb="sm">
        Documenten bijna verlopen
      </Title>

      {expiring.length === 0 ? (
        <Text c="dimmed" size="sm">
          Er zijn geen documenten die binnenkort verlopen.
        </Text>
      ) : (
        <Stack gap="xs">
          {expiring.map((project) => (
            <Group
              key={project.id}
              justify="space-between"
              wrap="nowrap"
              style={{ cursor: 'pointer' }}
              onClick={() => navigate(`/projects/${project.id}`)}
            >
              <Text size="sm" fw={500} lineClamp={1}>
                {project.name}
              </Text>
              <Text size="xs" c="red" fw={500}>
                {formatDate(project.end_date)}
              </Text>
            </Group>
          ))}
        </Stack>
      )}
    </Paper>
  )
}
