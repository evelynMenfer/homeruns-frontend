import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import api from '../api/axios'

export default function Reportes() {
  const [proyectos, setProyectos] = useState([])
  const [organizaciones, setOrganizaciones] = useState([])
  const [categorias, setCategorias] = useState([])
  const [cargando, setCargando] = useState(true)
  const [vistaActiva, setVistaActiva] = useState(null) // 'proyectos' | 'organizaciones' | 'general'

  // Filtros proyectos
  const [filtroEstado, setFiltroEstado] = useState('')
  const [filtroTipo, setFiltroTipo] = useState('')
  const [filtroCategoria, setFiltroCategoria] = useState('')
  const [fechaDesde, setFechaDesde] = useState('')
  const [fechaHasta, setFechaHasta] = useState('')

  // Filtros organizaciones
  const [filtroTipoOrg, setFiltroTipoOrg] = useState('')
  const [filtroParticipo, setFiltroParticipo] = useState('')

  useEffect(() => {
    const cargar = async () => {
      try {
        const [resP, resO, resC] = await Promise.all([
          api.get('/proyectos'),
          api.get('/organizaciones'),
          api.get('/categorias')
        ])
        setProyectos(resP.data.data || [])
        setOrganizaciones(resO.data.data || [])
        setCategorias(resC.data || [])
      } catch (err) {
        console.error(err)
      } finally {
        setCargando(false)
      }
    }
    cargar()
  }, [])

  const proyectosFiltrados = proyectos.filter(p => {
    const matchEstado = filtroEstado ? p.estado_actual === filtroEstado : true
    const matchTipo = filtroTipo ? p.organizacion?.tipo_organizacion === filtroTipo : true
    const matchCategoria = filtroCategoria ? p.id_categoria == filtroCategoria : true
    const matchDesde = fechaDesde ? new Date(p.fecha_creacion) >= new Date(fechaDesde) : true
    const matchHasta = fechaHasta ? new Date(p.fecha_creacion) <= new Date(fechaHasta) : true
    return matchEstado && matchTipo && matchCategoria && matchDesde && matchHasta
  })

  const organizacionesFiltradas = organizaciones.filter(org => {
    const matchTipo = filtroTipoOrg ? org.tipo_organizacion === filtroTipoOrg : true
    const matchParticipo = filtroParticipo ? org.participo_antes === filtroParticipo : true
    return matchTipo && matchParticipo
  })

  const descargar = async (ruta, nombre) => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`http://127.0.0.1:8000/api${ruta}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = nombre
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error(err)
    }
  }

  const estadoColor = {
    'En revision': 'bg-yellow-100 text-yellow-700',
    'Aprobado': 'bg-green-100 text-green-700',
    'Rechazado': 'bg-red-100 text-red-700',
    'En ejecucion': 'bg-blue-100 text-blue-700',
    'Finalizado': 'bg-gray-100 text-gray-700',
  }

  return (
    <Layout>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Reportes</h2>
        <p className="text-gray-500 text-sm mt-1">Previsualiza y descarga reportes en Excel o PDF</p>
      </div>

      {/* Tarjetas de reportes */}
      {!vistaActiva && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { key: 'proyectos', titulo: 'Reporte de Proyectos', descripcion: 'Lista de proyectos con estado, montos y beneficiarios.', icono: '📋' },
            { key: 'organizaciones', titulo: 'Reporte de Organizaciones', descripcion: 'Lista de organizaciones con sus datos generales.', icono: '🏢' },
            { key: 'general', titulo: 'Reporte General', descripcion: 'Resumen ejecutivo con estadísticas del programa.', icono: '📊' },
          ].map(r => (
            <div key={r.key} className="bg-white rounded-xl shadow p-6">
              <div className="text-4xl mb-3">{r.icono}</div>
              <h3 className="font-semibold text-gray-800 mb-2">{r.titulo}</h3>
              <p className="text-gray-500 text-sm mb-5">{r.descripcion}</p>
              <button
                onClick={() => setVistaActiva(r.key)}
                className="w-full py-2 rounded-lg text-sm text-white transition"
                style={{ background: '#D94218' }}>
                Ver reporte
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Vista previa Proyectos */}
      {vistaActiva === 'proyectos' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => setVistaActiva(null)} className="text-[#D94218] text-sm">← Volver</button>
            <h3 className="font-semibold text-gray-800">Reporte de Proyectos</h3>
            <div className="flex gap-2">
              <button onClick={() => descargar('/reportes/proyectos/excel', 'proyectos.csv')}
                className="px-3 py-1.5 border border-green-500 text-green-600 hover:bg-green-50 rounded-lg text-xs transition">
                📥 Excel
              </button>
              <button onClick={() => descargar('/reportes/proyectos/pdf', 'proyectos.pdf')}
                className="px-3 py-1.5 border border-[#D94218] text-[#D94218] hover:bg-orange-50 rounded-lg text-xs transition">
                📄 PDF
              </button>
            </div>
          </div>

          {/* Filtros proyectos */}
          <div className="bg-white rounded-xl shadow p-4 mb-4 grid grid-cols-2 md:grid-cols-5 gap-3">
            <select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#D94218]">
              <option value="">Todos los estados</option>
              <option value="En revision">En revisión</option>
              <option value="Aprobado">Aprobado</option>
              <option value="Rechazado">Rechazado</option>
              <option value="En ejecucion">En ejecución</option>
              <option value="Finalizado">Finalizado</option>
            </select>
            <select value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#D94218]">
              <option value="">Todos los tipos</option>
              <option value="AC">Asociación Civil</option>
              <option value="MUNICIPIO">Municipio</option>
            </select>
            <select value={filtroCategoria} onChange={e => setFiltroCategoria(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#D94218]">
              <option value="">Todas las categorías</option>
              {categorias.map(c => (
                <option key={c.id_categoria} value={c.id_categoria}>{c.nombre_categoria}</option>
              ))}
            </select>
            <input type="date" value={fechaDesde} onChange={e => setFechaDesde(e.target.value)}
              placeholder="Desde"
              className="border border-gray-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#D94218]" />
            <input type="date" value={fechaHasta} onChange={e => setFechaHasta(e.target.value)}
              placeholder="Hasta"
              className="border border-gray-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#D94218]" />
          </div>

          <p className="text-xs text-gray-500 mb-2">{proyectosFiltrados.length} proyectos encontrados</p>

          <div className="bg-white rounded-xl shadow overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 text-gray-600 font-medium">Nombre</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-medium">Organización</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-medium">Categoría</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-medium">Estado</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-medium">Monto</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-medium">Municipio</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {proyectosFiltrados.map(p => (
                  <tr key={p.id_proyecto} className="hover:bg-gray-50">
                    <td className="px-4 py-2 font-medium">{p.nombre_proyecto}</td>
                    <td className="px-4 py-2 text-gray-500">
                      {p.organizacion?.asociacion_civil?.razon_social ||
                       p.organizacion?.municipio?.nombre_municipio ||
                       p.organizacion?.rfc || '—'}
                    </td>
                    <td className="px-4 py-2 text-gray-500">{p.categoria?.nombre_categoria || '—'}</td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${estadoColor[p.estado_actual]}`}>
                        {p.estado_actual}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      {p.monto_solicitado ? `$${Number(p.monto_solicitado).toLocaleString('es-MX')}` : '—'}
                    </td>
                    <td className="px-4 py-2 text-gray-500">{p.ubicacion?.municipio || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Vista previa Organizaciones */}
      {vistaActiva === 'organizaciones' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => setVistaActiva(null)} className="text-[#D94218] text-sm">← Volver</button>
            <h3 className="font-semibold text-gray-800">Reporte de Organizaciones</h3>
            <div className="flex gap-2">
              <button onClick={() => descargar('/reportes/organizaciones/excel', 'organizaciones.csv')}
                className="px-3 py-1.5 border border-green-500 text-green-600 hover:bg-green-50 rounded-lg text-xs transition">
                📥 Excel
              </button>
              <button onClick={() => descargar('/reportes/organizaciones/pdf', 'organizaciones.pdf')}
                className="px-3 py-1.5 border border-[#D94218] text-[#D94218] hover:bg-orange-50 rounded-lg text-xs transition">
                📄 PDF
              </button>
            </div>
          </div>

          {/* Filtros organizaciones */}
          <div className="bg-white rounded-xl shadow p-4 mb-4 grid grid-cols-2 gap-3">
            <select value={filtroTipoOrg} onChange={e => setFiltroTipoOrg(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#D94218]">
              <option value="">Todos los tipos</option>
              <option value="AC">Asociación Civil</option>
              <option value="MUNICIPIO">Municipio</option>
            </select>
            <select value={filtroParticipo} onChange={e => setFiltroParticipo(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#D94218]">
              <option value="">¿Participó antes?</option>
              <option value="S">Sí participó</option>
              <option value="N">No participó</option>
            </select>
          </div>

          <p className="text-xs text-gray-500 mb-2">{organizacionesFiltradas.length} organizaciones encontradas</p>

          <div className="bg-white rounded-xl shadow overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 text-gray-600 font-medium">Nombre</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-medium">Tipo</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-medium">RFC</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-medium">Email</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-medium">Teléfono</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-medium">Participó antes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {organizacionesFiltradas.map(org => (
                  <tr key={org.id_organizacion} className="hover:bg-gray-50">
                    <td className="px-4 py-2 font-medium">
                      {org.asociacion_civil?.razon_social || org.municipio?.nombre_municipio || org.rfc || '—'}
                    </td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        org.tipo_organizacion === 'AC' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {org.tipo_organizacion === 'AC' ? 'Asociación Civil' : 'Municipio'}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-gray-500">{org.rfc || '—'}</td>
                    <td className="px-4 py-2 text-gray-500">{org.email || '—'}</td>
                    <td className="px-4 py-2 text-gray-500">{org.telefono || '—'}</td>
                    <td className="px-4 py-2">{org.participo_antes === 'S' ? 'Sí' : 'No'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Vista previa General */}
      {vistaActiva === 'general' && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <button onClick={() => setVistaActiva(null)} className="text-[#D94218] text-sm">← Volver</button>
            <h3 className="font-semibold text-gray-800">Reporte General</h3>
            <div className="flex gap-2">
              <button onClick={() => descargar('/reportes/general/excel', 'reporte_general.csv')}
                className="px-3 py-1.5 border border-green-500 text-green-600 hover:bg-green-50 rounded-lg text-xs transition">
                📥 Excel
              </button>
              <button onClick={() => descargar('/reportes/general/pdf', 'reporte_general.pdf')}
                className="px-3 py-1.5 border border-[#D94218] text-[#D94218] hover:bg-orange-50 rounded-lg text-xs transition">
                📄 PDF
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Proyectos totales', valor: proyectos.length, color: '#D94218' },
              { label: 'Organizaciones', valor: organizaciones.length, color: '#1A1A2E' },
              { label: 'Aprobados', valor: proyectos.filter(p => p.estado_actual === 'Aprobado').length, color: '#16a34a' },
              { label: 'En revisión', valor: proyectos.filter(p => p.estado_actual === 'En revision').length, color: '#ca8a04' },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-xl shadow p-5 text-center">
                <p className="text-2xl font-bold" style={{ color: s.color }}>{s.valor}</p>
                <p className="text-xs text-gray-500 mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow p-6">
              <h4 className="font-semibold text-gray-700 mb-4">Proyectos por estado</h4>
              <table className="w-full text-sm">
                <thead className="border-b">
                  <tr>
                    <th className="text-left py-2 text-gray-500 font-medium">Estado</th>
                    <th className="text-right py-2 text-gray-500 font-medium">Total</th>
                    <th className="text-right py-2 text-gray-500 font-medium">%</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {['En revision', 'Aprobado', 'Rechazado', 'En ejecucion', 'Finalizado'].map(estado => {
                    const total = proyectos.filter(p => p.estado_actual === estado).length
                    const pct = proyectos.length > 0 ? ((total / proyectos.length) * 100).toFixed(1) : 0
                    return (
                      <tr key={estado}>
                        <td className="py-2">{estado}</td>
                        <td className="py-2 text-right font-medium">{total}</td>
                        <td className="py-2 text-right text-gray-500">{pct}%</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <div className="bg-white rounded-xl shadow p-6">
              <h4 className="font-semibold text-gray-700 mb-4">Organizaciones por tipo</h4>
              <table className="w-full text-sm">
                <thead className="border-b">
                  <tr>
                    <th className="text-left py-2 text-gray-500 font-medium">Tipo</th>
                    <th className="text-right py-2 text-gray-500 font-medium">Total</th>
                    <th className="text-right py-2 text-gray-500 font-medium">%</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {['AC', 'MUNICIPIO'].map(tipo => {
                    const total = organizaciones.filter(o => o.tipo_organizacion === tipo).length
                    const pct = organizaciones.length > 0 ? ((total / organizaciones.length) * 100).toFixed(1) : 0
                    return (
                      <tr key={tipo}>
                        <td className="py-2">{tipo === 'AC' ? 'Asociación Civil' : 'Municipio'}</td>
                        <td className="py-2 text-right font-medium">{total}</td>
                        <td className="py-2 text-right text-gray-500">{pct}%</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}