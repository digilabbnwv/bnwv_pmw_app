import { Paper, Group, Text, Badge, ActionIcon, Menu } from '@mantine/core'
import { IconDots, IconEdit, IconTrash, IconMail, IconKey } from '@tabler/icons-react'
import EmployeeAvatar from '../common/EmployeeAvatar'

const ROLE_LABELS = {
  projectleider: 'Projectleider',
  projectlid: 'Projectlid',
  manager: 'Manager',
}

const ROLE_COLORS = {
  manager: 'brand',
  projectleider: 'vraag',
  projectlid: 'gray',
}

/**
 * Kaart voor een individuele medewerker.
 */
export default function EmployeeCard({ profile, onEdit, onDelete, onResendInvite, onResetPassword }) {
  const fullName = profile.full_name || [profile.voornaam, profile.tussenvoegsel, profile.achternaam].filter(Boolean).join(' ')

  return (
    <Paper withBorder p="md" radius="md" style={{ borderLeft: '3px solid var(--mantine-color-ontmoet-5)' }}>
      <Group justify="space-between" wrap="nowrap">
        <Group gap="md">
          <EmployeeAvatar profile={profile} size="md" />
          <div>
            <Group gap="xs" mb={2}>
              <Text fw={600} size="sm">
                {fullName}
              </Text>
              <Badge
                size="xs"
                variant="light"
                color={ROLE_COLORS[profile.role] || 'gray'}
              >
                {ROLE_LABELS[profile.role] || profile.role}
              </Badge>
            </Group>
            <Text size="xs" c="dimmed">
              {profile.email}
            </Text>
          </div>
        </Group>

        <Menu shadow="md" width={200} position="bottom-end">
          <Menu.Target>
            <ActionIcon variant="subtle" color="gray">
              <IconDots size={16} />
            </ActionIcon>
          </Menu.Target>

          <Menu.Dropdown>
            <Menu.Item
              leftSection={<IconEdit size={14} />}
              onClick={() => onEdit(profile)}
            >
              Bewerken
            </Menu.Item>
            <Menu.Item
              leftSection={<IconMail size={14} />}
              onClick={() => onResendInvite(profile)}
            >
              Uitnodiging opnieuw versturen
            </Menu.Item>
            <Menu.Item
              leftSection={<IconKey size={14} />}
              onClick={() => onResetPassword(profile)}
            >
              Wachtwoord resetten
            </Menu.Item>
            <Menu.Divider />
            <Menu.Item
              color="red"
              leftSection={<IconTrash size={14} />}
              onClick={() => onDelete(profile)}
            >
              Verwijderen
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Group>
    </Paper>
  )
}
