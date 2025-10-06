"use client"

import { useEffect, useState } from 'react'
import { io, Socket } from 'socket.io-client'

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000'

interface WhatsAppStatus {
  isReady: boolean
  hasQR: boolean
}

export const useSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [status, setStatus] = useState<WhatsAppStatus>({ isReady: false, hasQR: false })

  useEffect(() => {
    const socketInstance = io(SOCKET_URL)

    socketInstance.on('connect', () => {
      console.log('Socket conectado')
      setIsConnected(true)
    })

    socketInstance.on('disconnect', () => {
      console.log('Socket desconectado')
      setIsConnected(false)
    })

    socketInstance.on('qr', (data: { qr: string }) => {
      console.log('QR recibido')
      setQrCode(data.qr)
    })

    socketInstance.on('ready', (data: { message: string }) => {
      console.log('WhatsApp ready:', data.message)
      setStatus({ isReady: true, hasQR: false })
      setQrCode(null)
    })

    socketInstance.on('authenticated', () => {
      console.log('WhatsApp autenticado')
    })

    socketInstance.on('auth_failure', (data: { error: string }) => {
      console.error('Error de autenticación:', data.error)
    })

    socketInstance.on('disconnected', (data: { reason: string }) => {
      console.log('WhatsApp desconectado:', data.reason)
      setStatus({ isReady: false, hasQR: false })
    })

    socketInstance.on('status', (data: WhatsAppStatus) => {
      setStatus(data)
    })

    setSocket(socketInstance)

    return () => {
      socketInstance.disconnect()
    }
  }, [])

  const requestQR = () => {
    if (socket) {
      socket.emit('request_qr')
    }
  }

  return {
    socket,
    isConnected,
    qrCode,
    status,
    requestQR
  }
}
