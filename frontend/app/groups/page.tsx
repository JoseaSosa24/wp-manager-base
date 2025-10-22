"use client"

import { useState, useEffect } from 'react'
import { useGroups } from '@/hooks/useGroups'
import { useMessages } from '@/hooks/useMessages'
import { useMentionProgress } from '@/hooks/useMentionProgress'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/Card'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import { Textarea } from '@/components/Textarea'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/Table'
import { Badge } from '@/components/Badge'
import { Header } from '@/components/Header'
import { FileUploader } from '@/components/FileUploader'
import { MentionProgressBar } from '@/components/MentionProgressBar'
import { ArrowLeft, Users, Send, Loader2, AtSign, Link as LinkIcon, Sparkles } from 'lucide-react'
import Link from 'next/link'
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <Link href="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lista de grupos */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Grupos de WhatsApp
                    </CardTitle>
                    <CardDescription>
                      {groups?.length || 0} grupos encontrados
                    </CardDescription>
                  </div>
                  <Button onClick={() => refetch()} variant="outline" size="sm">
                    Actualizar
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : groups && groups.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nombre</TableHead>
                          <TableHead>Participantes</TableHead>
                          <TableHead>Última actividad</TableHead>
                          <TableHead>Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {groups.map((group: any) => (
                          <TableRow key={group.id}>
                            <TableCell className="font-medium">{group.name}</TableCell>
                            <TableCell>
                              <Badge variant="secondary">
                                {group.participantsCount} miembros
                              </Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground text-sm">
                              {formatRelativeTime(group.timestamp)}
                            </TableCell>
                            <TableCell>
                              <Button
                                size="sm"
                                variant={selectedGroup === group.id ? 'default' : 'outline'}
                                onClick={() => setSelectedGroup(group.id)}
                              >
                                {selectedGroup === group.id ? 'Seleccionado' : 'Seleccionar'}
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No se encontraron grupos
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Panel de acciones */}
          <div>
            <Card className={selectedGroup ? 'border-primary' : ''}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AtSign className="w-5 h-5" />
                  Mencionar a todos
                </CardTitle>
                <CardDescription>
                  Envía un mensaje mencionando a todos los participantes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedGroup ? (
                  <>
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Grupo seleccionado
                      </label>
                      <Badge variant="success" className="w-full justify-center py-2">
                        {groups?.find((g: any) => g.id === selectedGroup)?.name}
                      </Badge>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Mensaje (opcional si adjuntas archivo)
                      </label>
                      <Textarea
                        placeholder="Escribe tu mensaje aquí..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        rows={6}
                      />

                      {detectedLinks.length > 0 && (
                        <div className="mt-2 flex items-start gap-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <LinkIcon className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="text-xs font-medium text-blue-900 dark:text-blue-100">
                              {detectedLinks.length} enlace{detectedLinks.length > 1 ? 's' : ''} detectado{detectedLinks.length > 1 ? 's' : ''}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <input
                                type="checkbox"
                                id="linkPreview"
                                checked={linkPreview}
                                onChange={(e) => setLinkPreview(e.target.checked)}
                                className="rounded border-gray-300 text-primary focus:ring-primary"
                              />
                              <label htmlFor="linkPreview" className="text-xs text-blue-700 dark:text-blue-300 cursor-pointer">
                                Mostrar vista previa
                              </label>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2 mt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handlePreviewLink}
                          disabled={!message.match(/(https?:\/\/[^\s]+)/g)}
                        >
                          <LinkIcon className="w-3 h-3 mr-1" />
                          Preview de links
                        </Button>
                      </div>
                    </div>

                    {/* Preview de link */}
                    {preview && (
                      <Card className="bg-muted">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm">Preview del enlace</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          {preview.image && (
                            <img
                              src={preview.image}
                              alt={preview.title}
                              className="w-full rounded-md max-h-48 object-cover"
                            />
                          )}
                          <div>
                            <p className="font-semibold">{preview.title}</p>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {preview.description}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {preview.siteName || preview.url}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Archivo adjunto (opcional)
                      </label>
                      <FileUploader
                        onFileSelect={setFile}
                        accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar"
                        maxSize={50}
                      />
                    </div>

                    {/* Progress Bar */}
                    {progress && (
                      <MentionProgressBar
                        progress={progress}
                        groupName={groups?.find((g: any) => g.id === selectedGroup)?.name}
                      />
                    )}

                    <Button
                      className="w-full"
                      onClick={handleMentionAll}
                      disabled={loading || (!message && !file) || (progress?.status === 'started' || progress?.status === 'progress')}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Enviando...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          {file ? 'Enviar con archivo' : 'Mencionar a todos'}
                        </>
                      )}
                    </Button>

                    <Button
                      variant="ghost"
                      className="w-full"
                      onClick={() => {
                        setSelectedGroup(null)
                        setMessage('')
                        setFile(null)
                        setDetectedLinks([])
                        setPreview(null)
                      }}
                    >
                      Cancelar
                    </Button>
                  </>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Selecciona un grupo para comenzar
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
