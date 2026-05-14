import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const menuAdmin = [
  { path: '/dashboard', label: 'Dashboard', icon: '📊' },
  { path: '/organizaciones', label: 'Organizaciones', icon: '🏢' },
  { path: '/proyectos', label: 'Proyectos', icon: '📋' },
  { path: '/evaluaciones', label: 'Evaluaciones', icon: '✅' },
  { path: '/usuarios', label: 'Usuarios', icon: '👥' },
  { path: '/categorias', label: 'Categorías', icon: '🏷️' },
]

const menuOrganizacion = [
  { path: '/mi-organizacion', label: 'Mi Organización', icon: '🏢' },
  { path: '/mis-proyectos', label: 'Mis Proyectos', icon: '📋' },
]

export default function Sidebar() {
  const { logout, usuario, esAdmin } = useAuth()
  const menu = esAdmin() ? menuAdmin : menuOrganizacion

  return (
    <aside className="w-64 min-h-screen flex flex-col" style={{ background: '#1A1A2E' }}>
      {/* Logo */}
      <div className="p-6 border-b" style={{ borderColor: '#2A2A3E' }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
            style={{ background: '#D94218' }}>
            HR
          </div>
          <div>
            <h1 className="text-white text-base font-bold">Home Runs</h1>
            <p className="text-xs" style={{ color: '#9CA3AF' }}>Gestión de Proyectos</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {menu.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition ${
                isActive
                  ? 'text-white font-medium'
                  : 'text-gray-400 hover:text-white'
              }`
            }
            style={({ isActive }) => isActive ? { background: '#D94218' } : {}}
          >
            <span>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t" style={{ borderColor: '#2A2A3E' }}>
        <p className="text-xs mb-0.5 font-medium text-white">{usuario?.nombre} {usuario?.apellido}</p>
        <p className="text-xs mb-3" style={{ color: '#9CA3AF' }}>
          {esAdmin() ? 'Administrador' : 'Organización'}
        </p>
        <button
          onClick={logout}
          className="w-full text-white text-sm py-2 rounded-lg transition"
          style={{ background: '#D94218' }}
          onMouseEnter={e => e.target.style.background = '#B83510'}
          onMouseLeave={e => e.target.style.background = '#D94218'}>
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}