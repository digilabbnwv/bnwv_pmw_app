import { useCallback } from 'react'
import { supabase } from '../supabaseClient'

export function useActivityLog(projectId) {
  const log = useCallback(
    async (action, entityType, entityId, metadata = {}) => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user || !projectId) return

      await supabase.from('activity_log').insert({
        project_id: projectId,
        actor_id: user.id,
        action,
        entity_type: entityType,
        entity_id: entityId,
        metadata,
      })
    },
    [projectId]
  )

  return { log }
}
