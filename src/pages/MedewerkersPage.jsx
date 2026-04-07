import { useState, useEffect, useReducer } from 'react'
import {
  Title,
  Group,
  Button,
  TextInput,
  Stack,
  Skeleton,
  Text,
  Select,
} from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { useDisclosure } from '@mantine/hooks'
import { IconPlus, IconSearch } from '@tabler/icons-react'
import { supabase } from '../lib/supabaseClient'
import EmployeeCard from '../components/medewerkers/EmployeeCard'
import EmployeeForm from '../components/medewerkers/EmployeeForm'

const ROLE_FILTER_OPTIONS = [
  { value: '', label: 'Alle rollen' },
  { value: 'manager', label: 'Manager' },
  { value: 'projectleider', label: 'Projectleider' },
  { value: 'projectlid', label: 'Projectlid' },
]

export default function MedewerkersPage() {
  const [profiles, setProfiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [editProfile, setEditProfile] = useState(null)
  const [opened, { open, close }] = useDisclosure(false)

  // Counter om een refetch te triggeren vanuit event handlers
  const [fetchTrigger, triggerRefetch] = useReducer((x) => x + 1, 0)

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('full_name', { ascending: true })

      if (!error) {
        setProfiles(data || [])
      }
      setLoading(false)
    }
    load()
  }, [fetchTrigger])

  const handleOpenNew = () => {
    setEditProfile(null)
    open()
  }

  const handleEdit = (profile) => {
    setEditProfile(profile)
    open()
  }

  const handleSubmit = async (formData) => {
    setSaving(true)

    if (editProfile) {
      // Bewerk bestaand profiel
      const { error } = await supabase
        .from('profiles')
        .update({
          voornaam: formData.voornaam,
          tussenvoegsel: formData.tussenvoegsel,
          achternaam: formData.achternaam,
          role: formData.role,
          avatar_id: formData.avatar_id,
        })
        .eq('id', editProfile.id)

      setSaving(false)

      if (error) {
        notifications.show({ title: 'Fout', message: 'Opslaan mislukt: ' + error.message, color: 'red' })
      } else {
        notifications.show({ title: 'Opgeslagen', message: 'Medewerker bijgewerkt.', color: 'green' })
        close()
        triggerRefetch()
      }
    } else {
      // Nieuwe medewerker: invite via Edge Function
      try {
        const { data: { session } } = await supabase.auth.getSession()
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/invite-employee`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${session?.access_token}`,
              apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
            },
            body: JSON.stringify({ action: 'invite', ...formData }),
          }
        )

        const result = await response.json()
        setSaving(false)

        if (!response.ok) {
          notifications.show({ title: 'Fout', message: result.error || 'Uitnodigen mislukt.', color: 'red' })
        } else {
          notifications.show({
            title: 'Uitnodiging verstuurd',
            message: `${formData.voornaam} ontvangt een e-mail om een wachtwoord in te stellen.`,
            color: 'green',
          })
          close()
          triggerRefetch()
        }
      } catch (err) {
        setSaving(false)
        notifications.show({ title: 'Fout', message: 'Kon geen verbinding maken met de server.', color: 'red' })
      }
    }
  }

  const handleDelete = async (profile) => {
    const confirmed = window.confirm(
      `Weet je zeker dat je ${profile.full_name} wilt verwijderen? Dit verwijdert ook het account en alle koppelingen aan projecten.`
    )
    if (!confirmed) return

    try {
      const { data: { session } } = await supabase.auth.getSession()
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/invite-employee`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session?.access_token}`,
            apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({ action: 'delete', user_id: profile.id }),
        }
      )

      const result = await response.json()

      if (!response.ok) {
        notifications.show({ title: 'Fout', message: result.error || 'Verwijderen mislukt.', color: 'red' })
      } else {
        notifications.show({ title: 'Verwijderd', message: `${profile.full_name} is verwijderd.`, color: 'green' })
        triggerRefetch()
      }
    } catch {
      notifications.show({ title: 'Fout', message: 'Kon geen verbinding maken met de server.', color: 'red' })
    }
  }

  const handleResendInvite = async (profile) => {
    if (!profile.email) {
      notifications.show({ title: 'Fout', message: 'Geen e-mailadres bekend.', color: 'red' })
      return
    }

    try {
      const { data: { session } } = await supabase.auth.getSession()
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/invite-employee`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session?.access_token}`,
            apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({ action: 'resend', email: profile.email }),
        }
      )

      const result = await response.json()

      if (!response.ok) {
        notifications.show({ title: 'Fout', message: result.error || 'Versturen mislukt.', color: 'red' })
      } else {
        notifications.show({
          title: 'Verstuurd',
          message: `Uitnodiging opnieuw verstuurd naar ${profile.email}.`,
          color: 'green',
        })
      }
    } catch {
      notifications.show({ title: 'Fout', message: 'Kon geen verbinding maken met de server.', color: 'red' })
    }
  }

  const handleResetPassword = async (profile) => {
    if (!profile.email) {
      notifications.show({ title: 'Fout', message: 'Geen e-mailadres bekend.', color: 'red' })
      return
    }

    const { error } = await supabase.auth.resetPasswordForEmail(profile.email, {
      redirectTo: `${window.location.origin}/bnwv_pmw_app/login`,
    })

    if (error) {
      notifications.show({ title: 'Fout', message: error.message, color: 'red' })
    } else {
      notifications.show({
        title: 'Wachtwoord reset',
        message: `${profile.full_name} ontvangt een e-mail om een nieuw wachtwoord in te stellen.`,
        color: 'green',
      })
    }
  }

  const filtered = profiles.filter((p) => {
    const name = (p.full_name || '').toLowerCase()
    const email = (p.email || '').toLowerCase()
    const matchesSearch = name.includes(search.toLowerCase()) || email.includes(search.toLowerCase())
    const matchesRole = !roleFilter || p.role === roleFilter
    return matchesSearch && matchesRole
  })

  return (
    <>
      <Group justify="space-between" mb="lg">
        <Title order={2}>Medewerkers</Title>
        <Button
          leftSection={<IconPlus size={16} />}
          onClick={handleOpenNew}
        >
          Nieuwe medewerker
        </Button>
      </Group>

      <Group mb="md">
        <TextInput
          placeholder="Zoeken op naam of e-mail..."
          leftSection={<IconSearch size={16} />}
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
          style={{ flex: 1 }}
        />
        <Select
          placeholder="Filter op rol"
          data={ROLE_FILTER_OPTIONS}
          value={roleFilter}
          onChange={(val) => setRoleFilter(val || '')}
          clearable
          w={200}
        />
      </Group>

      {loading ? (
        <Stack gap="sm">
          <Skeleton height={70} radius="md" />
          <Skeleton height={70} radius="md" />
          <Skeleton height={70} radius="md" />
        </Stack>
      ) : filtered.length === 0 ? (
        <Text c="dimmed" ta="center" mt="xl">
          {profiles.length === 0
            ? 'Nog geen medewerkers. Voeg je eerste collega toe!'
            : 'Geen medewerkers gevonden.'}
        </Text>
      ) : (
        <Stack gap="sm">
          {filtered.map((profile) => (
            <EmployeeCard
              key={profile.id}
              profile={profile}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onResendInvite={handleResendInvite}
              onResetPassword={handleResetPassword}
            />
          ))}
        </Stack>
      )}

      <EmployeeForm
        opened={opened}
        onClose={close}
        onSubmit={handleSubmit}
        editProfile={editProfile}
        loading={saving}
      />
    </>
  )
}
