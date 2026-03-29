import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../supabaseClient'

export function useProject(id) {
  const [project, setProject] = useState(null)
  const [phases, setPhases] = useState([])
  const [members, setMembers] = useState([])
  const [profiles, setProfiles] = useState([])
  const [deliverables, setDeliverables] = useState([])
  const [tasks, setTasks] = useState([])
  const [comments, setComments] = useState([])
  const [indicators, setIndicators] = useState([])
  const [activity, setActivity] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return

    let cancelled = false

    const fetchAll = async () => {
      const [
        projectRes,
        phasesRes,
        membersRes,
        profilesRes,
        deliverablesRes,
        tasksRes,
        commentsRes,
        indicatorsRes,
        activityRes,
      ] = await Promise.all([
        supabase.from('projects').select('*').eq('id', id).single(),
        supabase.from('project_phases').select('*').eq('project_id', id).order('started_at', { ascending: true }),
        supabase.from('project_members').select('*').eq('project_id', id),
        supabase.from('profiles').select('*'),
        supabase.from('project_deliverables').select('*').eq('project_id', id).order('created_at', { ascending: false }),
        supabase.from('project_tasks').select('*').eq('project_id', id).order('sort_order', { ascending: true }),
        supabase.from('project_comments').select('*').eq('project_id', id).order('created_at', { ascending: false }),
        supabase.from('success_indicators').select('*').eq('project_id', id).order('created_at', { ascending: true }),
        supabase.from('activity_log').select('*').eq('project_id', id).order('created_at', { ascending: false }).limit(20),
      ])

      if (cancelled) return

      setProject(projectRes.data)
      setPhases(phasesRes.data || [])
      setMembers(membersRes.data || [])
      setProfiles(profilesRes.data || [])
      setDeliverables(deliverablesRes.data || [])
      setTasks(tasksRes.data || [])
      setComments(commentsRes.data || [])
      setIndicators(indicatorsRes.data || [])
      setActivity(activityRes.data || [])
      setLoading(false)
    }

    fetchAll()

    return () => { cancelled = true }
  }, [id])

  const refetch = useCallback(() => {
    if (!id) return

    setLoading(true)

    const fetchAll = async () => {
      const [
        projectRes,
        phasesRes,
        membersRes,
        profilesRes,
        deliverablesRes,
        tasksRes,
        commentsRes,
        indicatorsRes,
        activityRes,
      ] = await Promise.all([
        supabase.from('projects').select('*').eq('id', id).single(),
        supabase.from('project_phases').select('*').eq('project_id', id).order('started_at', { ascending: true }),
        supabase.from('project_members').select('*').eq('project_id', id),
        supabase.from('profiles').select('*'),
        supabase.from('project_deliverables').select('*').eq('project_id', id).order('created_at', { ascending: false }),
        supabase.from('project_tasks').select('*').eq('project_id', id).order('sort_order', { ascending: true }),
        supabase.from('project_comments').select('*').eq('project_id', id).order('created_at', { ascending: false }),
        supabase.from('success_indicators').select('*').eq('project_id', id).order('created_at', { ascending: true }),
        supabase.from('activity_log').select('*').eq('project_id', id).order('created_at', { ascending: false }).limit(20),
      ])

      setProject(projectRes.data)
      setPhases(phasesRes.data || [])
      setMembers(membersRes.data || [])
      setProfiles(profilesRes.data || [])
      setDeliverables(deliverablesRes.data || [])
      setTasks(tasksRes.data || [])
      setComments(commentsRes.data || [])
      setIndicators(indicatorsRes.data || [])
      setActivity(activityRes.data || [])
      setLoading(false)
    }

    fetchAll()
  }, [id])

  return {
    project,
    setProject,
    phases,
    members,
    setMembers,
    profiles,
    deliverables,
    setDeliverables,
    tasks,
    setTasks,
    comments,
    setComments,
    indicators,
    setIndicators,
    activity,
    loading,
    refetch,
  }
}
