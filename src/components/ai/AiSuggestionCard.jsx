import { Paper, Text, Group, Button, ThemeIcon } from '@mantine/core'
import { IconSparkles, IconCheck, IconX } from '@tabler/icons-react'

export default function AiSuggestionCard({ suggestion, onAccept, onReject }) {
  return (
    <Paper p="sm" radius="md" withBorder bg="violet.0" style={{ borderColor: 'var(--mantine-color-violet-3)' }}>
      <Group gap="sm" align="flex-start" wrap="nowrap">
        <ThemeIcon size="sm" color="violet" variant="light" mt={2}>
          <IconSparkles size={12} />
        </ThemeIcon>
        <div style={{ flex: 1 }}>
          <Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>{suggestion}</Text>
          <Group gap="xs" mt="xs">
            <Button
              size="compact-xs"
              variant="light"
              color="green"
              leftSection={<IconCheck size={12} />}
              onClick={() => onAccept(suggestion)}
            >
              Overnemen
            </Button>
            <Button
              size="compact-xs"
              variant="subtle"
              color="gray"
              leftSection={<IconX size={12} />}
              onClick={onReject}
            >
              Afwijzen
            </Button>
          </Group>
        </div>
      </Group>
    </Paper>
  )
}
