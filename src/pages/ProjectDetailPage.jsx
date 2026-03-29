import { useState, useCallback } from 'react'
import {
  Title,
  Text,
  Group,
  Button,
  Stack,
  Paper,
  Anchor,
  Loader,
  Center,
  Grid,
  Divider,
  Badge,
} from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { IconEdit, IconExternalLink, IconSparkles } from '@tabler/icons-react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useProject } from '../lib/hooks/useProject'
import { useActivityLog } from '../lib/hooks/useActivityLog'
import { formatDate } from '../lib/utils/dateUtils'
import { getPhaseLabel, getPhaseColor, getNextPhase, PHASES } from '../lib/utils/phaseConfig'
import PhaseTimeline from '../components/projects/PhaseTimeline'
import PhaseWorkspace from '../components/projects/PhaseWorkspace'
import PhaseGate from '../components/projects/PhaseGate'
import ProjectMembersList from '../components/projects/ProjectMembersList'
import SuccessIndicators from '../components/projects/SuccessIndicators'
import ActivityFeed from '../components/projects/ActivityFeed'

export default function ProjectDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const {
    project, setProject,
    phases, setPhases,
    members, setMembers,
    profiles,
    deliverables, setDeliverables,
    tasks, setTasks,
    comments, setComments,
    indicators, setIndicators,
    activity, setActivity,
    loading,
    refetch,
  } = useProject(id)
  const { log } = useActivityLog(id)

  const [selectedPhase, setSelectedPhase] = useState(null)

  const activePhase = selectedPhase || project?.current_phase || 'initiatief'

  // ---- Deliverables ----
  const handleAddDeliverable = async (payload) => {
    const { data: { user } } = await supabase.auth.getUser()
    const { data, error } = await supabase
      .from('project_deliverables')
      .insert({ ...payload, project_id: id, created_by: user?.id })
      .select()
      .single()

    if (error) {
      notifications.show({ title: 'Fout', message: 'Document toevoegen mislukt.', color: 'red' })
    } else {
      setDeliverables((prev) => [data, ...prev])
      await log('deliverable_created', 'deliverable', data.id, { title: data.title })
      notifications.show({ title: 'Toegevoegd', message: 'Document aangemaakt.', color: 'green' })
    }
  }

  const handleUpdateDeliverable = async (item) => {
    const { error } = await supabase
      .from('project_deliverables')
      .update({
        title: item.title,
        type: item.type,
        status: item.status,
        sharepoint_url: item.sharepoint_url,
        updated_at: new Date().toISOString(),
      })
      .eq('id', item.id)

    if (error) {
      notifications.show({ title: 'Fout', message: 'Opslaan mislukt.', color: 'red' })
    } else {
      setDeliverables((prev) => prev.map((d) => (d.id === item.id ? item : d)))
      await log('deliverable_updated', 'deliverable', item.id, { title: item.title })
    }
  }

  const handleDeleteDeliverable = async (deliverableId) => {
    const { error } = await supabase.from('project_deliverables').delete().eq('id', deliverableId)
    if (!error) {
      setDeliverables((prev) => prev.filter((d) => d.id !== deliverableId))
    }
  }

  // ---- Tasks ----
  const handleAddTask = async (payload) => {
    const { data: { user } } = await supabase.auth.getUser()
    const { data, error } = await supabase
      .from('project_tasks')
      .insert({ ...payload, project_id: id, created_by: user?.id })
      .select()
      .single()

    if (error) {
      notifications.show({ title: 'Fout', message: 'Taak toevoegen mislukt.', color: 'red' })
    } else {
      setTasks((prev) => [...prev, data])
      await log('task_created', 'task', data.id, { title: data.title })
      notifications.show({ title: 'Toegevoegd', message: 'Taak aangemaakt.', color: 'green' })
    }
  }

  const handleUpdateTask = async (item) => {
    const wasCompleted = item.status === 'afgerond'
    const { error } = await supabase
      .from('project_tasks')
      .update({
        title: item.title,
        description: item.description,
        assigned_to: item.assigned_to,
        due_date: item.due_date,
        status: item.status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', item.id)

    if (!error) {
      setTasks((prev) => prev.map((t) => (t.id === item.id ? item : t)))
      if (wasCompleted) {
        await log('task_completed', 'task', item.id, { title: item.title })
      }
    }
  }

  const handleDeleteTask = async (taskId) => {
    const { error } = await supabase.from('project_tasks').delete().eq('id', taskId)
    if (!error) {
      setTasks((prev) => prev.filter((t) => t.id !== taskId))
    }
  }

  // ---- Comments ----
  const handleAddComment = async (payload) => {
    const { data: { user } } = await supabase.auth.getUser()
    const { data, error } = await supabase
      .from('project_comments')
      .insert({ ...payload, project_id: id, author_id: user?.id })
      .select()
      .single()

    if (error) {
      notifications.show({ title: 'Fout', message: 'Opmerking plaatsen mislukt.', color: 'red' })
    } else {
      setComments((prev) => [data, ...prev])
      await log('comment_added', 'comment', data.id)
    }
  }

  // ---- Indicators ----
  const handleAddIndicator = async (payload) => {
    const { data, error } = await supabase
      .from('success_indicators')
      .insert({ ...payload, project_id: id })
      .select()
      .single()

    if (error) {
      notifications.show({ title: 'Fout', message: 'Criterium toevoegen mislukt.', color: 'red' })
    } else {
      setIndicators((prev) => [...prev, data])
    }
  }

  const handleUpdateIndicator = async (item) => {
    const { error } = await supabase
      .from('success_indicators')
      .update({
        title: item.title,
        description: item.description,
        target_value: item.target_value,
        measurement_method: item.measurement_method,
        current_value: item.current_value,
        status: item.status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', item.id)

    if (!error) {
      setIndicators((prev) => prev.map((i) => (i.id === item.id ? item : i)))
      await log('indicator_updated', 'indicator', item.id, { title: item.title })
    }
  }

  const handleDeleteIndicator = async (indicatorId) => {
    const { error } = await supabase.from('success_indicators').delete().eq('id', indicatorId)
    if (!error) {
      setIndicators((prev) => prev.filter((i) => i.id !== indicatorId))
    }
  }

  // ---- Members ----
  const handleAddMember = async (profileId) => {
    const { data, error } = await supabase
      .from('project_members')
      .insert({ project_id: id, profile_id: profileId })
      .select()
      .single()

    if (error) {
      notifications.show({ title: 'Fout', message: 'Lid toevoegen mislukt.', color: 'red' })
    } else {
      setMembers((prev) => [...prev, data])
      const profile = profiles.find((p) => p.id === profileId)
      await log('member_added', 'member', data.id, { name: profile?.full_name })
    }
  }

  const handleRemoveMember = async (memberId) => {
    const { error } = await supabase.from('project_members').delete().eq('id', memberId)
    if (!error) {
      setMembers((prev) => prev.filter((m) => m.id !== memberId))
      await log('member_removed', 'member', memberId)
    }
  }

  // ---- Phase Gate ----
  const handlePhaseApprove = async (phaseKey, notes) => {
    const phaseRecord = phases.find((p) => p.phase === phaseKey)
    if (!phaseRecord) return

    const { data: { user } } = await supabase.auth.getUser()
    const now = new Date().toISOString()

    const { error: gateError } = await supabase
      .from('project_phases')
      .update({
        gate_approved: true,
        gate_approved_by: user?.id,
        gate_approved_at: now,
        gate_notes: notes || null,
        completed_at: now,
      })
      .eq('id', phaseRecord.id)

    if (gateError) {
      notifications.show({ title: 'Fout', message: 'Fase afsluiten mislukt.', color: 'red' })
      return
    }

    const nextPhaseKey = getNextPhase(phaseKey)

    if (nextPhaseKey) {
      const nextPhaseRecord = phases.find((p) => p.phase === nextPhaseKey)
      if (nextPhaseRecord) {
        await supabase
          .from('project_phases')
          .update({ started_at: now })
          .eq('id', nextPhaseRecord.id)
      }

      await supabase
        .from('projects')
        .update({ current_phase: nextPhaseKey, updated_at: now })
        .eq('id', id)

      setProject((prev) => ({ ...prev, current_phase: nextPhaseKey }))
      setSelectedPhase(nextPhaseKey)
    } else {
      await supabase
        .from('projects')
        .update({ current_phase: 'afgerond', status: 'Afgerond', updated_at: now })
        .eq('id', id)

      setProject((prev) => ({ ...prev, current_phase: 'afgerond', status: 'Afgerond' }))
    }

    await log('phase_advanced', 'phase', phaseRecord.id, {
      from: phaseKey,
      to: nextPhaseKey || 'afgerond',
    })

    notifications.show({
      title: 'Fase afgerond',
      message: nextPhaseKey
        ? `Doorgeschoven naar ${getPhaseLabel(nextPhaseKey)}.`
        : 'Project afgerond!',
      color: 'green',
    })

    refetch()
  }

  if (loading) {
    return (
      <Center py="xl">
        <Loader />
      </Center>
    )
  }

  if (!project) {
    return (
      <Text c="dimmed" ta="center" mt="xl">
        Project niet gevonden.
      </Text>
    )
  }

  const currentPhaseRecord = phases.find((p) => p.phase === activePhase)

  return (
    <Stack gap="lg">
      {/* Header */}
      <Group justify="space-between" align="flex-start">
        <div>
          <Group gap="sm" mb={4}>
            <Title order={2}>{project.name}</Title>
            <Badge color={getPhaseColor(project.current_phase)} variant="light" size="lg">
              {project.current_phase === 'afgerond' ? 'Afgerond' : getPhaseLabel(project.current_phase)}
            </Badge>
          </Group>
          <Group gap="md">
            {project.start_date && (
              <Text size="sm" c="dimmed">Start: {formatDate(project.start_date)}</Text>
            )}
            {project.end_date && (
              <Text size="sm" c="dimmed">Eind: {formatDate(project.end_date)}</Text>
            )}
          </Group>
        </div>
        <Group>
          {project.current_phase !== 'afgerond' && (
            <Button
              variant="light"
              color="violet"
              leftSection={<IconSparkles size={16} />}
              onClick={() => navigate(`/projects/${id}/ai`)}
            >
              AI Assistent
            </Button>
          )}
          <Button
            variant="light"
            leftSection={<IconEdit size={16} />}
            onClick={() => navigate(`/projects/${id}/edit`)}
          >
            Bewerken
          </Button>
        </Group>
      </Group>

      {project.description && (
        <Paper withBorder p="md" radius="md">
          <Text size="sm">{project.description}</Text>
        </Paper>
      )}

      {/* SharePoint Links */}
      {(project.sharepoint_project_url || project.sharepoint_actions_url) && (
        <Group gap="md">
          {project.sharepoint_project_url && (
            <Anchor href={project.sharepoint_project_url} target="_blank" size="sm">
              <Group gap={4}><IconExternalLink size={14} />Projectmap</Group>
            </Anchor>
          )}
          {project.sharepoint_actions_url && (
            <Anchor href={project.sharepoint_actions_url} target="_blank" size="sm">
              <Group gap={4}><IconExternalLink size={14} />Actielijst</Group>
            </Anchor>
          )}
        </Group>
      )}

      {/* Phase Timeline */}
      {project.current_phase !== 'afgerond' && (
        <Paper withBorder p="md" radius="md">
          <PhaseTimeline
            currentPhase={project.current_phase}
            phases={phases}
            selectedPhase={activePhase}
            onSelectPhase={setSelectedPhase}
          />
        </Paper>
      )}

      {/* Main content */}
      <Grid gutter="lg">
        <Grid.Col span={{ base: 12, lg: 8 }}>
          <Stack gap="lg">
            {/* Phase Workspace */}
            {project.current_phase !== 'afgerond' && (
              <PhaseWorkspace
                phase={activePhase}
                project={project}
                deliverables={deliverables}
                tasks={tasks}
                comments={comments}
                profiles={profiles}
                onAddDeliverable={handleAddDeliverable}
                onUpdateDeliverable={handleUpdateDeliverable}
                onDeleteDeliverable={handleDeleteDeliverable}
                onAddTask={handleAddTask}
                onUpdateTask={handleUpdateTask}
                onDeleteTask={handleDeleteTask}
                onAddComment={handleAddComment}
              />
            )}

            {/* Phase Gate */}
            {activePhase === project.current_phase && project.current_phase !== 'afgerond' && (
              <PhaseGate
                phase={activePhase}
                phaseRecord={currentPhaseRecord}
                deliverables={deliverables}
                onApprove={handlePhaseApprove}
              />
            )}
          </Stack>
        </Grid.Col>

        <Grid.Col span={{ base: 12, lg: 4 }}>
          <Stack gap="lg">
            <SuccessIndicators
              indicators={indicators}
              onAdd={handleAddIndicator}
              onUpdate={handleUpdateIndicator}
              onDelete={handleDeleteIndicator}
            />

            <ProjectMembersList
              members={members}
              profiles={profiles}
              onAdd={handleAddMember}
              onRemove={handleRemoveMember}
            />

            <ActivityFeed activity={activity} profiles={profiles} />
          </Stack>
        </Grid.Col>
      </Grid>
    </Stack>
  )
}
