import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertCircle, ArrowLeft, Loader2, Server, Shield } from 'lucide-react'
import api from '../api/client'
import { getErrorMessage } from '../lib/errors'
import { asRecord, asString } from '../lib/safe'

type AiStatus = { ollama_url: string; model: string }

export default function Settings() {
  const navigate = useNavigate()
  const [aiStatus, setAiStatus] = useState<AiStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadStatus = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const resp = await api.get('/ai/status')
      const data = asRecord(resp.data)
      setAiStatus({
        ollama_url: asString(data.ollama_url, 'Unknown'),
        model: asString(data.model, 'Unknown'),
      })
    } catch (err) {
      setAiStatus(null)
      setError(getErrorMessage(err, 'Could not load AI settings.'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadStatus()
  }, [loadStatus])

  return (
    <div className="min-h-screen bg-ghost-bg px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-400 hover:text-ghost-cyan mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <h1 className="text-3xl font-bold mb-6">Settings</h1>
        <div className="space-y-6">
          <div className="bg-ghost-midnight p-6 rounded border border-gray-800">
            <div className="flex items-center gap-2 mb-4">
              <Server className="w-5 h-5 text-ghost-violet" />
              <h2 className="text-xl font-semibold">Ollama AI Settings</h2>
            </div>
            {loading ? (
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <Loader2 className="w-4 h-4 animate-spin" /> Loading...
              </div>
            ) : error ? (
              <div role="alert" className="space-y-3">
                <p className="flex items-center gap-2 text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4 shrink-0" /> {error}
                </p>
                <button
                  type="button"
                  onClick={() => void loadStatus()}
                  className="text-ghost-cyan hover:underline text-sm"
                >
                  Try Again
                </button>
              </div>
            ) : (
              <div className="space-y-2 text-sm">
                <p className="text-gray-300">Base URL: {aiStatus?.ollama_url ?? 'Unknown'}</p>
                <p className="text-gray-300">Model: {aiStatus?.model ?? 'Unknown'}</p>
              </div>
            )}
          </div>
          <div className="bg-ghost-midnight p-6 rounded border border-gray-800">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-ghost-green" />
              <h2 className="text-xl font-semibold">Privacy & Local-First</h2>
            </div>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>Repository contents stay local by default</li>
              <li>AI prompts never sent to third-party APIs when using Ollama</li>
              <li>No telemetry or analytics</li>
              <li>All analysis runs locally</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
