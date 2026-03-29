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
  Select,
  Textarea,
  Modal,
  Anchor,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { IconPlus, IconTrash, IconExternalLink, IconEdit, IconSparkles } from '@tabler/icons-react'
import { DELIVERABLE_TYPES, DELIVERABLE_STATUS_COLORS, getPhaseConfig } from '../../lib/utils/phaseConfig'
import { formatDate } from '../../lib/utils/dateUtils'

export default function DeliverableCard({ deliverables, phase, project, onAdd, onUpdate, onDelete }) {
  const [opened, { open, close }] = useDisclosure(false)
  const [editItem, setEditItem] = useState(null)

  const config = getPhaseConfig(phase)
  const availableTypes = Object.entries(DELIVERABLE_TYPES).map(([value, label]) => ({ value, label }))

  const [form, setForm] = useState({
    title: '',
    type: config?.requiredDeliverables?.[0] || 'overig',
    status: 'concept',
    sharepoint_url: '',
  })

  const handleOpen = (item = null) => {
    if (item) {
      setEditItem(item)
      setForm({
        title: item.title,
        type: item.type,
        status: item.status,
        sharepoint_url: item.sharepoint_url || '',
      })
    } else {
      setEditItem(null)
      setForm({
        title: '',
        type: config?.requiredDeliverables?.[0] || 'overig',
        status: 'concept',
        sharepoint_url: '',
      })
    }
    open()
  }

  const handleSubmit = () => {
    if (!form.title.trim()) return

    if (editItem) {
      onUpdate({ ...editItem, ...form, title: form.title.trim() })
    } else {
      onAdd({ ...form, title: form.title.trim(), phase })
    }
    close()
  }

  return (
    <>
      <Stack gap="sm">
        {deliverables.length === 0 ? (
          <Paper p="lg" radius="md" withBorder ta="center">
            <Text c="dimmed" size="sm" mb="md">
              Er zijn nog geen documenten in deze fase.
            </Text>
          </Paper>
        ) : (
          deliverables.map((item) => (
            <Paper key={item.id} p="md" radius="md" withBorder>
              <Group justify="space-between" wrap="nowrap">
                <div style={{ flex: 1 }}>
                  <Group gap="xs" mb={4}>
                    <Text fw={600} size="sm">{item.title}</Text>
                    <Badge size="xs" color={DELIVERABLE_STATUS_COLORS[item.status]} variant="light">
                      {item.status === 'concept' ? 'Concept' : item.status === 'review' ? 'Review' : 'Definitief'}
                    </Badge>
                    <Badge size="xs" variant="outline" color="gray">
                      {DELIVERABLE_TYPES[item.type] || item.type}
                    </Badge>
                  </Group>
                  <Group gap="md">
                    <Text size="xs" c="dimmed">Aangemaakt: {formatDate(item.created_at)}</Text>
                    {item.sharepoint_url && (
                      <Anchor href={item.sharepoint_url} target="_blank" size="xs">
                        <Group gap={4}>
                          <IconExternalLink size={12} />
                          SharePoint
                        </Group>
                      </Anchor>
                    )}
                  </Group>
                </div>
                <Group gap="xs">
                  <ActionIcon variant="subtle" onClick={() => handleOpen(item)}>
                    <IconEdit size={16} />
                  </ActionIcon>
                  <ActionIcon variant="subtle" color="red" onClick={() => onDelete(item.id)}>
                    <IconTrash size={16} />
                  </ActionIcon>
                </Group>
              </Group>
            </Paper>
          ))
        )}

        <Group>
          <Button
            variant="light"
            leftSection={<IconPlus size={16} />}
            size="sm"
            onClick={() => handleOpen()}
          >
            Document toevoegen
          </Button>
        </Group>
      </Stack>

      <Modal opened={opened} onClose={close} title={editItem ? 'Document bewerken' : 'Nieuw document'} centered>
        <Stack gap="md">
          <TextInput
            label="Titel"
            placeholder="Titel van het document"
            required
            value={form.title}
            onChange={(e) => setForm((prev) => ({ ...prev, title: e.currentTarget.value }))}
          />
          <Select
            label="Type"
            data={availableTypes}
            value={form.type}
            onChange={(val) => setForm((prev) => ({ ...prev, type: val }))}
          />
          <Select
            label="Status"
            data={[
              { value: 'concept', label: 'Concept' },
              { value: 'review', label: 'Review' },
              { value: 'definitief', label: 'Definitief' },
            ]}
            value={form.status}
            onChange={(val) => setForm((prev) => ({ ...prev, status: val }))}
          />
          <TextInput
            label="SharePoint URL (optioneel)"
            placeholder="https://..."
            value={form.sharepoint_url}
            onChange={(e) => setForm((prev) => ({ ...prev, sharepoint_url: e.currentTarget.value }))}
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
