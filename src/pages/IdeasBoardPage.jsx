import { useState, useEffect } from 'react'
import {
  Title,
  Text,
  Group,
  Button,
  Stack,
  SimpleGrid,
  Paper,
  Loader,
  Center,
  Select,
  Badge,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { notifications } from '@mantine/notifications'
import { IconPlus, IconSparkles, IconBulb, IconArrowLeft } from '@tabler/icons-react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAi } from '../lib/hooks/useAi'
import IdeaCard from '../components/ideas/IdeaCard'
import IdeaForm from '../components/ideas/IdeaForm'

const STATUS_COLUMNS = [
  { key: 'idee', label: 'Ideeën', color: 'yellow' },
  { key: 'goedgekeurd', label: 'Goedgekeurd', color: 'blue' },
  { key: 'in_uitvoering', label: 'In uitvoering', color: 'orange' },
  { key: 'afgerond', label: 'Afgerond', color: 'green' },
]

const CATEGORY_FILTER = [
  { value: '', label: 'Alle categorieën' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'communicatie', label: 'Communicatie' },
  { value: 'evenement', label: 'Evenement' },
  { value: 'social_media', label: 'Social media' },
  { value: 'pers', label: 'Pers' },
  { value: 'overig', label: 'Overig' },
]

export default function IdeasBoardPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [project, setProject] = useState(null)
  const [ideas, setIdeas] = useState([])
  const [profiles, setProfiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [categoryFilter, setCategoryFilter] = useState('')
  const [formOpened, { open: openForm, close: closeForm }] = useDisclosure(false)
  const [editItem, setEditItem] = useState(null)
  const [generating, setGenerating] = useState(false)

  const { sendMessage } = useAi(id, 'ideas')

  useEffect(() => {
    const fetch = async () => {
      const [projectRes, ideasRes, profilesRes] = await Promise.all([
        supabase.from('projects').select('*').eq('id', id).single(),
        supabase.from('ideas_board').select('*').eq('project_id', id).order('created_at', { ascending: false }),
        supabase.from('profiles').select('*'),
      ])
      setProject(projectRes.data)
      setIdeas(ideasRes.data || [])
      setProfiles(profilesRes.data || [])
      setLoading(false)
    }
    fetch()
  }, [id])

  const handleAdd = async (payload) => {
    const { data: { user } } = await supabase.auth.getUser()
    const { data, error } = await supabase
      .from('ideas_board')
      .insert({ ...payload, project_id: id, created_by: user?.id })
      .select()
      .single()

    if (error) {
      notifications.show({ title: 'Fout', message: 'Idee toevoegen mislukt.', color: 'red' })
    } else {
      setIdeas((prev) => [data, ...prev])
      notifications.show({ title: 'Toegevoegd', message: 'Idee aangemaakt.', color: 'green' })
    }
  }

  const handleUpdate = async (item) => {
    const { error } = await supabase
      .from('ideas_board')
      .update({
        title: item.title,
        description: item.description,
        category: item.category,
        status: item.status,
        assigned_to: item.assigned_to,
        target_date: item.target_date,
        updated_at: new Date().toISOString(),
      })
      .eq('id', item.id)

    if (!error) {
      setIdeas((prev) => prev.map((i) => (i.id === item.id ? { ...i, ...item } : i)))
    }
  }

  const handleDelete = async (ideaId) => {
    const { error } = await supabase.from('ideas_board').delete().eq('id', ideaId)
    if (!error) {
      setIdeas((prev) => prev.filter((i) => i.id !== ideaId))
    }
  }

  const handleEdit = (item) => {
    setEditItem(item)
    openForm()
  }

  const handleFormSubmit = (payload) => {
    if (editItem) {
      handleUpdate(payload)
    } else {
      handleAdd(payload)
    }
    setEditItem(null)
  }

  const handleOpenNew = () => {
    setEditItem(null)
    openForm()
  }

  const handleGenerateIdeas = async () => {
    if (!project) return
    setGenerating(true)

    const context = `Project: ${project.name}\nBeschrijving: ${project.description || 'Niet opgegeven'}`
    const prompt = `Genereer 5 concrete marketing- en communicatie-ideeën voor dit bibliotheekproject. Geef per idee:
- Een korte titel
- Een beschrijving (1-2 zinnen)
- Een categorie (marketing, communicatie, evenement, social_media, pers)

Formatteer als genummerde lijst. Wees creatief en praktisch.`

    const response = await sendMessage(prompt, context)

    if (response) {
      // Parse the response and create ideas
      const lines = response.split('\n').filter((l) => l.trim())
      const ideaTexts = []
      let current = null

      for (const line of lines) {
        const match = line.match(/^\d+[.)]\s*(.+)/)
        if (match) {
          if (current) ideaTexts.push(current)
          current = { title: match[1].replace(/\*\*/g, '').trim(), description: '' }
        } else if (current && line.trim().startsWith('-')) {
          const text = line.replace(/^-\s*/, '').trim()
          if (text.toLowerCase().startsWith('beschrijving:') || text.toLowerCase().startsWith('omschrijving:')) {
            current.description = text.replace(/^(beschrijving|omschrijving):\s*/i, '')
          } else if (text.toLowerCase().startsWith('categorie:')) {
            const cat = text.replace(/^categorie:\s*/i, '').toLowerCase().replace(/\s+/g, '_')
            if (['marketing', 'communicatie', 'evenement', 'social_media', 'pers'].includes(cat)) {
              current.category = cat
            }
          } else if (!current.description) {
            current.description = text
          }
        }
      }
      if (current) ideaTexts.push(current)

      // Add each parsed idea
      const { data: { user } } = await supabase.auth.getUser()
      for (const idea of ideaTexts.slice(0, 5)) {
        const { data } = await supabase
          .from('ideas_board')
          .insert({
            project_id: id,
            title: idea.title.slice(0, 200),
            description: idea.description || null,
            category: idea.category || 'overig',
            status: 'idee',
            created_by: user?.id,
          })
          .select()
          .single()

        if (data) {
          setIdeas((prev) => [data, ...prev])
        }
      }

      notifications.show({
        title: 'Ideeën gegenereerd',
        message: `${ideaTexts.length} ideeën toegevoegd aan het bord.`,
        color: 'green',
      })
    }

    setGenerating(false)
  }

  if (loading) {
    return <Center py="xl"><Loader /></Center>
  }

  if (!project) {
    return <Text c="dimmed" ta="center" mt="xl">Project niet gevonden.</Text>
  }

  const filteredIdeas = categoryFilter
    ? ideas.filter((i) => i.category === categoryFilter)
    : ideas

  return (
    <Stack gap="lg">
      <Group justify="space-between">
        <div>
          <Title order={2}>
            <Group gap="sm"><IconBulb size={24} />Ideeënbord</Group>
          </Title>
          <Text c="dimmed" size="sm">Project: {project.name}</Text>
        </div>
        <Group>
          <Button
            variant="light"
            color="violet"
            leftSection={generating ? <Loader size={14} /> : <IconSparkles size={16} />}
            onClick={handleGenerateIdeas}
            disabled={generating}
          >
            {generating ? 'Genereren...' : 'AI ideeën genereren'}
          </Button>
          <Button leftSection={<IconPlus size={16} />} onClick={handleOpenNew}>
            Nieuw idee
          </Button>
          <Button variant="default" leftSection={<IconArrowLeft size={16} />} onClick={() => navigate(`/projects/${id}`)}>
            Terug
          </Button>
        </Group>
      </Group>

      <Select
        data={CATEGORY_FILTER}
        value={categoryFilter}
        onChange={(val) => setCategoryFilter(val || '')}
        placeholder="Filter op categorie"
        clearable
        w={200}
      />

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md">
        {STATUS_COLUMNS.map((col) => {
          const columnIdeas = filteredIdeas.filter((i) => i.status === col.key)
          return (
            <div key={col.key}>
              <Group gap="xs" mb="sm">
                <Badge color={col.color} variant="filled" size="sm">
                  {columnIdeas.length}
                </Badge>
                <Text fw={600} size="sm">{col.label}</Text>
              </Group>
              <Stack gap="xs">
                {columnIdeas.length === 0 ? (
                  <Paper p="md" radius="md" withBorder ta="center" bg="gray.0">
                    <Text size="xs" c="dimmed">Nog geen ideeën</Text>
                  </Paper>
                ) : (
                  columnIdeas.map((idea) => (
                    <IdeaCard
                      key={idea.id}
                      idea={idea}
                      profiles={profiles}
                      onUpdate={handleUpdate}
                      onDelete={handleDelete}
                      onEdit={handleEdit}
                    />
                  ))
                )}
              </Stack>
            </div>
          )
        })}
      </SimpleGrid>

      <IdeaForm
        opened={formOpened}
        onClose={() => { closeForm(); setEditItem(null) }}
        onSubmit={handleFormSubmit}
        editItem={editItem}
        profiles={profiles}
      />
    </Stack>
  )
}
