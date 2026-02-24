import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from './supabaseClient'

const errorMessages = {
  login: 'E-mailadres of wachtwoord is onjuist',
  totp: 'De code is onjuist of verlopen. Probeer opnieuw.',
  save: 'Opslaan mislukt. Controleer je verbinding en probeer opnieuw.',
  generic: 'Er is iets misgegaan. Probeer het opnieuw.',
}

export function useAuth() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [mfaVerified, setMfaVerified] = useState(false)
  const navigate = useNavigate()

  const checkMfa = useCallback(async () => {
    const { data } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
    if (data?.currentLevel === 'aal2') {
      setMfaVerified(true)
    } else {
      setMfaVerified(false)
    }
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s)
      if (s) checkMfa()
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s)
      if (s) checkMfa()
      else setMfaVerified(false)
    })

    return () => subscription.unsubscribe()
  }, [checkMfa])

  const signIn = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      return { error: errorMessages.login }
    }
    return { error: null }
  }

  const verifyTotp = async (factorId, code) => {
    const { data: challenge, error: challengeError } =
      await supabase.auth.mfa.challenge({ factorId })
    if (challengeError) {
      return { error: errorMessages.totp }
    }

    const { error: verifyError } = await supabase.auth.mfa.verify({
      factorId,
      challengeId: challenge.id,
      code,
    })
    if (verifyError) {
      return { error: errorMessages.totp }
    }

    setMfaVerified(true)
    return { error: null }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setSession(null)
    setMfaVerified(false)
    navigate('/login')
  }

  return {
    session,
    loading,
    mfaVerified,
    signIn,
    verifyTotp,
    signOut,
    errorMessages,
  }
}
