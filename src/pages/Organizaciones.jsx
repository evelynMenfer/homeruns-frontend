import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import OrganizacionForm from '../components/OrganizacionForm'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'

export default function Organizaciones() {
  const [organizaciones, setOrganizaciones] = useState([])
  const [cargando, setCargando] = useState(true)
  const [mostrarForm, setMostrarForm] = useState(false)
  const navigate = useNavigate()
  const { esAdmin } = useAuth()

  useEffect(() => {
    cargarOrganizaciones()
  }, [])

  const cargarOrganizaciones = async () => {
    try {
      const res = await api.get('/organizaciones')
      setOrganizaciones(res.data.data)
    } catch (err) {
      console.error(err)
    } finally {
      setCargando(false)
    }
  }

  const handleGuardado = () => {
    setMostrarForm(false)
    cargarOrganizaciones()
  }

  const handleEliminar = async (id) => {
    if (!confirm('¿Estás seguro de eliminar esta organización?')) return
    try {
      await api.delete(`/organizaciones/${id}`)
      cargarOrganizaciones()
    } catch (err) {
      console.error(err)
    }
  }

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

      <div className="bg-white rounded-xl shadow overflow-hidden">
        {cargando ? (
          <p className="p-6 text-gray-400">Cargando...</p>
        ) : organizaciones.length === 0 ? (
          <p className="p-6 text-gray-400">No hay organizaciones registradas.</p>
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
              {organizaciones.map(org => (
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
                  <td className="px-6 py-3">{org.email || '—'}</td>
                  <td className="px-6 py-3">{org.telefono || '—'}</td>
                  <td className="px-6 py-3">{org.participo_antes === 'S' ? 'Sí' : 'No'}</td>
                  <td className="px-6 py-3">
                  <button
                    onClick={() => navigate(`/organizaciones/${org.id_organizacion}`)}
                    className="text-[#D94218] hover:text-blue-800 text-xs font-medium">
                    Ver detalle
                  </button>
                  {esAdmin() && (
                    <button
                      onClick={() => handleEliminar(org.id_organizacion)}
                      className="text-red-400 hover:text-red-600 transition"
                      title="Eliminar organización">
                      🗑️
                    </button>
                  )}
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
    </Layout>
  )
}