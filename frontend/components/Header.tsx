"use client"

import { useSocket } from '@/hooks/useSocket'
import { Badge } from './Badge'
import { UserMenu } from './UserMenu'
import { Radio } from 'lucide-react'

export const Header = () => {
  const { status, isConnected } = useSocket()

  return (
    <header className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 sticky top-0 z-50 backdrop-blur-sm bg-opacity-90">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              WhatsApp Manager
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Administra tus grupos y canales
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Badge de estado de conexión */}
            <Badge variant={isConnected ? 'success' : 'destructive'}>
              <Radio className={`w-3 h-3 mr-1 ${isConnected ? 'animate-pulse' : ''}`} />
              {isConnected ? 'Conectado' : 'Desconectado'}
            </Badge>

            {/* Badge de WhatsApp listo */}
            {status.isReady && (
              <Badge variant="success">
                WhatsApp Listo
              </Badge>
            )}

            {/* Menú de usuario - solo mostrar si WhatsApp está conectado */}
            {status.isReady && <UserMenu />}
          </div>
        </div>
      </div>
    </header>
  )
}
