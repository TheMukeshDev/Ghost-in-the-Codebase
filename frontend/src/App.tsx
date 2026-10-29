import { Navigate, Route, Routes, useLocation, useParams } from 'react-router-dom'
import ErrorBoundary from './components/ErrorBoundary'
import Dashboard from './pages/Dashboard'
import Import from './pages/Import'
import Landing from './pages/Landing'
import NotFound from './pages/NotFound'
import Settings from './pages/Settings'

function DashboardRedirect() {
  const { id } = useParams<{ id: string }>()
  if (!id) return <Navigate to="/" replace />
  return <Navigate to={`/dashboard/${encodeURIComponent(id)}`} replace />
}

function App() {
  const location = useLocation()

  return (
    <div className="min-h-screen bg-ghost-bg">
      <ErrorBoundary key={location.pathname}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route
            path="/import"
            element={
              <ErrorBoundary
                title="Import failed"
                description="The import screen hit an unexpected error. Try again or go home."
              >
                <Import />
              </ErrorBoundary>
            }
          />
          <Route path="/dashboard" element={<Navigate to="/" replace />} />
          <Route
            path="/dashboard/:id"
            element={
              <ErrorBoundary
                title="Dashboard failed"
                description="We could not render this repository. Try again or go home."
              >
                <Dashboard />
              </ErrorBoundary>
            }
          />
          <Route path="/analysis/:id" element={<DashboardRedirect />} />
          <Route path="/chat/:id" element={<DashboardRedirect />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </ErrorBoundary>
    </div>
  )
}

export default App
