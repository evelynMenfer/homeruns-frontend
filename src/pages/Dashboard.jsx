import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import api from '../api/axios'

export default function Dashboard() {
  const [stats, setStats] = useState({
    proyectos: 0,
    en_revision: 0,
    aprobados: 0,
    organizaciones: 0
  })

  useEffect(() => {
    const cargarStats = async () => {
      try {
        const [proyectos, organizaciones] = await Promise.all([
          api.get('/proyectos'),
          api.get('/organizaciones')
        ])
        const data = proyectos.data.data
        setStats({
          proyectos: proyectos.data.total,
          en_revision: data.filter(p => p.estado_actual === 'En revision').length,
          aprobados: data.filter(p => p.estado_actual === 'Aprobado').length,
          organizaciones: organizaciones.data.total
        })
      } catch (err) {
        console.error(err)
      }
    }
    cargarStats()
  }, [])

  const tarjetas = [
    { label: 'Proyectos totales', valor: stats.proyectos, color: 'text-blue-900' },
    { label: 'En revisión', valor: stats.en_revision, color: 'text-yellow-500' },
    { label: 'Aprobados', valor: stats.aprobados, color: 'text-green-500' },
    { label: 'Organizaciones', valor: stats.organizaciones, color: 'text-purple-500' },
  ]

  return (
    <Layout>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Panel de control</h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {tarjetas.map(t => (
          <div key={t.label} className="bg-white rounded-xl shadow p-5">
            <p className="text-sm text-gray-500">{t.label}</p>
            <p className={`text-3xl font-bold mt-1 ${t.color}`}>{t.valor}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Actividad reciente</h3>
        <p className="text-gray-400 text-sm">No hay actividad reciente.</p>
      </div>
    </Layout>
  )
}