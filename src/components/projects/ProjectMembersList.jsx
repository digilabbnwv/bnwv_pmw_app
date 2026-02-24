import { useState } from 'react'
import { Paper, Title, Stack, Group, Text, ActionIcon, TextInput, Button } from '@mantine/core'
import { IconTrash, IconPlus } from '@tabler/icons-react'

export default function ProjectMembersList({ members, profiles, onAdd, onRemove }) {
  const [newMemberId, setNewMemberId] = useState('')

  const handleAdd = () => {
    if (newMemberId.trim()) {
      onAdd(newMemberId.trim())
      setNewMemberId('')
    }
  }

  return (
    <Paper withBorder p="md" radius="md">
      <Title order={4} mb="sm">
        Projectgroepleden
      </Title>

      {members.length === 0 ? (
        <Text c="dimmed" size="sm">
          Geen leden toegevoegd.
        </Text>
      ) : (
        <Stack gap="xs" mb="md">
          {members.map((member) => {
            const profile = profiles.find((p) => p.id === member.profile_id)
            return (
              <Group key={member.id} justify="space-between">
                <div>
                  <Text size="sm" fw={500}>
                    {profile?.full_name || 'Onbekend'}
                  </Text>
                  {member.role && (
                    <Text size="xs" c="dimmed">
                      {member.role}
                    </Text>
                  )}
                </div>
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

      <Group>
        <TextInput
          placeholder="Profiel ID toevoegen"
          value={newMemberId}
          onChange={(e) => setNewMemberId(e.currentTarget.value)}
          size="xs"
          style={{ flex: 1 }}
        />
        <Button size="xs" leftSection={<IconPlus size={14} />} onClick={handleAdd}>
          Toevoegen
        </Button>
      </Group>
    </Paper>
  )
}
