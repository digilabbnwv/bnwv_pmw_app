import { useState, useEffect } from 'react'
import {
  Container,
  Paper,
  Title,
  Text,
  Button,
  Alert,
  Stack,
  PinInput,
  Code,
  Image,
  Loader,
  Center,
} from '@mantine/core'
import { IconAlertCircle } from '@tabler/icons-react'
import { supabase } from '../lib/supabaseClient'
import { useNavigate } from 'react-router-dom'

const errorMessages = {
  totp: 'De code is onjuist of verlopen. Probeer opnieuw.',
  setup: 'Instellen van 2FA mislukt. Probeer het opnieuw.',
}

export default function SetupTOTPPage() {
  const [qrCode, setQrCode] = useState('')
  const [secret, setSecret] = useState('')
  const [factorId, setFactorId] = useState(null)
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [enrolling, setEnrolling] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const enroll = async () => {
      const { data, error: enrollError } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        friendlyName: 'BNWV Projectbeheer',
      })

      if (enrollError) {
        setError(errorMessages.setup)
        setEnrolling(false)
        return
      }

      setQrCode(data.totp.qr_code)
      setSecret(data.totp.secret)
      setFactorId(data.id)
      setEnrolling(false)
    }

    enroll()
  }, [])

  const handleVerify = async (verifyCode) => {
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
      code: verifyCode,
    })

    if (verifyError) {
      setError(errorMessages.totp)
      setCode('')
      setLoading(false)
      return
    }

    setLoading(false)
    navigate('/')
  }

  if (enrolling) {
    return (
      <Container size={420} py={80}>
        <Center>
          <Loader />
        </Center>
      </Container>
    )
  }

  return (
    <Container size={420} py={80}>
      <Title ta="center" order={2}>
        Twee-factor authenticatie instellen
      </Title>

      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        {error && (
          <Alert icon={<IconAlertCircle size={16} />} color="red" mb="md">
            {error}
          </Alert>
        )}

        <Stack>
          <Text size="sm">
            Scan de QR-code met je authenticator app (bijv. Google Authenticator of Authy).
          </Text>

          {qrCode && (
            <Center>
              <Image src={qrCode} alt="TOTP QR Code" w={200} h={200} />
            </Center>
          )}

          <Text size="xs" c="dimmed">
            Kun je de QR-code niet scannen? Voer deze sleutel handmatig in:
          </Text>
          <Code block>{secret}</Code>

          <Text size="sm" mt="md">
            Voer de 6-cijferige code in om te bevestigen:
          </Text>
          <PinInput
            length={6}
            type="number"
            oneTimeCode
            value={code}
            onChange={(value) => {
              setCode(value)
              if (value.length === 6) handleVerify(value)
            }}
            style={{ justifyContent: 'center' }}
          />
          <Button
            fullWidth
            loading={loading}
            onClick={() => handleVerify(code)}
            disabled={code.length !== 6}
          >
            Bevestigen
          </Button>
        </Stack>
      </Paper>
    </Container>
  )
}
