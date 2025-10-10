"use client"

import { useState } from 'react'
import { LogOut, User, Settings, ChevronDown, AlertTriangle } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from './Button'
import { Modal } from './Modal'

export const UserMenu = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const { logout } = useAuth()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogoutClick = () => {
    setIsOpen(false)
    setShowLogoutModal(true)
  }

  const handleLogout = async () => {
    setIsLoggingOut(true)
    await logout()
    // No necesitamos setIsLoggingOut(false) porque se redirigirá
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-blue-500 flex items-center justify-center">
          <User className="w-5 h-5 text-white" />
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-600 dark:text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          {/* Overlay para cerrar el menú */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Menú desplegable */}
          <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-20 overflow-hidden">
            <div className="p-3 border-b border-gray-200 dark:border-gray-700">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                WhatsApp Manager
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Sesión activa
              </p>
            </div>

            <div className="p-1">
              <button
                onClick={() => {
                  setIsOpen(false)
                  // Aquí podrías agregar navegación a configuración
                }}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
              >
                <Settings className="w-4 h-4" />
                <span>Configuración</span>
              </button>

              <button
                onClick={handleLogoutClick}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Desconectar</span>
              </button>
            </div>

            <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Al desconectar se cerrará tu sesión de WhatsApp
              </p>
            </div>
          </div>
        </>
      )}

      {/* Modal de confirmación de logout */}
      <Modal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        title="¿Cerrar sesión?"
        description="Esta acción desconectará tu cuenta de WhatsApp"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => setShowLogoutModal(false)}
              disabled={isLoggingOut}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              {isLoggingOut ? (
                <>Desconectando...</>
              ) : (
                <>
                  <LogOut className="w-4 h-4 mr-2" />
                  Desconectar
                </>
              )}
            </Button>
          </>
        }
      >
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          <div className="flex-1">
            <p className="text-gray-700 dark:text-gray-300 mb-3">
              Al cerrar sesión se desconectará WhatsApp y se eliminarán todos los datos de autenticación.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Tendrás que escanear el código QR nuevamente para volver a conectar.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  )
}
