"use client"

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  Users,
  Radio,
  MessageSquare,
  BarChart3,
  QrCode,
  Menu,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { cn } from '@/utils/cn'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/Tooltip'

interface NavItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  description: string
}

const navigation: NavItem[] = [
  {
    name: 'Dashboard',
    href: '/',
    icon: Home,
    description: 'Panel principal'
  },
  {
    name: 'Grupos',
    href: '/groups',
    icon: Users,
    description: 'Gestionar grupos'
  },
  {
    name: 'Canales',
    href: '/channels',
    icon: Radio,
    description: 'Gestionar canales'
  },
  {
    name: 'Mensajes',
    href: '/messages',
    icon: MessageSquare,
    description: 'Enviar mensajes'
  },
  {
    name: 'Estadísticas',
    href: '/stats',
    icon: BarChart3,
    description: 'Ver estadísticas'
  },
  {
    name: 'Conexión',
    href: '/qr',
    icon: QrCode,
    description: 'Conectar WhatsApp'
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-lg bg-background/80 backdrop-blur-sm border shadow-lg hover:bg-accent transition-colors"
        aria-label="Toggle menu"
      >
        {isMobileOpen ? (
          <X className="w-5 h-5" />
        ) : (
          <Menu className="w-5 h-5" />
        )}
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-40 h-screen transition-all duration-300 ease-in-out",
          "bg-background/95 backdrop-blur-lg border-r shadow-xl",
          "flex flex-col",
          // Mobile styles
          "lg:translate-x-0",
          isMobileOpen ? "translate-x-0" : "-translate-x-full",
          // Desktop width
          isCollapsed ? "lg:w-20" : "lg:w-64",
          // Mobile width
          "w-64"
        )}
      >
        {/* Header/Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b">
          <div className={cn(
            "flex items-center gap-3 overflow-hidden transition-all",
            isCollapsed && "lg:opacity-0"
          )}>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center flex-shrink-0">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-sm truncate">WP Manager</span>
              <span className="text-xs text-muted-foreground truncate">Admin Panel</span>
            </div>
          </div>

          {/* Desktop Collapse Toggle */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex p-1.5 rounded-lg hover:bg-accent transition-colors"
            aria-label={isCollapsed ? "Expandir sidebar" : "Contraer sidebar"}
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-2">
          <ul className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href

              const NavLink = (
                <Link
                  href={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group relative overflow-hidden w-full",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "hover:bg-accent hover:shadow-sm",
                    isCollapsed && "lg:justify-center lg:px-2"
                  )}
                >
                  {/* Active indicator */}
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary-foreground rounded-r-full" />
                  )}

                  {/* Icon */}
                  <Icon className={cn(
                    "w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-110",
                    isActive && "scale-110"
                  )} />

                  {/* Label */}
                  <span className={cn(
                    "font-medium text-sm truncate transition-all",
                    isCollapsed && "lg:hidden"
                  )}>
                    {item.name}
                  </span>

                  {/* Hover effect */}
                  {!isActive && (
                    <span className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                  )}
                </Link>
              )

              return (
                <li key={item.name}>
                  {/* Desktop con tooltip cuando está colapsado */}
                  <div className="hidden lg:block">
                    {isCollapsed ? (
                      <TooltipProvider delayDuration={300}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            {NavLink}
                          </TooltipTrigger>
                          <TooltipContent
                            side="right"
                            sideOffset={8}
                            className="text-xs py-1 px-2 font-medium"
                          >
                            {item.name}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ) : (
                      NavLink
                    )}
                  </div>

                  {/* Mobile sin tooltip */}
                  <div className="lg:hidden">
                    {NavLink}
                  </div>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Footer Info */}
        <div className={cn(
          "border-t p-4 transition-all",
          isCollapsed && "lg:p-2"
        )}>
          <div className={cn(
            "flex items-center gap-3",
            isCollapsed && "lg:justify-center"
          )}>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-white">WP</span>
            </div>
            <div className={cn(
              "flex flex-col min-w-0",
              isCollapsed && "lg:hidden"
            )}>
              <span className="text-xs font-medium truncate">WhatsApp Business</span>
              <span className="text-xs text-muted-foreground truncate">Conectado</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Spacer for content */}
      <div className={cn(
        "transition-all duration-300",
        isCollapsed ? "lg:w-20" : "lg:w-64"
      )} />
    </>
  )
}
