import ReactMarkdown from 'react-markdown'
import { Title, Text, List, Code, Divider, Blockquote } from '@mantine/core'

const components = {
  h1: ({ children }) => (
    <Title order={3} mb="xs">
      {children}
    </Title>
  ),
  h2: ({ children }) => (
    <Title order={4} mb="xs" mt="sm">
      {children}
    </Title>
  ),
  h3: ({ children }) => (
    <Title order={5} mb={4} mt="xs">
      {children}
    </Title>
  ),
  p: ({ children }) => (
    <Text size="sm" mb="xs">
      {children}
    </Text>
  ),
  ul: ({ children }) => (
    <List size="sm" mb="xs" spacing={4}>
      {children}
    </List>
  ),
  ol: ({ children }) => (
    <List type="ordered" size="sm" mb="xs" spacing={4}>
      {children}
    </List>
  ),
  li: ({ children }) => <List.Item>{children}</List.Item>,
  strong: ({ children }) => (
    <Text component="span" fw={700}>
      {children}
    </Text>
  ),
  em: ({ children }) => (
    <Text component="span" fs="italic">
      {children}
    </Text>
  ),
  code: ({ children }) => <Code>{children}</Code>,
  hr: () => <Divider my="sm" />,
  blockquote: ({ children }) => (
    <Blockquote color="violet" my="xs">
      {children}
    </Blockquote>
  ),
}

export default function MarkdownContent({ content }) {
  if (!content) return null
  return <ReactMarkdown components={components}>{content}</ReactMarkdown>
}
