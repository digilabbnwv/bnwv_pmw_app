import { useState, useEffect } from 'react'
import {
  Title,
  TextInput,
  Textarea,
  Button,
  Group,
  Stack,
  Paper,
  Loader,
  Center,
} from '@mantine/core'
import { DateInput } from '@mantine/dates'
import { notifications } from '@mantine/notifications'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { defaultEndDate } from '../lib/utils/dateUtils'
import { PHASES } from '../lib/utils/phaseConfig'

export default function ProjectFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState({
    name: '',
    description: '',
    start_date: null,
    end_date: null,
    sharepoint_project_url: '',
    sharepoint_actions_url: '',
  })

  useEffect(() => {
    if (!isEdit) return
    const fetch = async () => {
      const { data } = await supabase.from('projects').select('*').eq('id', id).single()
      if (data) {
        setForm({
          name: data.name || '',
          description: data.description || '',
          start_date: data.start_date ? new Date(data.start_date) : null,
          end_date: data.end_date ? new Date(data.end_date) : null,
          sharepoint_project_url: data.sharepoint_project_url || '',
          sharepoint_actions_url: data.sharepoint_actions_url || '',
        })
      }
      setLoading(false)
    }
    fetch()
  }, [id, isEdit])

  const handleStartDateChange = (date) => {
    setForm((prev) => ({
      ...prev,
      start_date: date,
      end_date: prev.end_date || defaultEndDate(date),
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) {
      notifications.show({ title: 'Fout', message: 'Projectnaam is verplicht.', color: 'red' })
      return
    }

    setSaving(true)

    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      start_date: form.start_date ? new Date(form.start_date).toISOString().split('T')[0] : null,
      end_date: form.end_date ? new Date(form.end_date).toISOString().split('T')[0] : null,
      sharepoint_project_url: form.sharepoint_project_url.trim() || null,
      sharepoint_actions_url: form.sharepoint_actions_url.trim() || null,
      updated_at: new Date().toISOString(),
    }

    if (isEdit) {
      const { error } = await supabase.from('projects').update(payload).eq('id', id)
      if (error) {
        notifications.show({
          title: 'Fout',
          message: 'Opslaan mislukt. Controleer je verbinding en probeer opnieuw.',
          color: 'red',
        })
        setSaving(false)
        return
      }
      notifications.show({ title: 'Opgeslagen', message: 'Project bijgewerkt.', color: 'green' })
      navigate(`/projects/${id}`)
    } else {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      payload.owner_id = user?.id
      payload.status = 'In opstart'
      payload.current_phase = 'initiatief'

      const { data, error } = await supabase.from('projects').insert(payload).select().single()
      if (error) {
        notifications.show({
          title: 'Fout',
          message: 'Opslaan mislukt. Controleer je verbinding en probeer opnieuw.',
          color: 'red',
        })
        setSaving(false)
        return
      }

      // Create phase records for all 6 phases
      const now = new Date().toISOString()
      const phaseRecords = PHASES.map((phase, index) => ({
        project_id: data.id,
        phase: phase.key,
        started_at: index === 0 ? now : null,
      }))

      await supabase.from('project_phases').insert(phaseRecords)

      // Also create legacy quality_checks for backward compatibility
      await supabase.from('quality_checks').insert({ project_id: data.id })

      notifications.show({ title: 'Aangemaakt', message: 'Project aangemaakt.', color: 'green' })
      navigate(`/projects/${data.id}`)
    }
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
        {isEdit ? 'Project bewerken' : 'Nieuw project'}
      </Title>

      <Paper withBorder p="lg" radius="md" maw={600}>
        <form onSubmit={handleSubmit}>
          <Stack gap="md">
            <TextInput
              label="Projectnaam"
              placeholder="Naam van het project"
              required
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e?.currentTarget?.value ?? '' }))}
            />

            <Textarea
              label="Omschrijving"
              placeholder="Korte omschrijving van het project"
              rows={3}
              value={form.description}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, description: e?.currentTarget?.value ?? '' }))
              }
            />

            <Group grow>
              <DateInput
                label="Startdatum"
                placeholder="Kies een datum"
                value={form.start_date}
                onChange={handleStartDateChange}
                valueFormat="DD-MM-YYYY"
              />
              <DateInput
                label="Einddatum"
                placeholder="Kies een datum"
                value={form.end_date}
                onChange={(date) => setForm((prev) => ({ ...prev, end_date: date }))}
                valueFormat="DD-MM-YYYY"
              />
            </Group>

            <TextInput
              label="SharePoint projectmap URL"
              placeholder="https://..."
              value={form.sharepoint_project_url}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, sharepoint_project_url: e?.currentTarget?.value ?? '' }))
              }
            />

            <TextInput
              label="SharePoint actielijst URL"
              placeholder="https://..."
              value={form.sharepoint_actions_url}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, sharepoint_actions_url: e?.currentTarget?.value ?? '' }))
              }
            />

            <Group justify="flex-end" mt="md">
              <Button variant="default" onClick={() => navigate(-1)}>
                Annuleren
              </Button>
              <Button type="submit" loading={saving}>
                {isEdit ? 'Opslaan' : 'Aanmaken'}
              </Button>
            </Group>
          </Stack>
        </form>
      </Paper>
    </>
  )
}
