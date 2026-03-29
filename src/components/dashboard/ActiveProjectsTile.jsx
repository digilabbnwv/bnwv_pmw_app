import { Paper, Title, Text, Stack, Group, Badge, Anchor, Progress } from '@mantine/core'
import { useNavigate } from 'react-router-dom'
import { getActiveProjects } from '../../lib/utils/projectUtils'
import { getPhaseColor, getPhaseLabel, getPhaseIndex, PHASES } from '../../lib/utils/phaseConfig'
import { formatDate } from '../../lib/utils/dateUtils'

export default function ActiveProjectsTile({ projects }) {
  const navigate = useNavigate()
  const active = getActiveProjects(projects).slice(0, 5)

  return (
    <Paper withBorder p="md" radius="md">
      <Title order={4} mb="sm">Actieve Projecten</Title>

      {active.length === 0 ? (
        <Text c="dimmed" size="sm">Er zijn geen actieve projecten.</Text>
      ) : (
        <Stack gap="sm">
          {active.map((project) => {
            const phaseKey = project.current_phase || 'initiatief'
            const phaseIndex = getPhaseIndex(phaseKey)
            const progressPct = Math.round(((phaseIndex >= 0 ? phaseIndex : 0) / PHASES.length) * 100)

            return (
              <div
                key={project.id}
                style={{ cursor: 'pointer' }}
                onClick={() => navigate(`/projects/${project.id}`)}
              >
                <Group justify="space-between" wrap="nowrap" mb={4}>
                  <Text size="sm" fw={500} lineClamp={1} style={{ flex: 1 }}>
                    {project.name}
                  </Text>
                  <Badge color={getPhaseColor(phaseKey)} variant="light" size="xs">
                    {getPhaseLabel(phaseKey)}
                  </Badge>
                </Group>
                <Progress value={progressPct} size="xs" color={getPhaseColor(phaseKey)} />
                {project.end_date && (
                  <Text size="xs" c="dimmed" mt={2}>
                    Einddatum: {formatDate(project.end_date)}
                  </Text>
                )}
              </div>
            )
          })}
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
