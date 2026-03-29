import { Stack, Text, ThemeIcon, Button } from '@mantine/core'
import { IconFolder } from '@tabler/icons-react'

export default function EmptyState({
  icon: Icon = IconFolder,
  title = 'Niets gevonden',
  description,
  actionLabel,
  onAction,
  color = 'gray',
}) {
  return (
    <Stack align="center" gap="md" py="xl">
      <ThemeIcon size={60} radius="xl" color={color} variant="light">
        <Icon size={30} />
      </ThemeIcon>
      <div style={{ textAlign: 'center' }}>
        <Text fw={600} size="lg">{title}</Text>
        {description && (
          <Text c="dimmed" size="sm" mt={4} maw={400}>
            {description}
          </Text>
        )}
      </div>
      {actionLabel && onAction && (
        <Button variant="light" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </Stack>
  )
}
