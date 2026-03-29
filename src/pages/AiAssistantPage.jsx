import { useState, useEffect } from 'react'
import {
  Title,
  Text,
  Tabs,
  Stack,
  Paper,
  Loader,
  Center,
  Textarea,
  Button,
  Group,
  Alert,
  ScrollArea,
  Avatar,
  ThemeIcon,
} from '@mantine/core'
import {
  IconSparkles,
  IconFileText,
  IconClipboard,
  IconChartBar,
  IconBulb,
  IconMessageCircle,
  IconSend,
} from '@tabler/icons-react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAi } from '../lib/hooks/useAi'
import StartnotitieWizard from '../components/ai/StartnotitieWizard'

function AiChat({ project, sessionType, placeholder }) {
  const { messages, loading, error, sendMessage } = useAi(project.id, sessionType)
  const [input, setInput] = useState('')

  const handleSend = async () => {
    if (!input.trim()) return
    const msg = input
    setInput('')
    await sendMessage(msg, `Project: ${project.name}\nBeschrijving: ${project.description || 'Niet opgegeven'}`)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSend()
    }
  }

  return (
    <Stack gap="md" style={{ height: '60vh' }}>
      <ScrollArea style={{ flex: 1 }} offsetScrollbars>
        <Stack gap="sm" p="xs">
          {messages.length === 0 && (
            <Paper p="lg" radius="md" ta="center">
              <ThemeIcon size="xl" radius="xl" color="violet" variant="light" mb="sm" mx="auto">
                <IconSparkles size={24} />
              </ThemeIcon>
              <Text c="dimmed" size="sm">
                {placeholder || 'Stel een vraag om te beginnen.'}
              </Text>
            </Paper>
          )}

          {messages.map((msg, i) => (
            <Group
              key={i}
              justify={msg.role === 'user' ? 'flex-end' : 'flex-start'}
              align="flex-start"
              gap="sm"
            >
              {msg.role === 'assistant' && (
                <Avatar radius="xl" size="sm" color="violet">
                  <IconSparkles size={14} />
                </Avatar>
              )}
              <Paper
                p="sm"
                radius="md"
                maw="80%"
                bg={msg.role === 'user' ? 'brand.0' : 'gray.0'}
                withBorder={msg.role === 'assistant'}
              >
                <Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</Text>
              </Paper>
            </Group>
          ))}

          {loading && (
            <Group gap="sm">
              <Avatar radius="xl" size="sm" color="violet">
                <IconSparkles size={14} />
              </Avatar>
              <Paper p="sm" radius="md" bg="gray.0">
                <Loader size="xs" />
              </Paper>
            </Group>
          )}
        </Stack>
      </ScrollArea>

      {error && (
        <Alert color="red" variant="light" size="sm">
          {error}
        </Alert>
      )}

      <Paper p="sm" radius="md" withBorder>
        <Group align="flex-end" gap="sm">
          <Textarea
            placeholder="Schrijf je bericht... (Ctrl+Enter om te versturen)"
            value={input}
            onChange={(e) => setInput(e?.currentTarget?.value ?? '')}
            onKeyDown={handleKeyDown}
            style={{ flex: 1 }}
            rows={2}
            autosize
            minRows={2}
            maxRows={5}
          />
          <Button leftSection={<IconSend size={14} />} onClick={handleSend} disabled={loading || !input.trim()}>
            Verstuur
          </Button>
        </Group>
      </Paper>
    </Stack>
  )
}

export default function AiAssistantPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from('projects').select('*').eq('id', id).single()
      setProject(data)
      setLoading(false)
    }
    fetch()
  }, [id])

  if (loading) {
    return <Center py="xl"><Loader /></Center>
  }

  if (!project) {
    return <Text c="dimmed" ta="center" mt="xl">Project niet gevonden.</Text>
  }

  return (
    <Stack gap="lg">
      <Group justify="space-between">
        <div>
          <Title order={2}>
            <Group gap="sm">
              <IconSparkles size={24} />
              AI Assistent
            </Group>
          </Title>
          <Text c="dimmed" size="sm">Project: {project.name}</Text>
        </div>
        <Button variant="default" onClick={() => navigate(`/projects/${id}`)}>
          Terug naar project
        </Button>
      </Group>

      <Tabs defaultValue="startnotitie" variant="outline" radius="md">
        <Tabs.List>
          <Tabs.Tab value="startnotitie" leftSection={<IconFileText size={16} />}>
            Startnotitie
          </Tabs.Tab>
          <Tabs.Tab value="projectplan" leftSection={<IconClipboard size={16} />}>
            Projectplan
          </Tabs.Tab>
          <Tabs.Tab value="evaluatie" leftSection={<IconChartBar size={16} />}>
            Evaluatie
          </Tabs.Tab>
          <Tabs.Tab value="ideas" leftSection={<IconBulb size={16} />}>
            Ideeën
          </Tabs.Tab>
          <Tabs.Tab value="chat" leftSection={<IconMessageCircle size={16} />}>
            Vrije chat
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="startnotitie" pt="md">
          <StartnotitieWizard
            project={project}
            onComplete={() => navigate(`/projects/${id}`)}
          />
        </Tabs.Panel>

        <Tabs.Panel value="projectplan" pt="md">
          <AiChat
            project={project}
            sessionType="projectplan"
            placeholder="Ik help je bij het opstellen van een projectplan. Heb je al een startnotitie? Deel de belangrijkste punten zodat ik je kan helpen."
          />
        </Tabs.Panel>

        <Tabs.Panel value="evaluatie" pt="md">
          <AiChat
            project={project}
            sessionType="evaluatie"
            placeholder="Ik help je bij het schrijven van een evaluatierapport. Vertel me over de resultaten van het project."
          />
        </Tabs.Panel>

        <Tabs.Panel value="ideas" pt="md">
          <AiChat
            project={project}
            sessionType="ideas"
            placeholder="Ik help je met marketing- en communicatie-ideeën. Vertel me kort over het project zodat ik gerichte suggesties kan doen."
          />
        </Tabs.Panel>

        <Tabs.Panel value="chat" pt="md">
          <AiChat
            project={project}
            sessionType="chat"
            placeholder="Stel me een vraag over projectmatig werken, dit project, of iets anders waar ik je mee kan helpen."
          />
        </Tabs.Panel>
      </Tabs>
    </Stack>
  )
}
