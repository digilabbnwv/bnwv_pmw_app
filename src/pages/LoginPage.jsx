import { useState } from 'react'
import {
  Container,
  Paper,
  Title,
  TextInput,
  PasswordInput,
  Button,
  Alert,
  Stack,
  PinInput,
  Text,
} from '@mantine/core'
import { IconAlertCircle } from '@tabler/icons-react'
import { supabase } from '../lib/supabaseClient'
import { useNavigate } from 'react-router-dom'

const errorMessages = {
  login: 'E-mailadres of wachtwoord is onjuist',
  totp: 'De code is onjuist of verlopen. Probeer opnieuw.',
  generic: 'Er is iets misgegaan. Probeer het opnieuw.',
}

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showTotp, setShowTotp] = useState(false)
  const [totpCode, setTotpCode] = useState('')
  const [factorId, setFactorId] = useState(null)
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) {
      setError(errorMessages.login)
      setLoading(false)
      return
    }

    const { data: factors } = await supabase.auth.mfa.listFactors()
    const totpFactors = factors?.totp || []

    if (totpFactors.length > 0) {
      setFactorId(totpFactors[0].id)
      setShowTotp(true)
      setLoading(false)
    } else {
      setLoading(false)
      navigate('/setup-totp')
    }
  }

  const handleTotp = async (code) => {
    setError('')
    setLoading(true)

    const { data: challenge, error: challengeError } =
      await supabase.auth.mfa.challenge({ factorId })

    if (challengeError) {
      setError(errorMessages.totp)
      setLoading(false)
      return
    }

    const { error: verifyError } = await supabase.auth.mfa.verify({
      factorId,
      challengeId: challenge.id,
      code,
    })

    if (verifyError) {
      setError(errorMessages.totp)
      setTotpCode('')
      setLoading(false)
      return
    }

    setLoading(false)
    navigate('/')
  }

  return (
    <Container size={420} py={80}>
      <Title ta="center" order={1}>
        Projectbeheer
      </Title>
      <Text ta="center" c="dimmed" mt="xs">
        Bibliotheek Noord-West Veluwe
      </Text>

      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        {error && (
          <Alert icon={<IconAlertCircle size={16} />} color="red" mb="md">
            {error}
          </Alert>
        )}

        {!showTotp ? (
          <form onSubmit={handleLogin}>
            <Stack>
              <TextInput
                label="E-mailadres"
                placeholder="je@email.nl"
                required
                value={email}
                onChange={(e) => setEmail(e.currentTarget.value)}
              />
              <PasswordInput
                label="Wachtwoord"
                placeholder="Je wachtwoord"
                required
                value={password}
                onChange={(e) => setPassword(e.currentTarget.value)}
              />
              <Button type="submit" fullWidth loading={loading}>
                Inloggen
              </Button>
            </Stack>
          </form>
        ) : (
          <Stack>
            <Text size="sm" ta="center">
              Voer de 6-cijferige code in van je authenticator app.
            </Text>
            <PinInput
              length={6}
              type="number"
              oneTimeCode
              value={totpCode}
              onChange={(value) => {
                setTotpCode(value)
                if (value.length === 6) handleTotp(value)
              }}
              style={{ justifyContent: 'center' }}
            />
            <Button
              fullWidth
              loading={loading}
              onClick={() => handleTotp(totpCode)}
              disabled={totpCode.length !== 6}
            >
              Verifiëren
            </Button>
          </Stack>
        )}
      </Paper>
    </Container>
  )
}
