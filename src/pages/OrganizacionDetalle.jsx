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
        asociacion_civil: res.data.asociacion_civil || {},
        municipio: res.data.municipio || {}
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
      await api.put(`/organizaciones/${id}`, form)
      setEditando(false)
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
          {esAdmin() ? (
            <button onClick={handleEliminar}
              className="px-4 py-2 border border-red-400 text-red-500 hover:bg-red-50 rounded-lg text-sm transition">
              Eliminar
            </button>
          ) : (
            !editando ? (
              <button onClick={() => setEditando(true)}
                className="px-4 py-2 border border-[#D94218] text-[#D94218] hover:bg-orange-50 rounded-lg text-sm transition">
                Editar
              </button>
            ) : (
              <>
                <button onClick={() => setEditando(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-600 hover:bg-gray-50 rounded-lg text-sm transition">
                  Cancelar
                </button>
                <button onClick={handleGuardar} disabled={guardando}
                  className="px-4 py-2 bg-[#D94218] text-white hover:bg-[#B83510] rounded-lg text-sm transition disabled:opacity-50">
                  {guardando ? 'Guardando...' : 'Guardar cambios'}
                </button>
              </>
            )
          )}
        </div>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Datos generales */}
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="font-semibold text-gray-700 mb-4">Datos generales</h3>
          <div className="space-y-4">
            {[
              { label: 'RFC', name: 'rfc' },
              { label: 'Teléfono', name: 'telefono' },
              { label: 'Email', name: 'email', type: 'email' },
            ].map(campo => (
              <div key={campo.name}>
                <p className="text-xs text-gray-500 mb-1">{campo.label}</p>
                {editando ? (
                  <input name={campo.name} type={campo.type || 'text'} value={form[campo.name]} onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#D94218]" />
                ) : (
                  <p className="text-sm font-medium">{org[campo.name] || '—'}</p>
                )}
              </div>
            ))}
            <div>
              <p className="text-xs text-gray-500 mb-1">¿Participó antes?</p>
              {editando ? (
                <select name="participo_antes" value={form.participo_antes} onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#D94218]">
                  <option value="N">No</option>
                  <option value="S">Sí</option>
                </select>
              ) : (
                <p className="text-sm font-medium">{org.participo_antes === 'S' ? 'Sí' : 'No'}</p>
              )}
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Dirección fiscal</p>
              {editando ? (
                <textarea name="direccion_fiscal" value={form.direccion_fiscal} onChange={handleChange} rows={2}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#D94218]" />
              ) : (
                <p className="text-sm font-medium">{org.direccion_fiscal || '—'}</p>
              )}
            </div>
          </div>
        </div>

        {/* Datos específicos */}
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="font-semibold text-gray-700 mb-4">
            {esAC ? 'Datos de Asociación Civil' : 'Datos del Municipio'}
          </h3>
          <div className="space-y-4">
            {esAC ? (
              <>
                {[
                  { label: 'Razón social', name: 'razon_social' },
                  { label: 'Representante', name: 'nombre_representante' },
                  { label: 'Núm. empleados', name: 'num_empleados', type: 'number' },
                  { label: 'Presupuesto anual', name: 'presupuesto_anual', type: 'number' },
                  { label: 'Principales donantes', name: 'principales_donantes' },
                ].map(campo => (
                  <div key={campo.name}>
                    <p className="text-xs text-gray-500 mb-1">{campo.label}</p>
                    {editando ? (
                      <input name={campo.name} type={campo.type || 'text'}
                        value={form.asociacion_civil?.[campo.name] || ''} onChange={handleDetalle}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#D94218]" />
                    ) : (
                      <p className="text-sm font-medium">{detalle?.[campo.name] || '—'}</p>
                    )}
                  </div>
                ))}
              </>
            ) : (
              <>
                {[
                  { label: 'Nombre municipio', name: 'nombre_municipio' },
                  { label: 'Presidente', name: 'nombre_presidente' },
                  { label: 'Síndico', name: 'nombre_sindicato' },
                  { label: 'Período de gestión', name: 'periodo_gestion' },
                  { label: 'Actividad económica', name: 'actividad_economica' },
                ].map(campo => (
                  <div key={campo.name}>
                    <p className="text-xs text-gray-500 mb-1">{campo.label}</p>
                    {editando ? (
                      <input name={campo.name} value={form.municipio?.[campo.name] || ''} onChange={handleDetalle}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#D94218]" />
                    ) : (
                      <p className="text-sm font-medium">{detalle?.[campo.name] || '—'}</p>
                    )}
                  </div>
                ))}
              </>
            )}
          </div>
        </div>

        {/* Proyectos de la organización */}
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