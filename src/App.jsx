import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Registro from './pages/Registro'
import Dashboard from './pages/Dashboard'
import DashboardOrganizacion from './pages/DashboardOrganizacion'
import Organizaciones from './pages/Organizaciones'
import OrganizacionDetalle from './pages/OrganizacionDetalle'
import Proyectos from './pages/Proyectos'
import ProyectoDetalle from './pages/ProyectoDetalle'
import MiOrganizacion from './pages/MiOrganizacion'
import MisProyectos from './pages/MisProyectos'
import Reportes from './pages/Reportes'
import Usuarios from './pages/Usuarios'
import Categorias from './pages/Categorias'

function RutaProtegida({ children }) {
  const { token, cargando } = useAuth()
  if (cargando) return <div className="min-h-screen flex items-center justify-center">Cargando...</div>
  return token ? children : <Navigate to="/login" />
}

function RedireccionInicio() {
  const { token, esAdmin, cargando } = useAuth()
  if (cargando) return <div className="min-h-screen flex items-center justify-center">Cargando...</div>
  if (!token) return <Navigate to="/login" />
  return esAdmin() ? <Navigate to="/dashboard" /> : <Navigate to="/inicio" />
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />
          <Route path="/" element={<RedireccionInicio />} />

          {/* Admin */}
          <Route path="/dashboard" element={
            <RutaProtegida><Dashboard /></RutaProtegida>
          } />
          <Route path="/organizaciones" element={
            <RutaProtegida><Organizaciones /></RutaProtegida>
          } />
          <Route path="/organizaciones/:id" element={
            <RutaProtegida><OrganizacionDetalle /></RutaProtegida>
          } />
          <Route path="/proyectos" element={
            <RutaProtegida><Proyectos /></RutaProtegida>
          } />
          <Route path="/proyectos/:id" element={
            <RutaProtegida><ProyectoDetalle /></RutaProtegida>
          } />

          {/* Organización */}
          <Route path="/mi-organizacion" element={
            <RutaProtegida><MiOrganizacion /></RutaProtegida>
          } />
          <Route path="/mis-proyectos" element={
            <RutaProtegida><MisProyectos /></RutaProtegida>
          } />

          <Route path="/reportes" element={
            <RutaProtegida><Reportes /></RutaProtegida>
          } />

          <Route path="/usuarios" element={
            <RutaProtegida><Usuarios /></RutaProtegida>
          } />

          <Route path="/categorias" element={
            <RutaProtegida><Categorias /></RutaProtegida>
          } />

          <Route path="/inicio" element={
            <RutaProtegida><DashboardOrganizacion /></RutaProtegida>
          } />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App