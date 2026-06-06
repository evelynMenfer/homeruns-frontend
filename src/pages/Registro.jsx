import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api/axios'
import Toast from '../components/Toast'
import useToast from '../hooks/useToast'

export default function Registro() {
  const [form, setForm] = useState({
    nombre: '', apellido: '', email: '', password: '', confirmar_password: '', telefono: ''
  })
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)
  const [aceptaTerminos, setAceptaTerminos] = useState(false)
  const navigate = useNavigate()
  const { toast, mostrar, cerrar } = useToast()

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password !== form.confirmar_password) {
      setError('Las contraseñas no coinciden')
      return
    }
    if (!aceptaTerminos) {
      setError('Debes aceptar los términos y condiciones para continuar')
      return
    }
    setCargando(true)
    setError('')
    try {
      const res = await api.post('/registro', {
        nombre: form.nombre,
        apellido: form.apellido,
        email: form.email,
        password: form.password,
        telefono: form.telefono
      })
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('usuario', JSON.stringify(res.data.usuario))
      mostrar('Cuenta creada correctamente. Bienvenido a Home Runs.')
      setTimeout(() => navigate('/mi-organizacion'), 1500)
    } catch (err) {
      setError(err.response?.data?.message || 'Error al registrarse')
      mostrar('Error al crear la cuenta', 'error')
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#F5F5F5' }}>
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4"
            style={{ background: '#D94218' }}>
            HR
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Crear cuenta</h2>
          <p className="text-gray-500 text-sm mt-1">Registra tu organización en Home Runs</p>
        </div>

        {error && (
          <div className="border px-4 py-3 rounded-lg mb-6 text-sm"
            style={{ background: '#FEF2F2', borderColor: '#FECACA', color: '#DC2626' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
              <input name="nombre" value={form.nombre} onChange={handleChange} required
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Apellido</label>
              <input name="apellido" value={form.apellido} onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Correo electrónico *</label>
            <input name="email" type="email" value={form.email} onChange={handleChange} required
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2"
              placeholder="correo@ejemplo.com" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
            <input name="telefono" value={form.telefono} onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña *</label>
            <input name="password" type="password" value={form.password} onChange={handleChange} required
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2"
              placeholder="Mínimo 8 caracteres" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar contraseña *</label>
            <input name="confirmar_password" type="password" value={form.confirmar_password} onChange={handleChange} required
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2" />
          </div>

          {/* Términos y condiciones */}
          <div className="flex items-start gap-3 pt-1">
            <input
              type="checkbox"
              id="terminos"
              checked={aceptaTerminos}
              onChange={(e) => setAceptaTerminos(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-gray-300 cursor-pointer"
              style={{ accentColor: '#D94218' }}
            />
            <label htmlFor="terminos" className="text-sm text-gray-600 cursor-pointer leading-snug">
              He leído y acepto el{' '}
              <a href="https://fahho.mx/aviso-de-privacidad/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium underline"
                style={{ color: '#D94218' }}>
                Aviso de Privacidad
              </a>{' '}
              de la Fundación Alfredo Harp Helú Oaxaca.
            </label>
          </div>

          <button type="submit" disabled={cargando || !aceptaTerminos}
            className="w-full text-white font-semibold py-2.5 rounded-lg transition disabled:opacity-50 mt-2"
            style={{ background: aceptaTerminos ? '#D94218' : '#9CA3AF' }}
            onMouseEnter={e => (!cargando && aceptaTerminos) && (e.target.style.background = '#B83510')}
            onMouseLeave={e => (!cargando && aceptaTerminos) && (e.target.style.background = '#D94218')}>
            {cargando ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="font-medium" style={{ color: '#D94218' }}>
            Iniciar sesión
          </Link>
        </p>
      </div>
      {toast && <Toast mensaje={toast.mensaje} tipo={toast.tipo} onCerrar={cerrar} />}
    </div>
  )
}