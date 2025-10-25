"use client"

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { toast } from 'sonner'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

// ============================================
// QUERIES (Consultas)
// ============================================

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

export const useGroupInfo = (groupId: string | null) => {
  return useQuery({
    queryKey: ['group-info', groupId],
    queryFn: async () => {
      if (!groupId) return null
      const response = await axios.get(`${API_URL}/api/groups/${groupId}`)
      return response.data.data
    },
    enabled: !!groupId,
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

export const useGroupStats = (groupId: string | null) => {
  return useQuery({
    queryKey: ['group-stats', groupId],
    queryFn: async () => {
      if (!groupId) return null
      const response = await axios.get(`${API_URL}/api/groups/${groupId}/stats`)
      return response.data.data
    },
    enabled: !!groupId,
  })
}

export const useGroupInviteCode = (groupId: string | null) => {
  return useQuery({
    queryKey: ['group-invite', groupId],
    queryFn: async () => {
      if (!groupId) return null
      const response = await axios.get(`${API_URL}/api/groups/${groupId}/invite`)
      return response.data.data
    },
    enabled: !!groupId,
  })
}

// ============================================
// MUTATIONS (Acciones)
// ============================================

export const useLeaveGroup = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (groupId: string) => {
      const response = await axios.delete(`${API_URL}/api/groups/${groupId}`)
      return response.data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['groups'] })
      toast.success(data.message || 'Has salido del grupo exitosamente')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Error al salir del grupo')
    }
  })
}

export const useAddParticipants = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ groupId, participants }: { groupId: string; participants: string[] }) => {
      const response = await axios.post(`${API_URL}/api/groups/${groupId}/participants`, {
        participants
      })
      return response.data
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['group-participants', variables.groupId] })
      queryClient.invalidateQueries({ queryKey: ['group-info', variables.groupId] })
      toast.success(data.message || 'Participantes añadidos exitosamente')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Error al añadir participantes')
    }
  })
}

export const useRemoveParticipant = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ groupId, participantId }: { groupId: string; participantId: string }) => {
      const response = await axios.delete(
        `${API_URL}/api/groups/${groupId}/participants/${participantId}`
      )
      return response.data
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['group-participants', variables.groupId] })
      queryClient.invalidateQueries({ queryKey: ['group-info', variables.groupId] })
      toast.success(data.message || 'Participante eliminado exitosamente')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Error al eliminar participante')
    }
  })
}

export const usePromoteParticipants = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ groupId, participants }: { groupId: string; participants: string[] }) => {
      const response = await axios.post(`${API_URL}/api/groups/${groupId}/promote`, {
        participants
      })
      return response.data
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['group-participants', variables.groupId] })
      toast.success(data.message || 'Participantes promocionados a admin')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Error al promocionar participantes')
    }
  })
}

export const useDemoteParticipants = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ groupId, participants }: { groupId: string; participants: string[] }) => {
      const response = await axios.post(`${API_URL}/api/groups/${groupId}/demote`, {
        participants
      })
      return response.data
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['group-participants', variables.groupId] })
      toast.success(data.message || 'Admins degradados a miembros')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Error al degradar participantes')
    }
  })
}

export const useUpdateGroupName = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ groupId, name }: { groupId: string; name: string }) => {
      const response = await axios.put(`${API_URL}/api/groups/${groupId}/name`, { name })
      return response.data
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['groups'] })
      queryClient.invalidateQueries({ queryKey: ['group-info', variables.groupId] })
      toast.success(data.message || 'Nombre actualizado exitosamente')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Error al actualizar nombre')
    }
  })
}

export const useUpdateGroupDescription = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ groupId, description }: { groupId: string; description: string }) => {
      const response = await axios.put(`${API_URL}/api/groups/${groupId}/description`, {
        description
      })
      return response.data
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['group-info', variables.groupId] })
      toast.success(data.message || 'Descripción actualizada exitosamente')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Error al actualizar descripción')
    }
  })
}

export const useRevokeGroupInvite = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (groupId: string) => {
      const response = await axios.post(`${API_URL}/api/groups/${groupId}/invite/revoke`)
      return response.data
    },
    onSuccess: (data, groupId) => {
      queryClient.invalidateQueries({ queryKey: ['group-invite', groupId] })
      toast.success(data.message || 'Código de invitación revocado')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Error al revocar invitación')
    }
  })
}
