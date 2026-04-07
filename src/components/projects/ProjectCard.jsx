import { Paper, Group, Text, Badge, Progress } from '@mantine/core'
import { useNavigate } from 'react-router-dom'
import { getPhaseColor, getPhaseLabel, getPhaseIndex, PHASES } from '../../lib/utils/phaseConfig'
import { formatDate } from '../../lib/utils/dateUtils'

export default function ProjectCard({ project }) {
  const navigate = useNavigate()
  const phaseKey = project.current_phase || 'initiatief'
  const isCompleted = phaseKey === 'afgerond'
  const phaseIndex = isCompleted ? PHASES.length : getPhaseIndex(phaseKey)
  const progressPct = Math.round((phaseIndex / PHASES.length) * 100)

  return (
    <Paper
      withBorder
      p="md"
      radius="md"
      style={{ cursor: 'pointer', transition: 'box-shadow 0.15s ease, transform 0.15s ease' }}
      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = 'var(--mantine-shadow-sm)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}
      onClick={() => navigate(`/projects/${project.id}`)}
      className="project-card"
    >
      <Group justify="space-between" wrap="nowrap" mb="xs">
        <div style={{ flex: 1 }}>
          <Text fw={600} lineClamp={1}>
            {project.name}
          </Text>
          {project.description && (
            <Text size="sm" c="dimmed" lineClamp={1} mt={2}>
              {project.description}
            </Text>
          )}
        </div>
        <Badge color={isCompleted ? 'green' : getPhaseColor(phaseKey)} variant="light" size="sm">
          {isCompleted ? 'Afgerond' : getPhaseLabel(phaseKey)}
        </Badge>
      </Group>

      <Progress value={progressPct} size="xs" color={isCompleted ? 'green' : getPhaseColor(phaseKey)} mb="xs" />

      <Group gap="md">
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
    </Paper>
  )
}
