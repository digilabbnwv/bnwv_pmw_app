import { Paper, Title, Text, Center } from '@mantine/core'
import { PieChart } from '@mantine/charts'
import { countByStatus } from '../../lib/utils/projectUtils'

const CHART_COLORS = {
  'Niet gestart': 'gray.5',
  'In opstart': 'blue.5',
  'In uitvoering': '#F06418',
  'In afronding': 'yellow.5',
  Afgerond: 'green.5',
  Gearchiveerd: 'gray.3',
}

export default function StatusChartTile({ projects }) {
  const data = countByStatus(projects).map((item) => ({
    ...item,
    color: CHART_COLORS[item.name] || 'gray.5',
  }))

  return (
    <Paper withBorder p="md" radius="md">
      <Title order={4} mb="sm">
        Statusverdeling
      </Title>

      {data.length === 0 ? (
        <Text c="dimmed" size="sm">
          Er zijn geen projecten om weer te geven.
        </Text>
      ) : (
        <Center>
          <PieChart
            data={data}
            withTooltip
            tooltipDataSource="segment"
            size={200}
          />
        </Center>
      )}
    </Paper>
  )
}
