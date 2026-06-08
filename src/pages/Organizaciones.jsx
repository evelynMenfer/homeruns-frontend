import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import OrganizacionForm from '../components/OrganizacionForm'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import Toast from '../components/Toast'
import useToast from '../hooks/useToast'

export default function Organizaciones() {
  const { esAdmin } = useAuth()
  const navigate = useNavigate()
  const [organizaciones, setOrganizaciones] = useState([])
  const [cargando, setCargando] = useState(true)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [busqueda, setBusqueda] = useState('')
  const [filtroTipo, setFiltroTipo] = useState('')
  const [filtroParticipo, setFiltroParticipo] = useState('')
  const { toast, mostrar, cerrar } = useToast()

  useEffect(() => {
    cargarOrganizaciones()
  }, [])

  const cargarOrganizaciones = async () => {
    try {
      const res = await api.get('/organizaciones')
      setOrganizaciones(res.data.data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setCargando(false)
    }
  }

  const handleGuardado = async () => {
    await cargarOrganizaciones()
    mostrar('Organización guardada correctamente')
    setTimeout(() => setMostrarForm(false), 2000)
  }

  const handleEliminar = async (id) => {
    if (!confirm('¿Estás seguro de eliminar esta organización?')) return
    try {
      await api.delete(`/organizaciones/${id}`)
      cargarOrganizaciones()
      mostrar('Organización eliminada')
    } catch (err) {
      mostrar('Error al eliminar la organización', 'error')
    }
  }

  const organizacionesFiltradas = organizaciones.filter(org => {
    const nombre = (org.asociacion_civil?.razon_social ||
                   org.municipio?.nombre_municipio ||
                   org.rfc || '').toLowerCase()
    const matchBusqueda = nombre.includes(busqueda.toLowerCase()) ||
                          (org.email || '').toLowerCase().includes(busqueda.toLowerCase())
    const matchTipo = filtroTipo ? org.tipo_organizacion === filtroTipo : true
    const matchParticipo = filtroParticipo ? org.participo_antes === filtroParticipo : true
    return matchBusqueda && matchTipo && matchParticipo
  })

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Organizaciones</h2>
        {!esAdmin() && (
          <button
            onClick={() => setMostrarForm(true)}
            className="bg-[#D94218] hover:bg-[#B83510] text-white px-4 py-2 rounded-lg text-sm transition">
            + Nueva organización
          </button>
        )}
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl shadow p-4 mb-4 grid grid-cols-1 md:grid-cols-3 gap-3">
        <input
          type="text"
          placeholder="Buscar por nombre, RFC o email..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#D94218]"
        />
        <select value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#D94218]">
          <option value="">Todos los tipos</option>
          <option value="AC">Asociación Civil</option>
          <option value="MUNICIPIO">Municipio</option>
        </select>
        <select value={filtroParticipo} onChange={e => setFiltroParticipo(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#D94218]">
          <option value="">¿Participó antes?</option>
          <option value="S">Sí participó</option>
          <option value="N">No participó</option>
        </select>
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        {cargando ? (
          <p className="p-6 text-gray-400">Cargando...</p>
        ) : organizacionesFiltradas.length === 0 ? (
          <p className="p-6 text-gray-400">No hay organizaciones que coincidan con los filtros.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-6 py-3 text-gray-600 font-medium">Nombre</th>
                <th className="text-left px-6 py-3 text-gray-600 font-medium">Tipo</th>
                <th className="text-left px-6 py-3 text-gray-600 font-medium">Email</th>
                <th className="text-left px-6 py-3 text-gray-600 font-medium">Teléfono</th>
                <th className="text-left px-6 py-3 text-gray-600 font-medium">Participó antes</th>
                <th className="text-left px-6 py-3 text-gray-600 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {organizacionesFiltradas.map(org => (
                <tr key={org.id_organizacion} className="hover:bg-gray-50">
                  <td className="px-6 py-3 font-medium">
                    {org.asociacion_civil?.razon_social || org.municipio?.nombre_municipio || org.rfc || '—'}
                  </td>
                  <td className="px-6 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      org.tipo_organizacion === 'AC'
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {org.tipo_organizacion === 'AC' ? 'Asociación Civil' : 'Municipio'}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-gray-500">{org.email || '—'}</td>
                  <td className="px-6 py-3 text-gray-500">{org.telefono || '—'}</td>
                  <td className="px-6 py-3">{org.participo_antes === 'S' ? 'Sí' : 'No'}</td>
                  <td className="px-6 py-3">
                    <div className="flex gap-3 items-center">
                      <button
                        onClick={() => navigate(`/organizaciones/${org.id_organizacion}`)}
                        className="text-[#D94218] hover:text-[#B83510] text-xs font-medium">
                        Ver detalle
                      </button>
                      {esAdmin() && (
                        <button
                          onClick={() => handleEliminar(org.id_organizacion)}
                          className="text-red-400 hover:text-red-600 transition"
                          title="Eliminar">
                          🗑️
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {mostrarForm && (
        <OrganizacionForm
          onGuardado={handleGuardado}
          onCancelar={() => setMostrarForm(false)}
        />
      )}

      {toast && <Toast mensaje={toast.mensaje} tipo={toast.tipo} onCerrar={cerrar} />}
    </Layout>
  )
}