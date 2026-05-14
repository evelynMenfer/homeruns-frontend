import { useState, useEffect } from 'react'
import api from '../api/axios'

export default function ProyectoForm({ onGuardado, onCancelar }) {
  const [organizaciones, setOrganizaciones] = useState([])
  const [categorias, setCategorias] = useState([])
  const [form, setForm] = useState({
    nombre_proyecto: '',
    descripcion: '',
    monto_solicitado: '',
    costo_total: '',
    fecha_inicio: '',
    fecha_termino: '',
    responsable: '',
    clasificacion: 'Primera vez',
    id_organizacion: '',
    id_categoria: '',
    id_ubicacion: ''
  })
  const [ubicacion, setUbicacion] = useState({
    domicilio: '', municipio: '', estado: '', aplicacion: ''
  })
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const cargarCatalogos = async () => {
      try {
        const [orgs, cats] = await Promise.all([
          api.get('/organizaciones'),
          api.get('/categorias')
        ])
        setOrganizaciones(orgs.data.data)
        setCategorias(cats.data)
      } catch (err) {
        console.error(err)
      }
    }
    cargarCatalogos()
  }, [])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleUbicacion = (e) => {
    setUbicacion({ ...ubicacion, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    console.log('Submit ejecutado', form, ubicacion)

    setCargando(true)
    setError('')
    try {
      const resUbicacion = await api.post('/ubicaciones', ubicacion)
      const resProyecto = await api.post('/proyectos', {
        ...form,
        id_ubicacion: resUbicacion.data.id_ubicacion
      })
      console.log('Proyecto guardado:', resProyecto.data)
      onGuardado()
    } catch (err) {
      console.error('Error completo:', err)
      console.error('Response:', err.response)
      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        JSON.stringify(err.response?.data) ||
        'Error al guardar'
      )
    } finally {
      setCargando(false)
    }
  }
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-screen overflow-y-auto">
        <div className="p-6 border-b flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-800">Nuevo Proyecto</h3>
          <button onClick={onCancelar} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>

        {error && (
          <div className="mx-6 mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
        
          {/* Datos generales */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del proyecto *</label>
            <input name="nombre_proyecto" value={form.nombre_proyecto} onChange={handleChange} required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Organización *</label>
              <select name="id_organizacion" value={form.id_organizacion} onChange={handleChange} required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Seleccionar...</option>
                {organizaciones.map(org => (
                  <option key={org.id_organizacion} value={org.id_organizacion}>
                    {org.asociacion_civil?.razon_social || org.municipio?.nombre_municipio || org.rfc || `Org #${org.id_organizacion}`}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoría *</label>
              <select name="id_categoria" value={form.id_categoria} onChange={handleChange} required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Seleccionar...</option>
                {categorias.map(cat => (
                  <option key={cat.id_categoria} value={cat.id_categoria}>
                    {cat.nombre_categoria}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Monto solicitado</label>
              <input name="monto_solicitado" type="number" value={form.monto_solicitado} onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Costo total</label>
              <input name="costo_total" type="number" value={form.costo_total} onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha inicio</label>
              <input name="fecha_inicio" type="date" value={form.fecha_inicio} onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha término</label>
              <input name="fecha_termino" type="date" value={form.fecha_termino} onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Responsable</label>
              <input name="responsable" value={form.responsable} onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Clasificación</label>
              <select name="clasificacion" value={form.clasificacion} onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="Primera vez">Primera vez</option>
                <option value="Continuidad">Continuidad</option>
                <option value="Ejecutado anteriormente">Ejecutado anteriormente</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <textarea name="descripcion" value={form.descripcion} onChange={handleChange} rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          {/* Ubicación */}
          <div className="border-t pt-4">
            <h4 className="font-medium text-gray-700 mb-3">Ubicación del proyecto</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Municipio</label>
                <input name="municipio" value={ubicacion.municipio} onChange={handleUbicacion}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                <input name="estado" value={ubicacion.estado} onChange={handleUbicacion}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Domicilio</label>
                <input name="domicilio" value={ubicacion.domicilio} onChange={handleUbicacion}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button type="button" onClick={onCancelar}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition">
              Cancelar
            </button>
            <button type="submit" disabled={cargando}
              className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-sm transition disabled:opacity-50">
              {cargando ? 'Guardando...' : 'Guardar proyecto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}