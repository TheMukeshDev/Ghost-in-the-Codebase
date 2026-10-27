import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { FileText, Network, BookOpen, MessageSquare, GitBranch, Settings as SettingsIcon, Trash2 } from 'lucide-react'
import api from '../api/client'

export default function Dashboard() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [repo, setRepo] = useState<any>(null)
  const [tree, setTree] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState('overview')
  const [report, setReport] = useState<any>(null)
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState<any>(null)
  const [asking, setAsking] = useState(false)

  useEffect(() => {
    loadData()
  }, [id])

  const loadData = async () => {
    try {
      const [reposResp, treeResp, reportResp] = await Promise.all([
        api.get('/repositories'),
        api.get(/repositories//tree),
        api.get(/repositories//report)
      ])
      const r = reposResp.data.repositories.find((x: any) => x.id === id)
      setRepo(r)
      setTree(treeResp.data.tree)
      setReport(reportResp.data)
    } catch (e) {
      console.error(e)
    }
  }

  const askQuestion = async () => {
    if (!question) return
    setAsking(true)
    try {
      const resp = await api.post(/repositories//ask, { question })
      setAnswer(resp.data)
    } catch (e) {
      setAnswer({ answer: 'Error asking question', source: 'error' })
    } finally {
      setAsking(false)
    }
  }

  const deleteRepo = async () => {
    if (confirm('Delete this repository?')) {
      await api.delete(/repositories/)
      navigate('/')
    }
  }

  return (
    <div className="min-h-screen bg-ghost-bg">
      <header className="border-b border-gray-800 bg-ghost-midnight px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-ghost-cyan">Ghost in the Codebase</h1>
            {repo && <span className="text-gray-400">| {repo.name}</span>}
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/settings')} className="text-gray-400 hover:text-ghost-cyan">
              <SettingsIcon className="w-5 h-5" />
            </button>
            <button onClick={deleteRepo} className="text-gray-400 hover:text-red-400">
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        <aside className="w-64 border-r border-gray-800 bg-ghost-midnight h-[calc(100vh-73px)] overflow-y-auto">
          <nav className="p-4 space-y-2">
            <button onClick={() => setActiveTab('overview')} className={w-full flex items-center gap-2 px-3 py-2 rounded }>
              <FileText className="w-4 h-4" /> Overview
            </button>
            <button onClick={() => setActiveTab('files')} className={w-full flex items-center gap-2 px-3 py-2 rounded }>
              <FileText className="w-4 h-4" /> Files ({tree.length})
            </button>
            <button onClick={() => setActiveTab('ghost-story')} className={w-full flex items-center gap-2 px-3 py-2 rounded }>
              <BookOpen className="w-4 h-4" /> Ghost Story
            </button>
            <button onClick={() => setActiveTab('ask')} className={w-full flex items-center gap-2 px-3 py-2 rounded }>
              <MessageSquare className="w-4 h-4" /> Ask the Ghost
            </button>
            <button onClick={() => setActiveTab('dependencies')} className={w-full flex items-center gap-2 px-3 py-2 rounded }>
              <Network className="w-4 h-4" /> Dependencies
            </button>
          </nav>
        </aside>

        <main className="flex-1 p-6 h-[calc(100vh-73px)] overflow-y-auto">
          {activeTab === 'overview' && report && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Repository Overview</h2>
              <div className="bg-ghost-midnight p-4 rounded border border-gray-800 mb-4">
                <p className="text-gray-300">Files: {report.overview.file_count}</p>
                <p className="text-gray-300">Languages: {JSON.stringify(report.languages)}</p>
                <p className="text-gray-300">Has README: {report.overview.has_readme ? 'Yes' : 'No'}</p>
              </div>
            </div>
          )}

          {activeTab === 'files' && (
            <div>
              <h2 className="text-2xl font-bold mb-4">File Explorer</h2>
              <div className="bg-ghost-midnight p-4 rounded border border-gray-800 max-h-[600px] overflow-y-auto">
                {tree.slice(0, 100).map((f, i) => (
                  <div key={i} className="py-1 text-sm text-gray-300">{f.path}</div>
                ))}
                {tree.length > 100 && <div className="text-gray-500 text-sm">... and {tree.length - 100} more files</div>}
              </div>
            </div>
          )}

          {activeTab === 'ghost-story' && report && (
            <div>
              <h2 className="text-2xl font-bold mb-4 text-ghost-violet">The Ghost Story</h2>
              <div className="space-y-4">
                <div className="bg-ghost-midnight p-4 rounded border border-ghost-violet/30">
                  <h3 className="text-lg font-semibold text-ghost-cyan mb-2">The Awakening</h3>
                  <p className="text-gray-300">{report.ghost_story.awakening}</p>
                </div>
                <div className="bg-ghost-midnight p-4 rounded border border-ghost-violet/30">
                  <h3 className="text-lg font-semibold text-ghost-cyan mb-2">The Haunted Halls</h3>
                  <p className="text-gray-300">{report.ghost_story.haunted_halls}</p>
                </div>
                <div className="bg-ghost-midnight p-4 rounded border border-ghost-violet/30">
                  <h3 className="text-lg font-semibold text-ghost-cyan mb-2">The Spirits</h3>
                  <p className="text-gray-300">{report.ghost_story.spirits}</p>
                </div>
                <div className="bg-ghost-midnight p-4 rounded border border-ghost-violet/30">
                  <h3 className="text-lg font-semibold text-ghost-cyan mb-2">The Hidden Passageways</h3>
                  <p className="text-gray-300">{report.ghost_story.hidden_passageways}</p>
                </div>
                <div className="bg-ghost-midnight p-4 rounded border border-ghost-violet/30">
                  <h3 className="text-lg font-semibold text-ghost-cyan mb-2">The Exorcism Plan</h3>
                  <p className="text-gray-300">{report.ghost_story.exorcism_plan}</p>
                </div>
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
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && askQuestion()}
                  placeholder="Ask about this codebase... (e.g., What does this project do?)"
                  className="w-full bg-ghost-bg border border-gray-700 rounded px-4 py-2 mb-2 focus:border-ghost-green focus:outline-none"
                />
                <button onClick={askQuestion} disabled={asking} className="bg-ghost-green text-black px-4 py-2 rounded font-semibold hover:opacity-90 disabled:opacity-50">
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
