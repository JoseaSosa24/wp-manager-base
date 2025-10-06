"use client"

import { useEffect } from 'react'
import { useSocket } from '@/hooks/useSocket'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/Card'
import { Button } from '@/components/Button'
import { ArrowLeft, CheckCircle2, Loader2 } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export default function QRPage() {
  const { qrCode, status, requestQR, isConnected } = useSocket()

  useEffect(() => {
    if (isConnected && !qrCode && !status.isReady) {
      requestQR()
    }
  }, [isConnected, qrCode, status.isReady, requestQR])

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <Link href="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
        </Link>

        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Conectar WhatsApp</CardTitle>
              <CardDescription>
                Escanea el código QR con tu aplicación de WhatsApp
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-8">
                {!isConnected && (
                  <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
                    <p className="text-muted-foreground">Conectando al servidor...</p>
                  </div>
                )}

                {isConnected && !qrCode && !status.isReady && (
                  <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
                    <p className="text-muted-foreground">Generando código QR...</p>
                  </div>
                )}

                {qrCode && (
                  <div className="text-center">
                    <div className="bg-white p-4 rounded-lg shadow-lg mb-6 inline-block">
                      <Image
                        src={qrCode}
                        alt="QR Code"
                        width={300}
                        height={300}
                        className="rounded"
                      />
                    </div>
                    <div className="space-y-2 text-sm text-muted-foreground max-w-md">
                      <p className="font-semibold text-foreground">Instrucciones:</p>
                      <ol className="text-left space-y-1 list-decimal list-inside">
                        <li>Abre WhatsApp en tu teléfono</li>
                        <li>Ve a Configuración → Dispositivos vinculados</li>
                        <li>Toca en "Vincular un dispositivo"</li>
                        <li>Escanea este código QR</li>
                      </ol>
                    </div>
                  </div>
                )}

                {status.isReady && (
                  <div className="text-center">
                    <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">¡Conectado correctamente!</h3>
                    <p className="text-muted-foreground mb-6">
                      Tu cuenta de WhatsApp está lista para usar
                    </p>
                    <Link href="/">
                      <Button size="lg">
                        Ir al Dashboard
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
