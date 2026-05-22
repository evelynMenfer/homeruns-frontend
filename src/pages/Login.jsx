import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)
  const [config, setConfig] = useState(null)
  const { login } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/configuracion').then(res => setConfig(res.data)).catch(() => {})
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setCargando(true)
    setError('')
    try {
      const data = await login(email, password)
      const roles = data.roles || []
      const esAdminUser = roles.some(r => r.nombre_rol === 'admin')
      navigate(esAdminUser ? '/dashboard' : '/inicio')
    } catch (err) {
      setError('Credenciales incorrectas. Verifica tu email y contraseña.')
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="min-h-screen flex" style={{ background: '#F5F5F5' }}>

      {/* Panel izquierdo */}
      <div className="hidden md:flex w-1/2 flex-col items-center justify-center p-12"
        style={{ background: '#1A1A2E' }}>
        <div className="text-center">
          {config?.logo_path ? (
            <img src={`http://127.0.0.1:8000/storage/${config.logo_path}`}
              alt="Logo" className="w-24 h-24 rounded-full object-contain mx-auto mb-6 bg-white p-2" />
          ) : (
            <div className="w-24 h-24 rounded-full flex items-center justify-center text-white text-4xl font-bold mx-auto mb-6"
              style={{ background: '#D94218' }}>
              HR
            </div>
          )}
          <h1 className="text-4xl font-bold text-white mb-3">
            {config?.nombre_programa || 'Programa Home Runs Banamex'}
          </h1>
          <p className="text-lg mb-2" style={{ color: '#9CA3AF' }}>
            {config?.nombre_organizacion || 'Fundación Alfredo Harp Helú Oaxaca'}
          </p>
          <p className="text-sm" style={{ color: '#6B7280' }}>
            Convocatoria {config?.anio_convocatoria || '2026'}
          </p>
          <div className="mt-10 space-y-3">
            {[
              `Fecha límite de recepción: ${config?.fecha_limite || '15 Mayo 2026'}`,
              `Si tienes dudas escríbenos a: ${config?.email_contacto || 'homeruns@fahho.mx'}`
            ].map(item => (
              <div key={item} className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full" style={{ background: '#D94218' }}></div>
                <p className="text-sm text-gray-400">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Panel derecho */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8">
        <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800">Bienvenido</h2>
            <p className="text-gray-500 text-sm mt-1">Inicia sesión para continuar</p>
          </div>

          {error && (
            <div className="border px-4 py-3 rounded-lg mb-6 text-sm"
              style={{ background: '#FEF2F2', borderColor: '#FECACA', color: '#DC2626' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Correo electrónico
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2"
                placeholder="correo@ejemplo.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={cargando}
              className="w-full text-white font-semibold py-2.5 rounded-lg transition disabled:opacity-50"
              style={{ background: '#D94218' }}
              onMouseEnter={e => !cargando && (e.target.style.background = '#B83510')}
              onMouseLeave={e => !cargando && (e.target.style.background = '#D94218')}>
              {cargando ? 'Iniciando sesión...' : 'Iniciar sesión'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            ¿Eres una organización?{' '}
            <Link to="/registro" className="font-medium" style={{ color: '#D94218' }}>
              Crear cuenta
            </Link>
          </p>
        </div>
      </div>

    </div>
  )
}