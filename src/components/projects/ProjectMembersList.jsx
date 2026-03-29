import { useState } from 'react'
import { Paper, Title, Stack, Group, Text, ActionIcon, Button, Avatar, Badge } from '@mantine/core'
import { IconTrash, IconPlus } from '@tabler/icons-react'
import ProfileSelect from '../common/ProfileSelect'

export default function ProjectMembersList({ members, profiles, onAdd, onRemove }) {
  const [selectedId, setSelectedId] = useState(null)

  const handleAdd = () => {
    if (selectedId) {
      onAdd(selectedId)
      setSelectedId(null)
    }
  }

  const getInitials = (name) => {
    if (!name) return '?'
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const availableProfiles = profiles.filter(
    (p) => !members.some((m) => m.profile_id === p.id)
  )

  return (
    <Paper withBorder p="md" radius="md">
      <Title order={5} mb="sm">
        Projectgroepleden
      </Title>

      {members.length === 0 ? (
        <Text c="dimmed" size="sm" mb="md">
          Nog geen leden toegevoegd.
        </Text>
      ) : (
        <Stack gap="xs" mb="md">
          {members.map((member) => {
            const profile = profiles.find((p) => p.id === member.profile_id)
            return (
              <Group key={member.id} justify="space-between" wrap="nowrap">
                <Group gap="sm">
                  <Avatar radius="xl" size="sm" color="brand">
                    {getInitials(profile?.full_name)}
                  </Avatar>
                  <div>
                    <Text size="sm" fw={500}>
                      {profile?.full_name || 'Onbekend'}
                    </Text>
                    {profile?.role && (
                      <Badge size="xs" variant="light" color="gray">
                        {profile.role}
                      </Badge>
                    )}
                  </div>
                </Group>
                <ActionIcon
                  color="red"
                  variant="subtle"
                  onClick={() => onRemove(member.id)}
                  aria-label="Verwijder lid"
                >
                  <IconTrash size={16} />
                </ActionIcon>
              </Group>
            )
          })}
        </Stack>
      )}

      <Group gap="sm">
        <div style={{ flex: 1 }}>
          <ProfileSelect
            profiles={availableProfiles}
            value={selectedId}
            onChange={setSelectedId}
            label={null}
            placeholder="Collega toevoegen..."
            size="sm"
          />
        </div>
        <Button size="sm" leftSection={<IconPlus size={14} />} onClick={handleAdd} disabled={!selectedId}>
          Toevoegen
        </Button>
      </Group>
    </Paper>
  )
}
