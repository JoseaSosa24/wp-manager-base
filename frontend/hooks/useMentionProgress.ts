"use client"

import { useState, useEffect } from 'react'
import { io, Socket } from 'socket.io-client'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

interface MentionProgress {
  groupId: string
  status: 'started' | 'progress' | 'completed' | 'error'
  totalParticipants?: number
  mentionedCount?: number
  currentBatch?: number
  totalBatches?: number
  progress?: number
  batches?: number
  error?: string
}

export const useMentionProgress = () => {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [progress, setProgress] = useState<MentionProgress | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    const socketInstance = io(API_URL)

    socketInstance.on('connect', () => {
      setIsConnected(true)
      console.log('Socket conectado para progreso de menciones')
    })

    socketInstance.on('disconnect', () => {
      setIsConnected(false)
      console.log('Socket desconectado')
    })

    socketInstance.on('mention_progress', (data: MentionProgress) => {
      setProgress(data)
    })

    setSocket(socketInstance)

    return () => {
      socketInstance.disconnect()
    }
  }, [])

  const resetProgress = () => {
    setProgress(null)
  }

  return {
    progress,
    isConnected,
    resetProgress
  }
}