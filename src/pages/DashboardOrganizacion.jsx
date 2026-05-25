import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import { Link } from 'react-router-dom'
import api from '../api/axios'

export default function DashboardOrganizacion() {
  const [config, setConfig] = useState(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    api.get('/configuracion').then(res => {
      setConfig(res.data)
    }).catch(err => {
      console.error(err)
    }).finally(() => {
      setCargando(false)
    })
  }, [])

  if (cargando) return <Layout><p className="text-gray-400">Cargando...</p></Layout>

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="rounded-2xl p-8 mb-6 text-white" style={{ background: '#D94218' }}>
          <div className="flex items-center gap-4 mb-6">
            {config?.logo_path ? (
              <img src={`http://127.0.0.1:8000/storage/${config.logo_path}`}
                alt="Logo" className="w-16 h-16 rounded-xl object-contain bg-white p-1" />
            ) : (
              <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center"
                style={{ minWidth: '64px' }}>
                <span className="text-2xl font-bold" style={{ color: '#D94218' }}>HR</span>
              </div>
            )}
            <h1 className="text-3xl font-bold uppercase tracking-wide">
              Registro Home Runs {config?.anio_convocatoria || '2026'}
              {/*Registro {config?.nombre_programa || 'Home Runs'} {config?.anio_convocatoria || '2026'}*/}
            </h1>
          </div>

          <p className="text-sm leading-relaxed mb-2">
            {config?.texto_bienvenida}
          </p>
        </div>

        {/* Info cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-start gap-3">
              <span className="text-xl">ℹ️</span>
              <div> 
                <h3 className="font-semibold text-gray-800 mb-2">Importante</h3>
                <div className="text-sm text-gray-600 whitespace-pre-line">
                  {config?.aviso}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-6 space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-lg" style={{ background: '#FEF2F2' }}>
              <span className="text-xl">🕐</span>
              <div>
                <p className="text-xs text-gray-500">Fecha límite de recepción de solicitudes</p>
                <p className="text-sm font-semibold text-gray-800 italic">
                  {config?.fecha_limite}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg" style={{ background: '#FEF2F2' }}>
              <span className="text-xl">✉️</span>
              <div>
                <p className="text-xs text-gray-500">Si tienes dudas, escríbenos a</p>
                <a href={`mailto:${config?.email_contacto}`} className="text-sm font-semibold"
                  style={{ color: '#D94218' }}>
                  {config?.email_contacto}
                </a>
              </div>
            </div>

            <div className="border-t pt-4 space-y-2">
              <p className="text-xs font-medium text-gray-600 mb-2">Accesos rápidos</p>
              <Link to="/mi-organizacion"
                className="flex items-center gap-2 p-2 rounded-lg text-sm text-white transition"
                style={{ background: '#FEF2F2', color: '#D94218' }}>
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