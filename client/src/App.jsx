import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Landing } from './pages/Landing'
import { Scan } from './pages/Scan'
import { Login } from './pages/Login'
import { OAuthCallback } from './pages/OAuthCallback'
import { Onboarding } from './pages/Onboarding'
import { Dashboard } from './pages/Dashboard'
import { History } from './pages/History'
import { Compare } from './pages/Compare'
import { Profile } from './pages/Profile'
import { Settings } from './pages/Settings'
import { Privacy } from './pages/Privacy'
import { Terms } from './pages/Terms'
import { ScanDetail } from './pages/ScanDetail'

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/scan" element={<Scan />} />
        <Route path="/login" element={<Login />} />
        <Route path="/auth/callback" element={<OAuthCallback />} />
        <Route path="/compare" element={<Compare />} />
        <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
        <Route path="/history/:id" element={<ProtectedRoute><ScanDetail /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
      </Routes>
    </AuthProvider>
  )
}
