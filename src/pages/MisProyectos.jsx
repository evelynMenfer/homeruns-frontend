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

export default function MisProyectos() {
  const { usuario } = useAuth()
  const navigate = useNavigate()
  const [proyectos, setProyectos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [mostrarForm, setMostrarForm] = useState(false)
  const { toast, mostrar, cerrar } = useToast()

  useEffect(() => {
    cargarMisProyectos()
  }, [])

  const cargarMisProyectos = async () => {
    try {
      const res = await api.get('/proyectos')
      const misProyectos = res.data.data?.filter(
        p => p.creado_por?.id_usuario === usuario?.id_usuario
      ) || []
      setProyectos(misProyectos)
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
      cargarMisProyectos()
      mostrar('Proyecto eliminado correctamente')
    } catch (err) {
      mostrar('Error al eliminar el proyecto', 'error')
    }
  }

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Mis Proyectos</h2>
        <button
          onClick={() => setMostrarForm(true)}
          className="bg-[#D94218] hover:bg-[#B83510] text-white px-4 py-2 rounded-lg text-sm transition">
          + Nuevo proyecto
        </button>
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        {cargando ? (
          <p className="p-6 text-gray-400">Cargando...</p>
        ) : proyectos.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-5xl mb-4">📋</div>
            <p className="text-gray-500 font-medium">No tienes proyectos registrados</p>
            <p className="text-gray-400 text-sm mt-1">Haz clic en "+ Nuevo proyecto" para comenzar</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-6 py-3 text-gray-600 font-medium">Nombre</th>
                <th className="text-left px-6 py-3 text-gray-600 font-medium">Monto solicitado</th>
                <th className="text-left px-6 py-3 text-gray-600 font-medium">Estado</th>
                <th className="text-left px-6 py-3 text-gray-600 font-medium">Fecha inicio</th>
                <th className="text-left px-6 py-3 text-gray-600 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {proyectos.map(p => (
                <tr key={p.id_proyecto} className="hover:bg-gray-50">
                  <td className="px-6 py-3 font-medium text-gray-800">{p.nombre_proyecto}</td>
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
                    <div className="flex gap-3">
                      <button
                        onClick={() => navigate(`/proyectos/${p.id_proyecto}`)}
                        className="text-[#D94218] hover:text-blue-800 text-xs font-medium">
                        Ver estado
                      </button>
                      <button
                        onClick={() => handleEliminar(p.id_proyecto)}
                        className="text-red-500 hover:text-red-700 text-xs font-medium">
                        Eliminar
                      </button>
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
        onGuardado={() => { setMostrarForm(false); cargarMisProyectos(); mostrar('Proyecto registrado correctamente') }}
          onCancelar={() => setMostrarForm(false)}
        />
      )}
      {toast && <Toast mensaje={toast.mensaje} tipo={toast.tipo} onCerrar={cerrar} />}
    </Layout>
  )
}