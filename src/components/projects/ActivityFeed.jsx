import { Timeline, Text, ThemeIcon, Paper, Title } from '@mantine/core'
import {
  IconArrowRight,
  IconFileText,
  IconChecklist,
  IconMessage,
  IconUser,
  IconBulb,
  IconActivity,
} from '@tabler/icons-react'
import { formatDate } from '../../lib/utils/dateUtils'

const ACTION_CONFIG = {
  phase_advanced: { icon: IconArrowRight, color: 'brand', label: 'Fase doorgeschoven' },
  deliverable_created: { icon: IconFileText, color: 'blue', label: 'Document aangemaakt' },
  deliverable_updated: { icon: IconFileText, color: 'cyan', label: 'Document bijgewerkt' },
  task_created: { icon: IconChecklist, color: 'teal', label: 'Taak aangemaakt' },
  task_completed: { icon: IconChecklist, color: 'green', label: 'Taak afgerond' },
  comment_added: { icon: IconMessage, color: 'grape', label: 'Opmerking geplaatst' },
  member_added: { icon: IconUser, color: 'violet', label: 'Lid toegevoegd' },
  member_removed: { icon: IconUser, color: 'red', label: 'Lid verwijderd' },
  idea_created: { icon: IconBulb, color: 'yellow', label: 'Idee toegevoegd' },
  indicator_updated: { icon: IconActivity, color: 'orange', label: 'Indicator bijgewerkt' },
}

export default function ActivityFeed({ activity, profiles }) {
  if (!activity || activity.length === 0) {
    return (
      <Paper p="md" radius="md" withBorder style={{ borderLeft: '3px solid var(--mantine-color-brand-5)' }}>
        <Title order={5} mb="sm">Recente activiteit</Title>
        <Text c="dimmed" size="sm">Nog geen activiteit geregistreerd.</Text>
      </Paper>
    )
  }

  return (
    <Paper p="md" radius="md" withBorder style={{ borderLeft: '3px solid var(--mantine-color-brand-5)' }}>
      <Title order={5} mb="md">Recente activiteit</Title>
      <Timeline active={-1} bulletSize={28} lineWidth={2}>
        {activity.slice(0, 10).map((item) => {
          const config = ACTION_CONFIG[item.action] || {
            icon: IconActivity,
            color: 'gray',
            label: item.action,
          }
          const actor = profiles.find((p) => p.id === item.actor_id)
          const Icon = config.icon

          return (
            <Timeline.Item
              key={item.id}
              bullet={
                <ThemeIcon size={28} radius="xl" color={config.color} variant="light">
                  <Icon size={14} />
                </ThemeIcon>
              }
            >
              <Text size="sm" fw={500}>
                {actor?.full_name || 'Onbekend'}{' '}
                <Text span c="dimmed" fw={400}>
                  {config.label.toLowerCase()}
                </Text>
              </Text>
              {item.metadata?.title && (
                <Text size="xs" c="dimmed">{item.metadata.title}</Text>
              )}
              <Text size="xs" c="dimmed">{formatDate(item.created_at)}</Text>
            </Timeline.Item>
          )
        })}
      </Timeline>
    </Paper>
  )
}
