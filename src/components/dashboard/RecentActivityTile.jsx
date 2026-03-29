import { useState, useEffect } from 'react'
import { Paper, Title, Text, Timeline, ThemeIcon } from '@mantine/core'
import {
  IconArrowRight,
  IconFileText,
  IconChecklist,
  IconMessage,
  IconUser,
  IconActivity,
} from '@tabler/icons-react'
import { supabase } from '../../lib/supabaseClient'
import { formatDate } from '../../lib/utils/dateUtils'

const ACTION_CONFIG = {
  phase_advanced: { icon: IconArrowRight, color: 'brand', label: 'Fase doorgeschoven' },
  deliverable_created: { icon: IconFileText, color: 'blue', label: 'Document aangemaakt' },
  deliverable_updated: { icon: IconFileText, color: 'cyan', label: 'Document bijgewerkt' },
  task_created: { icon: IconChecklist, color: 'teal', label: 'Taak aangemaakt' },
  task_completed: { icon: IconChecklist, color: 'green', label: 'Taak afgerond' },
  comment_added: { icon: IconMessage, color: 'grape', label: 'Opmerking geplaatst' },
  member_added: { icon: IconUser, color: 'violet', label: 'Lid toegevoegd' },
}

export default function RecentActivityTile() {
  const [activity, setActivity] = useState([])
  const [profiles, setProfiles] = useState([])

  useEffect(() => {
    const fetch = async () => {
      const [activityRes, profilesRes] = await Promise.all([
        supabase
          .from('activity_log')
          .select('*, projects(name)')
          .order('created_at', { ascending: false })
          .limit(8),
        supabase.from('profiles').select('id, full_name'),
      ])
      setActivity(activityRes.data || [])
      setProfiles(profilesRes.data || [])
    }
    fetch()
  }, [])

  return (
    <Paper withBorder p="md" radius="md">
      <Title order={4} mb="sm">Recente activiteit</Title>

      {activity.length === 0 ? (
        <Text c="dimmed" size="sm">Nog geen activiteit.</Text>
      ) : (
        <Timeline active={-1} bulletSize={24} lineWidth={2}>
          {activity.map((item) => {
            const config = ACTION_CONFIG[item.action] || { icon: IconActivity, color: 'gray', label: item.action }
            const actor = profiles.find((p) => p.id === item.actor_id)
            const Icon = config.icon

            return (
              <Timeline.Item
                key={item.id}
                bullet={
                  <ThemeIcon size={24} radius="xl" color={config.color} variant="light">
                    <Icon size={12} />
                  </ThemeIcon>
                }
              >
                <Text size="xs" fw={500}>
                  {actor?.full_name || 'Onbekend'} — {config.label.toLowerCase()}
                </Text>
                {item.projects?.name && (
                  <Text size="xs" c="dimmed">{item.projects.name}</Text>
                )}
                <Text size="xs" c="dimmed">{formatDate(item.created_at)}</Text>
              </Timeline.Item>
            )
          })}
        </Timeline>
      )}
    </Paper>
  )
}
