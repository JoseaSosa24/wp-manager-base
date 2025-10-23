import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'sonner';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export interface ChannelMetadata {
  creationTime: number;
  inviteCode: string;
  size: number; // número de suscriptores
  verified: boolean;
  privacy: 'public' | 'private';
  website: string | null;
  adminCount: number;
  suspended: boolean;
  geosuspended: boolean;
  terminated: boolean;
  createdAtTs: number;
}

export interface Channel {
  id: string;
  name: string;
  description: string;
  isOwner: boolean;
  membershipType: 'owner' | 'admin' | 'subscriber';
  isSubscriber: boolean;
  timestamp: number;
  verified: boolean;
  metadata: ChannelMetadata;
}

interface CreateChannelData {
  title: string;
  description?: string;
  file?: File | null;
}

interface SearchChannelsData {
  searchText: string;
  skipSubscribed?: boolean;
  limit?: number;
  countryCodes?: string[];
}

// Hook para obtener todos los canales del usuario
export const useChannels = () => {
  return useQuery<Channel[]>({
    queryKey: ['channels'],
    queryFn: async () => {
      const { data } = await axios.get(`${API_URL}/api/channels`);
      return data.data;
    },
    refetchInterval: 30000 // Refetch cada 30 segundos
  });
};

// Hook para crear un canal
export const useCreateChannel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (channelData: CreateChannelData) => {
      const formData = new FormData();
      formData.append('title', channelData.title);

      if (channelData.description) {
        formData.append('description', channelData.description);
      }

      if (channelData.file) {
        formData.append('file', channelData.file);
      }

      const { data } = await axios.post(`${API_URL}/api/channels/create`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['channels'] });
      toast.success('Canal creado exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Error al crear el canal');
    }
  });
};

// Hook para buscar canales públicos
export const useSearchChannels = () => {
  return useMutation({
    mutationFn: async (searchData: SearchChannelsData) => {
      const { data } = await axios.post(`${API_URL}/api/channels/search`, searchData);
      return data.data;
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Error al buscar canales');
    }
  });
};

// Hook para suscribirse a un canal
export const useSubscribeChannel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (channelId: string) => {
      const { data } = await axios.post(`${API_URL}/api/channels/subscribe`, { channelId });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['channels'] });
      toast.success('Te has suscrito al canal');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Error al suscribirse');
    }
  });
};

// Hook para desuscribirse de un canal
export const useUnsubscribeChannel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ channelId, deleteLocal }: { channelId: string; deleteLocal?: boolean }) => {
      const { data } = await axios.post(`${API_URL}/api/channels/unsubscribe`, {
        channelId,
        deleteLocal
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['channels'] });
      toast.success('Te has desuscrito del canal');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Error al desuscribirse');
    }
  });
};

// Hook para eliminar un canal (solo propietario)
export const useDeleteChannel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (channelId: string) => {
      const { data } = await axios.delete(`${API_URL}/api/channels/${channelId}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['channels'] });
      toast.success('Canal eliminado exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Error al eliminar el canal');
    }
  });
};

// Hook para obtener canal por código de invitación
export const useGetChannelByInvite = () => {
  return useMutation({
    mutationFn: async (inviteCode: string) => {
      const { data } = await axios.get(`${API_URL}/api/channels/invite/${inviteCode}`);
      return data.data;
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Error al obtener el canal');
    }
  });
};
