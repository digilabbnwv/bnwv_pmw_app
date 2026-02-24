import { useState, useEffect } from 'react'
import { Title, TextInput, Button, Paper, Stack, Text, Badge, Group, Loader, Center } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { supabase } from '../lib/supabaseClient'

export default function SettingsPage() {
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [mfaEnabled, setMfaEnabled] = useState(false)

  useEffect(() => {
    const fetch = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .single()

        if (profile) {
          setFullName(profile.full_name || '')
        }

        const { data: factors } = await supabase.auth.mfa.listFactors()
        setMfaEnabled((factors?.totp || []).length > 0)
      }

      setLoading(false)
    }
    fetch()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const { error } = await supabase
      .from('profiles')
      .upsert({ id: user.id, full_name: fullName.trim() })

    if (error) {
      notifications.show({
        title: 'Fout',
        message: 'Opslaan mislukt. Controleer je verbinding en probeer opnieuw.',
        color: 'red',
      })
    } else {
      notifications.show({ title: 'Opgeslagen', message: 'Profiel bijgewerkt.', color: 'green' })
    }
    setSaving(false)
  }

  const handleResetMfa = async () => {
    const { data: factors } = await supabase.auth.mfa.listFactors()
    const totpFactors = factors?.totp || []

    for (const factor of totpFactors) {
      await supabase.auth.mfa.unenroll({ factorId: factor.id })
    }

    notifications.show({
      title: '2FA gereset',
      message: 'Log opnieuw in om 2FA opnieuw in te stellen.',
      color: 'blue',
    })

    await supabase.auth.signOut()
  }

  if (loading) {
    return (
      <Center py="xl">
        <Loader />
      </Center>
    )
  }

  return (
    <>
      <Title order={2} mb="lg">
        Instellingen
      </Title>

      <Stack gap="lg" maw={500}>
        <Paper withBorder p="md" radius="md">
          <Title order={4} mb="sm">
            Profiel
          </Title>
          <Stack gap="sm">
            <TextInput
              label="Volledige naam"
              placeholder="Je naam"
              value={fullName}
              onChange={(e) => setFullName(e.currentTarget.value)}
            />
            <Button onClick={handleSave} loading={saving}>
              Opslaan
            </Button>
          </Stack>
        </Paper>

        <Paper withBorder p="md" radius="md">
          <Title order={4} mb="sm">
            Twee-factor authenticatie
          </Title>
          <Group mb="sm">
            <Text size="sm">Status:</Text>
            <Badge color={mfaEnabled ? 'green' : 'red'} variant="light">
              {mfaEnabled ? 'Actief' : 'Niet actief'}
            </Badge>
          </Group>
          {mfaEnabled && (
            <Button variant="light" color="red" onClick={handleResetMfa}>
              2FA opnieuw instellen
            </Button>
          )}
        </Paper>
      </Stack>
    </>
  )
}
