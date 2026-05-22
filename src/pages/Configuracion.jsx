import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import api from '../api/axios'
import Toast from '../components/Toast'
import useToast from '../hooks/useToast'

export default function Configuracion() {
  const [config, setConfig] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [logo, setLogo] = useState(null)
  const [form, setForm] = useState({
    nombre_programa: '',
    anio_convocatoria: '',
    nombre_organizacion: '',
    fecha_limite: '',
    email_contacto: '',
    texto_bienvenida: '',
    aviso: ''
  })
  const { toast, mostrar, cerrar } = useToast()

  useEffect(() => {
    api.get('/configuracion').then(res => {
      setConfig(res.data)
      setForm({
        nombre_programa: res.data.nombre_programa || '',
        anio_convocatoria: res.data.anio_convocatoria || '',
        nombre_organizacion: res.data.nombre_organizacion || '',
        fecha_limite: res.data.fecha_limite || '',
        email_contacto: res.data.email_contacto || '',
        texto_bienvenida: res.data.texto_bienvenida || '',
        aviso: res.data.aviso || ''
      })
    }).catch(err => {
      console.error(err)
    }).finally(() => {
      setCargando(false)
    })
  }, [])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleGuardar = async () => {
    setGuardando(true)
    try {
      const formData = new FormData()
      Object.keys(form).forEach(key => formData.append(key, form[key]))
      if (logo) formData.append('logo', logo)
      await api.post('/configuracion', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      mostrar('Configuración actualizada correctamente')
      const res = await api.get('/configuracion')
      setConfig(res.data)
    } catch (err) {
      mostrar('Error al guardar la configuración', 'error')
    } finally {
      setGuardando(false)
    }
  }

  const handleEliminarLogo = async () => {
    if (!confirm('¿Eliminar el logo?')) return
    try {
      const formData = new FormData()
      Object.keys(form).forEach(key => formData.append(key, form[key]))
      formData.append('eliminar_logo', '1')
      await api.post('/configuracion', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      const res = await api.get('/configuracion')
      setConfig(res.data)
      setLogo(null)
      mostrar('Logo eliminado correctamente')
    } catch (err) {
      mostrar('Error al eliminar el logo', 'error')
    }
  }

  if (cargando) return <Layout><p className="text-gray-400">Cargando...</p></Layout>

  return (
    <Layout>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Configuración del sistema</h2>
        <button onClick={handleGuardar} disabled={guardando}
          className="px-4 py-2 text-white rounded-lg text-sm transition disabled:opacity-50"
          style={{ background: '#D94218' }}>
          {guardando ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Datos del programa */}
        <div className="bg-white rounded-xl shadow p-6 space-y-4">
          <h3 className="font-semibold text-gray-700 mb-2">Datos del programa</h3>

          <div>
            <label className="block text-xs text-gray-500 mb-1">Nombre del programa</label>
            <input name="nombre_programa" value={form.nombre_programa} onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#D94218]" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Año de convocatoria</label>
            <input name="anio_convocatoria" value={form.anio_convocatoria} onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#D94218]" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Nombre de la organización</label>
            <input name="nombre_organizacion" value={form.nombre_organizacion} onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#D94218]" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Fecha límite de recepción</label>
            <input name="fecha_limite" value={form.fecha_limite} onChange={handleChange}
              placeholder="Ej: 15 de mayo de 2026"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#D94218]" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Email de contacto</label>
            <input name="email_contacto" type="email" value={form.email_contacto} onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#D94218]" />
          </div>

          {/* Logo */}
          <div>
            <label className="block text-xs text-gray-500 mb-1">Logo del programa</label>
            {config?.logo_path && (
              <div className="mb-2 flex items-center gap-3">
                <img src={`http://127.0.0.1:8000/storage/${config.logo_path}`}
                  alt="Logo actual" className="h-16 object-contain border rounded-lg p-1" />
                <button onClick={handleEliminarLogo}
                  className="text-xs text-red-500 hover:text-red-700 border border-red-300 px-2 py-1 rounded-lg">
                  🗑️ Eliminar logo
                </button>
              </div>
            )}
            <input type="file" accept="image/*"
              onChange={e => setLogo(e.target.files[0])}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          </div>
        </div>

        {/* Textos */}
        <div className="bg-white rounded-xl shadow p-6 space-y-4">
          <h3 className="font-semibold text-gray-700 mb-2">Textos de bienvenida</h3>

          <div>
            <label className="block text-xs text-gray-500 mb-1">Texto de bienvenida</label>
            <textarea name="texto_bienvenida" value={form.texto_bienvenida} onChange={handleChange}
              rows={5}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#D94218]" />
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">Aviso / Información adicional</label>
            <textarea name="aviso" value={form.aviso} onChange={handleChange}
              rows={8}
              placeholder="Escribe el aviso con bullets usando • al inicio de cada línea"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#D94218]" />
          </div>

          {/* Vista previa */}
          <div className="border-t pt-4">
            <p className="text-xs text-gray-500 mb-2">Vista previa del aviso:</p>
            <div className="text-sm text-gray-600 whitespace-pre-line bg-gray-50 rounded-lg p-3">
              {form.aviso || '—'}
            </div>
          </div>
        </div>

      </div>

      {toast && <Toast mensaje={toast.mensaje} tipo={toast.tipo} onCerrar={cerrar} />}
    </Layout>
  )
}