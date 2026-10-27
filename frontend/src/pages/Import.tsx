import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FolderOpen, AlertCircle } from 'lucide-react'
import api from '../api/client'

export default function Import() {
  const [path, setPath] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleImport = async () => {
    if (!path) {
      setError('Please enter a repository path')
      return
    }
    setLoading(true)
    setError('')
    try {
      const resp = await api.post('/repositories/import', { path })
      navigate(/dashboard/)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Import failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <FolderOpen className="w-12 h-12 text-ghost-cyan mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2">Import Repository</h1>
          <p className="text-gray-400">Select a local repository directory to explore</p>
        </div>
        <div className="bg-ghost-midnight p-6 rounded-lg border border-gray-800">
          <label className="block text-sm mb-2">Repository Path</label>
          <input
            type="text"
            value={path}
            onChange={(e) => setPath(e.target.value)}
            placeholder="e.g., C:\\path\\to\\repo or /path/to/repo"
            className="w-full bg-ghost-bg border border-gray-700 rounded px-4 py-2 mb-4 focus:border-ghost-cyan focus:outline-none"
          />
          <button
            onClick={handleImport}
            disabled={loading}
            className="w-full bg-gradient-to-r from-ghost-cyan to-ghost-violet text-black py-2 rounded font-semibold hover:opacity-90 disabled:opacity-50"
          >
            {loading ? 'Importing...' : 'Import Repository'}
          </button>
          {error && (
            <div className="mt-4 flex items-center gap-2 text-red-400">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}
        </div>
        <div className="mt-6 text-center">
          <button onClick={() => navigate('/')} className="text-gray-400 hover:text-ghost-cyan">
            Back to Home
          </button>
        </div>
      </div>
    </div>
  )
}
