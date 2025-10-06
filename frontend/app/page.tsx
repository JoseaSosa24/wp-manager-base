"use client"

import { useSocket } from '@/hooks/useSocket'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/Card'
import { Button } from '@/components/Button'
import { MessageSquare, Users, BarChart3, Radio } from 'lucide-react'
import Link from 'next/link'
import { Badge } from '@/components/Badge'

export default function HomePage() {
  const { status, isConnected } = useSocket()

  const features = [
    {
      title: 'Mensajes',
      description: 'Envía mensajes individuales o masivos',
      icon: MessageSquare,
      href: '/messages',
      color: 'text-blue-500'
    },
    {
      title: 'Grupos',
      description: 'Administra tus grupos y menciona participantes',
      icon: Users,
      href: '/groups',
      color: 'text-green-500'
    },
    {
      title: 'Estadísticas',
      description: 'Visualiza el rendimiento de tus mensajes',
      icon: BarChart3,
      href: '/stats',
      color: 'text-purple-500'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                WhatsApp Manager
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Administra tus grupos y canales de WhatsApp
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant={isConnected ? 'success' : 'destructive'}>
                <Radio className={`w-3 h-3 mr-1 ${isConnected ? 'animate-pulse' : ''}`} />
                {isConnected ? 'Conectado' : 'Desconectado'}
              </Badge>
              {status.isReady && (
                <Badge variant="success">
                  WhatsApp Listo
                </Badge>
              )}
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {features.map((feature) => (
            <Link key={feature.href} href={feature.href}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <feature.icon className={`w-12 h-12 mb-4 ${feature.color}`} />
                  <CardTitle>{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full">
                    Acceder
                  </Button>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {!status.isReady && (
          <Card className="border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20">
            <CardHeader>
              <CardTitle className="text-yellow-800 dark:text-yellow-200">
                ⚠️ WhatsApp no conectado
              </CardTitle>
              <CardDescription className="text-yellow-700 dark:text-yellow-300">
                Para usar la aplicación, primero debes conectar tu cuenta de WhatsApp
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/qr">
                <Button variant="default">
                  Conectar WhatsApp
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
