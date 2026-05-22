import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import api from '../api/axios'
import Toast from '../components/Toast'
import useToast from '../hooks/useToast'

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([])
  const [cargando, setCargando] = useState(true)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [busqueda, setBusqueda] = useState('')
  const [filtroEstatus, setFiltroEstatus] = useState('')
  const [filtroRol, setFiltroRol] = useState('')
  const [form, setForm] = useState({
    nombre: '', apellido: '', email: '', password: '', telefono: '', estatus: 'activo', roles: [1]
  })
  const [error, setError] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [editando, setEditando] = useState(null)
  const [formEdit, setFormEdit] = useState({})
  const { toast, mostrar, cerrar } = useToast()

  useEffect(() => {
    cargarUsuarios()
  }, [])

  const cargarUsuarios = async () => {
    try {
      const res = await api.get('/usuarios')
      setUsuarios(res.data.data || [])
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
      await api.post('/usuarios', form)
      setMostrarForm(false)
      setForm({ nombre: '', apellido: '', email: '', password: '', telefono: '', estatus: 'activo', roles: [1] })
      cargarUsuarios()
      mostrar('Usuario creado correctamente')
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar')
      mostrar('Error al crear el usuario', 'error')
    } finally {
      setGuardando(false)
    }
  }

  const handleToggleEstatus = async (usuario) => {
    const nuevoEstatus = usuario.estatus === 'activo' ? 'inactivo' : 'activo'
    if (!confirm(`¿${nuevoEstatus === 'inactivo' ? 'Desactivar' : 'Activar'} este usuario?`)) return
    try {
      await api.put(`/usuarios/${usuario.id_usuario}`, { estatus: nuevoEstatus })
      cargarUsuarios()
      mostrar(`Usuario ${nuevoEstatus === 'activo' ? 'activado' : 'desactivado'} correctamente`)
    } catch (err) {
      mostrar('Error al actualizar el estatus', 'error')
    }
  }

  const handleEliminar = async (id) => {
    if (!confirm('¿Eliminar permanentemente este usuario?')) return
    try {
      await api.delete(`/usuarios/${id}`)
      cargarUsuarios()
      mostrar('Usuario eliminado correctamente')
    } catch (err) {
      mostrar('Error al eliminar el usuario', 'error')
    }
  }

  const usuariosFiltrados = usuarios.filter(u => {
    const nombre = `${u.nombre} ${u.apellido}`.toLowerCase()
    const matchBusqueda = nombre.includes(busqueda.toLowerCase()) ||
                          u.email.toLowerCase().includes(busqueda.toLowerCase())
    const matchEstatus = filtroEstatus ? u.estatus === filtroEstatus : true
    const matchRol = filtroRol ? u.roles?.some(r => r.nombre_rol === filtroRol) : true
    return matchBusqueda && matchEstatus && matchRol
  })

  const handleEditarClick = (u) => {
    setEditando(u.id_usuario)
    setFormEdit({
      nombre: u.nombre || '',
      apellido: u.apellido || '',
      email: u.email || '',
      telefono: u.telefono || '',
      password: ''
    })
  }
  
  const handleGuardarEdit = async (id) => {
  try {
    const data = { ...formEdit }
    if (!data.password) delete data.password
    await api.put(`/usuarios/${id}`, data)
    setEditando(null)
    cargarUsuarios()
    mostrar('Usuario actualizado correctamente')
  } catch (err) {
    mostrar('Error al actualizar el usuario', 'error')
  }
}

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Usuarios</h2>
        <button onClick={() => setMostrarForm(true)}
          className="bg-[#D94218] hover:bg-[#B83510] text-white px-4 py-2 rounded-lg text-sm transition">
          + Nuevo usuario
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl shadow p-4 mb-4 grid grid-cols-1 md:grid-cols-3 gap-3">
        <input type="text" placeholder="Buscar por nombre o email..."
          value={busqueda} onChange={e => setBusqueda(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#D94218]" />
        <select value={filtroEstatus} onChange={e => setFiltroEstatus(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#D94218]">
          <option value="">Todos los estatus</option>
          <option value="activo">Activo</option>
          <option value="inactivo">Inactivo</option>
        </select>
        <select value={filtroRol} onChange={e => setFiltroRol(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#D94218]">
          <option value="">Todos los roles</option>
          <option value="admin">Administrador</option>
          <option value="organizacion">Organización</option>
        </select>
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        {cargando ? (
          <p className="p-6 text-gray-400">Cargando...</p>
        ) : usuariosFiltrados.length === 0 ? (
          <p className="p-6 text-gray-400">No hay usuarios registrados.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-6 py-3 text-gray-600 font-medium">Nombre</th>
                <th className="text-left px-6 py-3 text-gray-600 font-medium">Email</th>
                <th className="text-left px-6 py-3 text-gray-600 font-medium">Teléfono</th>
                <th className="text-left px-6 py-3 text-gray-600 font-medium">Rol</th>
                <th className="text-left px-6 py-3 text-gray-600 font-medium">Estatus</th>
                <th className="text-left px-6 py-3 text-gray-600 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
  {usuariosFiltrados.map(u => (
    <tr key={u.id_usuario} className="hover:bg-gray-50">
      {editando === u.id_usuario ? (
        <>
          <td className="px-4 py-2">
            <div className="flex gap-2">
              <input name="nombre" value={formEdit.nombre}
                onChange={e => setFormEdit({...formEdit, nombre: e.target.value})}
                className="w-full border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-[#D94218]"
                placeholder="Nombre" />
              <input name="apellido" value={formEdit.apellido}
                onChange={e => setFormEdit({...formEdit, apellido: e.target.value})}
                className="w-full border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-[#D94218]"
                placeholder="Apellido" />
            </div>
          </td>
          <td className="px-4 py-2">
            <input name="email" type="email" value={formEdit.email}
              onChange={e => setFormEdit({...formEdit, email: e.target.value})}
              className="w-full border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-[#D94218]" />
          </td>
          <td className="px-4 py-2">
            <input name="telefono" value={formEdit.telefono}
              onChange={e => setFormEdit({...formEdit, telefono: e.target.value})}
              className="w-full border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-[#D94218]"
              placeholder="Teléfono" />
          </td>
          <td className="px-4 py-2">
            <input name="password" type="password" value={formEdit.password}
              onChange={e => setFormEdit({...formEdit, password: e.target.value})}
              className="w-full border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-[#D94218]"
              placeholder="Nueva contraseña (opcional)" />
          </td>
          <td className="px-4 py-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              u.estatus === 'activo' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {u.estatus}
            </span>
          </td>
          <td className="px-4 py-2">
            <div className="flex gap-2 items-center">
              <button onClick={() => handleGuardarEdit(u.id_usuario)}
                className="text-xs text-white px-2 py-1 rounded"
                style={{ background: '#D94218' }}>
                Guardar
              </button>
              <button onClick={() => setEditando(null)}
                className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 border border-gray-300 rounded">
                Cancelar
              </button>
            </div>
          </td>
        </>
      ) : (
        <>
          <td className="px-6 py-3 font-medium">{u.nombre} {u.apellido}</td>
          <td className="px-6 py-3 text-gray-500">{u.email}</td>
          <td className="px-6 py-3 text-gray-500">{u.telefono || '—'}</td>
          <td className="px-6 py-3">
            {u.roles?.map(r => (
              <span key={r.id_rol} className={`px-2 py-1 rounded-full text-xs font-medium mr-1 ${
                r.nombre_rol === 'admin' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
              }`}>
                {r.nombre_rol === 'admin' ? 'Administrador' : 'Organización'}
              </span>
            ))}
          </td>
          <td className="px-6 py-3">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              u.estatus === 'activo' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {u.estatus}
            </span>
          </td>
          <td className="px-6 py-3">
            <div className="flex gap-2 items-center">
              <button onClick={() => handleEditarClick(u)}
                className="text-[#D94218] hover:text-[#B83510] text-xs font-medium"
                title="Editar usuario">
                ✏️
              </button>
              <button onClick={() => handleToggleEstatus(u)}
                className={`text-xs font-medium ${
                  u.estatus === 'activo' ? 'text-yellow-500 hover:text-yellow-700' : 'text-green-500 hover:text-green-700'
                }`}
                title={u.estatus === 'activo' ? 'Desactivar' : 'Activar'}>
                {u.estatus === 'activo' ? '⏸' : '▶'}
              </button>
              <button onClick={() => handleEliminar(u.id_usuario)}
                className="text-red-400 hover:text-red-600 transition"
                title="Eliminar usuario">
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

      {/* Modal nuevo usuario */}
      {mostrarForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-800">Nuevo Administrador</h3>
              <button onClick={() => setMostrarForm(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>

            {error && (
              <div className="mx-6 mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                  <input name="nombre" value={form.nombre} onChange={handleChange} required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#D94218]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Apellido</label>
                  <input name="apellido" value={form.apellido} onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#D94218]" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input name="email" type="email" value={form.email} onChange={handleChange} required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#D94218]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña *</label>
                <input name="password" type="password" value={form.password} onChange={handleChange} required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#D94218]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                <input name="telefono" value={form.telefono} onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#D94218]" />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setMostrarForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition">
                  Cancelar
                </button>
                <button type="submit" disabled={guardando}
                  className="px-4 py-2 bg-[#D94218] hover:bg-[#B83510] text-white rounded-lg text-sm transition disabled:opacity-50">
                  {guardando ? 'Guardando...' : 'Guardar usuario'}
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