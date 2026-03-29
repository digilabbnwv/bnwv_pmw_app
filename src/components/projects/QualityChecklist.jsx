import { Paper, Title, Stack, Group, Checkbox, TextInput, Text } from '@mantine/core'
import { formatDate } from '../../lib/utils/dateUtils'

const ITEMS = [
  { key: 'kickoff', label: 'Kickoff' },
  { key: 'startnotitie', label: 'Startnotitie' },
  { key: 'projectplan', label: 'Projectplan' },
  { key: 'evaluatie', label: 'Evaluatie' },
]

export default function QualityChecklist({ qualityCheck, onUpdate }) {
  if (!qualityCheck) return null

  const handleToggle = (key) => {
    onUpdate({
      ...qualityCheck,
      [`${key}_done`]: !qualityCheck[`${key}_done`],
      [`${key}_date`]: !qualityCheck[`${key}_done`] ? new Date().toISOString().split('T')[0] : null,
    })
  }

  const handleUrlChange = (key, url) => {
    onUpdate({
      ...qualityCheck,
      [`${key}_url`]: url,
    })
  }

  return (
    <Paper withBorder p="md" radius="md">
      <Title order={4} mb="sm">
        Kwaliteitschecklist
      </Title>
      <Stack gap="md">
        {ITEMS.map((item) => (
          <div key={item.key}>
            <Group>
              <Checkbox
                label={item.label}
                checked={qualityCheck[`${item.key}_done`] || false}
                onChange={() => handleToggle(item.key)}
              />
              {qualityCheck[`${item.key}_date`] && (
                <Text size="xs" c="dimmed">
                  {formatDate(qualityCheck[`${item.key}_date`])}
                </Text>
              )}
            </Group>
            <TextInput
              placeholder={`URL naar ${item.label.toLowerCase()}`}
              value={qualityCheck[`${item.key}_url`] || ''}
              onChange={(e) => handleUrlChange(item.key, e?.currentTarget?.value ?? '')}
              size="xs"
              mt={4}
            />
          </div>
        ))}
      </Stack>
    </Paper>
  )
}
