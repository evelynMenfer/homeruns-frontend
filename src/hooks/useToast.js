import { useState } from 'react'

export default function useToast() {
  const [toast, setToast] = useState(null)

  const mostrar = (mensaje, tipo = 'exito') => {
    setToast({ mensaje, tipo })
  }

  const cerrar = () => setToast(null)

  return { toast, mostrar, cerrar }
}