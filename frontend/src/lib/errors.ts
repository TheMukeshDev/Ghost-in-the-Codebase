import axios from 'axios'

export function getErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const data: unknown = error.response?.data
    if (data && typeof data === 'object' && 'error' in data) {
      const message = (data as { error?: unknown }).error
      if (typeof message === 'string' && message.trim()) return message
    }
    if (typeof data === 'string') {
      const text = data.trim()
      if (text && !text.startsWith('<')) return text.slice(0, 300)
    }
    if (!error.response) {
      if (error.code === 'ECONNABORTED') {
        return 'The request timed out. The repository may be too large.'
      }
      return 'Cannot reach the analysis backend. Make sure it is running (locally at http://localhost:5000) and try again.'
    }
    if (error.response.status === 413) return 'The upload is too large for the server.'
    if (error.response.status === 404) return 'The repository or endpoint could not be found.'
    return `${fallback} (HTTP ${error.response.status})`
  }
  if (error instanceof Error && error.message.trim()) return error.message
  return fallback
}
