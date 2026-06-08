import { useEffect } from 'react'

export default function Toast({ mensaje, tipo = 'exito', onCerrar }) {
  useEffect(() => {
    const timer = setTimeout(onCerrar, 3000)
    return () => clearTimeout(timer)
  }, [])

  const estilos = {
    exito: 'bg-green-50 border-green-400 text-green-700',
    error: 'bg-red-50 border-red-400 text-red-700',
    info: 'bg-blue-50 border-blue-400 text-blue-700',
    advertencia: 'bg-yellow-50 border-yellow-400 text-yellow-700',
  }

  const iconos = {
    exito: '✅',
    error: '❌',
    info: 'ℹ️',
    advertencia: '⚠️',
  }

  return (
<div className={`fixed top-4 right-4 z-[200] flex items-center gap-3 px-4 py-3 border rounded-lg shadow-lg text-sm max-w-sm ${estilos[tipo]}`}>      <span>{iconos[tipo]}</span>
      <p className="flex-1">{mensaje}</p>
      <button onClick={onCerrar} className="text-gray-400 hover:text-gray-600 ml-2">✕</button>
    </div>
  )
}