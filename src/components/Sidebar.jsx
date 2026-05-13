import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const menu = [
  { path: '/dashboard', label: 'Dashboard', icon: '📊' },
  { path: '/organizaciones', label: 'Organizaciones', icon: '🏢' },
  { path: '/proyectos', label: 'Proyectos', icon: '📋' },
  { path: '/evaluaciones', label: 'Evaluaciones', icon: '✅' },
  { path: '/usuarios', label: 'Usuarios', icon: '👥' },
  { path: '/categorias', label: 'Categorías', icon: '🏷️' },
]

export default function Sidebar() {
  const { logout, usuario } = useAuth()

  return (
    <aside className="w-64 bg-blue-900 min-h-screen flex flex-col">
      <div className="p-6 border-b border-blue-800">
        <h1 className="text-white text-xl font-bold">Homeruns</h1>
        <p className="text-blue-300 text-xs mt-1">Gestión de Proyectos</p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {menu.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition ${
                isActive
                  ? 'bg-blue-700 text-white font-medium'
                  : 'text-blue-200 hover:bg-blue-800 hover:text-white'
              }`
            }
          >
            <span>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-blue-800">
        <p className="text-blue-300 text-xs mb-3">{usuario?.nombre} {usuario?.apellido}</p>
        <button
          onClick={logout}
          className="w-full bg-blue-800 hover:bg-blue-700 text-white text-sm py-2 rounded-lg transition"
        >
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}