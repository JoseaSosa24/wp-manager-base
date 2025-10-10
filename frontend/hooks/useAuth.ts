"use client"

import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export const useAuth = () => {
  const router = useRouter()

  const logout = useCallback(async () => {
    try {
      // Llamar al endpoint de logout
      const response = await fetch('http://localhost:4000/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Error al cerrar sesión')
      }

      // Limpiar localStorage
      if (typeof window !== 'undefined') {
        localStorage.clear()
        sessionStorage.clear()
      }

      // Mostrar notificación de éxito
      toast.success('Sesión cerrada correctamente', {
        description: 'WhatsApp ha sido desconectado'
      })

      // Redirigir a la página de QR
      router.push('/qr')
      router.refresh()

    } catch (error) {
      console.error('Error al cerrar sesión:', error)
      toast.error('Error al cerrar sesión', {
        description: 'Por favor, intenta nuevamente'
      })
    }
  }, [router])

  return {
    logout
  }
}
