"use client"

import { useSocket } from '@/hooks/useSocket'
import { Badge } from './Badge'
import { UserMenu } from './UserMenu'
import { Radio, MessageSquare, Users, BarChart3, Home } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export const Header = () => {
  const { status, isConnected } = useSocket()
  const pathname = usePathname()

  const navItems = [
    { href: '/', label: 'Inicio', icon: Home },
    { href: '/messages', label: 'Mensajes', icon: MessageSquare },
    { href: '/groups', label: 'Grupos', icon: Users },
    { href: '/channels', label: 'Canales', icon: Radio },
    { href: '/stats', label: 'Estadísticas', icon: BarChart3 }
  ]

  return (
    <header className="glass sticky top-0 z-50 border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  WhatsApp Manager
                </h1>
                <p className="text-xs text-muted-foreground">
                  Gestión profesional de mensajes
                </p>
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-2">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`
                      flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
                      ${isActive
                        ? 'bg-primary text-primary-foreground shadow-md'
                        : 'text-muted-foreground hover:bg-secondary hover:text-secondary-foreground'
                      }
                    `}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <Badge
              variant={isConnected ? 'success' : 'destructive'}
              className="hidden sm:flex"
            >
              <Radio className={`w-3 h-3 mr-1.5 ${isConnected ? 'animate-pulse' : ''}`} />
              {isConnected ? 'Conectado' : 'Desconectado'}
            </Badge>

            {status.isReady && (
              <Badge variant="success" className="hidden sm:flex">
                WhatsApp Listo
              </Badge>
            )}

            {status.isReady && <UserMenu />}
          </div>
        </div>
      </div>
    </header>
  )
}
