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
  Anchor,
  ScrollArea,
  SegmentedControl,
  TypographyStylesProvider,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { IconPlus, IconTrash, IconExternalLink, IconEdit, IconEye } from '@tabler/icons-react'
import ReactMarkdown from 'react-markdown'
import { DELIVERABLE_TYPES, DELIVERABLE_STATUS_COLORS, getPhaseConfig } from '../../lib/utils/phaseConfig'
import { formatDate } from '../../lib/utils/dateUtils'

export default function DeliverableCard({ deliverables, phase, onAdd, onUpdate, onDelete }) {
  const [opened, { open, close }] = useDisclosure(false)
  const [viewOpened, { open: openView, close: closeView }] = useDisclosure(false)
  const [viewItem, setViewItem] = useState(null)
  const [viewMode, setViewMode] = useState('weergave')
  const [editedText, setEditedText] = useState('')
  const [editItem, setEditItem] = useState(null)

  const handleView = (item) => {
    setViewItem(item)
    setEditedText(item.content?.text || '')
    setViewMode('weergave')
    openView()
  }

  const handleSaveContent = () => {
    const updated = { ...viewItem, content: { ...viewItem.content, text: editedText } }
    onUpdate(updated)
    setViewItem(updated)
    setViewMode('weergave')
  }

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
                  {item.content?.text && (
                    <ActionIcon variant="subtle" color="blue" onClick={() => handleView(item)}>
                      <IconEye size={16} />
                    </ActionIcon>
                  )}
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

      <Modal
        opened={viewOpened}
        onClose={closeView}
        title={viewItem?.title}
        size="xl"
        centered
      >
        <Stack gap="sm">
          <Group justify="space-between">
            <SegmentedControl
              size="xs"
              value={viewMode}
              onChange={setViewMode}
              data={[
                { label: 'Weergave', value: 'weergave' },
                { label: 'Bewerken', value: 'bewerken' },
              ]}
            />
            {viewMode === 'bewerken' && (
              <Group gap="xs">
                <Button size="xs" variant="default" onClick={() => setViewMode('weergave')}>Annuleren</Button>
                <Button size="xs" onClick={handleSaveContent}>Opslaan</Button>
              </Group>
            )}
          </Group>

          {viewMode === 'weergave' ? (
            <ScrollArea h={560} offsetScrollbars>
              <TypographyStylesProvider>
                <ReactMarkdown>{editedText}</ReactMarkdown>
              </TypographyStylesProvider>
            </ScrollArea>
          ) : (
            <Textarea
              autosize
              minRows={20}
              maxRows={30}
              value={editedText}
              onChange={(e) => setEditedText(e.currentTarget.value)}
              styles={{ input: { fontFamily: 'monospace', fontSize: 13 } }}
            />
          )}
        </Stack>
      </Modal>

      <Modal opened={opened} onClose={close} title={editItem ? 'Document bewerken' : 'Nieuw document'} centered>
        <Stack gap="md">
          <TextInput
            label="Titel"
            placeholder="Titel van het document"
            required
            value={form.title}
            onChange={(e) => { const v = e.currentTarget.value; setForm((prev) => ({ ...prev, title: v })); }}
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
            onChange={(e) => { const v = e.currentTarget.value; setForm((prev) => ({ ...prev, sharepoint_url: v })); }}
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
