import { Paper, Group, Button, ThemeIcon } from '@mantine/core'
import { IconSparkles, IconCheck, IconX } from '@tabler/icons-react'
import MarkdownContent from '../common/MarkdownContent'

export default function AiSuggestionCard({ suggestion, onAccept, onReject }) {
  return (
    <Paper
      p="sm"
      radius="md"
      withBorder
      style={{
        borderColor: 'var(--mantine-color-violet-4)',
        background: 'var(--mantine-color-violet-light)',
      }}
    >
      <Group gap="sm" align="flex-start" wrap="nowrap">
        <ThemeIcon size="sm" color="violet" variant="light" mt={2}>
          <IconSparkles size={12} />
        </ThemeIcon>
        <div style={{ flex: 1 }}>
          <MarkdownContent content={suggestion} />
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
