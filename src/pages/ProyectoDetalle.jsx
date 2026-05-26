import { useAuth } from '../context/AuthContext'
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import api from '../api/axios'
import Toast from '../components/Toast'
import useToast from '../hooks/useToast'

const estadoColor = {
  'En revision': 'bg-yellow-100 text-yellow-700',
  'Aprobado': 'bg-green-100 text-green-700',
  'Rechazado': 'bg-red-100 text-red-700',
  'En ejecucion': 'bg-blue-100 text-blue-700',
  'Finalizado': 'bg-gray-100 text-gray-700',
}

const estados = ['En revision', 'Aprobado', 'Rechazado', 'En ejecucion', 'Finalizado']

const rangosBenef = [
  { label: '0-12 años', campoM: 'beneficiarios_012m', campoH: 'beneficiarios_012h' },
  { label: '13-29 años', campoM: 'beneficiarios_1329m', campoH: 'beneficiarios_1329h' },
  { label: '30-59 años', campoM: 'beneficiarios_3059m', campoH: 'beneficiarios_3059h' },
  { label: '60-64 años', campoM: 'beneficiarios_6064m', campoH: 'beneficiarios_6064h' },
  { label: '65+ años', campoM: 'beneficiarios_65m', campoH: 'beneficiarios_65h' },
]

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
  const [beneficiarios, setBeneficiarios] = useState({
    beneficiarios_012m: 0, beneficiarios_012h: 0,
    beneficiarios_1329m: 0, beneficiarios_1329h: 0,
    beneficiarios_3059m: 0, beneficiarios_3059h: 0,
    beneficiarios_6064m: 0, beneficiarios_6064h: 0,
    beneficiarios_65m: 0, beneficiarios_65h: 0,
    beneficiarios_indirectos: 0, indicadores: '',
    total_beneficiarios: 0
  })
  const [documentos, setDocumentos] = useState([])
  const [subiendoDoc, setSubiendoDoc] = useState(null)
  const [categorias, setCategorias] = useState([])
  const { toast, mostrar, cerrar } = useToast()

  useEffect(() => {
    cargarProyecto()
    cargarBeneficiarios()
    cargarDocumentos()
    cargarCategorias()
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
        aplicacion: res.data.ubicacion?.aplicacion || '',
        id_categoria: res.data.id_categoria || '',
      })
    } catch (err) {
      console.error(err)
    } finally {
      setCargando(false)
    }
  }

  const cargarBeneficiarios = async () => {
    try {
      const res = await api.get(`/proyectos/${id}/beneficiarios`)
      if (res.data) setBeneficiarios(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  const cargarDocumentos = async () => {
    try {
      const res = await api.get(`/documentos?id_proyecto=${id}`)
      setDocumentos(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  const cargarCategorias = async () => {
    try {
      const res = await api.get(`/categorias?tipo_organizacion=${proyecto?.organizacion?.tipo_organizacion || 'AMBOS'}`)
      setCategorias(res.data || [])
    } catch (err) {
      console.error(err)
    }
  }
  
  const handleSubirDocumento = async (tipoDocumento, archivo) => {
    setSubiendoDoc(tipoDocumento)
    try {
      const formData = new FormData()
      formData.append('id_proyecto', id)
      formData.append('tipo_documento', tipoDocumento)
      formData.append('archivo', archivo)
      await api.post('/documentos', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      cargarDocumentos()
      mostrar('Documento subido correctamente')
    } catch (err) {
      mostrar('Error al subir el documento', 'error')
    } finally {
      setSubiendoDoc(null)
    }
  }
  
  const handleEliminarDocumento = async (idDoc) => {
    if (!confirm('¿Eliminar este documento?')) return
    try {
      await api.delete(`/documentos/${idDoc}`)
      cargarDocumentos()
      mostrar('Documento eliminado')
    } catch (err) {
      mostrar('Error al eliminar el documento', 'error')
    }
  }

  const handleCambiarEstado = async () => {
    setGuardando(true)
    try {
      await api.patch(`/proyectos/${id}/estado`, { estado_actual: nuevoEstado, comentario })
      setComentario('')
      setCambiandoEstado(false)
      cargarProyecto()
      mostrar(`Estado cambiado a: ${nuevoEstado}`)
    } catch (err) {
      mostrar('Error al cambiar el estado', 'error')
    } finally {
      setGuardando(false)
    }
  }

  const handleGuardarEdit = async () => {
    setGuardandoEdit(true)
    try {
      await api.put(`/ubicaciones/${proyecto.id_ubicacion}`, {
        municipio: formEdit.municipio,
        estado: formEdit.estado,
        domicilio: formEdit.domicilio,
        aplicacion: formEdit.aplicacion,
      })
      await api.put(`/proyectos/${id}`, {
        nombre_proyecto: formEdit.nombre_proyecto,
        descripcion: formEdit.descripcion,
        responsable: formEdit.responsable,
        monto_solicitado: formEdit.monto_solicitado,
        costo_total: formEdit.costo_total,
        fecha_inicio: formEdit.fecha_inicio,
        fecha_termino: formEdit.fecha_termino,
        clasificacion: formEdit.clasificacion,
        id_categoria: formEdit.id_categoria,
      })
      await api.post(`/proyectos/${id}/beneficiarios`, beneficiarios)
      setEditando(false)
      cargarProyecto()
      cargarBeneficiarios()
      mostrar('Proyecto actualizado correctamente')
    } catch (err) {
      mostrar('Error al guardar los cambios', 'error')
      console.error(err)
    } finally {
      setGuardandoEdit(false)
    }
  }
  const handleChange = (e) => {
    setFormEdit({ ...formEdit, [e.target.name]: e.target.value })
  }

  const handleBenefChange = (e) => {
    const val = e.target.type === 'number' ? Number(e.target.value) : e.target.value
    const updated = { ...beneficiarios, [e.target.name]: val }
    updated.total_beneficiarios =
      (Number(updated.beneficiarios_012m) || 0) + (Number(updated.beneficiarios_012h) || 0) +
      (Number(updated.beneficiarios_1329m) || 0) + (Number(updated.beneficiarios_1329h) || 0) +
      (Number(updated.beneficiarios_3059m) || 0) + (Number(updated.beneficiarios_3059h) || 0) +
      (Number(updated.beneficiarios_6064m) || 0) + (Number(updated.beneficiarios_6064h) || 0) +
      (Number(updated.beneficiarios_65m) || 0) + (Number(updated.beneficiarios_65h) || 0)
    setBeneficiarios(updated)
  }

  const handleValidarDocumento = async (idDoc, estatus) => {
    try {
      await api.patch(`/documentos/${idDoc}/validar`, { estatus_validacion: estatus })
      cargarDocumentos()
      mostrar(estatus === 'valido' ? 'Documento validado correctamente' : 'Documento rechazado')
    } catch (err) {
      mostrar('Error al validar el documento', 'error')
    }
  }
  
  function ComentarioValidacion({ docId, comentarioInicial, onGuardar }) {
    const [comentario, setComentario] = useState(comentarioInicial)
    const [guardando, setGuardando] = useState(false)
  
    const guardar = async () => {
      setGuardando(true)
      try {
        await api.patch(`/documentos/${docId}/validar`, {
          estatus_validacion: 'rechazado',
          comentario_validacion: comentario
        })
        onGuardar()
      } catch (err) {
        console.error(err)
      } finally {
        setGuardando(false)
      }
    }
  
    return (
      <div className="space-y-1">
        <textarea
          value={comentario}
          onChange={e => setComentario(e.target.value)}
          placeholder="Motivo del rechazo..."
          rows={2}
          className="w-full border border-red-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-red-400"
        />
        <button onClick={guardar} disabled={guardando}
          className="w-full text-xs py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50">
          {guardando ? 'Guardando...' : 'Guardar comentario'}
        </button>
      </div>
    )
  }

  if (cargando) return <Layout><p className="text-gray-400">Cargando...</p></Layout>
  if (!proyecto) return <Layout><p className="text-gray-400">Proyecto no encontrado.</p></Layout>

  return (
    <Layout>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="text-[#D94218] text-sm">← Volver</button>
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
                <button onClick={() => { setEditando(false); cargarProyecto(); cargarBeneficiarios() }}
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
        <div className="md:col-span-2 space-y-6">

          {/* Info general */}
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
                    <label className="block text-xs text-gray-500 mb-1">Rubro principal del proyecto</label>
                    <select name="id_categoria" value={formEdit.id_categoria || ''} onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#D94218]">
                      <option value="">Seleccionar...</option>
                      {categorias.map(cat => (
                        <option key={cat.id_categoria} value={cat.id_categoria}>
                          {cat.nombre_categoria}
                        </option>
                      ))}
                    </select>
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
                    <label className="block text-xs text-gray-500 mb-1">Costo total del proyecto</label>
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
                  <label className="block text-xs text-gray-500 mb-1">Responsable</label>
                  <input name="responsable" value={formEdit.responsable} onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#D94218]" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Objeto, metas y alcance del proyecto</label>
                  <textarea name="descripcion" value={formEdit.descripcion} onChange={handleChange} rows={3}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#D94218]" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Aplicación del donativo solicitado</label>
                  <textarea name="aplicacion" value={formEdit.aplicacion || ''} onChange={handleChange} rows={2}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#D94218]" />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Rubro principal del proyecto</p>
                  <p className="font-medium">{proyecto.categoria?.nombre_categoria || '—'}</p>
                </div>
                <div><p className="text-gray-500">Clasificación</p><p className="font-medium">{proyecto.clasificacion || '—'}</p></div>
                <div>
                  <p className="text-gray-500">Monto solicitado</p>
                  <p className="font-medium">{proyecto.monto_solicitado ? `$${Number(proyecto.monto_solicitado).toLocaleString('es-MX')}` : '—'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Costo total</p>
                  <p className="font-medium">{proyecto.costo_total ? `$${Number(proyecto.costo_total).toLocaleString('es-MX')}` : '—'}</p>
                </div>
                <div><p className="text-gray-500">Fecha inicio</p><p className="font-medium">{proyecto.fecha_inicio || '—'}</p></div>
                <div><p className="text-gray-500">Fecha término</p><p className="font-medium">{proyecto.fecha_termino || '—'}</p></div>
                <div><p className="text-gray-500">Responsable</p><p className="font-medium">{proyecto.responsable || '—'}</p></div>
                <div className="col-span-2">
                  <p className="text-gray-500">Objeto, metas y alcance del proyecto</p>
                  <p className="mt-1">{proyecto.descripcion || '—'}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-gray-500">Aplicación del donativo solicitado</p>
                  <p className="mt-1">{proyecto.ubicacion?.aplicacion || '—'}</p>
                </div>
              </div>
            )}
          </div>

          {/* Beneficiarios */}
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="font-semibold text-gray-700 mb-4">Beneficiarios directos</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm mb-4">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 text-gray-500 font-medium">Rango de edad</th>
                    <th className="text-center py-2 text-gray-500 font-medium">Mujeres</th>
                    <th className="text-center py-2 text-gray-500 font-medium">Hombres</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {rangosBenef.map(rango => (
                    <tr key={rango.label}>
                      <td className="py-2 text-gray-700">{rango.label}</td>
                      <td className="py-2 text-center">
                        {editando ? (
                          <input type="number" name={rango.campoM}
                            value={beneficiarios[rango.campoM] === 0 ? '' : beneficiarios[rango.campoM]}
                            onChange={handleBenefChange} min="0"
                            className="w-20 border border-gray-300 rounded px-2 py-1 text-sm text-center focus:outline-none focus:ring-1 focus:ring-[#D94218]" />
                        ) : (
                          <span className="font-medium">{beneficiarios[rango.campoM] || 0}</span>
                        )}
                      </td>
                      <td className="py-2 text-center">
                        {editando ? (
                          <input type="number" name={rango.campoH}
                            value={beneficiarios[rango.campoH] === 0 ? '' : beneficiarios[rango.campoH]}
                            onChange={handleBenefChange} min="0"
                            className="w-20 border border-gray-300 rounded px-2 py-1 text-sm text-center focus:outline-none focus:ring-1 focus:ring-[#D94218]" />
                        ) : (
                          <span className="font-medium">{beneficiarios[rango.campoH] || 0}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm border-t pt-4">
              <div>
                <p className="text-gray-500 mb-1">Total beneficiarios directos</p>
                <p className="text-xl font-bold" style={{ color: '#D94218' }}>
                  {beneficiarios.total_beneficiarios || 0}
                </p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Beneficiarios indirectos</p>
                {editando ? (
                  <input type="number" name="beneficiarios_indirectos"
                    value={beneficiarios.beneficiarios_indirectos === 0 ? '' : beneficiarios.beneficiarios_indirectos}
                    onChange={handleBenefChange} min="0"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#D94218]" />
                ) : (
                  <p className="text-xl font-bold text-gray-700">{beneficiarios.beneficiarios_indirectos || 0}</p>
                )}
              </div>
            </div>

            <div className="mt-4">
              <p className="text-gray-500 text-sm mb-1">Indicadores que permitirán evaluar el proyecto</p>
              {editando ? (
                <textarea name="indicadores" value={beneficiarios.indicadores || ''} onChange={handleBenefChange} rows={3}
                  placeholder="Describe los indicadores del proyecto..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#D94218]" />
              ) : (
                <p className="text-sm text-gray-700">{beneficiarios.indicadores || '—'}</p>
              )}
            </div>
          </div>

          {/* Documentos */}
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="font-semibold text-gray-700 mb-4">Documentos requeridos</h3>
            {(() => {
              const tipoOrg = proyecto.organizacion?.tipo_organizacion
              const docsRequeridos = tipoOrg === 'AC' ? [
                'INE del representante legal',
                'Carta de donataria autorizada',
                'CSF (Constancia de Situación Fiscal)',
              ] : [
                'INE del presidente municipal',
                'INE del síndico',
                'Constancia de acreditación del presidente',
                'Constancia de acreditación del síndico',
                'Comprobante de domicilio del municipio',
              ]
              return (
                <div className="space-y-3">
                  {docsRequeridos.map(tipo => {
                    const docSubido = documentos.find(d => d.tipo_documento === tipo)
                    const estatus = docSubido?.estatus_validacion || 'pendiente'
                    const iconoEstatus = estatus === 'valido' ? '✅' : estatus === 'rechazado' ? '❌' : '📄'

                    return (
                      <div key={tipo} className="border border-gray-100 rounded-lg p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-lg">{iconoEstatus}</span>
                            <div>
                              <p className="text-sm font-medium text-gray-700">{tipo}</p>
                              {docSubido && (
                                <p className="text-xs text-gray-400">{docSubido.nombre_archivo}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2 items-center">
                            {docSubido ? (
                              <>
                                <a href="#"
                                  onClick={async (e) => {
                                    e.preventDefault();
                                    const res = await api.get(`/documentos/${docSubido.id_documento}`);
                                    window.open(res.data.url, '_blank');
                                  }}
                                  className="text-xs text-[#D94218] hover:text-[#B83510] font-medium">
                                  Ver
                                </a>
                                {!esAdmin() && (
                                  <button onClick={() => handleEliminarDocumento(docSubido.id_documento)}
                                    className="text-red-400 hover:text-red-600 text-xs" title="Eliminar">
                                    🗑️
                                  </button>
                                )}
                              </>
                            ) : (
                              !esAdmin() && (
                                <label className="cursor-pointer text-xs text-[#D94218] hover:text-[#B83510] font-medium">
                                  {subiendoDoc === tipo ? 'Subiendo...' : 'Subir'}
                                  <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png"
                                    onChange={e => {
                                      if (e.target.files[0]) handleSubirDocumento(tipo, e.target.files[0])
                                    }} />
                                </label>
                              )
                            )}
                          </div>
                        </div>

                        {/* Validación admin */}
                        {esAdmin() && docSubido && (
                          <div className="border-t pt-2 space-y-2">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleValidarDocumento(docSubido.id_documento, 'valido')}
                                className={`flex-1 text-xs py-1.5 rounded-lg border transition ${
                                  estatus === 'valido'
                                    ? 'bg-green-500 text-white border-green-500'
                                    : 'border-green-400 text-green-600 hover:bg-green-50'
                                }`}>
                                ✓ Válido
                              </button>
                              <button
                                onClick={() => handleValidarDocumento(docSubido.id_documento, 'rechazado')}
                                className={`flex-1 text-xs py-1.5 rounded-lg border transition ${
                                  estatus === 'rechazado'
                                    ? 'bg-red-500 text-white border-red-500'
                                    : 'border-red-400 text-red-500 hover:bg-red-50'
                                }`}>
                                ✗ Rechazar
                              </button>
                            </div>
                            {estatus === 'rechazado' && (
                              <ComentarioValidacion
                                docId={docSubido.id_documento}
                                comentarioInicial={docSubido.comentario_validacion || ''}
                                onGuardar={cargarDocumentos}
                              />
                            )}
                            {docSubido.comentario_validacion && estatus !== 'rechazado' && (
                              <p className="text-xs text-gray-500 italic">{docSubido.comentario_validacion}</p>
                            )}
                          </div>
                        )}

                        {/* Mostrar comentario a la organización */}
                        {!esAdmin() && docSubido?.comentario_validacion && (
                          <p className="text-xs text-red-500 mt-1">
                            Observación: {docSubido.comentario_validacion}
                          </p>
                        )}
                      </div>
                    )
                  })}
                </div>
              )
            })()}
          </div>
        </div>

        {/* Panel lateral */}
        <div className="space-y-6">
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

          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="font-semibold text-gray-700 mb-3">Ubicación geográfica del proyecto</h3>
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

          {esAdmin() && (
            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="font-semibold text-gray-700 mb-3">Evaluar proyecto</h3>
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
                  <textarea value={comentario} onChange={e => setComentario(e.target.value)}
                    placeholder="Comentario (opcional)" rows={2}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#D94218]" />
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

          {/* Historial de estados */}
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="font-semibold text-gray-700 mb-4">Historial de estados</h3>
            {proyecto.historial_estado?.length === 0 ? (
              <p className="text-gray-400 text-sm">Sin historial.</p>
            ) : (
              <div className="space-y-3">
                {proyecto.historial_estado?.map(h => (
                  <div key={h.id_historial} className="flex items-start gap-3 text-sm">
                    <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: '#D94218' }}></div>
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
      </div>
      {toast && <Toast mensaje={toast.mensaje} tipo={toast.tipo} onCerrar={cerrar} />}
    </Layout>
  )
}