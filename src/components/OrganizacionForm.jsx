import { useState } from 'react'
import api from '../api/axios'

export default function OrganizacionForm({ onGuardado, onCancelar }) {
  const [tipo, setTipo] = useState('AC')
  const [form, setForm] = useState({
    rfc: '', telefono: '', email: '', direccion_fiscal: '', participo_antes: 'N'
  })
  const [detalle, setDetalle] = useState({
    // AC
    razon_social: '', nombre_representante: '', telefono_representante: '', email_representante: '',
    pagina_web: '', objeto_social: '', metas_institucionales: '', descripcion_general: '',
    problematica: '', num_empleados: '', presupuesto_anual: '', principales_donantes: '',
    // Municipio
    nombre_municipio: '', nombre_presidente: '', telefono_presidente: '',
    nombre_sindico: '', telefono_sindico: '', periodo_gestion: '',
    actividad_economica: '', logros_alcanzados: '',
    // Contador (AC y Municipio)
    nombre_contador: '', telefono_contador: '', email_contador: ''
  })
  const [cartaIntencion, setCartaIntencion] = useState(null)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')

  const inputClass = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#D94218]"

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleDetalle = (e) => {
    setDetalle({ ...detalle, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!cartaIntencion) {
      setError('La carta de intención es obligatoria para registrar la organización')
      return
    }

    setCargando(true)
    setError('')
    try {
      const formData = new FormData()
      formData.append('tipo_organizacion', tipo)
      formData.append('rfc', form.rfc)
      formData.append('telefono', form.telefono)
      formData.append('email', form.email)
      formData.append('direccion_fiscal', form.direccion_fiscal)
      formData.append('participo_antes', form.participo_antes)
      formData.append('carta_intencion', cartaIntencion)

      if (tipo === 'AC') {
        formData.append('asociacion_civil[razon_social]', detalle.razon_social)
        formData.append('asociacion_civil[nombre_representante]', detalle.nombre_representante)
        formData.append('asociacion_civil[telefono_representante]', detalle.telefono_representante)
        formData.append('asociacion_civil[email_representante]', detalle.email_representante)
        formData.append('asociacion_civil[pagina_web]', detalle.pagina_web)
        formData.append('asociacion_civil[objeto_social]', detalle.objeto_social)
        formData.append('asociacion_civil[metas_institucionales]', detalle.metas_institucionales)
        formData.append('asociacion_civil[descripcion_general]', detalle.descripcion_general)
        formData.append('asociacion_civil[problematica]', detalle.problematica)
        formData.append('asociacion_civil[num_empleados]', detalle.num_empleados)
        formData.append('asociacion_civil[presupuesto_anual]', detalle.presupuesto_anual)
        formData.append('asociacion_civil[principales_donantes]', detalle.principales_donantes)
        formData.append('asociacion_civil[nombre_contador]', detalle.nombre_contador)
        formData.append('asociacion_civil[telefono_contador]', detalle.telefono_contador)
        formData.append('asociacion_civil[email_contador]', detalle.email_contador)
      } else {
        formData.append('municipio[nombre_municipio]', detalle.nombre_municipio)
        formData.append('municipio[nombre_presidente]', detalle.nombre_presidente)
        formData.append('municipio[telefono_presidente]', detalle.telefono_presidente)
        formData.append('municipio[nombre_sindico]', detalle.nombre_sindico)
        formData.append('municipio[telefono_sindico]', detalle.telefono_sindico)
        formData.append('municipio[periodo_gestion]', detalle.periodo_gestion)
        formData.append('municipio[actividad_economica]', detalle.actividad_economica)
        formData.append('municipio[logros_alcanzados]', detalle.logros_alcanzados)
        formData.append('municipio[nombre_contador]', detalle.nombre_contador)
        formData.append('municipio[telefono_contador]', detalle.telefono_contador)
        formData.append('municipio[email_contador]', detalle.email_contador)
      }

      await api.post('/organizaciones', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      onGuardado()
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar')
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-screen overflow-y-auto">
        <div className="p-6 border-b flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-800">Nueva Organización</h3>
          <button onClick={onCancelar} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>

        {error && (
          <div className="mx-6 mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Tipo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de organización</label>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" value="AC" checked={tipo === 'AC'} onChange={() => setTipo('AC')} />
                <span className="text-sm">Asociación Civil</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" value="MUNICIPIO" checked={tipo === 'MUNICIPIO'} onChange={() => setTipo('MUNICIPIO')} />
                <span className="text-sm">Municipio</span>
              </label>
            </div>
          </div>

          {/* Datos generales */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">RFC</label>
              <input name="rfc" value={form.rfc} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
              <input name="telefono" value={form.telefono} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">¿Participó antes?</label>
              <select name="participo_antes" value={form.participo_antes} onChange={handleChange} className={inputClass}>
                <option value="N">No</option>
                <option value="S">Sí</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Dirección fiscal</label>
            <textarea name="direccion_fiscal" value={form.direccion_fiscal} onChange={handleChange} rows={2} className={inputClass} />
          </div>

          {/* Campos AC */}
          {tipo === 'AC' && (
            <div className="space-y-4 border-t pt-4">
              <h4 className="font-medium text-gray-700">Datos de Asociación Civil</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la Institución</label>
                  <input name="razon_social" value={detalle.razon_social} onChange={handleDetalle} className={inputClass} />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Página web</label>
                  <input name="pagina_web" value={detalle.pagina_web} onChange={handleDetalle} className={inputClass} placeholder="https://..." />
                </div>
              </div>

              {/* Representante legal */}
              <div className="border-t pt-3">
                <h5 className="text-sm font-medium text-gray-600 mb-3">Representante legal</h5>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                    <input name="nombre_representante" value={detalle.nombre_representante} onChange={handleDetalle} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                    <input name="telefono_representante" value={detalle.telefono_representante} onChange={handleDetalle} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Correo</label>
                    <input name="email_representante" type="email" value={detalle.email_representante} onChange={handleDetalle} className={inputClass} />
                  </div>
                </div>
              </div>

              {/* Contador */}
              <div className="border-t pt-3">
                <h5 className="text-sm font-medium text-gray-600 mb-3">Datos del contador</h5>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                    <input name="nombre_contador" value={detalle.nombre_contador} onChange={handleDetalle} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                    <input name="telefono_contador" value={detalle.telefono_contador} onChange={handleDetalle} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Correo</label>
                    <input name="email_contador" type="email" value={detalle.email_contador} onChange={handleDetalle} className={inputClass} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">¿Cuál es el número de empleados con el que operan?</label>
                  <input name="num_empleados" type="number" value={detalle.num_empleados} onChange={handleDetalle} className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">¿Cuál es su presupuesto anual?</label>
                  <input name="presupuesto_anual" type="number" value={detalle.presupuesto_anual} onChange={handleDetalle} className={inputClass} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Objeto social(acta constitutiva) y cómo se relaciona con el proyecto que presenta</label>
                <textarea name="objeto_social" value={detalle.objeto_social} onChange={handleDetalle} rows={2} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mencione las metas institucionales</label>
                <textarea name="metas_institucionales" value={detalle.metas_institucionales} onChange={handleDetalle} rows={2} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción general de los proyectos y avtividades que ejecuta la institución que presenta su objeto social</label>
                <textarea name="descripcion_general" value={detalle.descripcion_general} onChange={handleDetalle} rows={2} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Enliste a sus Principales donantes</label>
                <textarea name="principales_donantes" value={detalle.principales_donantes} onChange={handleDetalle} rows={2} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Defina la problemática que su propuesta de proyecto busca atender </label>
                <textarea name="problematica" value={detalle.problematica} onChange={handleDetalle} rows={2} className={inputClass} />
              </div>
            </div>
          )}

          {/* Campos Municipio */}
          {tipo === 'MUNICIPIO' && (
            <div className="space-y-4 border-t pt-4">
              <h4 className="font-medium text-gray-700">Datos del Municipio</h4>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del municipio</label>
                <input name="nombre_municipio" value={detalle.nombre_municipio} onChange={handleDetalle} className={inputClass} />
              </div>

              {/* Presidente */}
              <div className="border-t pt-3">
                <h5 className="text-sm font-medium text-gray-600 mb-3">Presidente municipal</h5>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                    <input name="nombre_presidente" value={detalle.nombre_presidente} onChange={handleDetalle} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                    <input name="telefono_presidente" value={detalle.telefono_presidente} onChange={handleDetalle} className={inputClass} />
                  </div>
                </div>
              </div>

              {/* Síndico */}
              <div className="border-t pt-3">
                <h5 className="text-sm font-medium text-gray-600 mb-3">Síndico municipal</h5>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                    <input name="nombre_sindico" value={detalle.nombre_sindico} onChange={handleDetalle} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                    <input name="telefono_sindico" value={detalle.telefono_sindico} onChange={handleDetalle} className={inputClass} />
                  </div>
                </div>
              </div>

              {/* Contador */}
              <div className="border-t pt-3">
                <h5 className="text-sm font-medium text-gray-600 mb-3">Datos del contador</h5>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                    <input name="nombre_contador" value={detalle.nombre_contador} onChange={handleDetalle} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                    <input name="telefono_contador" value={detalle.telefono_contador} onChange={handleDetalle} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Correo</label>
                    <input name="email_contador" type="email" value={detalle.email_contador} onChange={handleDetalle} className={inputClass} />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Periodo de gestión administrativa</label>
                <input name="periodo_gestion" value={detalle.periodo_gestion} onChange={handleDetalle} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">¿Cuál es la principal actividad económica de su municipio?</label>
                <textarea name="actividad_economica" value={detalle.actividad_economica} onChange={handleDetalle} rows={2} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mencione los logros alcanzados en su administración</label>
                <textarea name="logros_alcanzados" value={detalle.logros_alcanzados} onChange={handleDetalle} rows={2} className={inputClass} />
              </div>
            </div>
          )}

          {/* Carta de intención */}
          <div className="border-t pt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Carta de intención <span className="text-red-500">*</span>
            </label>
            <p className="text-xs text-gray-500 mb-2">Sube tu carta de intención en formato PDF, JPG o PNG (máx. 10MB)</p>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => setCartaIntencion(e.target.files[0])}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#D94218] file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:font-medium file:bg-[#D94218] file:text-white hover:file:bg-[#B83510] cursor-pointer"
            />
            {cartaIntencion && (
              <p className="text-xs text-green-600 mt-1">✅ {cartaIntencion.name}</p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button type="button" onClick={onCancelar}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition">
              Cancelar
            </button>
            <button type="submit" disabled={cargando || !cartaIntencion}
              className="px-4 py-2 text-white rounded-lg text-sm transition disabled:opacity-50"
              style={{ background: cartaIntencion ? '#D94218' : '#9CA3AF' }}>
              {cargando ? 'Guardando...' : 'Guardar organización'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}