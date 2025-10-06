"use client"

import { useQuery } from '@tanstack/react-query'
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

export const useStats = () => {
  return useQuery({
    queryKey: ['stats'],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/api/stats`)
      return response.data.data
    },
    refetchInterval: 5000, // Refetch cada 5 segundos
  })
}
