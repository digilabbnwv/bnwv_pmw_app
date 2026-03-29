import { Paper, Group, Text, Badge, ActionIcon, Select, Avatar, Tooltip } from '@mantine/core'
import { IconEdit, IconTrash } from '@tabler/icons-react'
import { formatDate } from '../../lib/utils/dateUtils'

const CATEGORY_COLORS = {
  marketing: 'pink',
  communicatie: 'blue',
  evenement: 'orange',
  social_media: 'cyan',
  pers: 'grape',
  overig: 'gray',
}

const CATEGORY_LABELS = {
  marketing: 'Marketing',
  communicatie: 'Communicatie',
  evenement: 'Evenement',
  social_media: 'Social media',
  pers: 'Pers',
  overig: 'Overig',
}

const STATUS_OPTIONS = [
  { value: 'idee', label: 'Idee' },
  { value: 'goedgekeurd', label: 'Goedgekeurd' },
  { value: 'in_uitvoering', label: 'In uitvoering' },
  { value: 'afgerond', label: 'Afgerond' },
  { value: 'afgewezen', label: 'Afgewezen' },
]

export default function IdeaCard({ idea, profiles, onUpdate, onDelete, onEdit }) {
  const assignee = profiles.find((p) => p.id === idea.assigned_to)

  const getInitials = (name) => {
    if (!name) return '?'
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
  }

  return (
    <Paper p="sm" radius="md" withBorder>
      <Group justify="space-between" wrap="nowrap" mb="xs">
        <Group gap="xs">
          <Badge size="xs" color={CATEGORY_COLORS[idea.category]} variant="light">
            {CATEGORY_LABELS[idea.category]}
          </Badge>
        </Group>
        <Group gap={4}>
          <ActionIcon variant="subtle" size="sm" onClick={() => onEdit(idea)}>
            <IconEdit size={14} />
          </ActionIcon>
          <ActionIcon variant="subtle" size="sm" color="red" onClick={() => onDelete(idea.id)}>
            <IconTrash size={14} />
          </ActionIcon>
        </Group>
      </Group>

      <Text fw={600} size="sm" mb={4}>{idea.title}</Text>
      {idea.description && (
        <Text size="xs" c="dimmed" lineClamp={3} mb="xs">{idea.description}</Text>
      )}

      <Group justify="space-between" mt="xs">
        <Select
          data={STATUS_OPTIONS}
          value={idea.status}
          onChange={(val) => onUpdate({ ...idea, status: val })}
          size="xs"
          w={130}
          variant="unstyled"
          styles={{ input: { fontWeight: 500, fontSize: 12 } }}
        />
        <Group gap="xs">
          {assignee && (
            <Tooltip label={assignee.full_name}>
              <Avatar radius="xl" size="xs" color="brand">
                {getInitials(assignee.full_name)}
              </Avatar>
            </Tooltip>
          )}
          {idea.target_date && (
            <Text size="xs" c="dimmed">{formatDate(idea.target_date)}</Text>
          )}
        </Group>
      </Group>
    </Paper>
  )
}

export { CATEGORY_COLORS, CATEGORY_LABELS }
