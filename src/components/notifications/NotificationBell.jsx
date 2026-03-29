import { ActionIcon, Indicator, Popover, Stack, Group, Text, Button, Paper, ScrollArea, Badge } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { IconBell, IconCheck } from '@tabler/icons-react'
import { useNavigate } from 'react-router-dom'
import { useNotifications } from '../../lib/hooks/useNotifications'
import { formatDate } from '../../lib/utils/dateUtils'

export default function NotificationBell() {
  const [opened, { toggle, close }] = useDisclosure(false)
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications()
  const navigate = useNavigate()

  const handleClick = (notification) => {
    markAsRead(notification.id)
    if (notification.link) {
      navigate(notification.link)
      close()
    }
  }

  return (
    <Popover width={360} position="bottom-end" shadow="md" opened={opened} onChange={toggle}>
      <Popover.Target>
        <Indicator disabled={unreadCount === 0} label={unreadCount} size={16} color="red" offset={4}>
          <ActionIcon
            variant="default"
            size="lg"
            onClick={toggle}
            aria-label="Meldingen"
          >
            <IconBell size={18} />
          </ActionIcon>
        </Indicator>
      </Popover.Target>

      <Popover.Dropdown p={0}>
        <Group justify="space-between" p="sm" style={{ borderBottom: '1px solid var(--mantine-color-gray-3)' }}>
          <Text fw={600} size="sm">Meldingen</Text>
          {unreadCount > 0 && (
            <Button
              size="compact-xs"
              variant="subtle"
              leftSection={<IconCheck size={12} />}
              onClick={markAllAsRead}
            >
              Alles gelezen
            </Button>
          )}
        </Group>

        <ScrollArea.Autosize mah={400}>
          {notifications.length === 0 ? (
            <Text c="dimmed" size="sm" ta="center" p="lg">
              Geen meldingen
            </Text>
          ) : (
            <Stack gap={0}>
              {notifications.map((n) => (
                <Paper
                  key={n.id}
                  p="sm"
                  style={{
                    cursor: n.link ? 'pointer' : 'default',
                    backgroundColor: n.read ? 'transparent' : 'var(--mantine-color-blue-0)',
                    borderBottom: '1px solid var(--mantine-color-gray-2)',
                  }}
                  onClick={() => handleClick(n)}
                >
                  <Group justify="space-between" wrap="nowrap">
                    <div>
                      <Text size="sm" fw={n.read ? 400 : 600}>{n.title}</Text>
                      {n.message && (
                        <Text size="xs" c="dimmed" lineClamp={2}>{n.message}</Text>
                      )}
                    </div>
                    {!n.read && (
                      <Badge size="xs" color="blue" variant="filled" circle>
                        {' '}
                      </Badge>
                    )}
                  </Group>
                  <Text size="xs" c="dimmed" mt={2}>{formatDate(n.created_at)}</Text>
                </Paper>
              ))}
            </Stack>
          )}
        </ScrollArea.Autosize>
      </Popover.Dropdown>
    </Popover>
  )
}
