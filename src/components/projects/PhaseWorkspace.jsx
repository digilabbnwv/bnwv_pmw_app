import { Tabs, Text, Badge, Group, Stack, Paper, ThemeIcon, rem } from '@mantine/core'
import {
  IconFileText,
  IconChecklist,
  IconMessage,
  IconInfoCircle,
} from '@tabler/icons-react'
import { getPhaseConfig } from '../../lib/utils/phaseConfig'
import DeliverableCard from './DeliverableCard'
import TaskList from './TaskList'
import CommentThread from './CommentThread'

export default function PhaseWorkspace({
  phase,
  project,
  deliverables,
  tasks,
  comments,
  profiles,
  onAddDeliverable,
  onUpdateDeliverable,
  onDeleteDeliverable,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  onAddComment,
}) {
  const config = getPhaseConfig(phase)
  if (!config) return null

  const phaseDeliverables = deliverables.filter((d) => d.phase === phase)
  const phaseTasks = tasks.filter((t) => t.phase === phase)
  const phaseComments = comments.filter((c) => c.phase === phase && !c.deliverable_id)

  return (
    <Tabs defaultValue="overzicht" variant="outline" radius="md">
      <Tabs.List>
        <Tabs.Tab value="overzicht" leftSection={<IconInfoCircle size={16} />}>
          Overzicht
        </Tabs.Tab>
        <Tabs.Tab value="documenten" leftSection={<IconFileText size={16} />}>
          Documenten
          {phaseDeliverables.length > 0 && (
            <Badge size="xs" variant="filled" color="brand" ml={6}>
              {phaseDeliverables.length}
            </Badge>
          )}
        </Tabs.Tab>
        <Tabs.Tab value="taken" leftSection={<IconChecklist size={16} />}>
          Taken
          {phaseTasks.filter((t) => t.status !== 'afgerond').length > 0 && (
            <Badge size="xs" variant="filled" color="blue" ml={6}>
              {phaseTasks.filter((t) => t.status !== 'afgerond').length}
            </Badge>
          )}
        </Tabs.Tab>
        <Tabs.Tab value="opmerkingen" leftSection={<IconMessage size={16} />}>
          Opmerkingen
          {phaseComments.length > 0 && (
            <Badge size="xs" variant="filled" color="gray" ml={6}>
              {phaseComments.length}
            </Badge>
          )}
        </Tabs.Tab>
      </Tabs.List>

      <Tabs.Panel value="overzicht" pt="md">
        <Stack gap="md">
          <Paper p="md" radius="md" withBorder>
            <Group gap="md" mb="sm">
              <ThemeIcon size="lg" radius="md" color={config.color} variant="light">
                <config.icon size={20} />
              </ThemeIcon>
              <div>
                <Text fw={600} size="lg">{config.label}</Text>
                <Text size="sm" c="dimmed">{config.description}</Text>
              </div>
            </Group>
          </Paper>

          <Paper p="md" radius="md" withBorder>
            <Text fw={600} size="sm" mb="xs">Vereiste opleverpunten</Text>
            {config.requiredDeliverables.map((type) => {
              const exists = phaseDeliverables.find((d) => d.type === type)
              return (
                <Group key={type} gap="xs" mb={4}>
                  <Badge
                    size="xs"
                    color={exists?.status === 'definitief' ? 'green' : exists ? 'yellow' : 'gray'}
                    variant="filled"
                  >
                    {exists?.status === 'definitief' ? 'Definitief' : exists ? 'In concept' : 'Ontbreekt'}
                  </Badge>
                  <Text size="sm">{type.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}</Text>
                </Group>
              )
            })}
          </Paper>

          <Paper p="md" radius="md" withBorder>
            <Text fw={600} size="sm" mb="xs">Voorgestelde taken</Text>
            {config.suggestedTasks.map((task, i) => (
              <Text key={i} size="sm" c="dimmed" mb={2}>
                {i + 1}. {task}
              </Text>
            ))}
          </Paper>
        </Stack>
      </Tabs.Panel>

      <Tabs.Panel value="documenten" pt="md">
        <DeliverableCard
          deliverables={phaseDeliverables}
          phase={phase}
          project={project}
          onAdd={onAddDeliverable}
          onUpdate={onUpdateDeliverable}
          onDelete={onDeleteDeliverable}
        />
      </Tabs.Panel>

      <Tabs.Panel value="taken" pt="md">
        <TaskList
          tasks={phaseTasks}
          phase={phase}
          projectId={project.id}
          profiles={profiles}
          onAdd={onAddTask}
          onUpdate={onUpdateTask}
          onDelete={onDeleteTask}
        />
      </Tabs.Panel>

      <Tabs.Panel value="opmerkingen" pt="md">
        <CommentThread
          comments={phaseComments}
          phase={phase}
          projectId={project.id}
          profiles={profiles}
          onAdd={onAddComment}
        />
      </Tabs.Panel>
    </Tabs>
  )
}
