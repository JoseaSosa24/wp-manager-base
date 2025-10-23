"use client"

import { useState, useEffect } from 'react'
import { useGroups } from '@/hooks/useGroups'
import { useMessages } from '@/hooks/useMessages'
import { useMentionProgress } from '@/hooks/useMentionProgress'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/Card'
import { Button } from '@/components/Button'
import { Textarea } from '@/components/Textarea'
import { Badge } from '@/components/Badge'
import { Header } from '@/components/Header'
import { FileUploader } from '@/components/FileUploader'
import { MentionProgressBar } from '@/components/MentionProgressBar'
import { Users, Loader2, AtSign, Link as LinkIcon, Sparkles, UserCheck } from 'lucide-react'
import { formatRelativeTime } from '@/utils/formatTime'

export default function GroupsPage() {
  const { data: groups, isLoading, refetch } = useGroups()
  const { mentionAll, loading, getLinkPreview } = useMessages()
  const { progress, resetProgress } = useMentionProgress()
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [linkPreview, setLinkPreview] = useState(true)
  const [detectedLinks, setDetectedLinks] = useState<string[]>([])
  const [preview, setPreview] = useState<any>(null)

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Gestión de Grupos
          </h2>
          <p className="text-muted-foreground">
            Administra tus grupos de WhatsApp y menciona a todos los participantes
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-2">
              <CardHeader className="bg-muted/30">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                        <Users className="w-5 h-5 text-white" />
                      </div>
                      Tus Grupos
                    </CardTitle>
                    <CardDescription className="mt-2 text-base">
                      {groups?.length || 0} grupo{groups?.length !== 1 ? 's' : ''} disponible{groups?.length !== 1 ? 's' : ''}
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
                    <p className="text-muted-foreground">Cargando grupos...</p>
                  </div>
                ) : groups && groups.length > 0 ? (
                  <div className="space-y-3">
                    {groups.map((group: any) => (
                      <div
                        key={group.id}
                        className={`
                          p-4 rounded-xl border-2 transition-all cursor-pointer
                          ${selectedGroup === group.id
                            ? 'border-primary bg-primary/5 shadow-md'
                            : 'border-border hover:border-primary/30 hover:shadow-sm'
                          }
                        `}
                        onClick={() => setSelectedGroup(group.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 flex-1">
                            <div className={`
                              w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0
                              ${selectedGroup === group.id
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted'
                              }
                            `}>
                              <Users className="w-6 h-6" />
                            </div>

                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-base truncate mb-1">
                                {group.name}
                              </h4>
                              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <UserCheck className="w-4 h-4" />
                                  {group.participantsCount} miembros
                                </span>
                                <span className="hidden sm:inline">•</span>
                                <span className="hidden sm:inline">
                                  {formatRelativeTime(group.timestamp)}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex-shrink-0 ml-4">
                            {selectedGroup === group.id ? (
                              <Badge variant="default" className="font-medium">
                                Seleccionado
                              </Badge>
                            ) : (
                              <Badge variant="outline">
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
              <CardHeader className="bg-muted/30">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <AtSign className="w-5 h-5 text-white" />
                  </div>
                  Mencionar a Todos
                </CardTitle>
                <CardDescription className="text-base mt-2">
                  Envía un mensaje mencionando a todos los participantes del grupo
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5 pt-6">
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
    </div>
  )
}
