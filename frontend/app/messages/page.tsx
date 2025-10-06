"use client"

import { useState } from 'react'
import { useChats } from '@/hooks/useGroups'
import { useMessages } from '@/hooks/useMessages'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/Card'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import { Textarea } from '@/components/Textarea'
import { Badge } from '@/components/Badge'
import { ArrowLeft, Send, Loader2, MessageSquare, Users2, Link as LinkIcon } from 'lucide-react'
import Link from 'next/link'

export default function MessagesPage() {
  const { data: chats, isLoading } = useChats()
  const { sendMessage, sendBulkMessages, sendToChannel, getLinkPreview, loading } = useMessages()

  const [mode, setMode] = useState<'single' | 'bulk' | 'channel'>('single')
  const [chatId, setChatId] = useState('')
  const [recipients, setRecipients] = useState('')
  const [message, setMessage] = useState('')
  const [preview, setPreview] = useState<any>(null)

  const handleSend = async () => {
    if (!message) return

    try {
      if (mode === 'single' && chatId) {
        await sendMessage({ chatId, message })
      } else if (mode === 'bulk' && recipients) {
        const recipientList = recipients.split('\n').filter(r => r.trim())
        await sendBulkMessages({ recipients: recipientList, message })
      } else if (mode === 'channel' && chatId) {
        await sendToChannel({ channelId: chatId, message })
      }

      setMessage('')
      setChatId('')
      setRecipients('')
      setPreview(null)
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <Link href="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
        </Link>

        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Enviar Mensajes
              </CardTitle>
              <CardDescription>
                Envía mensajes individuales, masivos o a canales
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Selector de modo */}
              <div>
                <label className="text-sm font-medium mb-3 block">Tipo de envío</label>
                <div className="flex gap-2">
                  <Button
                    variant={mode === 'single' ? 'default' : 'outline'}
                    onClick={() => setMode('single')}
                    className="flex-1"
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Individual
                  </Button>
                  <Button
                    variant={mode === 'bulk' ? 'default' : 'outline'}
                    onClick={() => setMode('bulk')}
                    className="flex-1"
                  >
                    <Users2 className="w-4 h-4 mr-2" />
                    Masivo
                  </Button>
                  <Button
                    variant={mode === 'channel' ? 'default' : 'outline'}
                    onClick={() => setMode('channel')}
                    className="flex-1"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Canal
                  </Button>
                </div>
              </div>

              {/* Destinatarios */}
              {mode === 'single' || mode === 'channel' ? (
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    {mode === 'channel' ? 'ID del Canal' : 'ID del Chat'}
                  </label>
                  <Input
                    placeholder="Ej: 5491112345678@c.us"
                    value={chatId}
                    onChange={(e) => setChatId(e.target.value)}
                  />
                  {chats && chats.length > 0 && (
                    <select
                      className="w-full mt-2 h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                      onChange={(e) => setChatId(e.target.value)}
                      value={chatId}
                    >
                      <option value="">Seleccionar de chats recientes...</option>
                      {chats.map((chat: any) => (
                        <option key={chat.id} value={chat.id}>
                          {chat.name} {chat.isGroup ? '(Grupo)' : ''}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              ) : (
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Destinatarios (uno por línea)
                  </label>
                  <Textarea
                    placeholder="5491112345678@c.us&#10;5491187654321@c.us"
                    value={recipients}
                    onChange={(e) => setRecipients(e.target.value)}
                    rows={5}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {recipients.split('\n').filter(r => r.trim()).length} destinatarios
                  </p>
                </div>
              )}

              {/* Mensaje */}
              <div>
                <label className="text-sm font-medium mb-2 block">Mensaje</label>
                <Textarea
                  placeholder="Escribe tu mensaje aquí..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={8}
                />
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

              {/* Botón enviar */}
              <Button
                className="w-full"
                size="lg"
                onClick={handleSend}
                disabled={loading || !message || (mode !== 'bulk' && !chatId) || (mode === 'bulk' && !recipients)}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Enviar {mode === 'bulk' ? 'mensajes masivos' : 'mensaje'}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
