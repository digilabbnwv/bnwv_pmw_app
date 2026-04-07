import { useState } from 'react'
import { Stack, Paper, Group, Text, Button, Textarea } from '@mantine/core'
import { IconSend } from '@tabler/icons-react'
import { formatDate } from '../../lib/utils/dateUtils'
import EmployeeAvatar from '../common/EmployeeAvatar'

export default function CommentThread({ comments, phase, profiles, onAdd }) {
  const [content, setContent] = useState('')
  const [sending, setSending] = useState(false)

  const handleSubmit = async () => {
    if (!content.trim()) return
    setSending(true)
    await onAdd({ content: content.trim(), phase })
    setContent('')
    setSending(false)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSubmit()
    }
  }

  return (
    <Stack gap="md">
      {comments.length === 0 ? (
        <Paper p="lg" radius="md" withBorder ta="center">
          <Text c="dimmed" size="sm">Nog geen opmerkingen in deze fase.</Text>
        </Paper>
      ) : (
        comments.map((comment) => {
          const author = profiles.find((p) => p.id === comment.author_id)
          return (
            <Paper key={comment.id} p="sm" radius="md" withBorder>
              <Group gap="sm" align="flex-start">
                <EmployeeAvatar profile={author} size="sm" />
                <div style={{ flex: 1 }}>
                  <Group gap="xs" mb={2}>
                    <Text size="sm" fw={600}>{author?.full_name || 'Onbekend'}</Text>
                    <Text size="xs" c="dimmed">{formatDate(comment.created_at)}</Text>
                  </Group>
                  <Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>{comment.content}</Text>
                </div>
              </Group>
            </Paper>
          )
        })
      )}

      <Paper p="sm" radius="md" withBorder>
        <Textarea
          placeholder="Schrijf een opmerking... (Ctrl+Enter om te versturen)"
          value={content}
          onChange={(e) => setContent(e.currentTarget.value)}
          onKeyDown={handleKeyDown}
          rows={2}
          mb="xs"
        />
        <Group justify="flex-end">
          <Button
            size="sm"
            leftSection={<IconSend size={14} />}
            onClick={handleSubmit}
            loading={sending}
            disabled={!content.trim()}
          >
            Versturen
          </Button>
        </Group>
      </Paper>
    </Stack>
  )
}
