import { useState, useMemo } from 'react'
import { Modal, Stack, Group, TextInput, Select, Button } from '@mantine/core'
import AvatarPicker from './AvatarPicker'

const ROLE_OPTIONS = [
  { value: 'projectlid', label: 'Projectlid' },
  { value: 'projectleider', label: 'Projectleider' },
  { value: 'manager', label: 'Manager' },
]

const EMPTY_FORM = {
  voornaam: '',
  tussenvoegsel: '',
  achternaam: '',
  email: '',
  role: 'projectlid',
  avatar_id: '',
}

/**
 * Modal formulier voor het aanmaken of bewerken van een medewerker.
 */
export default function EmployeeForm({ opened, onClose, onSubmit, editProfile, loading }) {
  const initialForm = useMemo(() => {
    if (!editProfile) return EMPTY_FORM
    return {
      voornaam: editProfile.voornaam || '',
      tussenvoegsel: editProfile.tussenvoegsel || '',
      achternaam: editProfile.achternaam || '',
      email: editProfile.email || '',
      role: editProfile.role || 'projectlid',
      avatar_id: editProfile.avatar_id || '',
    }
  }, [editProfile])

  const [form, setForm] = useState(EMPTY_FORM)

  // Reset form wanneer modal opent (via key prop zou ook kunnen, maar dit is expliciet)
  const [prevOpened, setPrevOpened] = useState(false)
  if (opened && !prevOpened) {
    setForm(initialForm)
  }
  if (opened !== prevOpened) {
    setPrevOpened(opened)
  }

  const handleSubmit = () => {
    if (!form.voornaam.trim() || !form.achternaam.trim() || !form.email.trim()) return
    onSubmit({
      ...form,
      voornaam: form.voornaam.trim(),
      tussenvoegsel: form.tussenvoegsel.trim() || null,
      achternaam: form.achternaam.trim(),
      email: form.email.trim().toLowerCase(),
      avatar_id: form.avatar_id || null,
    })
  }

  const isEditing = !!editProfile

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={isEditing ? 'Medewerker bewerken' : 'Nieuwe medewerker'}
      centered
      size="lg"
    >
      <Stack gap="md">
        <Group grow>
          <TextInput
            label="Voornaam"
            placeholder="Jan"
            required
            value={form.voornaam}
            onChange={(e) => setForm((prev) => ({ ...prev, voornaam: e.currentTarget.value }))}
          />
          <TextInput
            label="Tussenvoegsel"
            placeholder="van"
            value={form.tussenvoegsel}
            onChange={(e) => setForm((prev) => ({ ...prev, tussenvoegsel: e.currentTarget.value }))}
            style={{ maxWidth: 120 }}
          />
          <TextInput
            label="Achternaam"
            placeholder="Jansen"
            required
            value={form.achternaam}
            onChange={(e) => setForm((prev) => ({ ...prev, achternaam: e.currentTarget.value }))}
          />
        </Group>

        <TextInput
          label="E-mailadres"
          placeholder="jan@bibliotheeknwv.nl"
          required
          type="email"
          value={form.email}
          onChange={(e) => setForm((prev) => ({ ...prev, email: e.currentTarget.value }))}
          disabled={isEditing}
          description={isEditing ? 'E-mailadres kan niet worden gewijzigd' : undefined}
        />

        <Select
          label="Rol"
          data={ROLE_OPTIONS}
          value={form.role}
          onChange={(val) => setForm((prev) => ({ ...prev, role: val }))}
        />

        <AvatarPicker
          value={form.avatar_id}
          onChange={(id) => setForm((prev) => ({ ...prev, avatar_id: id }))}
        />

        <Group justify="flex-end" mt="sm">
          <Button variant="default" onClick={onClose}>
            Annuleren
          </Button>
          <Button onClick={handleSubmit} loading={loading}>
            {isEditing ? 'Opslaan' : 'Uitnodigen & aanmaken'}
          </Button>
        </Group>
      </Stack>
    </Modal>
  )
}
