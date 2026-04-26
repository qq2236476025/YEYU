import 'dotenv/config'
import express from 'express'
import cors from 'cors'

const app = express()
const port = process.env.PORT || 8787
const deepseekApiKey = process.env.DEEPSEEK_API_KEY
const WHATSAPP_NUMBER = '+1 (213) 913-8552'

app.use(cors())
app.use(express.json())

app.get('/api/health', (_req, res) => {
  res.json({ ok: true })
})

app.post('/api/generate-replies', async (req, res) => {
  if (!deepseekApiKey) {
    return res.status(500).json({ error: 'Server missing DEEPSEEK_API_KEY. Please configure .env.' })
  }

  const {
    platform,
    messageType,
    userMessage,
    videoCaption,
    ringCut,
    accountType,
    shouldGuideWhatsApp,
  } = req.body || {}

  if (!platform || !messageType || !userMessage || !ringCut || !accountType) {
    return res.status(400).json({ error: 'Missing required fields.' })
  }

  const systemPrompt = `You are a US-native social media copywriter for a premium jewelry brand.

Write 5 reply variants for incoming social messages.
Rules:
- Sound naturally American, human, and platform-native.
- No customer-service voice, no AI tone.
- Avoid overusing: "Thank you", "We're glad", "Please contact us".
- Never invent uncertain product specs.
- If user asks about price, buying, customization, carat, or ring size, naturally guide to WhatsApp (${WHATSAPP_NUMBER}).
- Guidance should feel smooth, not pushy ads.
- Comment replies should be short. DM can be fuller.
- Platform adaptation:
  - TikTok: conversational and playful
  - Instagram: polished and aesthetic
  - Facebook: clearer and a bit more complete
  - YouTube Shorts: direct and punchy

Return ONLY valid JSON with this exact shape:
{
  "casual": "...",
  "brand": "...",
  "conversion": "...",
  "playful": "...",
  "short": "..."
}`

  const userPrompt = JSON.stringify(
    {
      platform,
      messageType,
      userMessage,
      videoCaption: videoCaption || '',
      ringCut,
      accountType,
      shouldGuideWhatsApp,
      whatsappNumber: WHATSAPP_NUMBER,
    },
    null,
    2,
  )

  try {
    const upstream = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${deepseekApiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        temperature: 0.9,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        response_format: { type: 'json_object' },
      }),
    })

    if (!upstream.ok) {
      const text = await upstream.text()
      return res.status(502).json({ error: 'DeepSeek API request failed.', detail: text.slice(0, 500) })
    }

    const data = await upstream.json()
    const content = data?.choices?.[0]?.message?.content

    if (!content) {
      return res.status(502).json({ error: 'DeepSeek returned empty content.' })
    }

    let parsed
    try {
      parsed = JSON.parse(content)
    } catch {
      return res.status(502).json({ error: 'DeepSeek returned non-JSON output.' })
    }

    const result = {
      casual: parsed.casual || '',
      brand: parsed.brand || '',
      conversion: parsed.conversion || '',
      playful: parsed.playful || '',
      short: parsed.short || '',
    }

    return res.json(result)
  } catch (error) {
    return res.status(500).json({ error: 'Server error while generating replies.', detail: error.message })
  }
})

app.listen(port, () => {
  console.log(`API server listening on http://localhost:${port}`)
})