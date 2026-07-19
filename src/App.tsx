import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'

import { AuthProvider, useAuth } from '@/hooks/use-auth'
import { StoreProvider } from '@/hooks/use-store'

import Layout from './components/Layout'
import Login from './pages/auth/Login'
import Dashboard from './pages/Dashboard'
import Reception from './pages/Reception'
import Warranties from './pages/Warranties'
import Claims from './pages/Claims'
import Settings from './pages/Settings'
import NotFound from './pages/NotFound'

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuth()
  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">Cargando...</div>
    )
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <>{children}</>
}

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <StoreProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Routes>
            <Route path="/login" element={<Login />} />

            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="reception" element={<Reception />} />
              <Route path="warranties" element={<Warranties />} />
              <Route path="claims" element={<Claims />} />
              <Route path="settings" element={<Settings />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </TooltipProvider>
      </StoreProvider>
    </AuthProvider>
  </BrowserRouter>
)

export default App
