import { useState } from 'react'

const WHATSAPP_NUMBER = '+1 (213) 913-8552'

const platformOptions = ['TikTok', 'Instagram', 'YouTube Shorts', 'Facebook']
const messageTypeOptions = ['comment', 'DM']
const ringCutOptions = ['oval', 'marquise', 'emerald', 'round', 'pear', 'unknown']
const accountTypeOptions = ['traffic', 'brand', 'conversion']

const outputConfig = [
  { key: 'casual', title: 'casual native reply' },
  { key: 'brand', title: 'brand polished reply' },
  { key: 'conversion', title: 'conversion-friendly reply' },
  { key: 'playful', title: 'playful reply' },
  { key: 'short', title: 'short comment reply' },
]

const emptyReplies = {
  casual: '',
  brand: '',
  conversion: '',
  playful: '',
  short: '',
}

function App() {
  const [form, setForm] = useState({
    platform: 'TikTok',
    messageType: 'comment',
    userMessage: '',
    videoCaption: '',
    ringCut: 'unknown',
    accountType: 'brand',
    shouldGuideWhatsApp: true,
  })

  const [replies, setReplies] = useState(emptyReplies)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const onGenerate = async () => {
    if (!form.userMessage.trim()) {
      setError('Please enter the user message first.')
      return
    }

    setError('')
    setIsLoading(true)

    try {
      const res = await fetch('/api/generate-replies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data?.error || 'Unable to generate replies right now.')
      }

      setReplies({
        casual: data.casual || '',
        brand: data.brand || '',
        conversion: data.conversion || '',
        playful: data.playful || '',
        short: data.short || '',
      })
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again in a moment.')
    } finally {
      setIsLoading(false)
    }
  }

  const copyText = async (text) => {
    if (!text) return

    try {
      await navigator.clipboard.writeText(text)
    } catch {
      setError('Copy failed. Please copy manually.')
    }
  }

  const inputClass =
    'w-full rounded-xl border border-zinc-700 bg-zinc-900/80 px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-amber-300'

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 px-4 py-10 md:px-8">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-6 shadow-glow">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-100">Jewelry Reply Assistant</h1>
          <p className="mt-2 text-sm text-zinc-400">
            DeepSeek-powered social reply drafts for jewelry accounts (API key secured on backend).
          </p>

          <div className="mt-6 space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-sm text-zinc-300">platform</span>
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
              <span className="mb-1.5 block text-sm text-zinc-300">messageType</span>
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
              <span className="mb-1.5 block text-sm text-zinc-300">userMessage</span>
              <textarea
                rows={4}
                value={form.userMessage}
                onChange={(e) => setForm((s) => ({ ...s, userMessage: e.target.value }))}
                className={inputClass}
                placeholder="Paste the user's exact message"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm text-zinc-300">videoCaption (optional)</span>
              <textarea
                rows={2}
                value={form.videoCaption}
                onChange={(e) => setForm((s) => ({ ...s, videoCaption: e.target.value }))}
                className={inputClass}
                placeholder="Optional video context"
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-sm text-zinc-300">ringCut</span>
                <select
                  value={form.ringCut}
                  onChange={(e) => setForm((s) => ({ ...s, ringCut: e.target.value }))}
                  className={inputClass}
                >
                  {ringCutOptions.map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-1.5 block text-sm text-zinc-300">accountType</span>
                <select
                  value={form.accountType}
                  onChange={(e) => setForm((s) => ({ ...s, accountType: e.target.value }))}
                  className={inputClass}
                >
                  {accountTypeOptions.map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </select>
              </label>
            </div>

            <label className="flex items-center justify-between rounded-xl border border-zinc-700 bg-zinc-900/80 px-4 py-3">
              <span className="text-sm text-zinc-200">shouldGuideWhatsApp</span>
              <input
                type="checkbox"
                checked={form.shouldGuideWhatsApp}
                onChange={(e) => setForm((s) => ({ ...s, shouldGuideWhatsApp: e.target.checked }))}
                className="h-5 w-5 accent-amber-300"
              />
            </label>

            <div className="rounded-xl border border-amber-200/20 bg-amber-50/5 px-4 py-3 text-sm text-amber-100">
              WhatsApp (fixed): <span className="font-medium">{WHATSAPP_NUMBER}</span>
            </div>

            <button
              type="button"
              onClick={onGenerate}
              disabled={isLoading}
              className="w-full rounded-xl bg-amber-300 px-4 py-3 text-sm font-semibold text-zinc-900 transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isLoading ? 'Generating replies...' : 'Generate Replies'}
            </button>

            {error ? (
              <div className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">{error}</div>
            ) : null}
          </div>
        </section>

        <section className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-6 shadow-glow">
          <h2 className="text-xl font-semibold text-zinc-100">Generated Outputs</h2>
          <p className="mt-2 text-sm text-zinc-400">
            Native-sounding drafts customized by platform, message type, and commercial intent.
          </p>

          <div className="mt-6 space-y-4">
            {outputConfig.map(({ key, title }) => (
              <article key={key} className="rounded-xl border border-zinc-700 bg-zinc-900/80 p-4">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold text-zinc-200">{title}</h3>
                  <button
                    type="button"
                    onClick={() => copyText(replies[key])}
                    className="rounded-lg border border-zinc-600 px-3 py-1.5 text-xs text-zinc-200 transition hover:border-amber-300 hover:text-amber-100"
                  >
                    Copy
                  </button>
                </div>
                <p className="mt-3 min-h-14 whitespace-pre-wrap text-sm leading-relaxed text-zinc-300">
                  {replies[key] || 'Generate to see this version.'}
                </p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

export default App