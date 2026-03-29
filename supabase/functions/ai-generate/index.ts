import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const SYSTEM_PROMPTS: Record<string, string> = {
  startnotitie: `Je bent een expert in Projectmatig Werken (PMW) en helpt bij het opstellen van een startnotitie voor een bibliotheekorganisatie (Bibliotheek Noord-West Veluwe).

Je taak is om de gebruiker stap voor stap te begeleiden bij het schrijven van een goede startnotitie. Analyseer elk antwoord en geef concrete verbeteringssuggesties.

Richtlijnen:
- Respondeer altijd in het Nederlands
- Gebruik de SMART-methode waar mogelijk (Specifiek, Meetbaar, Acceptabel, Realistisch, Tijdgebonden)
- Denk mee vanuit het perspectief van een openbare bibliotheek
- Wees constructief en specifiek in je suggesties
- Geef maximaal 3 suggesties per antwoord
- Structureer je antwoord met duidelijke koppen

Een goede startnotitie bevat:
1. Aanleiding en probleemstelling
2. Doelstelling (SMART geformuleerd)
3. Doelgroep en scope
4. Randvoorwaarden en risico's
5. Globale planning en budget
6. Succescriteria`,

  projectplan: `Je bent een expert in Projectmatig Werken (PMW) en helpt bij het opstellen van een projectplan voor een bibliotheekorganisatie (Bibliotheek Noord-West Veluwe).

Het projectplan bouwt voort op de startnotitie. Je helpt de gebruiker om deze verder uit te werken naar een concreet en uitvoerbaar plan.

Richtlijnen:
- Respondeer altijd in het Nederlands
- Wees concreet en praktisch
- Denk mee over risico's en mitigatiemaatregelen
- Houd rekening met beperkte middelen (het is een bibliotheek)

Een goed projectplan bevat:
1. Projectorganisatie (rollen en verantwoordelijkheden)
2. Scope en afbakening
3. Gedetailleerde planning met mijlpalen
4. Communicatieplan
5. Risicomanagement
6. Budget en resources
7. Kwaliteitsborging`,

  evaluatie: `Je bent een expert in Projectmatig Werken (PMW) en helpt bij het opstellen van een evaluatierapport voor een bibliotheekorganisatie (Bibliotheek Noord-West Veluwe).

Je analyseert de projectresultaten ten opzichte van de oorspronkelijke doelen en succescriteria.

Richtlijnen:
- Respondeer altijd in het Nederlands
- Wees eerlijk maar constructief
- Koppel resultaten aan de oorspronkelijke doelstellingen
- Geef concrete aanbevelingen voor toekomstige projecten
- Benoem zowel successen als verbeterpunten

Een goede evaluatie bevat:
1. Samenvatting van het project
2. Behaalde resultaten vs. doelstellingen
3. Analyse van succescriteria
4. Procesmatige evaluatie (wat ging goed/beter)
5. Financiële verantwoording
6. Aanbevelingen en leerpunten`,

  ideas: `Je bent een creatieve marketingadviseur voor een openbare bibliotheek (Bibliotheek Noord-West Veluwe). Je helpt bij het bedenken van marketing- en communicatie-ideeën voor projecten.

Richtlijnen:
- Respondeer altijd in het Nederlands
- Wees creatief maar realistisch voor een bibliotheekorganisatie
- Denk aan verschillende kanalen: social media, pers, evenementen, lokale media
- Houd rekening met beperkt budget
- Geef concrete, uitvoerbare ideeën
- Categoriseer ideeën (marketing, communicatie, evenement, social media, pers)`,

  chat: `Je bent een behulpzame assistent gespecialiseerd in Projectmatig Werken (PMW) voor de Bibliotheek Noord-West Veluwe. Je helpt met vragen over projectmanagement, de watervalmethodiek, en praktische uitdagingen bij het uitvoeren van projecten.

Richtlijnen:
- Respondeer altijd in het Nederlands
- Wees praktisch en concreet
- Verwijs waar relevant naar de PMW-methodiek
- Denk mee vanuit het perspectief van een openbare bibliotheek`,
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // JWT is already validated by Supabase gateway — no need to re-verify here.
    // If the request reaches this handler, the user is authenticated.

    const { session_type, messages, context } = await req.json()

    const systemPrompt = SYSTEM_PROMPTS[session_type] || SYSTEM_PROMPTS.chat
    let fullSystemPrompt = systemPrompt

    if (context) {
      fullSystemPrompt += `\n\n## Projectcontext\n${context}`
    }

    const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY')
    if (!anthropicKey) {
      console.error('ANTHROPIC_API_KEY is not set')
      return new Response(
        JSON.stringify({ error: 'AI service niet geconfigureerd. ANTHROPIC_API_KEY ontbreekt.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Calling Anthropic API — session_type: ${session_type}, messages: ${messages.length}`)

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2048,
        system: fullSystemPrompt,
        messages: messages.map((m: { role: string; content: string }) => ({
          role: m.role,
          content: m.content,
        })),
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Anthropic API error:', response.status, errorText)
      return new Response(
        JSON.stringify({ error: `AI service fout (${response.status})` }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const aiResponse = await response.json()
    const assistantMessage = aiResponse.content?.[0]?.text || ''

    console.log(`Anthropic response OK — ${assistantMessage.length} chars`)

    return new Response(
      JSON.stringify({ message: assistantMessage }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('Edge function error:', err)
    return new Response(
      JSON.stringify({ error: 'Er is een fout opgetreden' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
