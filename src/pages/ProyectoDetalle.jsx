import { useAuth } from '../context/AuthContext'
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import api from '../api/axios'

const estadoColor = {
  'En revision': 'bg-yellow-100 text-yellow-700',
  'Aprobado': 'bg-green-100 text-green-700',
  'Rechazado': 'bg-red-100 text-red-700',
  'En ejecucion': 'bg-blue-100 text-blue-700',
  'Finalizado': 'bg-gray-100 text-gray-700',
}

const estados = ['En revision', 'Aprobado', 'Rechazado', 'En ejecucion', 'Finalizado']

export default function ProyectoDetalle() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { esAdmin } = useAuth()
  const [proyecto, setProyecto] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [cambiandoEstado, setCambiandoEstado] = useState(false)
  const [nuevoEstado, setNuevoEstado] = useState('')
  const [comentario, setComentario] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [editando, setEditando] = useState(false)
  const [guardandoEdit, setGuardandoEdit] = useState(false)
  const [formEdit, setFormEdit] = useState({})

  useEffect(() => {
    cargarProyecto()
  }, [id])

  const cargarProyecto = async () => {
    try {
      const res = await api.get(`/proyectos/${id}`)
      setProyecto(res.data)
      setNuevoEstado(res.data.estado_actual)
      setFormEdit({
        nombre_proyecto: res.data.nombre_proyecto || '',
        descripcion: res.data.descripcion || '',
        responsable: res.data.responsable || '',
        monto_solicitado: res.data.monto_solicitado || '',
        costo_total: res.data.costo_total || '',
        fecha_inicio: res.data.fecha_inicio || '',
        fecha_termino: res.data.fecha_termino || '',
        clasificacion: res.data.clasificacion || 'Primera vez',
        municipio: res.data.ubicacion?.municipio || '',
        estado: res.data.ubicacion?.estado || '',
        domicilio: res.data.ubicacion?.domicilio || '',
      })
    } catch (err) {
      console.error(err)
    } finally {
      setCargando(false)
    }
  }

  const handleCambiarEstado = async () => {
    setGuardando(true)
    try {
      await api.patch(`/proyectos/${id}/estado`, {
        estado_actual: nuevoEstado,
        comentario
      })
      setComentario('')
      setCambiandoEstado(false)
      cargarProyecto()
    } catch (err) {
      console.error(err)
    } finally {
      setGuardando(false)
    }
  }

  const handleGuardarEdit = async () => {
    setGuardandoEdit(true)
    try {
      // Actualizar ubicación
      await api.put(`/ubicaciones/${proyecto.id_ubicacion}`, {
        municipio: formEdit.municipio,
        estado: formEdit.estado,
        domicilio: formEdit.domicilio,
      })
      // Actualizar proyecto
      await api.put(`/proyectos/${id}`, {
        nombre_proyecto: formEdit.nombre_proyecto,
        descripcion: formEdit.descripcion,
        responsable: formEdit.responsable,
        monto_solicitado: formEdit.monto_solicitado,
        costo_total: formEdit.costo_total,
        fecha_inicio: formEdit.fecha_inicio,
        fecha_termino: formEdit.fecha_termino,
        clasificacion: formEdit.clasificacion,
      })
      setEditando(false)
      cargarProyecto()
    } catch (err) {
      console.error(err)
    } finally {
      setGuardandoEdit(false)
    }
  }

  const handleChange = (e) => {
    setFormEdit({ ...formEdit, [e.target.name]: e.target.value })
  }

  if (cargando) return <Layout><p className="text-gray-400">Cargando...</p></Layout>
  if (!proyecto) return <Layout><p className="text-gray-400">Proyecto no encontrado.</p></Layout>

  return (
    <Layout>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)}
            className="text-[#D94218] hover:text-blue-800 text-sm">
            ← Volver
          </button>
          <h2 className="text-2xl font-bold text-gray-800">{proyecto.nombre_proyecto}</h2>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${estadoColor[proyecto.estado_actual]}`}>
            {proyecto.estado_actual}
          </span>
        </div>
        {!esAdmin() && (
          <div className="flex gap-2">
            {!editando ? (
              <button onClick={() => setEditando(true)}
                className="px-4 py-2 border border-[#D94218] text-[#D94218] hover:bg-orange-50 rounded-lg text-sm transition">
                Editar
              </button>
            ) : (
              <>
                <button onClick={() => { setEditando(false); cargarProyecto() }}
                  className="px-4 py-2 border border-gray-300 text-gray-600 hover:bg-gray-50 rounded-lg text-sm transition">
                  Cancelar
                </button>
                <button onClick={handleGuardarEdit} disabled={guardandoEdit}
                  className="px-4 py-2 bg-[#D94218] text-white hover:bg-[#B83510] rounded-lg text-sm transition disabled:opacity-50">
                  {guardandoEdit ? 'Guardando...' : 'Guardar cambios'}
                </button>
              </>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Info general */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="font-semibold text-gray-700 mb-4">Información general</h3>
            {editando ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Nombre del proyecto</label>
                  <input name="nombre_proyecto" value={formEdit.nombre_proyecto} onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#D94218]" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Responsable</label>
                    <input name="responsable" value={formEdit.responsable} onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#D94218]" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Clasificación</label>
                    <select name="clasificacion" value={formEdit.clasificacion} onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#D94218]">
                      <option value="Primera vez">Primera vez</option>
                      <option value="Continuidad">Continuidad</option>
                      <option value="Ejecutado anteriormente">Ejecutado anteriormente</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Monto solicitado</label>
                    <input name="monto_solicitado" type="number" value={formEdit.monto_solicitado} onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#D94218]" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Costo total</label>
                    <input name="costo_total" type="number" value={formEdit.costo_total} onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#D94218]" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Fecha inicio</label>
                    <input name="fecha_inicio" type="date" value={formEdit.fecha_inicio} onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#D94218]" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Fecha término</label>
                    <input name="fecha_termino" type="date" value={formEdit.fecha_termino} onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#D94218]" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Descripción</label>
                  <textarea name="descripcion" value={formEdit.descripcion} onChange={handleChange} rows={3}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#D94218]" />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Responsable</p>
                  <p className="font-medium">{proyecto.responsable || '—'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Clasificación</p>
                  <p className="font-medium">{proyecto.clasificacion || '—'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Monto solicitado</p>
                  <p className="font-medium">
                    {proyecto.monto_solicitado
                      ? `$${Number(proyecto.monto_solicitado).toLocaleString('es-MX')}`
                      : '—'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Costo total</p>
                  <p className="font-medium">
                    {proyecto.costo_total
                      ? `$${Number(proyecto.costo_total).toLocaleString('es-MX')}`
                      : '—'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Fecha inicio</p>
                  <p className="font-medium">{proyecto.fecha_inicio || '—'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Fecha término</p>
                  <p className="font-medium">{proyecto.fecha_termino || '—'}</p>
                </div>
                {proyecto.descripcion && (
                  <div className="col-span-2">
                    <p className="text-gray-500">Descripción</p>
                    <p className="mt-1">{proyecto.descripcion}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Historial de estados */}
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="font-semibold text-gray-700 mb-4">Historial de estados</h3>
            {proyecto.historial_estado?.length === 0 ? (
              <p className="text-gray-400 text-sm">Sin historial.</p>
            ) : (
              <div className="space-y-3">
                {proyecto.historial_estado?.map(h => (
                  <div key={h.id_historial} className="flex items-start gap-3 text-sm">
                    <div className="w-2 h-2 rounded-full bg-blue-400 mt-1.5 flex-shrink-0"></div>
                    <div>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${estadoColor[h.estado] || 'bg-gray-100 text-gray-700'}`}>
                        {h.estado}
                      </span>
                      <p className="text-gray-500 mt-0.5">{h.comentario}</p>
                      <p className="text-gray-400 text-xs">{new Date(h.fecha_cambio).toLocaleString('es-MX')}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Panel lateral */}
        <div className="space-y-6">

          {/* Organización */}
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="font-semibold text-gray-700 mb-3">Organización</h3>
            <p className="text-sm font-medium">
              {proyecto.organizacion?.asociacion_civil?.razon_social ||
               proyecto.organizacion?.municipio?.nombre_municipio ||
               proyecto.organizacion?.rfc || '—'}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {proyecto.organizacion?.tipo_organizacion === 'AC' ? 'Asociación Civil' : 'Municipio'}
            </p>
            <p className="text-xs text-gray-500">{proyecto.organizacion?.email}</p>
          </div>

          {/* Cambiar estado - solo admin */}
          {esAdmin() && (
            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="font-semibold text-gray-700 mb-3">Cambiar estado</h3>
              {!cambiandoEstado ? (
                <button onClick={() => setCambiandoEstado(true)}
                  className="w-full border border-[#D94218] text-[#D94218] hover:bg-orange-50 py-2 rounded-lg text-sm transition">
                  Cambiar estado
                </button>
              ) : (
                <div className="space-y-3">
                  <select value={nuevoEstado} onChange={e => setNuevoEstado(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#D94218]">
                    {estados.map(e => (
                      <option key={e} value={e}>{e}</option>
                    ))}
                  </select>
                  <textarea
                    value={comentario}
                    onChange={e => setComentario(e.target.value)}
                    placeholder="Comentario (opcional)"
                    rows={2}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#D94218]"
                  />
                  <div className="flex gap-2">
                    <button onClick={() => setCambiandoEstado(false)}
                      className="flex-1 border border-gray-300 text-gray-600 py-2 rounded-lg text-sm hover:bg-gray-50 transition">
                      Cancelar
                    </button>
                    <button onClick={handleCambiarEstado} disabled={guardando}
                      className="flex-1 bg-[#D94218] text-white py-2 rounded-lg text-sm hover:bg-[#B83510] transition disabled:opacity-50">
                      {guardando ? 'Guardando...' : 'Guardar'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Ubicación */}
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="font-semibold text-gray-700 mb-3">Ubicación</h3>
            {editando ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Municipio</label>
                  <input name="municipio" value={formEdit.municipio} onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#D94218]" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Estado</label>
                  <input name="estado" value={formEdit.estado} onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#D94218]" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Domicilio</label>
                  <input name="domicilio" value={formEdit.domicilio} onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#D94218]" />
                </div>
              </div>
            ) : (
              <>
                <p className="text-sm">{proyecto.ubicacion?.domicilio || '—'}</p>
                <p className="text-sm text-gray-500">{proyecto.ubicacion?.municipio}, {proyecto.ubicacion?.estado}</p>
              </>
            )}
          </div>

        </div>
      </div>
    </Layout>
  )
}