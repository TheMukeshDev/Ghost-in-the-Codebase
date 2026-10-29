import { useNavigate } from 'react-router-dom'
import { Ghost, Code, Brain } from 'lucide-react'

export default function Landing() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-4xl text-center">
        <div className="flex justify-center mb-6">
          <Ghost className="w-16 h-16 text-ghost-cyan animate-glow" />
        </div>
        <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-ghost-cyan to-ghost-violet bg-clip-text text-transparent">
          Ghost in the Codebase
        </h1>
        <p className="text-xl text-gray-400 mb-2">Every Codebase Has a Story. Some Are Waiting to Be Resurrected.</p>
        <p className="text-lg text-gray-500 mb-8">
          A spooky but genuinely useful local-first AI assistant that explores unfamiliar or abandoned open-source repositories
        </p>
        <div className="flex flex-wrap gap-4 justify-center mb-12">
          <div className="flex items-center gap-2 bg-ghost-midnight px-4 py-2 rounded border border-ghost-cyan/30">
            <Code className="w-5 h-5 text-ghost-cyan" />
            <span>Static Analysis</span>
          </div>
          <div className="flex items-center gap-2 bg-ghost-midnight px-4 py-2 rounded border border-ghost-violet/30">
            <Brain className="w-5 h-5 text-ghost-violet" />
            <span>Local AI with Ollama</span>
          </div>
          <div className="flex items-center gap-2 bg-ghost-midnight px-4 py-2 rounded border border-ghost-green/30">
            <Ghost className="w-5 h-5 text-ghost-green" />
            <span>Privacy-First</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-4 justify-center">
          <button
            onClick={() => navigate('/import')}
            className="bg-gradient-to-r from-ghost-cyan to-ghost-violet text-black px-8 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
          >
            Start Exploring
          </button>
          <button
            onClick={() => navigate('/settings')}
            className="border border-gray-600 px-8 py-3 rounded-lg font-semibold text-gray-200 hover:border-ghost-cyan hover:text-ghost-cyan transition-colors"
          >
            Settings
          </button>
        </div>
      </div>
    </div>
  )
}
