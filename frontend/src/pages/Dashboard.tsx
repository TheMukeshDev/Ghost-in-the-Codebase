import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  AlertCircle,
  BookOpen,
  FileText,
  Ghost,
  Home,
  Loader2,
  MessageSquare,
  Network,
  Settings as SettingsIcon,
  Trash2,
  Upload,
} from 'lucide-react'
import api from '../api/client'
import { getErrorMessage } from '../lib/errors'
import { asArray, asNumber, asRecord, asString, asStringMap } from '../lib/safe'

type TreeEntry = { path: string; name?: string; type?: string; size?: number }
type Repository = { id: string; name?: string; created_at?: string }
type Answer = { answer: string; source: string; model: string | null }
type ReportData = {
  overview: Record<string, unknown>
  languages: Record<string, number>
  ghost_story: Record<string, unknown>
  analysis_type: string
}
type GhostStoryKey = 'awakening' | 'haunted_halls' | 'spirits' | 'hidden_passageways' | 'exorcism_plan'

const EMPTY_STORY: Record<GhostStoryKey, string> = {
  awakening: 'No story is available for this repository yet.',
  haunted_halls: 'The analysis did not return any structural details.',
  spirits: 'No key components were reported.',
  hidden_passageways: 'No complex areas were reported.',
  exorcism_plan: 'Try reloading the report or re-importing the repository.',
}

const STORY_SECTIONS: { key: GhostStoryKey; title: string }[] = [
  { key: 'awakening', title: 'The Awakening' },
  { key: 'haunted_halls', title: 'The Haunted Halls' },
  { key: 'spirits', title: 'The Spirits' },
  { key: 'hidden_passageways', title: 'The Hidden Passageways' },
  { key: 'exorcism_plan', title: 'The Exorcism Plan' },
]

export default function Dashboard() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [repo, setRepo] = useState<Repository | null>(null)
  const [tree, setTree] = useState<TreeEntry[]>([])
  const [report, setReport] = useState<ReportData | null>(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState<Answer | null>(null)
  const [asking, setAsking] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notFound, setNotFound] = useState(false)
  const [actionError, setActionError] = useState('')

  const loadData = useCallback(async () => {
    if (!id) {
      setNotFound(true)
      setLoading(false)
      return
    }

    setLoading(true)
    setError('')
    setActionError('')
    setNotFound(false)

    try {
      const reposResp = await api.get('/repositories')
      const repositories = asArray<Repository>(asRecord(reposResp.data).repositories)
      const found = repositories.find((item) => item && item.id === id) ?? null

      if (!found) {
        setRepo(null)
        setNotFound(true)
        return
      }
      setRepo(found)

      const encodedId = encodeURIComponent(id)
      const [treeResult, reportResult] = await Promise.allSettled([
        api.get(`/repositories/${encodedId}/tree`),
        api.get(`/repositories/${encodedId}/report`),
      ])

      if (treeResult.status === 'fulfilled') {
        const entries = asArray<TreeEntry>(asRecord(treeResult.value.data).tree)
        setTree(entries.filter((entry) => entry && typeof entry.path === 'string'))
      } else {
        setTree([])
        setActionError(getErrorMessage(treeResult.reason, 'Could not load the file tree.'))
      }

      if (reportResult.status === 'fulfilled') {
        const raw = asRecord(reportResult.value.data)
        setReport({
          overview: asRecord(raw.overview),
          languages: asStringMap(raw.languages),
          ghost_story: asRecord(raw.ghost_story),
          analysis_type: asString(raw.analysis_type, 'deterministic'),
        })
      } else {
        setReport(null)
        const message = getErrorMessage(reportResult.reason, 'Could not load the report.')
        setActionError((previous) => previous || message)
      }
    } catch (err) {
      setError(getErrorMessage(err, 'Could not load this repository.'))
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    void loadData()
  }, [loadData])

  const askQuestion = async () => {
    const trimmed = question.trim()
    if (!trimmed) {
      setActionError('Type a question first.')
      return
    }
    if (!id || asking) return

    setAsking(true)
    setActionError('')
    try {
      const resp = await api.post(`/repositories/${encodeURIComponent(id)}/ask`, {
        question: trimmed,
      })
      const data = asRecord(resp.data)
      setAnswer({
        answer: asString(data.answer, 'No answer returned.'),
        source: asString(data.source, 'unknown'),
        model: typeof data.model === 'string' ? data.model : null,
      })
    } catch (err) {
      setAnswer(null)
      setActionError(getErrorMessage(err, 'Could not ask the ghost.'))
    } finally {
      setAsking(false)
    }
  }

  const deleteRepo = async () => {
    if (!id) return
    if (!window.confirm('Delete this repository? This cannot be undone.')) return

    setActionError('')
    try {
      await api.delete(`/repositories/${encodeURIComponent(id)}`)
      navigate('/')
    } catch (err) {
      setActionError(getErrorMessage(err, 'Could not delete this repository.'))
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 px-4">
        <Loader2 className="w-8 h-8 animate-spin text-ghost-cyan" />
        <p className="text-gray-400">Loading repository…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div role="alert" className="max-w-md w-full bg-ghost-midnight border border-red-500/40 rounded-lg p-8 text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Could not load repository</h1>
          <p className="text-gray-400 mb-6">{error}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              type="button"
              onClick={() => void loadData()}
              className="bg-gradient-to-r from-ghost-cyan to-ghost-violet text-black px-5 py-2 rounded font-semibold hover:opacity-90"
            >
              Try Again
            </button>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="border border-gray-600 px-5 py-2 rounded font-semibold text-gray-200 hover:border-ghost-cyan hover:text-ghost-cyan"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <Ghost className="w-16 h-16 text-ghost-cyan mx-auto mb-4 animate-glow" />
          <h1 className="text-2xl font-bold mb-2">Repository not found</h1>
          <p className="text-gray-400 mb-6">
            This repository may have been deleted, or the import did not finish.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              type="button"
              onClick={() => navigate('/import')}
              className="bg-gradient-to-r from-ghost-cyan to-ghost-violet text-black px-5 py-2 rounded font-semibold hover:opacity-90"
            >
              Import Repository
            </button>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="border border-gray-600 px-5 py-2 rounded font-semibold text-gray-200 hover:border-ghost-cyan hover:text-ghost-cyan"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    )
  }

  const overview = asRecord(report?.overview)
  const story = asRecord(report?.ghost_story)
  const storyText = (key: GhostStoryKey) => asString(story[key], EMPTY_STORY[key])
  const languages = report?.languages ?? {}
  const fileCount = asNumber(overview.file_count, tree.length)
  const hasReadme = overview.has_readme === true
  const readmePreview = asString(overview.readme_preview)
  const languageSummary =
    Object.entries(languages)
      .map(([extension, count]) => `${extension} (${count})`)
      .join(', ') || 'None detected'

  return (
    <div className="min-h-screen bg-ghost-bg">
      <header className="border-b border-gray-800 bg-ghost-midnight px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => navigate('/')}
              aria-label="Home"
              className="text-gray-400 hover:text-ghost-cyan"
            >
              <Home className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold text-ghost-cyan">Ghost in the Codebase</h1>
            <span className="text-gray-400 truncate">| {repo?.name ?? 'Repository'}</span>
          </div>
          <div className="flex items-center gap-4 shrink-0">
            <button
              type="button"
              onClick={() => navigate('/import')}
              aria-label="Import another repository"
              className="text-gray-400 hover:text-ghost-cyan"
            >
              <Upload className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => navigate('/settings')}
              aria-label="Settings"
              className="text-gray-400 hover:text-ghost-cyan"
            >
              <SettingsIcon className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => void deleteRepo()}
              aria-label="Delete repository"
              className="text-gray-400 hover:text-red-400"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        <aside className="w-64 border-r border-gray-800 bg-ghost-midnight h-[calc(100vh-73px)] overflow-y-auto">
          <nav className="p-4 space-y-2">
            <button
              type="button"
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded ${activeTab === 'overview' ? 'bg-ghost-cyan/10 text-ghost-cyan' : 'text-gray-400 hover:text-ghost-cyan'}`}
            >
              <FileText className="w-4 h-4" /> Overview
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('files')}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded ${activeTab === 'files' ? 'bg-ghost-cyan/10 text-ghost-cyan' : 'text-gray-400 hover:text-ghost-cyan'}`}
            >
              <FileText className="w-4 h-4" /> Files ({tree.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('ghost-story')}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded ${activeTab === 'ghost-story' ? 'bg-ghost-cyan/10 text-ghost-cyan' : 'text-gray-400 hover:text-ghost-cyan'}`}
            >
              <BookOpen className="w-4 h-4" /> Ghost Story
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('ask')}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded ${activeTab === 'ask' ? 'bg-ghost-cyan/10 text-ghost-cyan' : 'text-gray-400 hover:text-ghost-cyan'}`}
            >
              <MessageSquare className="w-4 h-4" /> Ask the Ghost
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('dependencies')}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded ${activeTab === 'dependencies' ? 'bg-ghost-cyan/10 text-ghost-cyan' : 'text-gray-400 hover:text-ghost-cyan'}`}
            >
              <Network className="w-4 h-4" /> Dependencies
            </button>
          </nav>
        </aside>

        <main className="flex-1 p-6 h-[calc(100vh-73px)] overflow-y-auto">
          {actionError && (
            <div
              role="alert"
              className="mb-4 flex items-start justify-between gap-3 rounded border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-200"
            >
              <span className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {actionError}
              </span>
              <button
                type="button"
                onClick={() => setActionError('')}
                className="text-amber-200 hover:text-white"
              >
                Dismiss
              </button>
            </div>
          )}

          {activeTab === 'overview' && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Repository Overview</h2>
              {report ? (
                <div className="bg-ghost-midnight p-4 rounded border border-gray-800 space-y-2">
                  <p className="text-gray-300">Files: {fileCount}</p>
                  <p className="text-gray-300">Languages: {languageSummary}</p>
                  <p className="text-gray-300">Has README: {hasReadme ? 'Yes' : 'No'}</p>
                  {readmePreview && (
                    <details className="pt-2">
                      <summary className="cursor-pointer text-ghost-cyan text-sm">README preview</summary>
                      <pre className="mt-2 whitespace-pre-wrap text-xs text-gray-400">{readmePreview}</pre>
                    </details>
                  )}
                </div>
              ) : (
                <div className="bg-ghost-midnight p-4 rounded border border-gray-800">
                  <p className="text-gray-400 mb-3">No report is available for this repository.</p>
                  <button
                    type="button"
                    onClick={() => void loadData()}
                    className="text-ghost-cyan hover:underline"
                  >
                    Retry
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'files' && (
            <div>
              <h2 className="text-2xl font-bold mb-4">File Explorer</h2>
              <div className="bg-ghost-midnight p-4 rounded border border-gray-800 max-h-[600px] overflow-y-auto">
                {tree.length === 0 ? (
                  <p className="text-gray-500 text-sm">No files were indexed for this repository.</p>
                ) : (
                  <>
                    {tree.slice(0, 100).map((entry) => (
                      <div key={entry.path} className="py-1 text-sm text-gray-300 break-all">
                        {entry.path}
                      </div>
                    ))}
                    {tree.length > 100 && (
                      <div className="text-gray-500 text-sm">... and {tree.length - 100} more files</div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {activeTab === 'ghost-story' && (
            <div>
              <h2 className="text-2xl font-bold mb-4 text-ghost-violet">The Ghost Story</h2>
              <div className="space-y-4">
                {STORY_SECTIONS.map(({ key, title }) => (
                  <div key={key} className="bg-ghost-midnight p-4 rounded border border-ghost-violet/30">
                    <h3 className="text-lg font-semibold text-ghost-cyan mb-2">{title}</h3>
                    <p className="text-gray-300">{storyText(key)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'ask' && (
            <div>
              <h2 className="text-2xl font-bold mb-4 text-ghost-green">Ask the Ghost</h2>
              <div className="bg-ghost-midnight p-4 rounded border border-gray-800 mb-4">
                <input
                  type="text"
                  value={question}
                  onChange={(event) => setQuestion(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') void askQuestion()
                  }}
                  placeholder="Ask about this codebase... (e.g., What does this project do?)"
                  maxLength={500}
                  className="w-full bg-ghost-bg border border-gray-700 rounded px-4 py-2 mb-2 focus:border-ghost-green focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => void askQuestion()}
                  disabled={asking || !question.trim()}
                  className="bg-ghost-green text-black px-4 py-2 rounded font-semibold hover:opacity-90 disabled:opacity-50"
                >
                  {asking ? 'Asking...' : 'Ask'}
                </button>
              </div>
              {answer && (
                <div className="bg-ghost-midnight p-4 rounded border border-ghost-green/30">
                  <div className="flex items-center gap-2 mb-2 text-sm text-gray-400">
                    <span>Source: {answer.source}</span>
                    {answer.model && <span>| Model: {answer.model}</span>}
                  </div>
                  <p className="text-gray-300 whitespace-pre-wrap">{answer.answer}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'dependencies' && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Dependencies</h2>
              <div className="bg-ghost-midnight p-4 rounded border border-gray-800">
                <p className="text-gray-400">Dependency manifest analysis coming soon</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
