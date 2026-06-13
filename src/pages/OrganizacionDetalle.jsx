import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'

export default function OrganizacionDetalle() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [org, setOrg] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [editando, setEditando] = useState(false)
  const [form, setForm] = useState({})
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')
  const [nuevaCarta, setNuevaCarta] = useState(null)
  const { esAdmin } = useAuth()

  useEffect(() => {
    cargarOrganizacion()
  }, [id])

  const cargarOrganizacion = async () => {
    try {
      const res = await api.get(`/organizaciones/${id}`)
      setOrg(res.data)
      setForm({
        rfc: res.data.rfc || '',
        telefono: res.data.telefono || '',
        email: res.data.email || '',
        direccion_fiscal: res.data.direccion_fiscal || '',
        participo_antes: res.data.participo_antes || 'N',
        asociacion_civil: {
          razon_social: res.data.asociacion_civil?.razon_social || '',
          nombre_representante: res.data.asociacion_civil?.nombre_representante || '',
          telefono_representante: res.data.asociacion_civil?.telefono_representante || '',
          email_representante: res.data.asociacion_civil?.email_representante || '',
          pagina_web: res.data.asociacion_civil?.pagina_web || '',
          objeto_social: res.data.asociacion_civil?.objeto_social || '',
          metas_institucionales: res.data.asociacion_civil?.metas_institucionales || '',
          descripcion_general: res.data.asociacion_civil?.descripcion_general || '',
          problematica: res.data.asociacion_civil?.problematica || '',
          num_empleados: res.data.asociacion_civil?.num_empleados || '',
          presupuesto_anual: res.data.asociacion_civil?.presupuesto_anual || '',
          principales_donantes: res.data.asociacion_civil?.principales_donantes || '',
          nombre_contador: res.data.asociacion_civil?.nombre_contador || '',
          telefono_contador: res.data.asociacion_civil?.telefono_contador || '',
          email_contador: res.data.asociacion_civil?.email_contador || '',
        },
        municipio: {
          nombre_municipio: res.data.municipio?.nombre_municipio || '',
          nombre_presidente: res.data.municipio?.nombre_presidente || '',
          telefono_presidente: res.data.municipio?.telefono_presidente || '',
          nombre_sindico: res.data.municipio?.nombre_sindico || '',
          telefono_sindico: res.data.municipio?.telefono_sindico || '',
          periodo_gestion: res.data.municipio?.periodo_gestion || '',
          actividad_economica: res.data.municipio?.actividad_economica || '',
          logros_alcanzados: res.data.municipio?.logros_alcanzados || '',
          nombre_contador: res.data.municipio?.nombre_contador || '',
          telefono_contador: res.data.municipio?.telefono_contador || '',
          email_contador: res.data.municipio?.email_contador || '',
        }
      })
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
    const key = org.tipo_organizacion === 'AC' ? 'asociacion_civil' : 'municipio'
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
        await api.post(`/organizaciones/${id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
      } else {
        await api.put(`/organizaciones/${id}`, form)
      }
      setEditando(false)
      setNuevaCarta(null)
      cargarOrganizacion()
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar')
    } finally {
      setGuardando(false)
    }
  }

  const handleEliminar = async () => {
    if (!confirm('¿Estás segura de eliminar esta organización?')) return
    try {
      await api.delete(`/organizaciones/${id}`)
      navigate('/organizaciones')
    } catch (err) {
      setError('Error al eliminar')
    }
  }

  if (cargando) return <Layout><p className="text-gray-400">Cargando...</p></Layout>
  if (!org) return <Layout><p className="text-gray-400">Organización no encontrada.</p></Layout>

  const esAC = org.tipo_organizacion === 'AC'
  const detalle = esAC ? org.asociacion_civil : org.municipio
  const inputClass = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#D94218]"

  const campo = (label, name, isDetalle = false, type = 'text') => (
    <div key={name}>
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      {editando ? (
        <input name={name} type={type}
          value={isDetalle ? (form[esAC ? 'asociacion_civil' : 'municipio']?.[name] || '') : (form[name] || '')}
          onChange={isDetalle ? handleDetalle : handleChange}
          className={inputClass} />
      ) : (
        <p className="text-sm font-medium">{(isDetalle ? detalle?.[name] : org[name]) || '—'}</p>
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
          className={inputClass} />
      ) : (
        <p className="text-sm font-medium">{(isDetalle ? detalle?.[name] : org[name]) || '—'}</p>
      )}
    </div>
  )

  return (
    <Layout>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/organizaciones')}
            className="text-[#D94218] hover:text-blue-800 text-sm">
            ← Volver
          </button>
          <h2 className="text-2xl font-bold text-gray-800">
            {esAC ? detalle?.razon_social : detalle?.nombre_municipio || `Organización #${id}`}
          </h2>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            esAC ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
          }`}>
            {esAC ? 'Asociación Civil' : 'Municipio'}
          </span>
        </div>
        <div className="flex gap-2">
          {esAdmin() && (
            <button onClick={handleEliminar}
              className="px-4 py-2 border border-red-400 text-red-500 hover:bg-red-50 rounded-lg text-sm transition">
              Eliminar
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Columna izquierda */}
        <div className="bg-white rounded-xl shadow p-6">
          <div className="space-y-4">
          <h3 className="font-semibold text-gray-700 mb-4">Datos generales</h3>
        <>
          
          {org.carta_intencion_ruta ? (
            <a
              href="#"
              onClick={async (e) => {
                e.preventDefault()
                const res = await api.get(`/organizaciones/${id}/carta`)
                window.open(res.data.url, '_blank')
              }}
              className="text-sm font-medium text-[#D94218] hover:underline flex items-center gap-1"
            >
              📄 Ver carta de intención
              <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                org.estatus_carta === 'aprobada' ? 'bg-green-100 text-green-700' :
                org.estatus_carta === 'rechazada' ? 'bg-red-100 text-red-700' :
                'bg-yellow-100 text-yellow-700'
              }`}>
                {org.estatus_carta === 'aprobada' ? '✅ Aprobada' :
                 org.estatus_carta === 'rechazada' ? '❌ Rechazada' : '⏳ Pendiente'}
              </span>
            </a>
          ) : (
            <p className="text-sm text-gray-400">No cargada</p>
          )}

          

          {esAdmin() && (
            <div className="flex gap-2 mt-2">
              <button
                onClick={async () => {
                  await api.post(`/organizaciones/${id}/validar-carta`, {
                    estatus_carta: 'aprobada'
                  })
                  cargarOrganizacion()
                }}
                className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded-lg text-xs transition"
              >
                ✅ Aprobar
              </button>

              <button
                onClick={async () => {
                  await api.post(`/organizaciones/${id}/validar-carta`, {
                    estatus_carta: 'rechazada'
                  })
                  cargarOrganizacion()
                }}
                className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs transition"
              >
                ❌ Rechazar
              </button>
            </div>
          )}
        </>

            {esAC ? (
              <>
                {campo('Razón social', 'razon_social', true)}
                {campo('RFC', 'rfc')}
                {campo('Página web', 'pagina_web', true)}
                {campo('Teléfono', 'telefono')}
                {campo('Correo electrónico', 'email', false, 'email')}
                <div>
                  <p className="text-xs text-gray-500 mb-1">¿Participó antes?</p>
                  {editando ? (
                    <select name="participo_antes" value={form.participo_antes} onChange={handleChange} className={inputClass}>
                      <option value="N">No</option>
                      <option value="S">Sí</option>
                    </select>
                  ) : (
                    <p className="text-sm font-medium">{org.participo_antes === 'S' ? 'Sí' : 'No'}</p>
                  )}
                </div>
                <div className="border-t pt-4">
                  <h4 className="font-medium text-gray-700 mb-3">Representante legal</h4>
                  <div className="space-y-3">
                    {campo('Nombre', 'nombre_representante', true)}
                    {campo('Teléfono', 'telefono_representante', true)}
                    {campo('Correo', 'email_representante', true, 'email')}
                  </div>
                </div>
                <div className="border-t pt-4">
                  <h4 className="font-medium text-gray-700 mb-3">Datos del contador</h4>
                  <div className="space-y-3">
                    {campo('Nombre', 'nombre_contador', true)}
                    {campo('Teléfono', 'telefono_contador', true)}
                    {campo('Correo', 'email_contador', true, 'email')}
                  </div>
                </div>
              </>
            ) : (
              <>
                {campo('Nombre del municipio', 'nombre_municipio', true)}
                {campo('RFC', 'rfc')}
                {campo('Teléfono', 'telefono')}
                {campo('Correo electrónico', 'email', false, 'email')}
                {campoTextarea('Dirección fiscal', 'direccion_fiscal')}
                <div>
                  <p className="text-xs text-gray-500 mb-1">¿Participó antes?</p>
                  {editando ? (
                    <select name="participo_antes" value={form.participo_antes} onChange={handleChange} className={inputClass}>
                      <option value="N">No</option>
                      <option value="S">Sí</option>
                    </select>
                  ) : (
                    <p className="text-sm font-medium">{org.participo_antes === 'S' ? 'Sí' : 'No'}</p>
                  )}
                </div>
                {campo('Periodo de gestión', 'periodo_gestion', true)}
                {campoTextarea('Actividad económica', 'actividad_economica', true)}
                {campoTextarea('Logros alcanzados', 'logros_alcanzados', true)}   
              </>
            )}
          </div>
        </div>

        {/* Columna derecha */}
        <div className="bg-white rounded-xl shadow p-6">
          <div className="space-y-4">
            {esAC ? (
              <>
                {campo('Número de empleados', 'num_empleados', true, 'number')}
                {campo('Presupuesto anual', 'presupuesto_anual', true, 'number')}
                {campoTextarea('Objeto social', 'objeto_social', true)}
                {campoTextarea('Metas institucionales', 'metas_institucionales', true)}
                {campoTextarea('Descripción general', 'descripcion_general', true)}
                {campoTextarea('Principales donantes', 'principales_donantes', true)}
                {campoTextarea('Problemática', 'problematica', true)}
              </>
            ) : (
              <>
                <div className="border-t pt-4">
                    <h4 className="font-medium text-gray-700 mb-3">Presidente municipal</h4>
                    <div className="space-y-3">
                      {campo('Nombre', 'nombre_presidente', true)}
                      {campo('Teléfono', 'telefono_presidente', true)}
                    </div>
                  </div>
                  <div className="border-t pt-4">
                    <h4 className="font-medium text-gray-700 mb-3">Síndico municipal</h4>
                    <div className="space-y-3">
                      {campo('Nombre', 'nombre_sindico', true)}
                      {campo('Teléfono', 'telefono_sindico', true)}
                    </div>
                  </div>
                  <div className="border-t pt-4">
                    <h4 className="font-medium text-gray-700 mb-3">Datos del contador</h4>
                    <div className="space-y-3">
                      {campo('Nombre', 'nombre_contador', true)}
                      {campo('Teléfono', 'telefono_contador', true)}
                      {campo('Correo', 'email_contador', true, 'email')}
                    </div>
                  </div>
                
              </>
            )}
          </div>
        </div>

        {/* Proyectos */}
        <div className="md:col-span-2 bg-white rounded-xl shadow p-6">
          <h3 className="font-semibold text-gray-700 mb-4">Proyectos</h3>
          {org.proyectos?.length === 0 ? (
            <p className="text-gray-400 text-sm">No hay proyectos registrados.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-2 text-gray-600 font-medium">Nombre</th>
                  <th className="text-left px-4 py-2 text-gray-600 font-medium">Estado</th>
                  <th className="text-left px-4 py-2 text-gray-600 font-medium">Monto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {org.proyectos?.map(p => (
                  <tr key={p.id_proyecto} className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => navigate(`/proyectos/${p.id_proyecto}`)}>
                    <td className="px-4 py-2 font-medium">{p.nombre_proyecto}</td>
                    <td className="px-4 py-2">{p.estado_actual}</td>
                    <td className="px-4 py-2">
                      {p.monto_solicitado ? `$${Number(p.monto_solicitado).toLocaleString('es-MX')}` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </Layout>
  )
}