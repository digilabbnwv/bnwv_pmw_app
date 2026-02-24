import { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { Center, Loader } from '@mantine/core'
import { supabase } from '../lib/supabaseClient'

export default function ProtectedRoute({ children }) {
  const [loading, setLoading] = useState(true)
  const [authenticated, setAuthenticated] = useState(false)
  const [mfaVerified, setMfaVerified] = useState(false)

  useEffect(() => {
    const check = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        setLoading(false)
        return
      }

      setAuthenticated(true)

      const { data } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
      if (data?.currentLevel === 'aal2') {
        setMfaVerified(true)
      }

      setLoading(false)
    }

    check()
  }, [])

  if (loading) {
    return (
      <Center h="100vh">
        <Loader />
      </Center>
    )
  }

  if (!authenticated) {
    return <Navigate to="/login" replace />
  }

  if (!mfaVerified) {
    return <Navigate to="/setup-totp" replace />
  }

  return children
}
