import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Server, Shield } from 'lucide-react'
import { useState, useEffect } from 'react'
import api from '../api/client'

export default function Settings() {
  const navigate = useNavigate()
  const [aiStatus, setAiStatus] = useState<any>(null)

  useEffect(() => {
    api.get('/ai/status').then(r => setAiStatus(r.data)).catch(() => {})
  }, [])

  return (
    <div className="min-h-screen bg-ghost-bg px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-400 hover:text-ghost-cyan mb-6">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <h1 className="text-3xl font-bold mb-6">Settings</h1>
        <div className="space-y-6">
          <div className="bg-ghost-midnight p-6 rounded border border-gray-800">
            <div className="flex items-center gap-2 mb-4">
              <Server className="w-5 h-5 text-ghost-violet" />
              <h2 className="text-xl font-semibold">Ollama AI Settings</h2>
            </div>
            {aiStatus ? (
              <div className="space-y-2 text-sm">
                <p className="text-gray-300">Base URL: {aiStatus.ollama_url}</p>
                <p className="text-gray-300">Model: {aiStatus.model}</p>
              </div>
            ) : (
              <p className="text-gray-400">Loading...</p>
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
