import { SimpleGrid, UnstyledButton, Text, Stack, Tooltip } from '@mantine/core'
import { AVATARS } from '../../lib/utils/avatarConfig'

/**
 * Raster van speelse avatars om uit te kiezen.
 */
export default function AvatarPicker({ value, onChange }) {
  return (
    <Stack gap="xs">
      <Text size="sm" fw={500}>
        Kies een avatar
      </Text>
      <SimpleGrid cols={8} spacing="xs">
        {AVATARS.map((avatar) => {
          const isSelected = value === avatar.id
          return (
            <Tooltip key={avatar.id} label={avatar.label} position="top" withArrow>
              <UnstyledButton
                onClick={() => onChange(avatar.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  fontSize: 22,
                  backgroundColor: isSelected ? avatar.color : 'var(--mantine-color-gray-1)',
                  border: isSelected
                    ? `2px solid ${avatar.color}`
                    : '2px solid transparent',
                  transition: 'all 0.15s ease',
                  opacity: isSelected ? 1 : 0.7,
                  filter: isSelected ? 'none' : 'grayscale(0.3)',
                }}
              >
                {avatar.emoji}
              </UnstyledButton>
            </Tooltip>
          )
        })}
      </SimpleGrid>
    </Stack>
  )
}
