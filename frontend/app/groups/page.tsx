"use client"

import { useState, useEffect } from 'react'
import { useGroups } from '@/hooks/useGroups'
import { useMessages } from '@/hooks/useMessages'
import { useMentionProgress } from '@/hooks/useMentionProgress'
import { useParticipants } from '@/hooks/useParticipants'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/Card'
import { Button } from '@/components/Button'
import { Textarea } from '@/components/Textarea'
import { Badge } from '@/components/Badge'
import { Header } from '@/components/Header'
import { FileUploader } from '@/components/FileUploader'
import { MentionProgressBar } from '@/components/MentionProgressBar'
import { Modal } from '@/components/Modal'
import { Input } from '@/components/Input'
import { useMemo } from 'react'
import { DataControls } from '@/components/DataControls'
import { Users, Loader2, AtSign, Link as LinkIcon, Sparkles, UserCheck, Search, ListPlus, Trash } from 'lucide-react'
import { formatRelativeTime } from '@/utils/formatTime'

export default function GroupsPage() {
  const { data: groups, isLoading, refetch } = useGroups()
  const { mentionAll, loading, getLinkPreview, createPoll } = useMessages()
  const { progress, resetProgress } = useMentionProgress()
  const { loading: participantsLoading, participants, getParticipants } = useParticipants()
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [linkPreview, setLinkPreview] = useState(true)
  const [detectedLinks, setDetectedLinks] = useState<string[]>([])
  const [preview, setPreview] = useState<any>(null)
  const [isConfirmationModalOpen, setConfirmationModalOpen] = useState(false)
  const [isCreatePollModalOpen, setCreatePollModalOpen] = useState(false)
  const [pollName, setPollName] = useState('')
  const [pollOptions, setPollOptions] = useState([{ name: '' }, { name: '' }])
  const [mentionAllInPoll, setMentionAllInPoll] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('name')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  const filteredAndSortedGroups = useMemo(() => {
    let result = [...(groups || [])]

    if (searchTerm) {
      result = result.filter((group: any) =>
        group.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    result.sort((a: any, b: any) => {
      let comparison = 0
      if (sortBy === 'name') {
        comparison = a.name.localeCompare(b.name)
      } else if (sortBy === 'participants') {
        comparison = a.participantsCount - b.participantsCount
      }
      return sortDirection === 'asc' ? comparison : -comparison
    })

    return result
  }, [groups, searchTerm, sortBy, sortDirection])

  // Detectar links en el mensaje
  useEffect(() => {
    const urlRegex = /(https?:\/\/[^\s]+)/g
    const links = message.match(urlRegex) || []
    setDetectedLinks(links)
  }, [message])

  const handlePreviewLink = async () => {
    const urlRegex = /(https?:\/\/[^\s]+)/g
    const urls = message.match(urlRegex)

    if (urls && urls[0]) {
      const previewData = await getLinkPreview(urls[0])
      setPreview(previewData)
    }
  }

  const handleMentionAll = async () => {
    if (!selectedGroup) return
    if (!message && !file) {
      return // Necesita al menos mensaje o archivo
    }

    await getParticipants(selectedGroup)
    setConfirmationModalOpen(true)
  }

  const handleConfirmMentionAll = async () => {
    if (!selectedGroup) return

    // Cerrar modal
    setConfirmationModalOpen(false)

    // Resetear progreso previo
    resetProgress()

    try {
      await mentionAll({
        groupId: selectedGroup,
        message,
        file,
        linkPreview
      })

      // Solo limpiar si fue exitoso y completado
      if (progress?.status === 'completed') {
        setMessage('')
        setFile(null)
        setSelectedGroup(null)
        setDetectedLinks([])
        setPreview(null)
      }
    } catch (error) {
      // El error ya se maneja en useMentionProgress
      console.error('Error en mención:', error)
    }
  }

  const handleCreatePoll = async () => {
    if (!selectedGroup || !pollName || pollOptions.some(opt => !opt.name)) return

    await createPoll({
      chatId: selectedGroup,
      pollName,
      pollOptions,
      mentionAll: mentionAllInPoll
    })

    setCreatePollModalOpen(false)
    setPollName('')
    setPollOptions([{ name: '' }, { name: '' }])
    setMentionAllInPoll(false)
  }

  const handlePollOptionChange = (index: number, value: string) => {
    const newOptions = [...pollOptions]
    newOptions[index].name = value
    setPollOptions(newOptions)
  }

  const addPollOption = () => {
    setPollOptions([...pollOptions, { name: '' }])
  }

  const removePollOption = (index: number) => {
    const newOptions = [...pollOptions]
    newOptions.splice(index, 1)
    setPollOptions(newOptions)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <Header />

      <div className="container mx-auto px-2 sm:px-4 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Gestión de Grupos
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base">
            Administra tus grupos de WhatsApp y menciona a todos los participantes
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            <Card className="border-2">
              <CardHeader className="bg-muted/30 p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                        <Users className="w-5 h-5 text-white" />
                      </div>
                      Tus Grupos
                    </CardTitle>
                    <CardDescription className="mt-2 text-sm sm:text-base">
                      {filteredAndSortedGroups.length || 0} grupo{filteredAndSortedGroups.length !== 1 ? 's' : ''} disponible{filteredAndSortedGroups.length !== 1 ? 's' : ''}
                    </CardDescription>
                  </div>
                  <Button onClick={() => refetch()} variant="outline" size="sm" className="gap-2 mt-3 sm:mt-0">
                    <Sparkles className="w-4 h-4" />
                    Actualizar
                  </Button>
                </div>
                <div className="pt-4">
                  <DataControls
                    searchPlaceholder="Buscar grupo..."
                    searchValue={searchTerm}
                    onSearchChange={setSearchTerm}
                    sortOptions={[
                      { value: 'name', label: 'Nombre' },
                      { value: 'participants', label: 'Miembros' },
                    ]}
                    sortValue={sortBy}
                    sortDirection={sortDirection}
                    onSortChange={(value, direction) => {
                      setSortBy(value)
                      setSortDirection(direction)
                    }}
                  />
                </div>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
                    <p className="text-muted-foreground">Cargando grupos...</p>
                  </div>
                ) : filteredAndSortedGroups.length > 0 ? (
                  <div className="space-y-3">
                    {filteredAndSortedGroups.map((group: any) => (
                      <div
                        key={group.id}
                        className={`
                          p-3 sm:p-4 rounded-xl border-2 transition-all cursor-pointer
                          ${selectedGroup === group.id
                            ? 'border-primary bg-primary/5 shadow-md'
                            : 'border-border hover:border-primary/30 hover:shadow-sm'
                          }
                        `}
                        onClick={() => setSelectedGroup(group.id)}
                      >
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
                          <div className="flex items-center gap-3 sm:gap-4 flex-1">
                            <div className={`
                              w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0
                              ${selectedGroup === group.id
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted'
                              }
                            `}>
                              <Users className="w-5 h-5 sm:w-6 sm:h-6" />
                            </div>

                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-base truncate mb-1">
                                {group.name}
                              </h4>
                              <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <UserCheck className="w-3 h-3 sm:w-4 sm:h-4" />
                                  {group.participantsCount} miembros
                                </span>
                                <span className="hidden sm:inline">•</span>
                                <span className="hidden sm:inline">
                                  {formatRelativeTime(group.timestamp)}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex-shrink-0 mt-3 sm:mt-0 sm:ml-4">
                            {selectedGroup === group.id ? (
                              <Badge variant="default" className="font-medium text-xs sm:text-sm">
                                Seleccionado
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-xs sm:text-sm">
                                Seleccionar
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                      <Users className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground font-medium">
                      No se encontraron grupos
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Actualiza para cargar tus grupos de WhatsApp
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className={`border-2 ${selectedGroup ? 'border-primary shadow-lg' : 'border-border'}`}>
              <CardHeader className="bg-muted/30 p-4 sm:p-6">
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <AtSign className="w-5 h-5 text-white" />
                  </div>
                  Mencionar a Todos
                </CardTitle>
                <CardDescription className="text-sm sm:text-base mt-2">
                  Envía un mensaje mencionando a todos los participantes del grupo
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-5 p-4 sm:p-6">
                {selectedGroup ? (
                  <>
                    <div className="p-4 rounded-xl bg-primary/10 border-2 border-primary/20">
                      <label className="text-sm font-medium mb-2 block text-muted-foreground">
                        Grupo seleccionado
                      </label>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
                          <Users className="w-5 h-5 text-primary-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold truncate">
                            {groups?.find((g: any) => g.id === selectedGroup)?.name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {groups?.find((g: any) => g.id === selectedGroup)?.participantsCount} participantes
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-sm font-medium mb-2 block">
                        Mensaje {file ? '(opcional)' : ''}
                      </label>
                      <Textarea
                        placeholder="Escribe tu mensaje aquí..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        rows={6}
                        className="resize-none"
                      />

                      {detectedLinks.length > 0 && (
                        <div className="flex items-start gap-3 p-3 bg-info/10 border border-info/20 rounded-lg">
                          <LinkIcon className="w-5 h-5 text-info mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="text-sm font-medium mb-2">
                              {detectedLinks.length} enlace{detectedLinks.length > 1 ? 's' : ''} detectado{detectedLinks.length > 1 ? 's' : ''}
                            </p>
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                id="linkPreview"
                                checked={linkPreview}
                                onChange={(e) => setLinkPreview(e.target.checked)}
                                className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                              />
                              <label htmlFor="linkPreview" className="text-sm cursor-pointer">
                                Mostrar vista previa
                              </label>
                            </div>
                          </div>
                        </div>
                      )}

                      {detectedLinks.length > 0 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handlePreviewLink}
                          disabled={!message.match(/(https?:\/\/[^\s]+)/g)}
                        >
                          <LinkIcon className="w-4 h-4 mr-2" />
                          Previsualizar enlace
                        </Button>
                      )}
                    </div>

                    {preview && (
                      <Card className="border-2 border-info/30 bg-gradient-to-br from-info/5 to-info/10">
                        <CardHeader>
                          <CardTitle className="text-base flex items-center gap-2">
                            <LinkIcon className="w-4 h-4" />
                            Vista previa del enlace
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {preview.image && (
                            <div className="rounded-lg overflow-hidden border">
                              <img
                                src={preview.image}
                                alt={preview.title}
                                className="w-full max-h-48 object-cover"
                              />
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-base mb-1">{preview.title}</p>
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                              {preview.description}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {preview.siteName || preview.url}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Archivo adjunto {message ? '(opcional)' : ''}
                      </label>
                      <FileUploader
                        onFileSelect={setFile}
                        accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar"
                        maxSize={50}
                      />
                    </div>

                    {progress && (
                      <MentionProgressBar
                        progress={progress}
                        groupName={groups?.find((g: any) => g.id === selectedGroup)?.name}
                      />
                    )}

                    <div className="space-y-3 pt-4 border-t">
                      <Button
                        className="w-full group"
                        size="lg"
                        onClick={handleMentionAll}
                        disabled={loading || (!message && !file) || (progress?.status === 'started' || progress?.status === 'progress')}
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Enviando menciones...
                          </>
                        ) : (
                          <>
                            <AtSign className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                            {file ? 'Mencionar con archivo' : 'Mencionar a todos'}
                          </>
                        )}
                      </Button>

                      <Button
                        variant="secondary"
                        className="w-full group"
                        size="lg"
                        onClick={() => setCreatePollModalOpen(true)}
                        disabled={loading || (progress?.status === 'started' || progress?.status === 'progress')}
                      >
                        <ListPlus className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                        Crear Encuesta
                      </Button>

                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => {
                          setSelectedGroup(null)
                          setMessage('')
                          setFile(null)
                          setDetectedLinks([])
                          setPreview(null)
                        }}
                      >
                        Cancelar selección
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                      <AtSign className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground font-medium mb-1">
                      Ningún grupo seleccionado
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Selecciona un grupo de la lista para comenzar
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isConfirmationModalOpen}
        onClose={() => setConfirmationModalOpen(false)}
        title="Confirmar Mención Masiva"
      >
        <div className="space-y-4">
          <p>
            Vas a enviar un mensaje a todos los participantes del grupo{' '}
            <span className="font-bold">{groups?.find((g: any) => g.id === selectedGroup)?.name}</span>.
          </p>
          <p>
            Se mencionarán{' '}
            <span className="font-bold">{participants.length}</span> participantes.
          </p>
          <div className="max-h-48 overflow-y-auto p-2 bg-muted rounded-md">
            <ul className="space-y-1">
              {participants.map((p: any) => (
                <li key={p.id} className="text-sm text-muted-foreground">{p.id}</li>
              ))}
            </ul>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setConfirmationModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleConfirmMentionAll} disabled={loading || participantsLoading}>
              {participantsLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                'Confirmar y Enviar'
              )}
            </Button>
          </div>
        </div>
      </Modal>
      <Modal
        isOpen={isCreatePollModalOpen}
        onClose={() => setCreatePollModalOpen(false)}
        title="Crear Encuesta"
      >
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Pregunta de la encuesta</label>
            <Input
              placeholder="¿Cuál es tu opción preferida?"
              value={pollName}
              onChange={(e) => setPollName(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Opciones</label>
            <div className="space-y-2">
              {pollOptions.map((option, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    placeholder={`Opción ${index + 1}`}
                    value={option.name}
                    onChange={(e) => handlePollOptionChange(index, e.target.value)}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removePollOption(index)}
                    disabled={pollOptions.length <= 2}
                  >
                    <Trash className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={addPollOption}
              className="mt-2"
            >
              <ListPlus className="w-4 h-4 mr-2" />
              Añadir opción
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="mentionAllInPoll"
              checked={mentionAllInPoll}
              onChange={(e) => setMentionAllInPoll(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
            />
            <label htmlFor="mentionAllInPoll" className="text-sm cursor-pointer">
              Mencionar a todos los participantes
            </label>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setCreatePollModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreatePoll} disabled={loading || !pollName || pollOptions.some(opt => !opt.name)}>
              Crear Encuesta
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
