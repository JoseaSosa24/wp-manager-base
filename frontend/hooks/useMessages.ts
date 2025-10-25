"use client"

import { useState } from 'react'
import axios from 'axios'
import { toast } from 'sonner'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

interface SendMessageParams {
  chatId: string
  message: string
  file?: File | null
  linkPreview?: boolean
}

interface BulkMessageParams {
  recipients: string[]
  message: string
  file?: File | null
  linkPreview?: boolean
}

interface MentionAllParams {
  groupId: string
  message: string
  messages?: string[] // Array de mensajes personalizados por lote
  file?: File | null
  linkPreview?: boolean
}

interface CreatePollParams {
  chatId: string
  pollName: string
  pollOptions: { name: string }[]
  mentionAll?: boolean
}

export const useMessages = () => {
  const [loading, setLoading] = useState(false)

  const sendMessage = async ({ chatId, message, file, linkPreview = true }: SendMessageParams) => {
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('chatId', chatId)
      formData.append('message', message || '')
      formData.append('linkPreview', linkPreview.toString())

      if (file) {
        formData.append('file', file)
      }

      const response = await axios.post(`${API_URL}/api/messages/send`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      const successMsg = file ? 'Mensaje con archivo enviado correctamente' : 'Mensaje enviado correctamente'
      toast.success(successMsg)
      return response.data
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al enviar mensaje')
      throw error
    } finally {
      setLoading(false)
    }
  }

  const sendBulkMessages = async ({ recipients, message, file, linkPreview = true }: BulkMessageParams) => {
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('recipients', JSON.stringify(recipients))
      formData.append('message', message || '')
      formData.append('linkPreview', linkPreview.toString())

      if (file) {
        formData.append('file', file)
      }

      const response = await axios.post(`${API_URL}/api/messages/bulk`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      const successMsg = file
        ? `Mensajes con archivo enviados: ${response.data.data.successful}/${response.data.data.total}`
        : `Mensajes enviados: ${response.data.data.successful}/${response.data.data.total}`

      toast.success(successMsg)
      return response.data
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al enviar mensajes')
      throw error
    } finally {
      setLoading(false)
    }
  }

  const mentionAll = async ({ groupId, message, messages, file, linkPreview = true }: MentionAllParams) => {
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('groupId', groupId)
      formData.append('message', message || '')
      formData.append('linkPreview', linkPreview.toString())

      // Agregar array de mensajes personalizados si existe
      if (messages && messages.length > 0) {
        formData.append('messages', JSON.stringify(messages))
        console.log('📝 Enviando', messages.length, 'mensajes personalizados al backend')
      }

      if (file) {
        formData.append('file', file)
      }

      const response = await axios.post(`${API_URL}/api/messages/mention-all`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      const result = response.data.data

      // Manejar mensaje cuando hay warning (fallback sin menciones)
      if (result.warning && result.mentionedCount === 0) {
        const warningMsg = file
          ? `⚠️ Mensaje con archivo enviado al grupo (${result.warning})`
          : `⚠️ Mensaje enviado al grupo (${result.warning})`
        toast.success(warningMsg)
      } else {
        const successMsg = file
          ? `Mensaje con archivo enviado a ${result.mentionedCount} participantes`
          : `Mención enviada a ${result.mentionedCount} participantes`
        toast.success(successMsg)
      }
      return response.data
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al mencionar todos')
      throw error
    } finally {
      setLoading(false)
    }
  }

  const createPoll = async ({ chatId, pollName, pollOptions, mentionAll }: CreatePollParams) => {
    setLoading(true)
    try {
      const response = await axios.post(`${API_URL}/api/messages/poll`, {
        chatId,
        pollName,
        pollOptions,
        mentionAll
      })

      toast.success('Encuesta creada correctamente')
      return response.data
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al crear la encuesta')
      throw error
    } finally {
      setLoading(false)
    }
  }

  const sendToChannel = async ({ chatId: channelId, message, file, linkPreview = true }: SendMessageParams) => {
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('channelId', channelId)
      formData.append('message', message || '')
      formData.append('linkPreview', linkPreview.toString())

      if (file) {
        formData.append('file', file)
      }

      const response = await axios.post(`${API_URL}/api/messages/channel`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      const successMsg = file ? 'Mensaje con archivo enviado al canal' : 'Mensaje enviado al canal'
      toast.success(successMsg)
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
    createPoll,
    sendToChannel,
    getLinkPreview
  }
}
