"use client"

import { useSocket } from '@/hooks/useSocket'
import { Badge } from './Badge'
import { UserMenu } from './UserMenu'
import { Radio, Bell, Settings, Search } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/Tooltip'
import { Button } from './Button'
import { cn } from '@/utils/cn'

export const Header = () => {
  const { status, isConnected } = useSocket()

  return (
    <header className="glass sticky top-0 z-30 border-b backdrop-blur-lg bg-background/80">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="h-16 flex items-center justify-between gap-4">
          {/* Left Section - Spacer for Sidebar on Desktop */}
          <div className="flex-1 lg:flex-none lg:w-20" />

          {/* Center Section - Search (optional) */}
          <div className="hidden md:flex flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                placeholder="Buscar grupos, canales..."
                className="w-full h-9 pl-9 pr-4 rounded-lg border bg-background/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
          </div>

          {/* Right Section - Status & Actions */}
          <div className="flex items-center gap-2">
            <TooltipProvider delayDuration={300}>
              {/* Connection Status */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "relative h-9 w-9 p-0",
                      isConnected && "text-success"
                    )}
                  >
                    <Radio className={cn(
                      "w-4 h-4",
                      isConnected && "animate-pulse"
                    )} />
                    {isConnected && (
                      <span className="absolute top-1 right-1 w-2 h-2 bg-success rounded-full border-2 border-background" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent sideOffset={8} className="text-xs py-1 px-2">
                  <p className="font-medium">
                    {isConnected ? 'WhatsApp Conectado' : 'WhatsApp Desconectado'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {status.isReady ? 'Listo para enviar' : 'Esperando conexión'}
                  </p>
                </TooltipContent>
              </Tooltip>

              {/* Notifications */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="relative h-9 w-9 p-0"
                  >
                    <Bell className="w-4 h-4" />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full border-2 border-background" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent sideOffset={8} className="text-xs py-1 px-2">
                  <p className="font-medium">Notificaciones</p>
                  <p className="text-xs text-muted-foreground">3 mensajes pendientes</p>
                </TooltipContent>
              </Tooltip>

              {/* Settings */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 w-9 p-0"
                  >
                    <Settings className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent sideOffset={8} className="text-xs py-1 px-2">
                  <p className="font-medium">Configuración</p>
                  <p className="text-xs text-muted-foreground">Ajustes del sistema</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* User Menu */}
            {status.isReady && (
              <div className="ml-2 pl-2 border-l">
                <UserMenu />
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
