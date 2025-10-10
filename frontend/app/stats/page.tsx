"use client"

import { useStats } from '@/hooks/useStats'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/Card'
import { Button } from '@/components/Button'
import { Badge } from '@/components/Badge'
import { Header } from '@/components/Header'
import { ArrowLeft, TrendingUp, Send, AlertCircle, Users, Loader2, BarChart3 } from 'lucide-react'
import Link from 'next/link'
import { formatDateTime } from '@/utils/formatTime'

export default function StatsPage() {
  const { data: stats, isLoading, refetch } = useStats()

  const statCards = [
    {
      title: 'Mensajes Enviados',
      value: stats?.messagesSent || 0,
      icon: Send,
      color: 'text-green-500',
      bgColor: 'bg-green-100 dark:bg-green-900/20'
    },
    {
      title: 'Mensajes Fallidos',
      value: stats?.messagesFailed || 0,
      icon: AlertCircle,
      color: 'text-red-500',
      bgColor: 'bg-red-100 dark:bg-red-900/20'
    },
    {
      title: 'Grupos Activos',
      value: stats?.activeGroups || 0,
      icon: Users,
      color: 'text-blue-500',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20'
    },
    {
      title: 'Tasa de Éxito',
      value: `${stats?.successRate || 0}%`,
      icon: TrendingUp,
      color: 'text-purple-500',
      bgColor: 'bg-purple-100 dark:bg-purple-900/20'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <Link href="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
        </Link>

        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold flex items-center gap-2 mb-2">
                  <BarChart3 className="w-8 h-8" />
                  Estadísticas
                </h1>
                <p className="text-muted-foreground">
                  Monitorea el rendimiento de tus mensajes
                </p>
              </div>
              <Button onClick={() => refetch()} variant="outline">
                Actualizar
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-12 h-12 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {/* Cards de estadísticas */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {statCards.map((stat) => (
                  <Card key={stat.title}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-1">
                            {stat.title}
                          </p>
                          <p className="text-3xl font-bold">{stat.value}</p>
                        </div>
                        <div className={`p-3 rounded-full ${stat.bgColor}`}>
                          <stat.icon className={`w-6 h-6 ${stat.color}`} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Detalles adicionales */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Resumen General</CardTitle>
                    <CardDescription>Información detallada del sistema</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center pb-3 border-b">
                      <span className="text-sm text-muted-foreground">Total de mensajes</span>
                      <Badge variant="secondary">
                        {(stats?.messagesSent || 0) + (stats?.messagesFailed || 0)}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b">
                      <span className="text-sm text-muted-foreground">Grupos activos</span>
                      <Badge variant="secondary">{stats?.activeGroups || 0}</Badge>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b">
                      <span className="text-sm text-muted-foreground">Canales activos</span>
                      <Badge variant="secondary">{stats?.activeChannels || 0}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Total de chats</span>
                      <Badge variant="secondary">{stats?.totalChats || 0}</Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Rendimiento</CardTitle>
                    <CardDescription>Métricas de efectividad</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-muted-foreground">Tasa de éxito</span>
                        <span className="text-sm font-semibold">{stats?.successRate || 0}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                        <div
                          className="bg-green-500 h-2.5 rounded-full transition-all"
                          style={{ width: `${stats?.successRate || 0}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            <span className="text-sm">Exitosos</span>
                          </div>
                          <span className="text-sm font-semibold">{stats?.messagesSent || 0}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                            <span className="text-sm">Fallidos</span>
                          </div>
                          <span className="text-sm font-semibold">{stats?.messagesFailed || 0}</span>
                        </div>
                      </div>
                    </div>

                    {stats?.lastUpdate && (
                      <div className="pt-4 border-t">
                        <p className="text-xs text-muted-foreground">
                          Última actualización: {formatDateTime(stats.lastUpdate)}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
