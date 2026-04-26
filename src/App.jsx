import { useMemo, useState } from 'react'

const WHATSAPP_NUMBER = '+1 (213) 913-8552'

const platformOptions = ['TikTok', 'Instagram', 'YouTube Shorts', 'Facebook']
const messageTypeOptions = ['评论', '私信']
const cutOptions = ['oval', 'marquise', 'emerald', 'round', 'pear', 'unknown']
const accountOptions = ['流量号', '品牌号', '转化号']

const inquiryKeywords = [
  'price',
  'pricing',
  'cost',
  'how much',
  'carat',
  'ct',
  'custom',
  'customize',
  'made to order',
  'buy',
  'purchase',
  'available',
  'ship',
  'shipping',
  'order',
]

const hasInquiryIntent = (text) => {
  const lowered = text.toLowerCase()
  return inquiryKeywords.some((keyword) => lowered.includes(keyword))
}

const toneByAccount = {
  流量号: 'friendly and playful',
  品牌号: 'premium and refined',
  转化号: 'warm and action-oriented',
}

function buildBaseContext({ platform, messageType, ringCut, accountType, originalText }) {
  const source = messageType === '私信' ? 'DM' : 'comment'
  const cutText = ringCut === 'unknown' ? 'cut not specified' : `${ringCut} cut`
  const tone = toneByAccount[accountType]

  return {
    source,
    cutText,
    tone,
    originalText,
    platform,
  }
}

function buildReply(style, context, shouldLeadWhatsApp) {
  const { source, cutText, tone, originalText, platform } = context
  const safeCut = cutText === 'cut not specified' ? 'the piece' : `the ${cutText} ring`
  const thanks = source === 'DM' ? 'Thanks for reaching out 💛' : 'Love this question — thank you 💛'

  const uncertaintyLine = /\?|maybe|not sure|unknown/i.test(originalText)
    ? "If you're still deciding, no rush — I can share options once you know the exact style you want."
    : ''

  const waLine = shouldLeadWhatsApp
    ? `For pricing, carat options, and custom details, message us on WhatsApp: ${WHATSAPP_NUMBER}.`
    : ''

  const styleTemplates = {
    natural: `${thanks} ${safeCut} looks stunning on ${platform}. ${
      source === 'comment' ? 'Happy to help here anytime.' : 'I can walk you through it.'
    } ${waLine} ${uncertaintyLine}`,
    brand: `Thank you for your message. We appreciate your interest in ${safeCut}. We keep details accurate and only confirm specifications once your preferred design is clear. ${waLine}`,
    conversion: `Great taste — ${safeCut} is one of our favorites. I can help you with next steps ${
      source === 'DM' ? 'right here' : 'quickly'
    }. ${waLine || 'Tell me your target style + budget and I will narrow options for you.'}`,
  }

  return styleTemplates[style].replace(/\s+/g, ' ').trim()
}

function App() {
  const [form, setForm] = useState({
    platform: 'TikTok',
    messageType: '评论',
    originalText: '',
    ringCut: 'unknown',
    accountType: '品牌号',
    needWhatsApp: true,
  })

  const shouldLeadWhatsApp = useMemo(() => {
    return form.needWhatsApp || hasInquiryIntent(form.originalText)
  }, [form.needWhatsApp, form.originalText])

  const generated = useMemo(() => {
    const context = buildBaseContext(form)

    return {
      '轻松自然版': buildReply('natural', context, shouldLeadWhatsApp),
      '品牌专业版': buildReply('brand', context, shouldLeadWhatsApp),
      '转化引导版': buildReply('conversion', context, shouldLeadWhatsApp),
    }
  }, [form, shouldLeadWhatsApp])

  const copyText = async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      alert('Copied!')
    } catch {
      alert('Copy failed. Please copy manually.')
    }
  }

  const inputClass =
    'w-full rounded-xl border border-zinc-700 bg-zinc-900/80 px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-amber-300'

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 px-4 py-10 md:px-8">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-6 shadow-glow">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-100">Jewelry Reply Assistant</h1>
          <p className="mt-2 text-sm text-zinc-400">为珠宝品牌账号快速生成自然英文评论/私信回复（本地规则，无 API）。</p>

          <div className="mt-6 space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-sm text-zinc-300">平台</span>
              <select
                value={form.platform}
                onChange={(e) => setForm((s) => ({ ...s, platform: e.target.value }))}
                className={inputClass}
              >
                {platformOptions.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm text-zinc-300">消息类型</span>
              <select
                value={form.messageType}
                onChange={(e) => setForm((s) => ({ ...s, messageType: e.target.value }))}
                className={inputClass}
              >
                {messageTypeOptions.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm text-zinc-300">用户原文</span>
              <textarea
                rows={5}
                value={form.originalText}
                onChange={(e) => setForm((s) => ({ ...s, originalText: e.target.value }))}
                className={inputClass}
                placeholder="Paste the user's exact message here..."
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-sm text-zinc-300">戒指切割</span>
                <select
                  value={form.ringCut}
                  onChange={(e) => setForm((s) => ({ ...s, ringCut: e.target.value }))}
                  className={inputClass}
                >
                  {cutOptions.map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-1.5 block text-sm text-zinc-300">账号类型</span>
                <select
                  value={form.accountType}
                  onChange={(e) => setForm((s) => ({ ...s, accountType: e.target.value }))}
                  className={inputClass}
                >
                  {accountOptions.map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </select>
              </label>
            </div>

            <label className="flex items-center justify-between rounded-xl border border-zinc-700 bg-zinc-900/80 px-4 py-3">
              <span className="text-sm text-zinc-200">是否需要引导 WhatsApp</span>
              <input
                type="checkbox"
                checked={form.needWhatsApp}
                onChange={(e) => setForm((s) => ({ ...s, needWhatsApp: e.target.checked }))}
                className="h-5 w-5 accent-amber-300"
              />
            </label>

            <div className="rounded-xl border border-amber-200/20 bg-amber-50/5 px-4 py-3 text-sm text-amber-100">
              WhatsApp: <span className="font-medium">{WHATSAPP_NUMBER}</span>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-6 shadow-glow">
          <h2 className="text-xl font-semibold text-zinc-100">输出结果</h2>
          <p className="mt-2 text-sm text-zinc-400">自动识别价格/克拉/定制/购买意图，必要时引导到 WhatsApp。</p>

          <div className="mt-6 space-y-4">
            {Object.entries(generated).map(([title, text]) => (
              <article key={title} className="rounded-xl border border-zinc-700 bg-zinc-900/80 p-4">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold text-zinc-200">{title}</h3>
                  <button
                    type="button"
                    onClick={() => copyText(text)}
                    className="rounded-lg border border-zinc-600 px-3 py-1.5 text-xs text-zinc-200 transition hover:border-amber-300 hover:text-amber-100"
                  >
                    复制
                  </button>
                </div>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-zinc-300">{text}</p>
              </article>
            ))}
          </div>

          <div className="mt-5 rounded-xl border border-zinc-700 bg-zinc-900/60 p-3 text-xs text-zinc-400">
            Reply tone profile: {toneByAccount[form.accountType]}
          </div>
        </section>
      </div>
    </div>
  )
}

export default App
