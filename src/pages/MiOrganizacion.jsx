import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import OrganizacionForm from '../components/OrganizacionForm'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import Toast from '../components/Toast'
import useToast from '../hooks/useToast'

export default function MiOrganizacion() {
  const { usuario } = useAuth()
  const [organizacion, setOrganizacion] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [editando, setEditando] = useState(false)
  const [form, setForm] = useState({})
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')
  const [nuevaCarta, setNuevaCarta] = useState(null)
  const { toast, mostrar, cerrar } = useToast()

  useEffect(() => {
    cargarMiOrganizacion()
  }, [])

  const cargarMiOrganizacion = async () => {
    try {
      const res = await api.get('/organizaciones')
      const miOrg = res.data.data?.find(o => o.id_usuario_registro === usuario?.id_usuario)
      setOrganizacion(miOrg || null)
      if (miOrg) {
        setForm({
          rfc: miOrg.rfc || '',
          telefono: miOrg.telefono || '',
          email: miOrg.email || '',
          direccion_fiscal: miOrg.direccion_fiscal || '',
          participo_antes: miOrg.participo_antes || 'N',
          asociacion_civil: miOrg.asociacion_civil || {},
          municipio: miOrg.municipio || {}
        })
      }
    } catch (err) {
      console.error(err)
    } finally {
      setCargando(false)
    }
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleDetalle = (e) => {
    const key = organizacion.tipo_organizacion === 'AC' ? 'asociacion_civil' : 'municipio'
    setForm({ ...form, [key]: { ...form[key], [e.target.name]: e.target.value } })
  }

  const handleGuardar = async () => {
    setGuardando(true)
    setError('')
    try {
      if (nuevaCarta) {
        const formData = new FormData()
        Object.keys(form).forEach(key => {
          if (key !== 'asociacion_civil' && key !== 'municipio') {
            formData.append(key, form[key])
          }
        })
        if (form.asociacion_civil) {
          Object.keys(form.asociacion_civil).forEach(key => {
            formData.append(`asociacion_civil[${key}]`, form.asociacion_civil[key] || '')
          })
        }
        if (form.municipio) {
          Object.keys(form.municipio).forEach(key => {
            formData.append(`municipio[${key}]`, form.municipio[key] || '')
          })
        }
        formData.append('carta_intencion', nuevaCarta)
        formData.append('_method', 'PUT')
        await api.post(`/organizaciones/${organizacion.id_organizacion}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
      } else {
        await api.put(`/organizaciones/${organizacion.id_organizacion}`, form)
      }
      setEditando(false)
      setNuevaCarta(null)
      mostrar('Información actualizada correctamente')
      cargarMiOrganizacion()
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar')
      mostrar('Error al guardar los cambios', 'error')
    } finally {
      setGuardando(false)
    }
  }

  if (cargando) return <Layout><p className="text-gray-400">Cargando...</p></Layout>

  if (!organizacion) {
    return (
      <Layout>
        <div className="max-w-lg mx-auto text-center py-16">
          <div className="text-6xl mb-4">🏢</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Registra tu organización</h2>
          <p className="text-gray-500 mb-6">Aún no tienes una organización registrada.</p>
          <button onClick={() => setMostrarForm(true)}
            className="bg-[#D94218] hover:bg-[#B83510] text-white px-6 py-3 rounded-lg transition">
            + Registrar organización
          </button>
        </div>
        {mostrarForm && (
          <OrganizacionForm
            onGuardado={() => { setMostrarForm(false); cargarMiOrganizacion() }}
            onCancelar={() => setMostrarForm(false)}
          />
        )}
        {toast && <Toast mensaje={toast.mensaje} tipo={toast.tipo} onCerrar={cerrar} />}
      </Layout>
    )
  }

  const esAC = organizacion.tipo_organizacion === 'AC'
  const detalle = esAC ? organizacion.asociacion_civil : organizacion.municipio

  const campoTexto = (label, name, isDetalle = false, type = 'text') => (
    <div key={name}>
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      {editando ? (
        <input name={name} type={type}
          value={isDetalle ? (form[esAC ? 'asociacion_civil' : 'municipio']?.[name] || '') : (form[name] || '')}
          onChange={isDetalle ? handleDetalle : handleChange}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#D94218]" />
      ) : (
        <p className="text-sm font-medium">{(isDetalle ? detalle?.[name] : organizacion[name]) || '—'}</p>
      )}
    </div>
  )

  const campoTextarea = (label, name, isDetalle = false) => (
    <div key={name}>
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      {editando ? (
        <textarea name={name} rows={3}
          value={isDetalle ? (form[esAC ? 'asociacion_civil' : 'municipio']?.[name] || '') : (form[name] || '')}
          onChange={isDetalle ? handleDetalle : handleChange}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#D94218]" />
      ) : (
        <p className="text-sm font-medium">{(isDetalle ? detalle?.[name] : organizacion[name]) || '—'}</p>
      )}
    </div>
  )

  const campoParticipo = () => (
    <div>
      <p className="text-xs text-gray-500 mb-1">¿Participó antes en el programa Home Runs?</p>
      {editando ? (
        <select name="participo_antes" value={form.participo_antes} onChange={handleChange}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#D94218]">
          <option value="N">No</option>
          <option value="S">Sí</option>
        </select>
      ) : (
        <p className="text-sm font-medium">{organizacion.participo_antes === 'S' ? 'Sí' : 'No'}</p>
      )}
    </div>
  )

  const campoCarta = () => (
    <div>
      <p className="text-xs text-gray-500 mb-1">Carta de intención</p>
      {organizacion.carta_intencion_ruta ? (
       <div className="flex items-center gap-3">
          <a
            href="#"
            onClick={async (e) => {
              e.preventDefault()
        
              const res = await api.get(
                `/organizaciones/${organizacion.id_organizacion}/carta`
              )
        
              window.open(res.data.url, '_blank')
            }}
            className="text-sm font-medium text-[#D94218] hover:underline flex items-center gap-1"
          >
            📄 Ver carta de intención
          </a>
        </div>
      ) : (
        <p className="text-sm text-gray-400">No cargada</p>
      )}
      {editando && (
        <div className="mt-2">
          <p className="text-xs text-gray-500 mb-1">Reemplazar carta de intención</p>
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={(e) => setNuevaCarta(e.target.files[0])}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#D94218] file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:font-medium file:bg-[#D94218] file:text-white hover:file:bg-[#B83510] cursor-pointer"
          />
          {nuevaCarta && (
            <p className="text-xs text-green-600 mt-1">✅ {nuevaCarta.name}</p>
          )}
        </div>
      )}
    </div>
  )

  return (
    <Layout>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-gray-800">
            {esAC ? detalle?.razon_social : detalle?.nombre_municipio || 'Mi Organización'}
          </h2>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            esAC ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
          }`}>
            {esAC ? 'Asociación Civil' : 'Municipio'}
          </span>
        </div>
        <div className="flex gap-2">
          {!editando ? (
            <button onClick={() => setEditando(true)}
              className="px-4 py-2 border border-[#D94218] text-[#D94218] hover:bg-orange-50 rounded-lg text-sm transition">
              Editar
            </button>
          ) : (
            <>
              <button onClick={() => { setEditando(false); setNuevaCarta(null) }}
                className="px-4 py-2 border border-gray-300 text-gray-600 hover:bg-gray-50 rounded-lg text-sm transition">
                Cancelar
              </button>
              <button onClick={handleGuardar} disabled={guardando}
                className="px-4 py-2 bg-[#D94218] text-white hover:bg-[#B83510] rounded-lg text-sm transition disabled:opacity-50">
                {guardando ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow p-6">
          <div className="space-y-4">
            {campoCarta()}
            {esAC ? (
              <>
                {campoTexto('Razón social', 'razon_social', true)}
                {campoTexto('RFC', 'rfc')}
                {campoTexto('Representante legal', 'nombre_representante', true)}
                {campoTexto('Teléfono', 'telefono')}
                {campoTexto('Correo electrónico', 'email', false, 'email')}
                {campoParticipo()}
              </>
            ) : (
              <>
                {campoTexto('Nombre del municipio', 'nombre_municipio', true)}
                {campoTexto('RFC', 'rfc')}
                {campoTexto('Nombre del presidente municipal', 'nombre_presidente', true)}
                {campoTexto('Nombre del síndico municipal', 'nombre_sindicato', true)}
                {campoTexto('Teléfono', 'telefono')}
                {campoTexto('Correo electrónico', 'email', false, 'email')}
                {campoTextarea('Dirección fiscal del municipio', 'direccion_fiscal')}
              </>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="font-semibold text-gray-700 mb-4">Datos generales</h3>
          <div className="space-y-4">
            {esAC ? (
              <>
                {campoTextarea('Objeto social', 'objeto_social', true)}
                {campoTextarea('Metas institucionales', 'metas_institucionales', true)}
                {campoTextarea('Descripción general', 'descripcion_general', true)}
                {campoTextarea('Problemática', 'problematica', true)}
                {campoTexto('Número de empleados', 'num_empleados', true, 'number')}
                {campoTexto('Presupuesto anual', 'presupuesto_anual', true, 'number')}
                {campoTextarea('Principales donantes', 'principales_donantes', true)}
              </>
            ) : (
              <>
                {campoParticipo()}
                {campoTextarea('Logros alcanzados', 'logros_alcanzados', true)}
                {campoTexto('Período de gestión', 'periodo_gestion', true)}
                {campoTextarea('Actividad económica', 'actividad_economica', true)}
              </>
            )}
          </div>
        </div>
      </div>

      {toast && <Toast mensaje={toast.mensaje} tipo={toast.tipo} onCerrar={cerrar} />}
    </Layout>
  )
}