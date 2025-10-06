"use client"

import { useState } from 'react'
import axios from 'axios'
import { toast } from 'sonner'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

interface SendMessageParams {
  chatId: string
  message: string
}

interface BulkMessageParams {
  recipients: string[]
  message: string
}

interface MentionAllParams {
  groupId: string
  message: string
}

export const useMessages = () => {
  const [loading, setLoading] = useState(false)

  const sendMessage = async ({ chatId, message }: SendMessageParams) => {
    setLoading(true)
    try {
      const response = await axios.post(`${API_URL}/api/messages/send`, {
        chatId,
        message
      })

      toast.success('Mensaje enviado correctamente')
      return response.data
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al enviar mensaje')
      throw error
    } finally {
      setLoading(false)
    }
  }

  const sendBulkMessages = async ({ recipients, message }: BulkMessageParams) => {
    setLoading(true)
    try {
      const response = await axios.post(`${API_URL}/api/messages/bulk`, {
        recipients,
        message
      })

      toast.success(`Mensajes enviados: ${response.data.data.successful}/${response.data.data.total}`)
      return response.data
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al enviar mensajes')
      throw error
    } finally {
      setLoading(false)
    }
  }

  const mentionAll = async ({ groupId, message }: MentionAllParams) => {
    setLoading(true)
    try {
      const response = await axios.post(`${API_URL}/api/messages/mention-all`, {
        groupId,
        message
      })

      toast.success(`Mención enviada a ${response.data.data.mentionedCount} participantes`)
      return response.data
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al mencionar todos')
      throw error
    } finally {
      setLoading(false)
    }
  }

  const sendToChannel = async ({ channelId, message }: SendMessageParams) => {
    setLoading(true)
    try {
      const response = await axios.post(`${API_URL}/api/messages/channel`, {
        channelId,
        message
      })

      toast.success('Mensaje enviado al canal')
      return response.data
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al enviar mensaje al canal')
      throw error
    } finally {
      setLoading(false)
    }
  }

  const getLinkPreview = async (url: string) => {
    try {
      const response = await axios.get(`${API_URL}/api/messages/preview`, {
        params: { url }
      })

      return response.data.data
    } catch (error: any) {
      console.error('Error al obtener preview:', error)
      return null
    }
  }

  return {
    loading,
    sendMessage,
    sendBulkMessages,
    mentionAll,
    sendToChannel,
    getLinkPreview
  }
}
