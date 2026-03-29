import { useState } from 'react'
import {
  Stack,
  Paper,
  Group,
  Text,
  Badge,
  Button,
  ActionIcon,
  TextInput,
  Textarea,
  Select,
  Modal,
} from '@mantine/core'
import { DateInput } from '@mantine/dates'
import { useDisclosure } from '@mantine/hooks'
import { IconPlus, IconTrash, IconEdit } from '@tabler/icons-react'
import { TASK_STATUS_COLORS } from '../../lib/utils/phaseConfig'
import { formatDate } from '../../lib/utils/dateUtils'

const TASK_STATUS_OPTIONS = [
  { value: 'open', label: 'Open' },
  { value: 'bezig', label: 'Bezig' },
  { value: 'afgerond', label: 'Afgerond' },
  { value: 'vervallen', label: 'Vervallen' },
]

export default function TaskList({ tasks, phase, profiles, onAdd, onUpdate, onDelete }) {
  const [opened, { open, close }] = useDisclosure(false)
  const [editItem, setEditItem] = useState(null)
  const [form, setForm] = useState({
    title: '',
    description: '',
    assigned_to: null,
    due_date: null,
    status: 'open',
  })

  const profileOptions = profiles.map((p) => ({
    value: p.id,
    label: p.full_name || p.id,
  }))

  const handleOpen = (item = null) => {
    if (item) {
      setEditItem(item)
      setForm({
        title: item.title,
        description: item.description || '',
        assigned_to: item.assigned_to,
        due_date: item.due_date ? new Date(item.due_date) : null,
        status: item.status,
      })
    } else {
      setEditItem(null)
      setForm({ title: '', description: '', assigned_to: null, due_date: null, status: 'open' })
    }
    open()
  }

  const handleSubmit = () => {
    if (!form.title.trim()) return

    const payload = {
      title: form.title.trim(),
      description: form.description.trim() || null,
      assigned_to: form.assigned_to || null,
      due_date: form.due_date ? new Date(form.due_date).toISOString().split('T')[0] : null,
      status: form.status,
      phase,
    }

    if (editItem) {
      onUpdate({ ...editItem, ...payload })
    } else {
      onAdd(payload)
    }
    close()
  }

  const handleQuickStatus = (task, newStatus) => {
    onUpdate({ ...task, status: newStatus })
  }

  const isOverdue = (task) => {
    if (!task.due_date || task.status === 'afgerond' || task.status === 'vervallen') return false
    return new Date(task.due_date) < new Date()
  }

  return (
    <>
      <Stack gap="sm">
        {tasks.length === 0 ? (
          <Paper p="lg" radius="md" withBorder ta="center">
            <Text c="dimmed" size="sm">Nog geen taken in deze fase.</Text>
          </Paper>
        ) : (
          tasks.map((task) => {
            const assignee = profiles.find((p) => p.id === task.assigned_to)
            return (
              <Paper key={task.id} p="sm" radius="md" withBorder>
                <Group justify="space-between" wrap="nowrap">
                  <div style={{ flex: 1 }}>
                    <Group gap="xs" mb={2}>
                      <Text
                        fw={500}
                        size="sm"
                        td={task.status === 'afgerond' ? 'line-through' : undefined}
                        c={task.status === 'afgerond' ? 'dimmed' : undefined}
                      >
                        {task.title}
                      </Text>
                      <Badge size="xs" color={TASK_STATUS_COLORS[task.status]} variant="light">
                        {task.status}
                      </Badge>
                      {isOverdue(task) && (
                        <Badge size="xs" color="red" variant="filled">Te laat</Badge>
                      )}
                    </Group>
                    <Group gap="md">
                      {assignee && (
                        <Text size="xs" c="dimmed">{assignee.full_name}</Text>
                      )}
                      {task.due_date && (
                        <Text size="xs" c={isOverdue(task) ? 'red' : 'dimmed'}>
                          Deadline: {formatDate(task.due_date)}
                        </Text>
                      )}
                    </Group>
                  </div>
                  <Group gap={4}>
                    {task.status === 'open' && (
                      <Button size="compact-xs" variant="light" onClick={() => handleQuickStatus(task, 'bezig')}>
                        Start
                      </Button>
                    )}
                    {task.status === 'bezig' && (
                      <Button size="compact-xs" variant="light" color="green" onClick={() => handleQuickStatus(task, 'afgerond')}>
                        Gereed
                      </Button>
                    )}
                    <ActionIcon variant="subtle" size="sm" onClick={() => handleOpen(task)}>
                      <IconEdit size={14} />
                    </ActionIcon>
                    <ActionIcon variant="subtle" size="sm" color="red" onClick={() => onDelete(task.id)}>
                      <IconTrash size={14} />
                    </ActionIcon>
                  </Group>
                </Group>
              </Paper>
            )
          })
        )}

        <Button variant="light" leftSection={<IconPlus size={16} />} size="sm" onClick={() => handleOpen()}>
          Taak toevoegen
        </Button>
      </Stack>

      <Modal opened={opened} onClose={close} title={editItem ? 'Taak bewerken' : 'Nieuwe taak'} centered>
        <Stack gap="md">
          <TextInput
            label="Titel"
            placeholder="Wat moet er gebeuren?"
            required
            value={form.title}
            onChange={(e) => setForm((prev) => ({ ...prev, title: e?.currentTarget?.value ?? '' }))}
          />
          <Textarea
            label="Omschrijving (optioneel)"
            placeholder="Meer details..."
            rows={2}
            value={form.description}
            onChange={(e) => setForm((prev) => ({ ...prev, description: e?.currentTarget?.value ?? '' }))}
          />
          <Select
            label="Toegewezen aan"
            data={profileOptions}
            value={form.assigned_to}
            onChange={(val) => setForm((prev) => ({ ...prev, assigned_to: val }))}
            clearable
            searchable
            placeholder="Selecteer een collega"
          />
          <DateInput
            label="Deadline"
            placeholder="Kies een datum"
            value={form.due_date}
            onChange={(date) => setForm((prev) => ({ ...prev, due_date: date }))}
            valueFormat="DD-MM-YYYY"
            clearable
          />
          <Select
            label="Status"
            data={TASK_STATUS_OPTIONS}
            value={form.status}
            onChange={(val) => setForm((prev) => ({ ...prev, status: val }))}
          />
          <Group justify="flex-end">
            <Button variant="default" onClick={close}>Annuleren</Button>
            <Button onClick={handleSubmit}>{editItem ? 'Opslaan' : 'Toevoegen'}</Button>
          </Group>
        </Stack>
      </Modal>
    </>
  )
}
