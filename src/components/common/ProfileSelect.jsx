import { Select } from '@mantine/core'

export default function ProfileSelect({ profiles, value, onChange, label, placeholder, ...props }) {
  const data = profiles.map((p) => ({
    value: p.id,
    label: p.full_name || p.id,
  }))

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
      {...props}
    />
  )
}
