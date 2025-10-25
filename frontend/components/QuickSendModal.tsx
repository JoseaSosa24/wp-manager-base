"use client"

import { useState, useEffect } from 'react'
import { Modal } from './Modal'
import { Button } from './Button'
import { Textarea } from './Textarea'
import { FileUploader } from './FileUploader'
import { Card, CardContent, CardHeader, CardTitle } from './Card'
import { MessageCircle, Loader2, AtSign, Link as LinkIcon, Send } from 'lucide-react'

interface QuickSendModalProps {
  isOpen: boolean
  onClose: () => void
  groupName: string
  groupId: string
  participantsCount: number
  onSendMessage: (data: {
    message: string
    file: File | null
    linkPreview: boolean
    mentionAll: boolean
  }) => Promise<void>
  onGetLinkPreview?: (url: string) => Promise<any>
}

export function QuickSendModal({
  isOpen,
  onClose,
  groupName,
  groupId,
  participantsCount,
  onSendMessage,
  onGetLinkPreview
}: QuickSendModalProps) {
  const [message, setMessage] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [mentionAll, setMentionAll] = useState(false)
  const [linkPreview, setLinkPreview] = useState(true)
  const [detectedLinks, setDetectedLinks] = useState<string[]>([])
  const [preview, setPreview] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  // Detectar links en el mensaje
  useEffect(() => {
    const urlRegex = /(https?:\/\/[^\s]+)/g
    const links = message.match(urlRegex) || []
    setDetectedLinks(links)
  }, [message])

  const handlePreviewLink = async () => {
    if (!onGetLinkPreview) return

    const urlRegex = /(https?:\/\/[^\s]+)/g
    const urls = message.match(urlRegex)

    if (urls && urls[0]) {
      const previewData = await onGetLinkPreview(urls[0])
      setPreview(previewData)
    }
  }

  const handleSend = async () => {
    if (!message && !file) return

    setLoading(true)
    try {
      await onSendMessage({
        message,
        file,
        linkPreview,
        mentionAll
      })

      // Reset form
      setMessage('')
      setFile(null)
      setMentionAll(false)
      setDetectedLinks([])
      setPreview(null)
      onClose()
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Enviar Mensaje Rápido"
      size="lg"
    >
      <div className="space-y-4">
        {/* Group Info */}
        <div className="p-4 rounded-lg bg-muted/50 border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <p className="font-semibold">{groupName}</p>
              <p className="text-sm text-muted-foreground">
                {participantsCount} participantes
              </p>
            </div>
          </div>
        </div>

        {/* Message Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium">
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

          {detectedLinks.length > 0 && onGetLinkPreview && (
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

        {/* Link Preview */}
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

        {/* File Upload */}
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

        {/* Mention All Option */}
        <div className="flex items-start gap-3 p-4 bg-primary/5 border border-primary/20 rounded-lg">
          <input
            type="checkbox"
            id="mentionAll"
            checked={mentionAll}
            onChange={(e) => setMentionAll(e.target.checked)}
            className="mt-1 w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
          />
          <div className="flex-1">
            <label htmlFor="mentionAll" className="font-medium cursor-pointer block">
              Mencionar a todos
            </label>
            <p className="text-sm text-muted-foreground mt-1">
              Se mencionarán los {participantsCount} participantes del grupo
            </p>
          </div>
          <AtSign className="w-5 h-5 text-primary flex-shrink-0" />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSend}
            disabled={loading || (!message && !file)}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Enviar Mensaje
              </>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
