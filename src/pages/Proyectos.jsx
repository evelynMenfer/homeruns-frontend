import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import ProyectoForm from '../components/ProyectoForm'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import Toast from '../components/Toast'
import useToast from '../hooks/useToast'

const estadoColor = {
  'En revision': 'bg-yellow-100 text-yellow-700',
  'Aprobado': 'bg-green-100 text-green-700',
  'Rechazado': 'bg-red-100 text-red-700',
  'En ejecucion': 'bg-blue-100 text-blue-700',
  'Finalizado': 'bg-gray-100 text-gray-700',
}

export default function Proyectos() {
  const { esAdmin } = useAuth()
  const navigate = useNavigate()
  const { toast, mostrar, cerrar } = useToast()
  const [proyectos, setProyectos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [busqueda, setBusqueda] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('')
  const [filtroTipo, setFiltroTipo] = useState('')

  useEffect(() => {
    cargarProyectos()
  }, [])

  const cargarProyectos = async () => {
    try {
      const res = await api.get('/proyectos')
      setProyectos(res.data.data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setCargando(false)
    }
  }

  const handleEliminar = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este proyecto?')) return
    try {
      await api.delete(`/proyectos/${id}`)
      cargarProyectos()
      mostrar('Proyecto eliminado correctamente')
    } catch (err) {
      mostrar('Error al eliminar el proyecto', 'error')
    }
  }

  const proyectosFiltrados = proyectos.filter(p => {
    const nombre = p.nombre_proyecto?.toLowerCase() || ''
    const org = (p.organizacion?.asociacion_civil?.razon_social ||
                 p.organizacion?.municipio?.nombre_municipio ||
                 p.organizacion?.rfc || '').toLowerCase()
    const matchBusqueda = nombre.includes(busqueda.toLowerCase()) || org.includes(busqueda.toLowerCase())
    const matchEstado = filtroEstado ? p.estado_actual === filtroEstado : true
    const matchTipo = filtroTipo ? p.organizacion?.tipo_organizacion === filtroTipo : true
    return matchBusqueda && matchEstado && matchTipo
  })

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Proyectos</h2>
        {!esAdmin() && (
          <button
            onClick={() => setMostrarForm(true)}
            className="bg-[#D94218] hover:bg-[#B83510] text-white px-4 py-2 rounded-lg text-sm transition">
            + Nuevo proyecto
          </button>
        )}
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl shadow p-4 mb-4 grid grid-cols-1 md:grid-cols-3 gap-3">
        <input
          type="text"
          placeholder="Buscar por nombre u organización..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#D94218]"
        />
        <select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#D94218]">
          <option value="">Todos los estados</option>
          <option value="En revision">En revisión</option>
          <option value="Aprobado">Aprobado</option>
          <option value="Rechazado">Rechazado</option>
          <option value="En ejecucion">En ejecución</option>
          <option value="Finalizado">Finalizado</option>
        </select>
        <select value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#D94218]">
          <option value="">Todos los tipos</option>
          <option value="AC">Asociación Civil</option>
          <option value="MUNICIPIO">Municipio</option>
        </select>
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        {cargando ? (
          <p className="p-6 text-gray-400">Cargando...</p>
        ) : proyectosFiltrados.length === 0 ? (
          <p className="p-6 text-gray-400">No hay proyectos que coincidan con los filtros.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-6 py-3 text-gray-600 font-medium">Nombre</th>
                <th className="text-left px-6 py-3 text-gray-600 font-medium">Organización</th>
                <th className="text-left px-6 py-3 text-gray-600 font-medium">Monto solicitado</th>
                <th className="text-left px-6 py-3 text-gray-600 font-medium">Estado</th>
                <th className="text-left px-6 py-3 text-gray-600 font-medium">Fecha inicio</th>
                <th className="text-left px-6 py-3 text-gray-600 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {proyectosFiltrados.map(p => (
                <tr key={p.id_proyecto} className="hover:bg-gray-50">
                  <td className="px-6 py-3 font-medium text-gray-800">{p.nombre_proyecto}</td>
                  <td className="px-6 py-3 text-gray-500">
                    {p.organizacion?.asociacion_civil?.razon_social ||
                     p.organizacion?.municipio?.nombre_municipio ||
                     p.organizacion?.rfc || '—'}
                  </td>
                  <td className="px-6 py-3">
                    {p.monto_solicitado
                      ? `$${Number(p.monto_solicitado).toLocaleString('es-MX')}`
                      : '—'}
                  </td>
                  <td className="px-6 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${estadoColor[p.estado_actual]}`}>
                      {p.estado_actual}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-gray-500">{p.fecha_inicio || '—'}</td>
                  <td className="px-6 py-3">
                    <div className="flex gap-3 items-center">
                      <button
                        onClick={() => navigate(`/proyectos/${p.id_proyecto}`)}
                        className="text-[#D94218] hover:text-[#B83510] text-xs font-medium">
                        Ver detalle
                      </button>
                      {esAdmin() && (
                        <button
                          onClick={() => handleEliminar(p.id_proyecto)}
                          className="text-red-400 hover:text-red-600 transition"
                          title="Eliminar proyecto">
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
        <ProyectoForm
          onGuardado={() => { setMostrarForm(false); cargarProyectos(); mostrar('Proyecto registrado correctamente') }}
          onCancelar={() => setMostrarForm(false)}
        />
      )}

      {toast && <Toast mensaje={toast.mensaje} tipo={toast.tipo} onCerrar={cerrar} />}
    </Layout>
  )
}