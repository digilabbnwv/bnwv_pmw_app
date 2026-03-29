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
        console.log('[useAi] Calling ai-generate via supabase.functions.invoke')

        const { data, error: fnError } = await supabase.functions.invoke('ai-generate', {
          body: {
            session_type: sessionType,
            messages: updatedMessages,
            context,
            project_id: projectId,
          },
        })

        if (fnError) {
          console.error('[useAi] Function error:', fnError)
          throw new Error(fnError.message || 'AI service niet beschikbaar')
        }

        console.log('[useAi] Response:', data)

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
        console.error('[useAi] Error:', err)
        setError(err.message || 'Onbekende fout bij AI-aanroep')
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
