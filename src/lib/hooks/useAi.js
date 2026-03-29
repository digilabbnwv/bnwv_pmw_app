import { useState, useCallback } from 'react'
import { supabase } from '../supabaseClient'

export function useAi(projectId, sessionType) {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [sessionId, setSessionId] = useState(null)

  const sendMessage = useCallback(
    async (content, context = '') => {
      setLoading(true)
      setError(null)

      const userMessage = { role: 'user', content }
      const updatedMessages = [...messages, userMessage]
      setMessages(updatedMessages)

      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session?.access_token) {
          throw new Error('Niet ingelogd')
        }

        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-generate`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({
              session_type: sessionType,
              messages: updatedMessages,
              context,
              project_id: projectId,
            }),
          }
        )

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}))
          throw new Error(errData.error || 'AI service niet beschikbaar')
        }

        const data = await response.json()
        const assistantMessage = { role: 'assistant', content: data.message }
        const allMessages = [...updatedMessages, assistantMessage]
        setMessages(allMessages)

        // Save session
        if (sessionId) {
          await supabase
            .from('ai_sessions')
            .update({ conversation: allMessages, updated_at: new Date().toISOString() })
            .eq('id', sessionId)
        } else {
          const { data: { user } } = await supabase.auth.getUser()
          const { data: newSession } = await supabase
            .from('ai_sessions')
            .insert({
              project_id: projectId,
              session_type: sessionType,
              conversation: allMessages,
              created_by: user?.id,
            })
            .select()
            .single()

          if (newSession) setSessionId(newSession.id)
        }

        setLoading(false)
        return data.message
      } catch (err) {
        setError(err.message)
        setLoading(false)
        return null
      }
    },
    [messages, projectId, sessionType, sessionId]
  )

  const resetConversation = useCallback(() => {
    setMessages([])
    setSessionId(null)
    setError(null)
  }, [])

  return {
    messages,
    loading,
    error,
    sendMessage,
    resetConversation,
  }
}
