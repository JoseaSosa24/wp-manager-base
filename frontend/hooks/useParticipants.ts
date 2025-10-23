"use client"

import { useState, useCallback } from 'react'
import axios from 'axios'
import { toast } from 'sonner'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

interface Participant {
  id: string
  isAdmin: boolean
  isSuperAdmin: boolean
}

export const useParticipants = () => {
  const [loading, setLoading] = useState(false)
  const [participants, setParticipants] = useState<Participant[]>([])

  const getParticipants = useCallback(async (groupId: string) => {
    setLoading(true)
    try {
      const response = await axios.get(`${API_URL}/api/groups/${groupId}/participants`)
      const participantData = response.data.data
      setParticipants(participantData)
      return participantData
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al obtener los participantes')
      setParticipants([])
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    loading,
    participants,
    getParticipants
  }
}
