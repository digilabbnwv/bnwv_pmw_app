import { Select, Group, Text } from '@mantine/core'
import EmployeeAvatar from './EmployeeAvatar'

export default function ProfileSelect({ profiles, value, onChange, label, placeholder, ...props }) {
  const data = profiles.map((p) => ({
    value: p.id,
    label: p.full_name || p.id,
  }))

  const renderOption = ({ option }) => {
    const profile = profiles.find((p) => p.id === option.value)
    return (
      <Group gap="sm" wrap="nowrap">
        <EmployeeAvatar profile={profile} size="xs" />
        <Text size="sm">{option.label}</Text>
      </Group>
    )
  }

  return (
    <Select
      label={label || 'Selecteer collega'}
      placeholder={placeholder || 'Zoek op naam...'}
      data={data}
      value={value}
      onChange={onChange}
      searchable
      clearable
      nothingFoundMessage="Geen collega's gevonden"
      renderOption={renderOption}
      {...props}
    />
  )
}
