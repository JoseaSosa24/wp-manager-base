"use client"

import { useState, useEffect } from 'react'
import { useChats } from '@/hooks/useGroups'
import { useMessages } from '@/hooks/useMessages'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/Card'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import { Textarea } from '@/components/Textarea'
import { Header } from '@/components/Header'
import { FileUploader } from '@/components/FileUploader'
import { Send, Loader2, MessageSquare, Users2, Link as LinkIcon } from 'lucide-react'

export default function MessagesPage() {
  const { data: chats } = useChats()
  const { sendMessage, sendBulkMessages, sendToChannel, getLinkPreview, loading } = useMessages()

  const [mode, setMode] = useState<'single' | 'bulk' | 'channel'>('single')
  const [chatId, setChatId] = useState('')
  const [recipients, setRecipients] = useState('')
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

  const handleSend = async () => {
    if (!message && !file) return

    try {
      if (mode === 'single' && chatId) {
        await sendMessage({ chatId, message, file, linkPreview })
      } else if (mode === 'bulk' && recipients) {
        const recipientList = recipients.split('\n').filter(r => r.trim())
        await sendBulkMessages({ recipients: recipientList, message, file, linkPreview })
      } else if (mode === 'channel' && chatId) {
        await sendToChannel({ chatId, message, file, linkPreview })
      }

      setMessage('')
      setChatId('')
      setRecipients('')
      setFile(null)
      setPreview(null)
      setDetectedLinks([])
    } catch (error) {
      console.error('Error al enviar:', error)
    }
  }

  const handlePreviewLink = async () => {
    const urlRegex = /(https?:\/\/[^\s]+)/g
    const urls = message.match(urlRegex)

    if (urls && urls[0]) {
      const previewData = await getLinkPreview(urls[0])
      setPreview(previewData)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Enviar Mensajes
            </h2>
            <p className="text-muted-foreground">
              Envía mensajes individuales, masivos o a canales con archivos adjuntos y vista previa de enlaces
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
            <button
              onClick={() => setMode('single')}
              className={`
                p-6 rounded-xl border-2 transition-all text-left group
                ${mode === 'single'
                  ? 'border-primary bg-primary/5 shadow-lg'
                  : 'border-border hover:border-primary/50 hover:shadow-md'
                }
              `}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${
                mode === 'single' ? 'bg-primary text-primary-foreground' : 'bg-secondary'
              }`}>
                <MessageSquare className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-lg mb-1">Individual</h3>
              <p className="text-sm text-muted-foreground">
                Envía un mensaje a un contacto o grupo específico
              </p>
            </button>

            <button
              onClick={() => setMode('bulk')}
              className={`
                p-6 rounded-xl border-2 transition-all text-left group
                ${mode === 'bulk'
                  ? 'border-primary bg-primary/5 shadow-lg'
                  : 'border-border hover:border-primary/50 hover:shadow-md'
                }
              `}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${
                mode === 'bulk' ? 'bg-primary text-primary-foreground' : 'bg-secondary'
              }`}>
                <Users2 className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-lg mb-1">Masivo</h3>
              <p className="text-sm text-muted-foreground">
                Envía el mismo mensaje a múltiples destinatarios
              </p>
            </button>

            <button
              onClick={() => setMode('channel')}
              className={`
                p-6 rounded-xl border-2 transition-all text-left group
                ${mode === 'channel'
                  ? 'border-primary bg-primary/5 shadow-lg'
                  : 'border-border hover:border-primary/50 hover:shadow-md'
                }
              `}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${
                mode === 'channel' ? 'bg-primary text-primary-foreground' : 'bg-secondary'
              }`}>
                <Send className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-lg mb-1">Canal</h3>
              <p className="text-sm text-muted-foreground">
                Envía mensajes a un canal de WhatsApp
              </p>
            </button>
          </div>

          <Card className="border-2">
            <CardHeader className="bg-muted/30">
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Componer Mensaje
              </CardTitle>
              <CardDescription>
                Completa los campos para enviar tu mensaje
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">

              {mode === 'single' || mode === 'channel' ? (
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      {mode === 'channel' ? 'ID del Canal' : 'ID del Chat'}
                    </label>
                    <Input
                      placeholder="Ej: 5491112345678@c.us"
                      value={chatId}
                      onChange={(e) => setChatId(e.target.value)}
                      className="font-mono text-sm"
                    />
                  </div>
                  {chats && chats.length > 0 && (
                    <div>
                      <label className="text-sm font-medium mb-2 block text-muted-foreground">
                        O selecciona de chats recientes
                      </label>
                      <select
                        className="w-full h-10 rounded-lg border-2 border-input bg-background px-4 py-2 text-sm focus:border-primary focus:outline-none transition-colors"
                        onChange={(e) => setChatId(e.target.value)}
                        value={chatId}
                      >
                        <option value="">Seleccionar chat...</option>
                        {chats.map((chat: any) => (
                          <option key={chat.id} value={chat.id}>
                            {chat.name} {chat.isGroup ? '(Grupo)' : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Destinatarios (uno por línea)
                  </label>
                  <Textarea
                    placeholder="5491112345678@c.us&#10;5491187654321@c.us&#10;..."
                    value={recipients}
                    onChange={(e) => setRecipients(e.target.value)}
                    rows={6}
                    className="font-mono text-sm"
                  />
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-muted-foreground">
                      {recipients.split('\n').filter(r => r.trim()).length} destinatarios
                    </p>
                    {recipients.split('\n').filter(r => r.trim()).length > 0 && (
                      <span className="text-xs font-medium text-primary">
                        Listo para enviar
                      </span>
                    )}
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <label className="text-sm font-medium mb-2 block">
                  Mensaje {file ? '(opcional)' : ''}
                </label>
                <Textarea
                  placeholder="Escribe tu mensaje aquí..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={8}
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
                          id="linkPreviewMsg"
                          checked={linkPreview}
                          onChange={(e) => setLinkPreview(e.target.checked)}
                          className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                        />
                        <label htmlFor="linkPreviewMsg" className="text-sm cursor-pointer">
                          Mostrar vista previa del enlace
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
                      <p className="font-semibold text-lg mb-1">{preview.title}</p>
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

              <div className="pt-4 border-t">
                <Button
                  className="w-full group"
                  size="lg"
                  onClick={handleSend}
                  disabled={loading || (!message && !file) || (mode !== 'bulk' && !chatId) || (mode === 'bulk' && !recipients)}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Enviando mensaje{mode === 'bulk' ? 's' : ''}...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2 group-hover:translate-x-0.5 transition-transform" />
                      {mode === 'bulk'
                        ? `Enviar a ${recipients.split('\n').filter(r => r.trim()).length} destinatarios`
                        : file ? 'Enviar mensaje con archivo' : 'Enviar mensaje'
                      }
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
