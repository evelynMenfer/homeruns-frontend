import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import ProyectoForm from '../components/ProyectoForm'
import api from '../api/axios'

const estadoColor = {
  'En revision': 'bg-yellow-100 text-yellow-700',
  'Aprobado': 'bg-green-100 text-green-700',
  'Rechazado': 'bg-red-100 text-red-700',
  'En ejecucion': 'bg-blue-100 text-blue-700',
  'Finalizado': 'bg-gray-100 text-gray-700',
}

export default function Proyectos() {
  const [proyectos, setProyectos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [mostrarForm, setMostrarForm] = useState(false)

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

  const handleGuardado = () => {
    setMostrarForm(false)
    cargarProyectos()
  }

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Proyectos</h2>
        <button
          onClick={() => setMostrarForm(true)}
          className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-lg text-sm transition">
          + Nuevo proyecto
        </button>
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        {cargando ? (
          <p className="p-6 text-gray-400">Cargando...</p>
        ) : proyectos.length === 0 ? (
          <p className="p-6 text-gray-400">No hay proyectos registrados.</p>
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
              {proyectos.map(p => (
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
                    <button className="text-blue-600 hover:text-blue-800 text-xs font-medium">
                      Ver detalle
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {mostrarForm && (
        <ProyectoForm
          onGuardado={handleGuardado}
          onCancelar={() => setMostrarForm(false)}
        />
      )}
    </Layout>
  )
}