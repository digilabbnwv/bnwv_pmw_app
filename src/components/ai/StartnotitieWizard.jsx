import { useState } from 'react'
import {
  Stepper,
  Paper,
  Title,
  Text,
  Textarea,
  Button,
  Group,
  Stack,
  Loader,
  Alert,
  CopyButton,
  ActionIcon,
  Tooltip,
} from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { IconSparkles, IconCheck, IconCopy, IconArrowRight, IconArrowLeft } from '@tabler/icons-react'
import { useAi } from '../../lib/hooks/useAi'
import { supabase } from '../../lib/supabaseClient'

const STEPS = [
  {
    key: 'aanleiding',
    label: 'Aanleiding',
    question: 'Wie is de opdrachtgever en wat is de directe aanleiding voor dit project?',
    placeholder: 'Beschrijf wie het project initieert en waarom dit project nu nodig is...',
    hint: 'Denk aan: wie vraagt erom, welk probleem of kans is de aanleiding, waarom nu?',
  },
  {
    key: 'doelstelling',
    label: 'Doelstelling',
    question: 'Wat wil je bereiken met dit project? Wat is het gewenste eindresultaat?',
    placeholder: 'Beschrijf wat je wilt bereiken, zo concreet mogelijk...',
    hint: 'Probeer SMART te formuleren: Specifiek, Meetbaar, Acceptabel, Realistisch, Tijdgebonden.',
  },
  {
    key: 'doelgroep',
    label: 'Doelgroep & Scope',
    question: 'Voor wie is dit project bedoeld? Wat valt binnen en buiten de scope?',
    placeholder: 'Beschrijf de doelgroep en wat wel en niet bij het project hoort...',
    hint: 'Wees duidelijk over wat je NIET gaat doen. Dat voorkomt verwachtingsproblemen.',
  },
  {
    key: 'randvoorwaarden',
    label: 'Randvoorwaarden',
    question: 'Welke beperkingen of randvoorwaarden zijn er? Welke risico\'s zie je?',
    placeholder: 'Denk aan budget, tijd, personeel, technische beperkingen, afhankelijkheden...',
    hint: 'Benoem ook risico\'s: wat kan er misgaan en hoe groot is de impact?',
  },
  {
    key: 'planning',
    label: 'Planning & Budget',
    question: 'Wat is de gewenste doorlooptijd? Is er budget beschikbaar?',
    placeholder: 'Beschrijf de tijdlijn, belangrijke mijlpalen en beschikbaar budget...',
    hint: 'Wees realistisch. Een goede planning houdt rekening met onvoorziene vertragingen.',
  },
  {
    key: 'succescriteria',
    label: 'Succescriteria',
    question: 'Hoe meet je of het project geslaagd is? Wanneer ben je tevreden?',
    placeholder: 'Definieer meetbare criteria waarmee je het succes van het project kunt vaststellen...',
    hint: 'Deze criteria worden automatisch opgeslagen als succescriteria voor je project.',
  },
]

export default function StartnotitieWizard({ project, onComplete }) {
  const [active, setActive] = useState(0)
  const [answers, setAnswers] = useState(STEPS.reduce((acc, s) => ({ ...acc, [s.key]: '' }), {}))
  const [aiResponse, setAiResponse] = useState(null)
  const [generatedDoc, setGeneratedDoc] = useState(null)
  const { loading, error, sendMessage } = useAi(project.id, 'startnotitie')

  const currentStep = STEPS[active]

  const handleAskAi = async () => {
    const answer = answers[currentStep.key]
    if (!answer.trim()) {
      notifications.show({ title: 'Let op', message: 'Vul eerst je antwoord in.', color: 'yellow' })
      return
    }

    const context = `Project: ${project.name}\n${project.description ? `Beschrijving: ${project.description}\n` : ''}Stap: ${currentStep.label}\nVraag: ${currentStep.question}`

    const previousAnswers = STEPS.slice(0, active)
      .map((s) => `${s.label}: ${answers[s.key]}`)
      .join('\n')

    const fullContext = previousAnswers
      ? `${context}\n\nEerdere antwoorden:\n${previousAnswers}`
      : context

    const prompt = `De gebruiker beantwoordt de vraag "${currentStep.question}" als volgt:\n\n"${answer}"\n\nAnalyseer dit antwoord en geef:\n1. Een korte beoordeling van de kwaliteit\n2. Maximaal 3 concrete suggesties om het antwoord te verbeteren of aan te scherpen\n3. Eventuele zaken die de gebruiker vergeten is`

    const response = await sendMessage(prompt, fullContext)
    if (response) {
      setAiResponse(response)
    }
  }

  const handleNext = () => {
    if (active < STEPS.length - 1) {
      setActive(active + 1)
      setAiResponse(null)
    }
  }

  const handlePrev = () => {
    if (active > 0) {
      setActive(active - 1)
      setAiResponse(null)
    }
  }

  const handleGenerate = async () => {
    const allAnswers = STEPS.map((s) => `## ${s.label}\n${answers[s.key]}`).join('\n\n')
    const context = `Project: ${project.name}\nAlle antwoorden van de gebruiker:\n\n${allAnswers}`

    const prompt = `Op basis van alle bovenstaande antwoorden, genereer een complete en professionele startnotitie. Gebruik het volgende format:

# Startnotitie: ${project.name}

## 1. Aanleiding en probleemstelling
## 2. Doelstelling
## 3. Doelgroep en scope
## 4. Randvoorwaarden en risico's
## 5. Globale planning en budget
## 6. Succescriteria

Maak het professioneel, helder en compleet. Neem de input van de gebruiker als basis maar verbeter waar nodig de formulering.`

    const response = await sendMessage(prompt, context)
    if (response) {
      setGeneratedDoc(response)
    }
  }

  const handleSave = async () => {
    if (!generatedDoc) return

    const { data: { user } } = await supabase.auth.getUser()

    const { data, error: insertError } = await supabase
      .from('project_deliverables')
      .insert({
        project_id: project.id,
        phase: 'initiatief',
        type: 'startnotitie',
        title: `Startnotitie - ${project.name}`,
        content: { text: generatedDoc, answers },
        status: 'concept',
        created_by: user?.id,
      })
      .select()
      .single()

    if (insertError) {
      notifications.show({ title: 'Fout', message: 'Opslaan mislukt.', color: 'red' })
    } else {
      notifications.show({
        title: 'Opgeslagen',
        message: 'Startnotitie is opgeslagen als concept.',
        color: 'green',
      })
      if (onComplete) onComplete(data)
    }
  }

  if (generatedDoc) {
    return (
      <Stack gap="md">
        <Group justify="space-between">
          <Title order={3}>Gegenereerde Startnotitie</Title>
          <Group>
            <CopyButton value={generatedDoc}>
              {({ copied, copy }) => (
                <Tooltip label={copied ? 'Gekopieerd!' : 'Kopieer naar klembord'}>
                  <ActionIcon color={copied ? 'green' : 'gray'} variant="light" onClick={copy}>
                    {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
                  </ActionIcon>
                </Tooltip>
              )}
            </CopyButton>
          </Group>
        </Group>

        <Paper p="lg" radius="md" withBorder>
          <Text style={{ whiteSpace: 'pre-wrap' }}>{generatedDoc}</Text>
        </Paper>

        <Group justify="flex-end">
          <Button variant="default" onClick={() => setGeneratedDoc(null)}>
            Terug naar vragen
          </Button>
          <Button color="green" leftSection={<IconCheck size={16} />} onClick={handleSave}>
            Opslaan als concept
          </Button>
        </Group>
      </Stack>
    )
  }

  return (
    <Stack gap="lg">
      <Title order={3}>Startnotitie Wizard</Title>
      <Text c="dimmed" size="sm">
        Beantwoord de vragen en laat AI je helpen om een scherpe startnotitie te schrijven.
      </Text>

      <Stepper active={active} size="xs">
        {STEPS.map((step) => (
          <Stepper.Step key={step.key} label={step.label} />
        ))}
      </Stepper>

      <Paper p="lg" radius="md" withBorder>
        <Stack gap="md">
          <div>
            <Text fw={600} mb={4}>{currentStep.question}</Text>
            <Text size="xs" c="dimmed">{currentStep.hint}</Text>
          </div>

          <Textarea
            placeholder={currentStep.placeholder}
            value={answers[currentStep.key]}
            onChange={(e) =>
              setAnswers((prev) => ({ ...prev, [currentStep.key]: e?.currentTarget?.value ?? '' }))
            }
            rows={5}
            autosize
            minRows={4}
            maxRows={10}
          />

          <Group justify="space-between">
            <Button
              variant="light"
              color="violet"
              leftSection={loading ? <Loader size={14} /> : <IconSparkles size={16} />}
              onClick={handleAskAi}
              disabled={loading || !answers[currentStep.key]?.trim()}
            >
              {loading ? 'AI denkt na...' : 'Vraag AI-feedback'}
            </Button>

            <Group>
              <Button
                variant="default"
                leftSection={<IconArrowLeft size={16} />}
                onClick={handlePrev}
                disabled={active === 0}
              >
                Vorige
              </Button>
              {active < STEPS.length - 1 ? (
                <Button
                  leftSection={<IconArrowRight size={16} />}
                  onClick={handleNext}
                  disabled={!answers[currentStep.key]?.trim()}
                >
                  Volgende
                </Button>
              ) : (
                <Button
                  color="green"
                  leftSection={<IconSparkles size={16} />}
                  onClick={handleGenerate}
                  disabled={loading || !answers[currentStep.key]?.trim()}
                >
                  Genereer startnotitie
                </Button>
              )}
            </Group>
          </Group>
        </Stack>
      </Paper>

      {error && (
        <Alert color="red" variant="light">
          {error}
        </Alert>
      )}

      {aiResponse && (
        <Paper p="md" radius="md" withBorder bg="violet.0" style={{ borderColor: 'var(--mantine-color-violet-3)' }}>
          <Group gap="sm" mb="sm">
            <IconSparkles size={16} color="var(--mantine-color-violet-6)" />
            <Text fw={600} size="sm" c="violet">AI Feedback</Text>
          </Group>
          <Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>{aiResponse}</Text>
        </Paper>
      )}
    </Stack>
  )
}
