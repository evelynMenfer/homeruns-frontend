import { useState, useEffect } from 'react'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'

const rangosBenef = [
  { label: '0 a 12 años', campoM: 'beneficiarios_012m', campoH: 'beneficiarios_012h' },
  { label: '13 a 29 años', campoM: 'beneficiarios_1329m', campoH: 'beneficiarios_1329h' },
  { label: '30 a 59 años', campoM: 'beneficiarios_3059m', campoH: 'beneficiarios_3059h' },
  { label: '60 a 64 años', campoM: 'beneficiarios_6064m', campoH: 'beneficiarios_6064h' },
  { label: '65 en adelante', campoM: 'beneficiarios_65m', campoH: 'beneficiarios_65h' },
]

const rubroMap = {
  'Cultura': 'cultura',
  'Deporte': 'deporte',
  'Medio Ambiente': 'medio_ambiente',
  'Productivo': 'productivo',
  'Salud': 'salud',
  'Educación': 'educacion',
}

const inputClass = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#D94218]"

export default function ProyectoForm({ onGuardado, onCancelar }) {
  const { usuario } = useAuth()
  const [organizaciones, setOrganizaciones] = useState([])
  const [categorias, setCategorias] = useState([])
  const [miOrganizacion, setMiOrganizacion] = useState(null)
  const [rubroSeleccionado, setRubroSeleccionado] = useState('')
  const [preguntasRubro, setPreguntasRubro] = useState([])
  const [form, setForm] = useState({
    nombre_proyecto: '', descripcion: '', monto_solicitado: '', costo_total: '',
    fecha_inicio: '', fecha_termino: '', responsable: '', clasificacion: 'Primera vez',
    id_organizacion: '', id_categoria: '',
    objetivo_general: '', alcance: '', como_se_aplicara: '',
    hablantes_lengua_indigena: '', nombre_regidor: '', telefono_regidor: '', correo_regidor: ''
  })
  const [ubicacion, setUbicacion] = useState({
    domicilio: '', municipio: '', estado: ''
  })
  const [beneficiarios, setBeneficiarios] = useState({
    beneficiarios_012m: 0, beneficiarios_012h: 0,
    beneficiarios_1329m: 0, beneficiarios_1329h: 0,
    beneficiarios_3059m: 0, beneficiarios_3059h: 0,
    beneficiarios_6064m: 0, beneficiarios_6064h: 0,
    beneficiarios_65m: 0, beneficiarios_65h: 0,
    beneficiarios_indirectos: 0, indicadores: ''
  })
  const [respuestas, setRespuestas] = useState({})
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')

  const esMunicipio = miOrganizacion?.tipo_organizacion === 'MUNICIPIO'

  useEffect(() => {
    cargarCatalogos()
  }, [])

  const cargarCatalogos = async () => {
    try {
      const resOrgs = await api.get('/organizaciones')
      const listaOrgs = resOrgs.data.data || []
      setOrganizaciones(listaOrgs)
      const miOrg = listaOrgs.find(o => o.id_usuario_registro === usuario?.id_usuario)
      if (miOrg) {
        setMiOrganizacion(miOrg)
        setForm(f => ({ ...f, id_organizacion: miOrg.id_organizacion }))
        const resCats = await api.get(`/categorias?tipo_organizacion=${miOrg.tipo_organizacion}`)
        setCategorias(resCats.data || [])
      } else {
        const resCats = await api.get('/categorias')
        setCategorias(resCats.data || [])
      }
    } catch (err) {
      console.error(err)
    }
  }

  const cargarPreguntasRubro = async (rubro) => {
    if (!rubro) {
      setPreguntasRubro([])
      return
    }
    try {
      const res = await api.get(`/preguntas-rubro?rubro=${rubro}`)
      setPreguntasRubro(res.data || [])
    } catch (err) {
      console.error(err)
      setPreguntasRubro([])
    }
  }

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })
  const handleUbicacion = (e) => setUbicacion({ ...ubicacion, [e.target.name]: e.target.value })
  const handleBenef = (e) => {
    const val = e.target.type === 'number' ? Number(e.target.value) : e.target.value
    setBeneficiarios({ ...beneficiarios, [e.target.name]: val })
  }
  const handleRespuesta = (e) => setRespuestas({ ...respuestas, [e.target.name]: e.target.value })

  const handleCategoriaChange = (e) => {
    const idCat = e.target.value
    setForm({ ...form, id_categoria: idCat })
    const cat = categorias.find(c => String(c.id_categoria) === String(idCat))
    const rubro = rubroMap[cat?.nombre_categoria] || ''
    setRubroSeleccionado(rubro)
    setRespuestas({})
    if (esMunicipio) cargarPreguntasRubro(rubro)
  }

  const totalBenef =
    (Number(beneficiarios.beneficiarios_012m) || 0) +
    (Number(beneficiarios.beneficiarios_012h) || 0) +
    (Number(beneficiarios.beneficiarios_1329m) || 0) +
    (Number(beneficiarios.beneficiarios_1329h) || 0) +
    (Number(beneficiarios.beneficiarios_3059m) || 0) +
    (Number(beneficiarios.beneficiarios_3059h) || 0) +
    (Number(beneficiarios.beneficiarios_6064m) || 0) +
    (Number(beneficiarios.beneficiarios_6064h) || 0) +
    (Number(beneficiarios.beneficiarios_65m) || 0) +
    (Number(beneficiarios.beneficiarios_65h) || 0)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setCargando(true)
    setError('')
    try {
      const resUbicacion = await api.post('/ubicaciones', ubicacion)
      const resProyecto = await api.post('/proyectos', {
        ...form,
        id_ubicacion: resUbicacion.data.id_ubicacion,
        rubro: rubroSeleccionado,
        respuestas
      })
      await api.post(`/proyectos/${resProyecto.data.id_proyecto}/beneficiarios`, {
        ...beneficiarios,
        total_beneficiarios: totalBenef
      })
      onGuardado()
    } catch (err) {
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

  const nombreRubroLabel = categorias.find(c => String(c.id_categoria) === String(form.id_categoria))?.nombre_categoria || ''

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

          {/* Organización */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Organización *</label>
            {miOrganizacion ? (
              <div className="w-full border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-700">
                {miOrganizacion.asociacion_civil?.razon_social ||
                 miOrganizacion.municipio?.nombre_municipio ||
                 miOrganizacion.rfc || `Organización #${miOrganizacion.id_organizacion}`}
              </div>
            ) : (
              <select name="id_organizacion" value={form.id_organizacion} onChange={handleChange} required className={inputClass}>
                <option value="">Seleccionar...</option>
                {organizaciones.map(org => (
                  <option key={org.id_organizacion} value={org.id_organizacion}>
                    {org.asociacion_civil?.razon_social || org.municipio?.nombre_municipio || org.rfc}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del proyecto *</label>
            <input name="nombre_proyecto" value={form.nombre_proyecto} onChange={handleChange} required className={inputClass} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rubro principal del proyecto *</label>
              <select name="id_categoria" value={form.id_categoria} onChange={handleCategoriaChange} required className={inputClass}>
                <option value="">Seleccionar...</option>
                {categorias.map(cat => (
                  <option key={cat.id_categoria} value={cat.id_categoria}>{cat.nombre_categoria}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">¿Cómo clasifica el proyecto propuesto?</label>
              <select name="clasificacion" value={form.clasificacion} onChange={handleChange} className={inputClass}>
                <option value="Primera vez">Implementado por primera vez</option>
                <option value="Continuidad">Continuidad de un proyecto</option>
                <option value="Ejecutado anteriormente">Ejecutado anteriormente</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Monto solicitado (hasta $100,000.00 MN)</label>
              <input name="monto_solicitado" type="number" value={form.monto_solicitado} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Costo total del proyecto (MXN)</label>
              <input name="costo_total" type="number" value={form.costo_total} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de inicio</label>
              <input name="fecha_inicio" type="date" value={form.fecha_inicio} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de término</label>
              <input name="fecha_termino" type="date" value={form.fecha_termino} onChange={handleChange} className={inputClass} />
            </div>
          </div>

          {/* Objetivo, alcance y aplicación */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Describa el objetivo general del proyecto</label>
            <textarea name="objetivo_general" value={form.objetivo_general} onChange={handleChange} rows={3} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Describa el alcance del proyecto</label>
            <textarea name="alcance" value={form.alcance} onChange={handleChange} rows={3} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mencione de forma detallada cómo se aplicará el donativo solicitado (en especie)</label>
            <textarea name="como_se_aplicara" value={form.como_se_aplicara} onChange={handleChange} rows={3} className={inputClass} />
          </div>

          {/* Regidor / Responsable */}
          <div className="border-t pt-4">
            <h4 className="font-medium text-gray-700 mb-3">
              {esMunicipio
                ? `Regidor${rubroSeleccionado === 'medio_ambiente' ? ' de ecología' : rubroSeleccionado === 'deporte' ? ' de deportes' : rubroSeleccionado === 'salud' ? ' de salud' : ''} que coordinará, dará seguimiento y elaborará el informe final del proyecto propuesto`
                : 'Responsable de dar seguimiento y presentar la comprobación ante la FAHHO'}
            </h4>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <input name="nombre_regidor" value={form.nombre_regidor} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                <input name="telefono_regidor" value={form.telefono_regidor} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Correo institucional</label>
                <input name="correo_regidor" type="email" value={form.correo_regidor} onChange={handleChange} className={inputClass} />
              </div>
            </div>
          </div>

          {/* Preguntas específicas por rubro (solo MUNICIPIO) */}
          {esMunicipio && preguntasRubro.length > 0 && (
            <div className="border-t pt-4">
              <h4 className="font-medium text-gray-700 mb-3">
                Información específica — {nombreRubroLabel}
              </h4>
              <div className="space-y-4">
                {preguntasRubro.map(p => (
                  <div key={p.id}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{p.etiqueta}</label>
                    {p.tipo === 'textarea' ? (
                      <textarea name={p.campo} value={respuestas[p.campo] || ''} onChange={handleRespuesta} rows={2} className={inputClass} />
                    ) : (
                      <input type={p.tipo === 'number' ? 'number' : 'text'} name={p.campo} value={respuestas[p.campo] || ''} onChange={handleRespuesta} className={inputClass} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Ubicación */}
          <div className="border-t pt-4">
            <h4 className="font-medium text-gray-700 mb-2">Ubicación geográfica del proyecto</h4>
            <p className="text-sm text-gray-500 mb-3">Mencione el domicilio en donde se ejecutará el proyecto propuesto.</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Municipio</label>
                <input name="municipio" value={ubicacion.municipio} onChange={handleUbicacion} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                <input name="estado" value={ubicacion.estado} onChange={handleUbicacion} className={inputClass} />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Domicilio</label>
                <input name="domicilio" value={ubicacion.domicilio} onChange={handleUbicacion} className={inputClass} />
              </div>
            </div>
          </div>

          {/* Beneficiarios */}
          <div className="border-t pt-4">
            <h4 className="font-medium text-gray-700 mb-3">Número de beneficiarios directos señalando los rangos de edad y sexo</h4>
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
                      <input type="number" name={rango.campoM} value={beneficiarios[rango.campoM]} onChange={handleBenef} min="0"
                        className="w-20 border border-gray-300 rounded px-2 py-1 text-sm text-center focus:outline-none focus:ring-1 focus:ring-[#D94218]" />
                    </td>
                    <td className="py-2 text-center">
                      <input type="number" name={rango.campoH} value={beneficiarios[rango.campoH]} onChange={handleBenef} min="0"
                        className="w-20 border border-gray-300 rounded px-2 py-1 text-sm text-center focus:outline-none focus:ring-1 focus:ring-[#D94218]" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total beneficiarios directos</label>
                <div className="w-full border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 text-sm font-bold" style={{ color: '#D94218' }}>
                  {totalBenef}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Número de beneficiarios indirectos</label>
                <input type="number" name="beneficiarios_indirectos" value={beneficiarios.beneficiarios_indirectos} onChange={handleBenef} min="0" className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Número de hablantes de lengua indígena</label>
                <input type="number" name="hablantes_lengua_indigena" value={form.hablantes_lengua_indigena} onChange={handleChange} min="0" className={inputClass} />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">¿Cuáles serán los indicadores que le permitirán evaluar el proyecto?</label>
              <textarea name="indicadores" value={beneficiarios.indicadores} onChange={handleBenef} rows={3} className={inputClass} />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button type="button" onClick={onCancelar}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition">
              Cancelar
            </button>
            <button type="submit" disabled={cargando}
              className="px-4 py-2 bg-[#D94218] hover:bg-[#B83510] text-white rounded-lg text-sm transition disabled:opacity-50">
              {cargando ? 'Guardando...' : 'Guardar proyecto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}