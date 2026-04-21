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
  PinInput,
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
  const [mfaRequired, setMfaRequired] = useState(false)
  const [mfaVerified, setMfaVerified] = useState(false)
  const [totpCode, setTotpCode] = useState('')
  const [factorId, setFactorId] = useState(null)
  const navigate = useNavigate()

  const checkMfaRequirement = async () => {
    const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
    if (aal?.nextLevel === 'aal2' && aal?.currentLevel !== 'aal2') {
      const { data: factors } = await supabase.auth.mfa.listFactors()
      const totpFactors = factors?.totp || []
      if (totpFactors.length > 0) {
        setFactorId(totpFactors[0].id)
        setMfaRequired(true)
        return
      }
    }
    setMfaVerified(true)
  }

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setSessionReady(true)
        checkMfaRequirement()
      }
    })

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSessionReady(true)
        checkMfaRequirement()
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleTotp = async (code) => {
    setError('')
    setLoading(true)

    const { data: challenge, error: challengeError } =
      await supabase.auth.mfa.challenge({ factorId })

    if (challengeError) {
      setError('MFA verificatie mislukt. Probeer opnieuw.')
      setLoading(false)
      return
    }

    const { error: verifyError } = await supabase.auth.mfa.verify({
      factorId,
      challengeId: challenge.id,
      code,
    })

    setLoading(false)

    if (verifyError) {
      setError('De code is onjuist of verlopen. Probeer opnieuw.')
      setTotpCode('')
      return
    }

    setMfaVerified(true)
    setMfaRequired(false)
  }

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
        ) : mfaRequired && !mfaVerified ? (
          <Stack>
            <Text size="sm" ta="center">
              Voer de 6-cijferige code in van je authenticator app om door te gaan.
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
