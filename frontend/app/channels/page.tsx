"use client"

import { useState } from 'react'
import { useChannels, useCreateChannel, useSearchChannels, useSubscribeChannel, useUnsubscribeChannel, useDeleteChannel } from '@/hooks/useChannels'
import { Card, CardContent } from '@/components/Card'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import { Textarea } from '@/components/Textarea'
import { Header } from '@/components/Header'
import { FileUploader } from '@/components/FileUploader'
import { Modal } from '@/components/Modal'
import { DataList, DataStack } from '@/components/DataList'
import { EmptyState } from '@/components/EmptyState'
import { SkeletonCard } from '@/components/Skeleton'
import { DataControls } from '@/components/DataControls'
import { ChannelListItem } from '@/components/ChannelListItem'
import { Radio, Plus, Search, Loader2, Trash2, CheckCircle } from 'lucide-react'
import { useMemo } from 'react'

export default function ChannelsPage() {
  const { data: channels, isLoading, refetch } = useChannels()
  const createChannel = useCreateChannel()
  const searchChannels = useSearchChannels()
  const subscribeChannel = useSubscribeChannel()
  const unsubscribeChannel = useUnsubscribeChannel()
  const deleteChannel = useDeleteChannel()

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showSearchModal, setShowSearchModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null)

  // View mode y filtros
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchFilter, setSearchFilter] = useState('')
  const [sortBy, setSortBy] = useState('name')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  // Formulario de creación
  const [newChannelTitle, setNewChannelTitle] = useState('')
  const [newChannelDescription, setNewChannelDescription] = useState('')
  const [newChannelImage, setNewChannelImage] = useState<File | null>(null)

  // Búsqueda de canales públicos
  const [searchText, setSearchText] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])

  const handleCreateChannel = async () => {
    if (!newChannelTitle.trim()) return

    await createChannel.mutateAsync({
      title: newChannelTitle,
      description: newChannelDescription,
      file: newChannelImage
    })

    // Limpiar formulario
    setNewChannelTitle('')
    setNewChannelDescription('')
    setNewChannelImage(null)
    setShowCreateModal(false)
  }

  const handleSearchChannels = async () => {
    if (!searchText.trim()) return

    const results = await searchChannels.mutateAsync({
      searchText,
      skipSubscribed: false,
      limit: 50
    })

    setSearchResults(results || [])
  }

  const handleSubscribe = async (channelId: string) => {
    await subscribeChannel.mutateAsync(channelId)
    // Actualizar resultados de búsqueda
    if (searchText) {
      await handleSearchChannels()
    }
  }

  const handleUnsubscribe = async (channelId: string) => {
    await unsubscribeChannel.mutateAsync({ channelId, deleteLocal: false })
  }

  const handleDeleteChannel = async () => {
    if (!selectedChannelId) return

    await deleteChannel.mutateAsync(selectedChannelId)
    setShowDeleteModal(false)
    setSelectedChannelId(null)
  }

  // Todos los canales retornados son administrados por el usuario
  const adminChannels = channels || []

  // Filtrar y ordenar canales
  const filteredAndSortedChannels = useMemo(() => {
    let result = [...adminChannels]

    // Filtrar por búsqueda
    if (searchFilter) {
      result = result.filter(channel =>
        channel.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
        channel.description.toLowerCase().includes(searchFilter.toLowerCase())
      )
    }

    // Ordenar
    result.sort((a, b) => {
      let comparison = 0

      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name)
          break
        case 'subscribers':
          comparison = a.metadata.size - b.metadata.size
          break
        case 'date':
          comparison = a.timestamp - b.timestamp
          break
        default:
          comparison = 0
      }

      return sortDirection === 'asc' ? comparison : -comparison
    })

    return result
  }, [adminChannels, searchFilter, sortBy, sortDirection])

  const handleSortChange = (value: string, direction: 'asc' | 'desc') => {
    setSortBy(value)
    setSortDirection(direction)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <Header />

      <div className="container mx-auto px-2 sm:px-4 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Mis Canales de WhatsApp
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base">
            Administra tus canales, envía mensajes, crea encuestas y comparte contenido con tu audiencia
          </p>
        </div>

        <div className="mb-4 sm:mb-6">
          <Button
            onClick={() => setShowCreateModal(true)}
            size="lg"
            className="group w-full sm:w-auto"
          >
            <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform" />
            Crear Nuevo Canal
          </Button>
        </div>
        <DataList
          title="Mis Canales"
          description={`${filteredAndSortedChannels.length} de ${adminChannels.length} canal${adminChannels.length !== 1 ? 'es' : ''}`}
          count={filteredAndSortedChannels.length}
          isLoading={isLoading}
          isEmpty={!isLoading && adminChannels.length === 0}
          onRefresh={refetch}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          emptyState={
            <EmptyState
              icon={Radio}
              title="No tienes canales"
              description="Crea tu primer canal para empezar a compartir contenido con tu audiencia"
              action={{
                label: "Crear Nuevo Canal",
                onClick: () => setShowCreateModal(true)
              }}
            />
          }
        >
          {/* Controles de búsqueda y ordenamiento */}
          {!isLoading && adminChannels.length > 0 && (
            <div className="mb-4">
              <DataControls
                searchPlaceholder="Buscar canales..."
                searchValue={searchFilter}
                onSearchChange={setSearchFilter}
                sortOptions={[
                  { value: 'name', label: 'Nombre' },
                  { value: 'subscribers', label: 'Suscriptores' },
                  { value: 'date', label: 'Fecha de creación' }
                ]}
                sortValue={sortBy}
                sortDirection={sortDirection}
                onSortChange={handleSortChange}
              />
            </div>
          )}

          {isLoading ? (
            <DataStack>
              {[1, 2, 3].map((i) => (
                <SkeletonCard key={i} />
              ))}
            </DataStack>
          ) : filteredAndSortedChannels.length === 0 && searchFilter ? (
            <EmptyState
              icon={Search}
              title="No se encontraron canales"
              description={`No hay canales que coincidan con "${searchFilter}"`}
            />
          ) : (
            <DataStack>
              {filteredAndSortedChannels.map((channel) => (
                <ChannelListItem
                  key={channel.id}
                  channel={channel}
                  viewMode={viewMode}
                  onDelete={(channelId) => {
                    setSelectedChannelId(channelId)
                    setShowDeleteModal(true)
                  }}
                />
              ))}
            </DataStack>
          )}
        </DataList>
      </div>

      {/* Modal Crear Canal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Crear Nuevo Canal"
        description="Crea un canal para compartir actualizaciones con tu audiencia"
      >
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Nombre del Canal
            </label>
            <Input
              placeholder="Ej: Novedades de mi Negocio"
              value={newChannelTitle}
              onChange={(e) => setNewChannelTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              Descripción (opcional)
            </label>
            <Textarea
              placeholder="Describe de qué trata tu canal..."
              value={newChannelDescription}
              onChange={(e) => setNewChannelDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              Imagen de Perfil (opcional)
            </label>
            <FileUploader
              onFileSelect={setNewChannelImage}
              accept="image/*"
              maxSize={5}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleCreateChannel}
              disabled={!newChannelTitle.trim() || createChannel.isPending}
              className="flex-1"
            >
              {createChannel.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creando...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Crear Canal
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowCreateModal(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal Buscar Canales */}
      <Modal
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        title="Buscar Canales"
        description="Encuentra y suscríbete a canales públicos"
      >
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Buscar por nombre..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearchChannels()}
              className="flex-1"
            />
            <Button
              onClick={handleSearchChannels}
              disabled={!searchText.trim() || searchChannels.isPending}
            >
              {searchChannels.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
            </Button>
          </div>

          {searchResults.length > 0 && (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {searchResults.map((channel) => (
                <div
                  key={channel.id}
                  className="p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm truncate">
                        {channel.name}
                      </h4>
                      {channel.description && (
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {channel.description}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {channel.subscriberCount} suscriptores
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleSubscribe(channel.id)}
                      disabled={subscribeChannel.isPending}
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Suscribirse
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>

      {/* Modal Eliminar Canal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Eliminar Canal"
        description="Esta acción no se puede deshacer"
      >
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            ¿Estás seguro que deseas eliminar este canal? Todos los suscriptores perderán acceso.
          </p>

          <div className="flex gap-3">
            <Button
              variant="destructive"
              onClick={handleDeleteChannel}
              disabled={deleteChannel.isPending}
              className="flex-1"
            >
              {deleteChannel.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Eliminando...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Eliminar
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowDeleteModal(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
