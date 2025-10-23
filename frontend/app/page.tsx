"use client"

import { useSocket } from '@/hooks/useSocket'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/Card'
import { Button } from '@/components/Button'
import { Header } from '@/components/Header'
import { MessageSquare, Users, BarChart3, Sparkles, TrendingUp, Zap, ArrowRight, QrCode } from 'lucide-react'
import Link from 'next/link'

export default function HomePage() {
  const { status } = useSocket()

  const features = [
    {
      title: 'Mensajes',
      description: 'Envía mensajes individuales, masivos o a canales con archivos adjuntos',
      icon: MessageSquare,
      href: '/messages',
      gradient: 'from-blue-500 to-cyan-500',
      bgGradient: 'from-blue-500/10 to-cyan-500/10',
      stats: 'Envío rápido y eficiente'
    },
    {
      title: 'Grupos',
      description: 'Administra grupos y menciona a todos los participantes de forma organizada',
      icon: Users,
      href: '/groups',
      gradient: 'from-green-500 to-emerald-500',
      bgGradient: 'from-green-500/10 to-emerald-500/10',
      stats: 'Gestión completa'
    },
    {
      title: 'Estadísticas',
      description: 'Monitorea el rendimiento y analiza métricas de tus mensajes en tiempo real',
      icon: BarChart3,
      href: '/stats',
      gradient: 'from-purple-500 to-pink-500',
      bgGradient: 'from-purple-500/10 to-pink-500/10',
      stats: 'Análisis en vivo'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <Header />

      <div className="container mx-auto px-4 py-12">
        <div className="mb-12 text-center animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            <span>Plataforma de Gestión Profesional</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            Gestiona tu WhatsApp
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Potencia tu comunicación con herramientas profesionales para envío masivo, gestión de grupos y análisis detallado
          </p>
        </div>

        {!status.isReady && (
          <Card className="border-2 border-warning/50 bg-gradient-to-br from-warning/10 to-orange-500/10 mb-8 animate-fade-in">
            <CardHeader>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-warning/20 flex items-center justify-center flex-shrink-0">
                  <QrCode className="w-6 h-6 text-warning" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-xl mb-2 flex items-center gap-2">
                    Conecta tu WhatsApp
                    <Zap className="w-5 h-5 text-warning" />
                  </CardTitle>
                  <CardDescription className="text-base">
                    Para comenzar a usar todas las funcionalidades, escanea el código QR con tu cuenta de WhatsApp
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Link href="/qr">
                <Button size="lg" className="group">
                  Conectar ahora
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {features.map((feature) => (
            <Link key={feature.href} href={feature.href} className="group">
              <Card className={`
                h-full card-hover border-2 relative overflow-hidden
                ${!status.isReady ? 'opacity-60 pointer-events-none' : ''}
              `}>
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

                <CardHeader className="relative">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>

                  <CardTitle className="text-2xl mb-2 group-hover:text-primary transition-colors">
                    {feature.title}
                  </CardTitle>

                  <CardDescription className="text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="relative">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                      <TrendingUp className="w-4 h-4" />
                      {feature.stats}
                    </span>
                    <ArrowRight className="w-5 h-5 text-primary group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {status.isReady && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                    <Zap className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Estado</p>
                    <p className="font-semibold">Sistema Operativo</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">WhatsApp</p>
                    <p className="font-semibold">Conectado y Listo</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Funciones</p>
                    <p className="font-semibold">Todas Disponibles</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
