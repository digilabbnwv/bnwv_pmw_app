import { useState } from 'react'
import {
  Paper,
  Title,
  Stack,
  Group,
  Text,
  Badge,
  Button,
  ActionIcon,
  TextInput,
  Textarea,
  Select,
  Modal,
  Progress,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { IconPlus, IconEdit, IconTrash, IconTarget } from '@tabler/icons-react'
import { INDICATOR_STATUS_COLORS, INDICATOR_STATUS_LABELS } from '../../lib/utils/phaseConfig'

const STATUS_OPTIONS = Object.entries(INDICATOR_STATUS_LABELS).map(([value, label]) => ({ value, label }))

export default function SuccessIndicators({ indicators, onAdd, onUpdate, onDelete }) {
  const [opened, { open, close }] = useDisclosure(false)
  const [editItem, setEditItem] = useState(null)
  const [form, setForm] = useState({
    title: '',
    description: '',
    target_value: '',
    measurement_method: '',
    current_value: '',
    status: 'niet_gemeten',
  })

  const handleOpen = (item = null) => {
    if (item) {
      setEditItem(item)
      setForm({
        title: item.title,
        description: item.description || '',
        target_value: item.target_value || '',
        measurement_method: item.measurement_method || '',
        current_value: item.current_value || '',
        status: item.status,
      })
    } else {
      setEditItem(null)
      setForm({
        title: '',
        description: '',
        target_value: '',
        measurement_method: '',
        current_value: '',
        status: 'niet_gemeten',
      })
    }
    open()
  }

  const handleSubmit = () => {
    if (!form.title.trim()) return

    const payload = {
      title: form.title.trim(),
      description: form.description.trim() || null,
      target_value: form.target_value.trim() || null,
      measurement_method: form.measurement_method.trim() || null,
      current_value: form.current_value.trim() || null,
      status: form.status,
    }

    if (editItem) {
      onUpdate({ ...editItem, ...payload })
    } else {
      onAdd(payload)
    }
    close()
  }

  const achieved = indicators.filter((i) => i.status === 'behaald').length
  const total = indicators.length
  const progressPct = total > 0 ? Math.round((achieved / total) * 100) : 0

  return (
    <>
      <Paper p="md" radius="md" withBorder>
        <Group justify="space-between" mb="md">
          <Group gap="sm">
            <IconTarget size={20} />
            <Title order={5}>Succescriteria</Title>
          </Group>
          <Button variant="light" size="xs" leftSection={<IconPlus size={14} />} onClick={() => handleOpen()}>
            Toevoegen
          </Button>
        </Group>

        {indicators.length > 0 && (
          <div style={{ marginBottom: 12 }}>
            <Group justify="space-between" mb={4}>
              <Text size="xs" c="dimmed">{achieved} van {total} behaald</Text>
              <Text size="xs" c="dimmed">{progressPct}%</Text>
            </Group>
            <Progress value={progressPct} size="sm" color="green" />
          </div>
        )}

        {indicators.length === 0 ? (
          <Text c="dimmed" size="sm">
            Nog geen succescriteria gedefinieerd. Voeg criteria toe om het succes van het project te meten.
          </Text>
        ) : (
          <Stack gap="xs">
            {indicators.map((ind) => (
              <Paper key={ind.id} p="xs" radius="sm" withBorder>
                <Group justify="space-between" wrap="nowrap">
                  <div style={{ flex: 1 }}>
                    <Group gap="xs" mb={2}>
                      <Text size="sm" fw={500}>{ind.title}</Text>
                      <Badge
                        size="xs"
                        color={INDICATOR_STATUS_COLORS[ind.status]}
                        variant="light"
                      >
                        {INDICATOR_STATUS_LABELS[ind.status]}
                      </Badge>
                    </Group>
                    {ind.target_value && (
                      <Text size="xs" c="dimmed">
                        Doel: {ind.target_value}
                        {ind.current_value ? ` | Huidig: ${ind.current_value}` : ''}
                      </Text>
                    )}
                  </div>
                  <Group gap={4}>
                    <ActionIcon variant="subtle" size="sm" onClick={() => handleOpen(ind)}>
                      <IconEdit size={14} />
                    </ActionIcon>
                    <ActionIcon variant="subtle" size="sm" color="red" onClick={() => onDelete(ind.id)}>
                      <IconTrash size={14} />
                    </ActionIcon>
                  </Group>
                </Group>
              </Paper>
            ))}
          </Stack>
        )}
      </Paper>

      <Modal opened={opened} onClose={close} title={editItem ? 'Criterium bewerken' : 'Nieuw succescriterium'} centered>
        <Stack gap="md">
          <TextInput
            label="Titel"
            placeholder="Bijv. Klanttevredenheid, Bereik doelgroep"
            required
            value={form.title}
            onChange={(e) => setForm((prev) => ({ ...prev, title: e.currentTarget.value }))}
          />
          <Textarea
            label="Omschrijving"
            placeholder="Wat wil je precies meten?"
            rows={2}
            value={form.description}
            onChange={(e) => setForm((prev) => ({ ...prev, description: e.currentTarget.value }))}
          />
          <TextInput
            label="Doelwaarde"
            placeholder="Bijv. Minimaal 80% tevredenheid"
            value={form.target_value}
            onChange={(e) => setForm((prev) => ({ ...prev, target_value: e.currentTarget.value }))}
          />
          <TextInput
            label="Meetmethode"
            placeholder="Hoe ga je dit meten?"
            value={form.measurement_method}
            onChange={(e) => setForm((prev) => ({ ...prev, measurement_method: e.currentTarget.value }))}
          />
          <TextInput
            label="Huidige waarde"
            placeholder="Vul in na meting"
            value={form.current_value}
            onChange={(e) => setForm((prev) => ({ ...prev, current_value: e.currentTarget.value }))}
          />
          <Select
            label="Status"
            data={STATUS_OPTIONS}
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
