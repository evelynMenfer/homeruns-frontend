import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import api from '../api/axios'
import Toast from '../components/Toast'
import useToast from '../hooks/useToast'

export default function Categorias() {
  const [categorias, setCategorias] = useState([])
  const [cargando, setCargando] = useState(true)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [editando, setEditando] = useState(null)
  const [form, setForm] = useState({ nombre_categoria: '', tipo_organizacion: 'AMBOS' })
  const [formEdit, setFormEdit] = useState({})
  const [error, setError] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [busqueda, setBusqueda] = useState('')
  const [filtroTipo, setFiltroTipo] = useState('')
  const { toast, mostrar, cerrar } = useToast()

  useEffect(() => {
    cargarCategorias()
  }, [])

  const cargarCategorias = async () => {
    try {
      const res = await api.get('/categorias')
      setCategorias(res.data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setCargando(false)
    }
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setGuardando(true)
    setError('')
    try {
      await api.post('/categorias', form)
      setMostrarForm(false)
      setForm({ nombre_categoria: '', tipo_organizacion: 'AMBOS' })
      cargarCategorias()
      mostrar('Categoría creada correctamente')
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar')
      mostrar('Error al crear la categoría', 'error')
    } finally {
      setGuardando(false)
    }
  }

  const handleEditarClick = (cat) => {
    setEditando(cat.id_categoria)
    setFormEdit({ nombre_categoria: cat.nombre_categoria, tipo_organizacion: cat.tipo_organizacion })
  }

  const handleGuardarEdit = async (id) => {
    try {
      await api.put(`/categorias/${id}`, formEdit)
      setEditando(null)
      cargarCategorias()
      mostrar('Categoría actualizada correctamente')
    } catch (err) {
      mostrar('Error al actualizar la categoría', 'error')
    }
  }

  const handleEliminar = async (id) => {
    if (!confirm('¿Eliminar esta categoría?')) return
    try {
      await api.delete(`/categorias/${id}`)
      cargarCategorias()
      mostrar('Categoría eliminada correctamente')
    } catch (err) {
      mostrar('Error al eliminar la categoría', 'error')
    }
  }

  const tipoLabel = (tipo) => {
    if (tipo === 'AC') return { label: 'Asociación Civil', clase: 'bg-purple-100 text-purple-700' }
    if (tipo === 'MUNICIPIO') return { label: 'Municipio', clase: 'bg-blue-100 text-blue-700' }
    return { label: 'Ambos', clase: 'bg-green-100 text-green-700' }
  }

  const categoriasFiltradas = categorias.filter(c => {
    const matchBusqueda = c.nombre_categoria.toLowerCase().includes(busqueda.toLowerCase())
    const matchTipo = filtroTipo ? c.tipo_organizacion === filtroTipo : true
    return matchBusqueda && matchTipo
  })

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Categorías / Rubros</h2>
        <button onClick={() => setMostrarForm(true)}
          className="bg-[#D94218] hover:bg-[#B83510] text-white px-4 py-2 rounded-lg text-sm transition">
          + Nueva categoría
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl shadow p-4 mb-4 grid grid-cols-1 md:grid-cols-2 gap-3">
        <input type="text" placeholder="Buscar por nombre..."
          value={busqueda} onChange={e => setBusqueda(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#D94218]" />
        <select value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#D94218]">
          <option value="">Todos los tipos</option>
          <option value="AC">Asociación Civil</option>
          <option value="MUNICIPIO">Municipio</option>
          <option value="AMBOS">Ambos</option>
        </select>
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        {cargando ? (
          <p className="p-6 text-gray-400">Cargando...</p>
        ) : categoriasFiltradas.length === 0 ? (
          <p className="p-6 text-gray-400">No hay categorías registradas.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-6 py-3 text-gray-600 font-medium">Nombre</th>
                <th className="text-left px-6 py-3 text-gray-600 font-medium">Tipo</th>
                <th className="text-left px-6 py-3 text-gray-600 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {categoriasFiltradas.map(cat => (
                <tr key={cat.id_categoria} className="hover:bg-gray-50">
                  {editando === cat.id_categoria ? (
                    <>
                      <td className="px-4 py-2">
                        <input value={formEdit.nombre_categoria}
                          onChange={e => setFormEdit({...formEdit, nombre_categoria: e.target.value})}
                          className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-[#D94218]" />
                      </td>
                      <td className="px-4 py-2">
                        <select value={formEdit.tipo_organizacion}
                          onChange={e => setFormEdit({...formEdit, tipo_organizacion: e.target.value})}
                          className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-[#D94218]">
                          <option value="AMBOS">Ambos</option>
                          <option value="AC">Asociación Civil</option>
                          <option value="MUNICIPIO">Municipio</option>
                        </select>
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex gap-2">
                          <button onClick={() => handleGuardarEdit(cat.id_categoria)}
                            className="text-xs text-white px-2 py-1 rounded"
                            style={{ background: '#D94218' }}>
                            Guardar
                          </button>
                          <button onClick={() => setEditando(null)}
                            className="text-xs text-gray-500 px-2 py-1 border border-gray-300 rounded">
                            Cancelar
                          </button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-6 py-3 font-medium">{cat.nombre_categoria}</td>
                      <td className="px-6 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${tipoLabel(cat.tipo_organizacion).clase}`}>
                          {tipoLabel(cat.tipo_organizacion).label}
                        </span>
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex gap-2 items-center">
                          <button onClick={() => handleEditarClick(cat)}
                            className="text-[#D94218] hover:text-[#B83510]"
                            title="Editar">
                            ✏️
                          </button>
                          <button onClick={() => handleEliminar(cat.id_categoria)}
                            className="text-red-400 hover:text-red-600"
                            title="Eliminar">
                            🗑️
                          </button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal nueva categoría */}
      {mostrarForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-800">Nueva Categoría</h3>
              <button onClick={() => setMostrarForm(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>

            {error && (
              <div className="mx-6 mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                <input name="nombre_categoria" value={form.nombre_categoria} onChange={handleChange} required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#D94218]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Aplica para *</label>
                <select name="tipo_organizacion" value={form.tipo_organizacion} onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#D94218]">
                  <option value="AMBOS">Ambos</option>
                  <option value="AC">Asociación Civil</option>
                  <option value="MUNICIPIO">Municipio</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setMostrarForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition">
                  Cancelar
                </button>
                <button type="submit" disabled={guardando}
                  className="px-4 py-2 bg-[#D94218] hover:bg-[#B83510] text-white rounded-lg text-sm transition disabled:opacity-50">
                  {guardando ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {toast && <Toast mensaje={toast.mensaje} tipo={toast.tipo} onCerrar={cerrar} />}
    </Layout>
  )
}