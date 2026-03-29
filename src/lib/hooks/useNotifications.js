import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../supabaseClient'

export function useNotifications() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchNotifications = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20)

    setItems(data || [])
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchNotifications()

    // Subscribe to realtime notifications
    const setupSubscription = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const channel = supabase
        .channel('notifications')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            setItems((prev) => [payload.new, ...prev])
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }

    const cleanup = setupSubscription()
    return () => {
      cleanup.then((fn) => fn?.())
    }
  }, [fetchNotifications])

  const unreadCount = items.filter((n) => !n.read).length

  const markAsRead = useCallback(async (notificationId) => {
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId)

    setItems((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    )
  }, [])

  const markAllAsRead = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', user.id)
      .eq('read', false)

    setItems((prev) => prev.map((n) => ({ ...n, read: true })))
  }, [])

  return {
    notifications: items,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    refetch: fetchNotifications,
  }
}
