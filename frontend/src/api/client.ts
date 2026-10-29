import axios from 'axios'

const configuredBaseUrl = import.meta.env.VITE_API_URL?.trim()
const normalizedBaseUrl = configuredBaseUrl
  ? configuredBaseUrl.replace(/\/$/, '').endsWith('/api')
    ? configuredBaseUrl.replace(/\/$/, '')
    : `${configuredBaseUrl.replace(/\/$/, '')}/api`
  : '/api'

const api = axios.create({
  baseURL: normalizedBaseUrl,
  timeout: 90000,
})

export default api
