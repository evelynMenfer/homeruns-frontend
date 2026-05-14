import Layout from '../components/Layout'
import { Link } from 'react-router-dom'

export default function DashboardOrganizacion() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="rounded-2xl p-8 mb-6 text-white" style={{ background: '#D94218' }}>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center"
              style={{ minWidth: '64px' }}>
              <span className="text-2xl font-bold" style={{ color: '#D94218' }}>HR</span>
            </div>
            <h1 className="text-3xl font-bold uppercase tracking-wide">
              Registro Home Runs 2025
            </h1>
          </div>

          <p className="text-sm leading-relaxed mb-2">
            Bienvenido al <strong>Programa Home Runs Banamex 2025</strong>,
            organizado por la <strong>Fundación Alfredo Harp Helú Oaxaca</strong> en colaboración con{' '}
            <strong>Fomento Social Banamex</strong>. Este sistema tiene como objetivo{' '}
            <strong>agilizar el registro y recopilación de información</strong> de las organizaciones
            y municipios interesados en participar.
          </p>
          <p className="text-sm leading-relaxed">
            Por favor, completa todos los campos solicitados y <strong>adjunta los documentos requeridos</strong>{' '}
            según el tipo de entidad que representa.
          </p>
        </div>

        {/* Info cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-start gap-3 mb-4">
              <span className="text-xl">ℹ️</span>
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Importante</h3>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Algunos campos y requisitos se mostrarán u ocultarán automáticamente según tus respuestas (por ejemplo, si eres una asociación civil o un municipio).</li>
                  <li>• Asegúrate de contar con los siguientes documentos antes de iniciar:</li>
                </ul>
              </div>
            </div>
            <ul className="text-sm text-gray-600 space-y-2 ml-8">
              <li className="flex items-center gap-2">
                <span style={{ color: '#D94218' }}>•</span>
                Oficio de solicitud membretado
              </li>
              <li className="flex items-center gap-2">
                <span style={{ color: '#D94218' }}>•</span>
                Identificación oficial del responsable
              </li>
              <li className="flex items-center gap-2">
                <span style={{ color: '#D94218' }}>•</span>
                En caso de municipios: constancia de mayoría y oficio firmado por autoridades
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-xl shadow p-6 space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-lg" style={{ background: '#FEF2F2' }}>
              <span className="text-xl">🕐</span>
              <div>
                <p className="text-xs text-gray-500">Fecha límite de recepción de solicitudes</p>
                <p className="text-sm font-semibold text-gray-800 italic">15 de mayo de 2026</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg" style={{ background: '#FEF2F2' }}>
              <span className="text-xl">✉️</span>
              <div>
                <p className="text-xs text-gray-500">Si tienes dudas, escríbenos a</p>
                <a href="mailto:homeruns@fahho.mx" className="text-sm font-semibold"
                  style={{ color: '#D94218' }}>
                  homeruns@fahho.mx
                </a>
              </div>
            </div>

            <div className="border-t pt-4 space-y-2">
              <p className="text-xs font-medium text-gray-600 mb-2">Accesos rápidos</p>
              <Link to="/mi-organizacion"
                className="flex items-center gap-2 p-2 rounded-lg text-sm text-white transition"
                style={{ background: '#D94218' }}>
                🏢 Completar datos de mi organización
              </Link>
              <Link to="/mis-proyectos"
                className="flex items-center gap-2 p-2 rounded-lg text-sm transition"
                style={{ background: '#FEF2F2', color: '#D94218' }}>
                📋 Ver mis proyectos
              </Link>
            </div>
          </div>

        </div>
      </div>
    </Layout>
  )
}