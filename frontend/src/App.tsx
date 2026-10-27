import { Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import Import from './pages/Import'
import Dashboard from './pages/Dashboard'
import Settings from './pages/Settings'

function App() {
  return (
    <div className="min-h-screen bg-ghost-bg">
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/import" element={<Import />} />
        <Route path="/dashboard/:id" element={<Dashboard />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </div>
  )
}

export default App
