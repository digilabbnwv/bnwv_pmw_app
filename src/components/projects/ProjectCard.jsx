import { Paper, Group, Text, Badge } from '@mantine/core'
import { useNavigate } from 'react-router-dom'
import { getStatusColor } from '../../lib/utils/projectUtils'
import { formatDate } from '../../lib/utils/dateUtils'

export default function ProjectCard({ project }) {
  const navigate = useNavigate()

  return (
    <Paper
      withBorder
      p="md"
      radius="md"
      style={{ cursor: 'pointer' }}
      onClick={() => navigate(`/projects/${project.id}`)}
    >
      <Group justify="space-between" wrap="nowrap">
        <div>
          <Text fw={600} lineClamp={1}>
            {project.name}
          </Text>
          {project.description && (
            <Text size="sm" c="dimmed" lineClamp={2} mt={4}>
              {project.description}
            </Text>
          )}
          <Group gap="xs" mt="xs">
            {project.start_date && (
              <Text size="xs" c="dimmed">
                Start: {formatDate(project.start_date)}
              </Text>
            )}
            {project.end_date && (
              <Text size="xs" c="dimmed">
                Eind: {formatDate(project.end_date)}
              </Text>
            )}
          </Group>
        </div>
        <Badge color={getStatusColor(project.status)} variant="light" size="sm">
          {project.status}
        </Badge>
      </Group>
    </Paper>
  )
}
