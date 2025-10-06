"use client"

import { useQuery } from '@tanstack/react-query'
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

export const useGroups = () => {
  return useQuery({
    queryKey: ['groups'],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/api/groups`)
      return response.data.data
    },
    refetchInterval: 30000, // Refetch cada 30 segundos
  })
}

export const useChats = () => {
  return useQuery({
    queryKey: ['chats'],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/api/groups/chats`)
      return response.data.data
    },
    refetchInterval: 30000,
  })
}

export const useGroupParticipants = (groupId: string | null) => {
  return useQuery({
    queryKey: ['group-participants', groupId],
    queryFn: async () => {
      if (!groupId) return []
      const response = await axios.get(`${API_URL}/api/groups/${groupId}/participants`)
      return response.data.data
    },
    enabled: !!groupId,
  })
}
