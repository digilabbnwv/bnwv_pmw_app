import { useState, useEffect } from 'react'
import {
  Container,
  Paper,
  Title,
  PasswordInput,
  Button,
  Alert,
  Stack,
  Text,
} from '@mantine/core'
import { IconAlertCircle, IconCheck } from '@tabler/icons-react'
import { supabase } from '../lib/supabaseClient'
import { useNavigate } from 'react-router-dom'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [sessionReady, setSessionReady] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    // Supabase automatically picks up the tokens from the URL hash
    // and establishes a session. We listen for the PASSWORD_RECOVERY event.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setSessionReady(true)
      }
    })

    // Also check if there's already an active session (tokens already consumed)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSessionReady(true)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (password.length < 8) {
      setError('Wachtwoord moet minimaal 8 tekens lang zijn.')
      return
    }

    if (password !== confirmPassword) {
      setError('De wachtwoorden komen niet overeen.')
      return
    }

    setLoading(true)

    const { error: updateError } = await supabase.auth.updateUser({
      password,
    })

    setLoading(false)

    if (updateError) {
      setError(updateError.message)
    } else {
      setSuccess(true)
      setTimeout(() => navigate('/login'), 3000)
    }
  }

  return (
    <Container size={420} py={80}>
      <Title ta="center" order={1}>
        Nieuw wachtwoord
      </Title>
      <Text ta="center" c="dimmed" mt="xs">
        Stel een nieuw wachtwoord in voor je account
      </Text>

      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        {error && (
          <Alert icon={<IconAlertCircle size={16} />} color="red" mb="md">
            {error}
          </Alert>
        )}

        {success ? (
          <Alert icon={<IconCheck size={16} />} color="green">
            Wachtwoord succesvol gewijzigd! Je wordt doorgestuurd naar de inlogpagina...
          </Alert>
        ) : !sessionReady ? (
          <Text ta="center" c="dimmed">
            Sessie laden...
          </Text>
        ) : (
          <form onSubmit={handleSubmit}>
            <Stack>
              <PasswordInput
                label="Nieuw wachtwoord"
                placeholder="Minimaal 8 tekens"
                required
                value={password}
                onChange={(e) => setPassword(e.currentTarget.value)}
              />
              <PasswordInput
                label="Bevestig wachtwoord"
                placeholder="Herhaal je wachtwoord"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.currentTarget.value)}
              />
              <Button type="submit" fullWidth loading={loading}>
                Wachtwoord opslaan
              </Button>
            </Stack>
          </form>
        )}
      </Paper>
    </Container>
  )
}
