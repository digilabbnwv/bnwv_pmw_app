import { useState } from 'react'
import { Modal, Stack, TextInput, Textarea, Select, Group, Button } from '@mantine/core'
import { DateInput } from '@mantine/dates'
import ProfileSelect from '../common/ProfileSelect'

const CATEGORY_OPTIONS = [
  { value: 'marketing', label: 'Marketing' },
  { value: 'communicatie', label: 'Communicatie' },
  { value: 'evenement', label: 'Evenement' },
  { value: 'social_media', label: 'Social media' },
  { value: 'pers', label: 'Pers' },
  { value: 'overig', label: 'Overig' },
]

export default function IdeaForm({ opened, onClose, onSubmit, editItem, profiles }) {
  const [form, setForm] = useState(
    editItem
      ? {
          title: editItem.title,
          description: editItem.description || '',
          category: editItem.category,
          assigned_to: editItem.assigned_to,
          target_date: editItem.target_date ? new Date(editItem.target_date) : null,
        }
      : {
          title: '',
          description: '',
          category: 'overig',
          assigned_to: null,
          target_date: null,
        }
  )

  const handleSubmit = () => {
    if (!form.title.trim()) return

    onSubmit({
      ...(editItem || {}),
      title: form.title.trim(),
      description: form.description.trim() || null,
      category: form.category,
      assigned_to: form.assigned_to || null,
      target_date: form.target_date ? new Date(form.target_date).toISOString().split('T')[0] : null,
    })
    onClose()
  }

  return (
    <Modal opened={opened} onClose={onClose} title={editItem ? 'Idee bewerken' : 'Nieuw idee'} centered>
      <Stack gap="md">
        <TextInput
          label="Titel"
          placeholder="Kort en krachtig"
          required
          value={form.title}
          onChange={(e) => setForm((prev) => ({ ...prev, title: e.currentTarget.value }))}
        />
        <Textarea
          label="Omschrijving"
          placeholder="Beschrijf het idee..."
          rows={3}
          value={form.description}
          onChange={(e) => setForm((prev) => ({ ...prev, description: e.currentTarget.value }))}
        />
        <Select
          label="Categorie"
          data={CATEGORY_OPTIONS}
          value={form.category}
          onChange={(val) => setForm((prev) => ({ ...prev, category: val }))}
        />
        <ProfileSelect
          profiles={profiles}
          value={form.assigned_to}
          onChange={(val) => setForm((prev) => ({ ...prev, assigned_to: val }))}
          label="Toegewezen aan"
        />
        <DateInput
          label="Streefdatum"
          placeholder="Kies een datum"
          value={form.target_date}
          onChange={(date) => setForm((prev) => ({ ...prev, target_date: date }))}
          valueFormat="DD-MM-YYYY"
          clearable
        />
        <Group justify="flex-end">
          <Button variant="default" onClick={onClose}>Annuleren</Button>
          <Button onClick={handleSubmit}>{editItem ? 'Opslaan' : 'Toevoegen'}</Button>
        </Group>
      </Stack>
    </Modal>
  )
}
