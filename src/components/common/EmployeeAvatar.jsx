import { Avatar, Tooltip } from '@mantine/core'
import { getAvatarById, getInitials } from '../../lib/utils/avatarConfig'

/**
 * Speelse avatar-component voor medewerkers.
 * Toont het gekozen emoji-avatar of valt terug op initialen.
 *
 * @param {{ profile: { avatar_id?: string, full_name?: string }, size?: string, showTooltip?: boolean }} props
 */
export default function EmployeeAvatar({ profile, size = 'sm', showTooltip = false, ...props }) {
  const avatar = profile?.avatar_id ? getAvatarById(profile.avatar_id) : null
  const name = profile?.full_name || 'Onbekend'

  const avatarElement = avatar ? (
    <Avatar
      radius="xl"
      size={size}
      color="white"
      style={{
        backgroundColor: avatar.color,
        fontSize: size === 'lg' ? 24 : size === 'md' ? 18 : 14,
      }}
      {...props}
    >
      {avatar.emoji}
    </Avatar>
  ) : (
    <Avatar radius="xl" size={size} color="brand" {...props}>
      {getInitials(name)}
    </Avatar>
  )

  if (showTooltip) {
    return <Tooltip label={name}>{avatarElement}</Tooltip>
  }

  return avatarElement
}
