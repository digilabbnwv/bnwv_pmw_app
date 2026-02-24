import { useState, useEffect } from 'react'
import { Title, SimpleGrid, Skeleton } from '@mantine/core'
import { supabase } from '../lib/supabaseClient'
import ActiveProjectsTile from '../components/dashboard/ActiveProjectsTile'
import DocumentsTile from '../components/dashboard/DocumentsTile'
import StatusChartTile from '../components/dashboard/StatusChartTile'

export default function DashboardPage() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProjects = async () => {
      const { data } = await supabase.from('projects').select('*')
      setProjects(data || [])
      setLoading(false)
    }
    fetchProjects()
  }, [])

  return (
    <>
      <Title order={2} mb="lg">
        Dashboard
      </Title>

      {loading ? (
        <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md">
          <Skeleton height={200} radius="md" />
          <Skeleton height={200} radius="md" />
          <Skeleton height={200} radius="md" />
        </SimpleGrid>
      ) : (
        <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md">
          <ActiveProjectsTile projects={projects} />
          <DocumentsTile projects={projects} />
          <StatusChartTile projects={projects} />
        </SimpleGrid>
      )}
    </>
  )
}
