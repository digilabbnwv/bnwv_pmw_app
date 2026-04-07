import { useState, useEffect } from 'react'
import { Paper, Title, Text, Stack, Group, Badge } from '@mantine/core'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { TASK_STATUS_COLORS } from '../../lib/utils/phaseConfig'
import { formatDate } from '../../lib/utils/dateUtils'

export default function MyTasksTile() {
  const [tasks, setTasks] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    const fetch = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('project_tasks')
        .select('*, projects(name)')
        .eq('assigned_to', user.id)
        .in('status', ['open', 'bezig'])
        .order('due_date', { ascending: true, nullsFirst: false })
        .limit(8)

      setTasks(data || [])
    }
    fetch()
  }, [])

  const isOverdue = (task) => {
    if (!task.due_date) return false
    return new Date(task.due_date) < new Date()
  }

  return (
    <Paper withBorder p="md" radius="md" style={{ borderLeft: '3px solid var(--mantine-color-doe-5)' }}>
      <Title order={4} mb="sm">Mijn taken</Title>

      {tasks.length === 0 ? (
        <Text c="dimmed" size="sm">Je hebt geen openstaande taken.</Text>
      ) : (
        <Stack gap="xs">
          {tasks.map((task) => (
            <Group
              key={task.id}
              justify="space-between"
              wrap="nowrap"
              style={{ cursor: 'pointer' }}
              onClick={() => navigate(`/projects/${task.project_id}`)}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <Text size="sm" fw={500} lineClamp={1}>{task.title}</Text>
                <Text size="xs" c="dimmed" lineClamp={1}>
                  {task.projects?.name}
                </Text>
              </div>
              <Group gap="xs" wrap="nowrap">
                {task.due_date && (
                  <Text size="xs" c={isOverdue(task) ? 'red' : 'dimmed'} fw={isOverdue(task) ? 600 : 400}>
                    {formatDate(task.due_date)}
                  </Text>
                )}
                <Badge size="xs" color={TASK_STATUS_COLORS[task.status]} variant="light">
                  {task.status}
                </Badge>
              </Group>
            </Group>
          ))}
        </Stack>
      )}
    </Paper>
  )
}
