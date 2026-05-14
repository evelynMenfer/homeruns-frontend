import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import OrganizacionForm from '../components/OrganizacionForm'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'

export default function MiOrganizacion() {
  const { usuario } = useAuth()
  const [organizacion, setOrganizacion] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [editando, setEditando] = useState(false)
  const [form, setForm] = useState({})
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')

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
      await api.put(`/organizaciones/${organizacion.id_organizacion}`, form)
      setEditando(false)
      cargarMiOrganizacion()
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar')
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
            className="bg-blue-700 hover:bg-blue-800 text-white px-6 py-3 rounded-lg transition">
            + Registrar organización
          </button>
        </div>
        {mostrarForm && (
          <OrganizacionForm
            onGuardado={() => { setMostrarForm(false); cargarMiOrganizacion() }}
            onCancelar={() => setMostrarForm(false)}
          />
        )}
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
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
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
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
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
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="N">No</option>
          <option value="S">Sí</option>
        </select>
      ) : (
        <p className="text-sm font-medium">{organizacion.participo_antes === 'S' ? 'Sí' : 'No'}</p>
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
              className="px-4 py-2 border border-blue-600 text-blue-600 hover:bg-blue-50 rounded-lg text-sm transition">
              Editar
            </button>
          ) : (
            <>
              <button onClick={() => setEditando(false)}
                className="px-4 py-2 border border-gray-300 text-gray-600 hover:bg-gray-50 rounded-lg text-sm transition">
                Cancelar
              </button>
              <button onClick={handleGuardar} disabled={guardando}
                className="px-4 py-2 bg-blue-700 text-white hover:bg-blue-800 rounded-lg text-sm transition disabled:opacity-50">
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

        {/* Izquierda */}
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="font-semibold text-gray-700 mb-4">
            {esAC ? 'Asociación Civil' : 'Municipio'}
          </h3>
          <div className="space-y-4">
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
                {campoParticipo()}
              </>
            )}
          </div>
        </div>

        {/* Derecha */}
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="font-semibold text-gray-700 mb-4">Datos generales</h3>
          <div className="space-y-4">
            {esAC ? (
              <>
               
                {campoTextarea('Objeto social', 'objeto_social', true)}
                {campoTextarea('Metas institucionales', 'metas_institucionales', true)}
                {campoTextarea('Descripción general de los proyectos y actividades que ejecuta la institución acorde a su objetivo social', 'descripcion_general', true)}
                {campoTextarea('Problemática', 'problematica', true)}
                {campoTexto('Número de empleados', 'num_empleados', true, 'number')}
                {campoTexto('Presupuesto anual', 'presupuesto_anual', true, 'number')}
                {campoTextarea('Principales donantes', 'principales_donantes', true)}
              </>
            ) : (
              <>
                {campoTextarea('Logros alcanzados en su administración', 'logros_alcanzados', true)}
                {campoTexto('Período de gestión administrativa', 'periodo_gestion', true)}
                {campoTextarea('Actividad económica de su municipio', 'actividad_economica', true)}
              </>
            )}
          </div>
        </div>

      </div>
    </Layout>
  )
}