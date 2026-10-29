import { Component, type ErrorInfo, type ReactNode } from 'react'
import { AlertTriangle, Home, RotateCcw } from 'lucide-react'

interface ErrorBoundaryProps {
  children: ReactNode
  title?: string
  description?: string
  onReset?: () => void
}

interface ErrorBoundaryState {
  error: Error | null
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Unhandled UI error:', error, info.componentStack)
  }

  handleReset = () => {
    this.setState({ error: null })
    this.props.onReset?.()
  }

  render() {
    const { error } = this.state
    if (!error) return this.props.children

    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div
          role="alert"
          className="max-w-md w-full bg-ghost-midnight border border-red-500/40 rounded-lg p-8 text-center"
        >
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">{this.props.title ?? 'Something went wrong'}</h1>
          <p className="text-gray-400 mb-4">
            {this.props.description ?? 'This page hit an unexpected error. Your data is safe.'}
          </p>
          <p className="text-xs text-gray-500 bg-ghost-bg rounded p-3 mb-6 break-words">
            {error.message || 'Unknown error'}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              type="button"
              onClick={this.handleReset}
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-ghost-cyan to-ghost-violet text-black px-5 py-2 rounded font-semibold hover:opacity-90"
            >
              <RotateCcw className="w-4 h-4" /> Try Again
            </button>
            <button
              type="button"
              onClick={() => {
                window.location.href = '/'
              }}
              className="inline-flex items-center justify-center gap-2 border border-gray-600 px-5 py-2 rounded font-semibold text-gray-200 hover:border-ghost-cyan hover:text-ghost-cyan"
            >
              <Home className="w-4 h-4" /> Go Home
            </button>
          </div>
        </div>
      </div>
    )
  }
}
