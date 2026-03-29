import { Paper, Title, Text } from '@mantine/core'
import { BarChart } from '@mantine/charts'
import { countByPhase } from '../../lib/utils/projectUtils'
import { PHASES } from '../../lib/utils/phaseConfig'

export default function PhaseChartTile({ projects }) {
  const data = countByPhase(projects)

  // Build chart data with all phases
  const chartData = PHASES.map((phase) => {
    const item = data.find((d) => d.name === phase.label)
    return {
      fase: phase.label,
      Projecten: item?.value || 0,
    }
  })

  const afgerond = data.find((d) => d.name === 'Afgerond')
  if (afgerond) {
    chartData.push({ fase: 'Afgerond', Projecten: afgerond.value })
  }

  return (
    <Paper withBorder p="md" radius="md">
      <Title order={4} mb="sm">Projecten per fase</Title>

      {data.length === 0 ? (
        <Text c="dimmed" size="sm">Geen projecten om weer te geven.</Text>
      ) : (
        <BarChart
          h={200}
          data={chartData}
          dataKey="fase"
          series={[{ name: 'Projecten', color: 'brand' }]}
          tickLine="y"
          gridAxis="y"
        />
      )}
    </Paper>
  )
}
