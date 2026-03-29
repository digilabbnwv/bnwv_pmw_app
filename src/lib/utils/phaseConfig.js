import {
  IconMessageCircle,
  IconTargetArrow,
  IconBulb,
  IconClipboardList,
  IconHammer,
  IconShieldCheck,
} from '@tabler/icons-react'

export const PHASES = [
  {
    key: 'initiatief',
    label: 'Initiatief',
    description: 'Gesprek met opdrachtgever en het opstellen van de startnotitie.',
    icon: IconMessageCircle,
    color: 'violet',
    requiredDeliverables: ['startnotitie'],
    suggestedTasks: [
      'Gesprek voeren met opdrachtgever',
      'Aanleiding en probleemstelling formuleren',
      'Startnotitie opstellen',
      'Go/no-go beslissing nemen',
    ],
    gateQuestion: 'Is de startnotitie goedgekeurd door de opdrachtgever?',
  },
  {
    key: 'definitie',
    label: 'Definitie',
    description: 'Team samenstellen, kick-off houden en eisen & wensen inventariseren.',
    icon: IconTargetArrow,
    color: 'blue',
    requiredDeliverables: ['projectplan'],
    suggestedTasks: [
      'Projectteam samenstellen',
      'Kick-off bijeenkomst organiseren',
      'Eisen en wensen inventariseren',
      'Projectplan opstellen',
      'Succescriteria definiëren',
    ],
    gateQuestion: 'Is het projectplan goedgekeurd en zijn alle eisen en wensen helder?',
  },
  {
    key: 'ontwerp',
    label: 'Ontwerp',
    description: 'Ontwerpen maken, testen en het beheersplan opstellen.',
    icon: IconBulb,
    color: 'cyan',
    requiredDeliverables: ['definitief_ontwerp'],
    suggestedTasks: [
      'Ontwerpvarianten uitwerken',
      'Voorkeursontwerp selecteren',
      'Ontwerp toetsen bij belanghebbenden',
      'Beheersplan opstellen',
    ],
    gateQuestion: 'Is het definitief ontwerp vastgesteld en het beheersplan gereed?',
  },
  {
    key: 'voorbereiding',
    label: 'Voorbereiding',
    description: 'Contracteren, activiteitenplanning maken en inkopen regelen.',
    icon: IconClipboardList,
    color: 'teal',
    requiredDeliverables: ['voorbereidingsplan'],
    suggestedTasks: [
      'Gedetailleerde activiteitenplanning maken',
      'Contracten afsluiten',
      'Materialen en diensten inkopen',
      'Communicatieplan opstellen',
    ],
    gateQuestion: 'Is alles gereed om met de realisatie te starten?',
  },
  {
    key: 'realisatie',
    label: 'Realisatie',
    description: 'Het projectresultaat realiseren, bouwen en maken.',
    icon: IconHammer,
    color: 'orange',
    requiredDeliverables: ['projectresultaat'],
    suggestedTasks: [
      'Projectactiviteiten uitvoeren',
      'Voortgang bewaken',
      'Tussentijds rapporteren',
      'Projectresultaat opleveren',
    ],
    gateQuestion: 'Is het projectresultaat opgeleverd en geaccepteerd?',
  },
  {
    key: 'nazorg',
    label: 'Nazorg',
    description: 'Evaluatie, kinderziektes oplossen en overdracht naar beheerorganisatie.',
    icon: IconShieldCheck,
    color: 'green',
    requiredDeliverables: ['evaluatierapport'],
    suggestedTasks: [
      'Evaluatie uitvoeren',
      'Kinderziektes inventariseren en oplossen',
      'Onderhoudsplan opstellen',
      'Overdracht naar beheerorganisatie',
      'Project formeel afsluiten',
    ],
    gateQuestion: 'Is de evaluatie afgerond en het project overgedragen?',
  },
]

export const PHASE_KEYS = PHASES.map((p) => p.key)

export function getPhaseConfig(phaseKey) {
  return PHASES.find((p) => p.key === phaseKey)
}

export function getPhaseIndex(phaseKey) {
  return PHASES.findIndex((p) => p.key === phaseKey)
}

export function getPhaseColor(phaseKey) {
  return getPhaseConfig(phaseKey)?.color || 'gray'
}

export function getPhaseLabel(phaseKey) {
  return getPhaseConfig(phaseKey)?.label || phaseKey
}

export function getNextPhase(phaseKey) {
  const idx = getPhaseIndex(phaseKey)
  if (idx < 0 || idx >= PHASES.length - 1) return null
  return PHASES[idx + 1].key
}

export const DELIVERABLE_TYPES = {
  startnotitie: 'Startnotitie',
  projectplan: 'Projectplan',
  definitief_ontwerp: 'Definitief ontwerp',
  voorbereidingsplan: 'Voorbereidingsplan',
  projectresultaat: 'Projectresultaat',
  evaluatierapport: 'Evaluatierapport',
  beheersplan: 'Beheersplan',
  onderhoudsplan: 'Onderhoudsplan',
  overig: 'Overig',
}

export const DELIVERABLE_STATUS_COLORS = {
  concept: 'yellow',
  review: 'blue',
  definitief: 'green',
}

export const TASK_STATUS_COLORS = {
  open: 'gray',
  bezig: 'blue',
  afgerond: 'green',
  vervallen: 'red',
}

export const INDICATOR_STATUS_COLORS = {
  niet_gemeten: 'gray',
  op_schema: 'green',
  afwijkend: 'yellow',
  behaald: 'green',
  niet_behaald: 'red',
}

export const INDICATOR_STATUS_LABELS = {
  niet_gemeten: 'Niet gemeten',
  op_schema: 'Op schema',
  afwijkend: 'Afwijkend',
  behaald: 'Behaald',
  niet_behaald: 'Niet behaald',
}
