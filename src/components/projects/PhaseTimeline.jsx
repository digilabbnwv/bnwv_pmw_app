import { Stepper, Text } from '@mantine/core'
import { PHASES, getPhaseIndex } from '../../lib/utils/phaseConfig'

export default function PhaseTimeline({ currentPhase, phases, selectedPhase, onSelectPhase }) {
  const currentIndex = getPhaseIndex(currentPhase)
  const selectedIndex = getPhaseIndex(selectedPhase)

  return (
    <Stepper
      active={currentIndex}
      onStepClick={(index) => onSelectPhase(PHASES[index].key)}
      color="brand"
      size="sm"
      styles={{
        root: { overflowX: 'auto' },
        step: { cursor: 'pointer', minWidth: 100 },
        stepIcon: { transition: 'all 0.2s ease' },
      }}
    >
      {PHASES.map((phase, index) => {
        const phaseRecord = phases.find((p) => p.phase === phase.key)
        const isCompleted = phaseRecord?.gate_approved
        const Icon = phase.icon

        return (
          <Stepper.Step
            key={phase.key}
            icon={<Icon size={18} />}
            label={phase.label}
            description={
              isCompleted ? (
                <Text size="xs" c="green">Afgerond</Text>
              ) : index === currentIndex ? (
                <Text size="xs" c="brand">Actief</Text>
              ) : null
            }
            color={
              isCompleted
                ? 'green'
                : index === currentIndex
                  ? 'brand'
                  : selectedIndex === index
                    ? phase.color
                    : 'gray'
            }
            completedIcon={<Icon size={18} />}
          />
        )
      })}
    </Stepper>
  )
}
