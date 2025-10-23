"use client"

import { useState } from 'react'
import { useChannels, useCreateChannel, useSearchChannels, useSubscribeChannel, useUnsubscribeChannel, useDeleteChannel } from '@/hooks/useChannels'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/Card'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import { Textarea } from '@/components/Textarea'
import { Badge } from '@/components/Badge'
import { Header } from '@/components/Header'
import { FileUploader } from '@/components/FileUploader'
import { Modal } from '@/components/Modal'
import { Radio, Loader2, Plus, Search, Trash2, Users, CheckCircle, XCircle, Crown, Sparkles } from 'lucide-react'
import { formatRelativeTime } from '@/utils/formatTime'

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

  // Formulario de creación
  const [newChannelTitle, setNewChannelTitle] = useState('')
  const [newChannelDescription, setNewChannelDescription] = useState('')
  const [newChannelImage, setNewChannelImage] = useState<File | null>(null)

  // Búsqueda
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Mis Canales de WhatsApp
          </h2>
          <p className="text-muted-foreground">
            Administra tus canales, envía mensajes, crea encuestas y comparte contenido con tu audiencia
          </p>
        </div>

        <div className="mb-6">
          <Button
            onClick={() => setShowCreateModal(true)}
            size="lg"
            className="group"
          >
            <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform" />
            Crear Nuevo Canal
          </Button>
        </div>
        <Card className="border-2">
          <CardHeader className="bg-muted/30">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <Crown className="w-5 h-5 text-white" />
                  </div>
                  Mis Canales
                </CardTitle>
                <CardDescription className="mt-2 text-base">
                  {adminChannels.length} canal{adminChannels.length !== 1 ? 'es' : ''} que administras
                </CardDescription>
              </div>
              <Button onClick={() => refetch()} variant="outline" size="sm" className="gap-2">
                <Sparkles className="w-4 h-4" />
                Actualizar
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Cargando canales...</p>
              </div>
            ) : adminChannels.length > 0 ? (
              <div className="space-y-3">
                {adminChannels.map((channel) => (
                    <div
                      key={channel.id}
                      className="p-4 rounded-xl border-2 border-border hover:border-primary/30 hover:shadow-sm transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
                            <Radio className="w-6 h-6 text-primary-foreground" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <h4 className="font-semibold text-base truncate">
                                {channel.name}
                              </h4>
                              {channel.membershipType === 'owner' && (
                                <Badge variant="default" className="text-xs">
                                  <Crown className="w-3 h-3 mr-1" />
                                  Propietario
                                </Badge>
                              )}
                              {channel.membershipType === 'admin' && (
                                <Badge variant="secondary" className="text-xs">
                                  <Users className="w-3 h-3 mr-1" />
                                  Administrador
                                </Badge>
                              )}
                              {channel.verified && (
                                <Badge variant="success" className="text-xs">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Verificado
                                </Badge>
                              )}
                              {channel.metadata.privacy === 'public' && (
                                <Badge variant="outline" className="text-xs">
                                  Público
                                </Badge>
                              )}
                            </div>
                            {channel.description && (
                              <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
                                {channel.description}
                              </p>
                            )}
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Users className="w-4 h-4" />
                                {channel.metadata.size} suscriptores
                              </span>
                              {channel.metadata.adminCount > 1 && (
                                <>
                                  <span className="hidden sm:inline">•</span>
                                  <span className="hidden sm:inline">
                                    {channel.metadata.adminCount} admins
                                  </span>
                                </>
                              )}
                              <span className="hidden sm:inline">•</span>
                              <span className="hidden sm:inline">
                                {formatRelativeTime(channel.timestamp)}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2 ml-4">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              setSelectedChannelId(channel.id)
                              setShowDeleteModal(true)
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <Crown className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground font-medium mb-2">
                  No administras ningún canal
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  Crea tu primer canal para empezar a compartir contenido con tu audiencia
                </p>
                <Button
                  onClick={() => setShowCreateModal(true)}
                  size="lg"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Crear Mi Primer Canal
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
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
