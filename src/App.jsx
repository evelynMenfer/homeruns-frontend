import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Organizaciones from './pages/Organizaciones'
import Proyectos from './pages/Proyectos'

function RutaProtegida({ children }) {
  const { token, cargando } = useAuth()
  if (cargando) return <div className="min-h-screen flex items-center justify-center">Cargando...</div>
  return token ? children : <Navigate to="/login" />
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={
            <RutaProtegida><Dashboard /></RutaProtegida>
          } />
          <Route path="/organizaciones" element={
            <RutaProtegida><Organizaciones /></RutaProtegida>
          } />
          <Route path="/proyectos" element={
            <RutaProtegida><Proyectos /></RutaProtegida>
          } />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App