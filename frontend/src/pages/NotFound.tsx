import { useLocation, useNavigate } from 'react-router-dom'
import { Ghost, Home, Upload } from 'lucide-react'

export default function NotFound() {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <Ghost className="w-16 h-16 text-ghost-cyan mx-auto mb-4 animate-glow" />
        <h1 className="text-3xl font-bold mb-2">This room is empty</h1>
        <p className="text-gray-400 mb-2">No page haunts this address.</p>
        <p className="text-xs text-gray-500 bg-ghost-midnight border border-gray-800 rounded p-3 mb-6 break-all">
          {location.pathname}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-ghost-cyan to-ghost-violet text-black px-5 py-2 rounded font-semibold hover:opacity-90"
          >
            <Home className="w-4 h-4" /> Go Home
          </button>
          <button
            type="button"
            onClick={() => navigate('/import')}
            className="inline-flex items-center justify-center gap-2 border border-gray-600 px-5 py-2 rounded font-semibold text-gray-200 hover:border-ghost-cyan hover:text-ghost-cyan"
          >
            <Upload className="w-4 h-4" /> Import Repository
          </button>
        </div>
      </div>
    </div>
  )
}
