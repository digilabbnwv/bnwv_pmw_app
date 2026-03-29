import { useState } from 'react'
import { Paper, Title, Text, Button, Textarea, Group, Alert, ThemeIcon } from '@mantine/core'
import { IconLock, IconArrowRight, IconCheck } from '@tabler/icons-react'
import { getPhaseConfig, getNextPhase } from '../../lib/utils/phaseConfig'

export default function PhaseGate({ phase, phaseRecord, deliverables, onApprove }) {
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)

  const config = getPhaseConfig(phase)
  const nextPhaseKey = getNextPhase(phase)
  const nextConfig = nextPhaseKey ? getPhaseConfig(nextPhaseKey) : null

  if (!config) return null

  if (phaseRecord?.gate_approved) {
    return (
      <Paper p="md" radius="md" withBorder bg="green.0">
        <Group gap="sm">
          <ThemeIcon color="green" variant="filled" radius="xl">
            <IconCheck size={16} />
          </ThemeIcon>
          <div>
            <Text fw={600} size="sm">Fase afgerond</Text>
            {phaseRecord.gate_notes && (
              <Text size="xs" c="dimmed">{phaseRecord.gate_notes}</Text>
            )}
          </div>
        </Group>
      </Paper>
    )
  }

  const requiredDeliverables = config.requiredDeliverables
  const phaseDeliverables = deliverables.filter((d) => d.phase === phase)
  const allRequiredComplete = requiredDeliverables.every((type) =>
    phaseDeliverables.some((d) => d.type === type && d.status === 'definitief')
  )

  const handleApprove = async () => {
    setLoading(true)
    await onApprove(phase, notes)
    setLoading(false)
  }

  return (
    <Paper p="md" radius="md" withBorder>
      <Group gap="sm" mb="md">
        <ThemeIcon color={config.color} variant="light" radius="xl">
          <IconLock size={16} />
        </ThemeIcon>
        <Title order={5}>Fase-gate: {config.label}</Title>
      </Group>

      <Text size="sm" mb="sm" c="dimmed">
        {config.gateQuestion}
      </Text>

      {!allRequiredComplete && (
        <Alert color="yellow" mb="md" variant="light">
          <Text size="sm">
            Niet alle vereiste documenten zijn definitief. Rond eerst de volgende documenten af:
          </Text>
          {requiredDeliverables
            .filter((type) => !phaseDeliverables.some((d) => d.type === type && d.status === 'definitief'))
            .map((type) => (
              <Text key={type} size="sm" fw={500} mt={4}>
                - {type.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
              </Text>
            ))}
        </Alert>
      )}

      <Textarea
        label="Opmerkingen bij afsluiting (optioneel)"
        placeholder="Eventuele opmerkingen of leerpunten..."
        value={notes}
        onChange={(e) => setNotes(e.currentTarget.value)}
        mb="md"
        rows={2}
      />

      <Button
        leftSection={<IconArrowRight size={16} />}
        color={config.color}
        onClick={handleApprove}
        loading={loading}
        disabled={!allRequiredComplete}
      >
        {nextConfig ? `Afsluiten en door naar ${nextConfig.label}` : 'Project afronden'}
      </Button>
    </Paper>
  )
}
