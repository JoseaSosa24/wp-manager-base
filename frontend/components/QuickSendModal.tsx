"use client"

import { useState, useEffect } from 'react'
import { Modal } from './Modal'
import { Button } from './Button'
import { Textarea } from './Textarea'
import { FileUploader } from './FileUploader'
import { Card, CardContent, CardHeader, CardTitle } from './Card'
import { MessageCircle, Loader2, AtSign, Link as LinkIcon, Send, Users, AlertCircle } from 'lucide-react'

interface QuickSendModalProps {
  isOpen: boolean
  onClose: () => void
  groupName: string
  groupId: string
  participantsCount: number
  onSendMessage: (data: {
    message: string
    messages?: string[] // Array de mensajes por lote
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
  const BATCH_SIZE = 250
  const [message, setMessage] = useState('')
  const [batchMessages, setBatchMessages] = useState<string[]>([])
  const [file, setFile] = useState<File | null>(null)
  const [mentionAll, setMentionAll] = useState(false)
  const [linkPreview, setLinkPreview] = useState(true)
  const [detectedLinks, setDetectedLinks] = useState<string[]>([])
  const [preview, setPreview] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [showBatchInputs, setShowBatchInputs] = useState(false)

  // Calcular número de lotes cuando mentionAll está activado
  const totalBatches = mentionAll ? Math.ceil(participantsCount / BATCH_SIZE) : 1

  // Inicializar mensajes por lote cuando cambia mentionAll o totalBatches
  useEffect(() => {
    if (mentionAll && totalBatches > 1) {
      // Inicializar array con el mensaje principal en todos los lotes
      setBatchMessages(Array(totalBatches).fill(message))
    } else {
      setBatchMessages([])
    }
  }, [mentionAll, totalBatches, message])

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

  const handleBatchMessageChange = (index: number, value: string) => {
    const newMessages = [...batchMessages]
    newMessages[index] = value
    setBatchMessages(newMessages)
  }

  const handleSend = async () => {
    if (!message && !file) return

    setLoading(true)
    try {
      await onSendMessage({
        message,
        messages: showBatchInputs && totalBatches > 1 ? batchMessages : undefined,
        file,
        linkPreview,
        mentionAll
      })

      // Reset form
      setMessage('')
      setBatchMessages([])
      setFile(null)
      setMentionAll(false)
      setShowBatchInputs(false)
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
      size={showBatchInputs ? "4xl" : "lg"}
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

        {/* Batch Info - Mostrar cuando mentionAll está activado */}
        {mentionAll && totalBatches > 1 && (
          <div className="p-4 bg-warning/10 border border-warning/30 rounded-lg space-y-3">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-sm mb-1">
                  Envío en múltiples lotes
                </p>
                <p className="text-sm text-muted-foreground mb-2">
                  Este grupo tiene {participantsCount} participantes. El mensaje se enviará en{' '}
                  <span className="font-semibold text-foreground">{totalBatches} lotes</span> de hasta {BATCH_SIZE} personas cada uno.
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {Array.from({ length: totalBatches }).map((_, i) => {
                    const start = i * BATCH_SIZE + 1
                    const end = Math.min((i + 1) * BATCH_SIZE, participantsCount)
                    const count = end - start + 1
                    return (
                      <div key={i} className="flex items-center gap-2 p-2 bg-background rounded border">
                        <Users className="w-3 h-3 text-muted-foreground" />
                        <span className="font-medium">Lote {i + 1}:</span>
                        <span className="text-muted-foreground">{count} personas</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Toggle para mensajes personalizados */}
            <div className="pt-3 border-t border-warning/20">
              <Button
                variant={showBatchInputs ? "default" : "outline"}
                size="sm"
                onClick={() => setShowBatchInputs(!showBatchInputs)}
                className="w-full"
              >
                {showBatchInputs ? '✓ Usar mensajes diferentes por lote' : '📝 Personalizar mensaje por lote'}
              </Button>
            </div>
          </div>
        )}

        {/* Inputs personalizados por lote */}
        {mentionAll && totalBatches > 1 && showBatchInputs && (
          <div className="space-y-3 p-4 bg-muted/30 border rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-sm">Mensajes por lote</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  // Copiar el mensaje principal a todos los lotes
                  setBatchMessages(Array(totalBatches).fill(message))
                }}
                className="text-xs h-7"
              >
                Copiar mensaje base a todos
              </Button>
            </div>

            {Array.from({ length: totalBatches }).map((_, i) => {
              const start = i * BATCH_SIZE + 1
              const end = Math.min((i + 1) * BATCH_SIZE, participantsCount)
              const count = end - start + 1

              return (
                <div key={i} className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                    <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs">
                      {i + 1}
                    </span>
                    Lote {i + 1} ({count} personas)
                  </label>
                  <Textarea
                    placeholder={`Mensaje para lote ${i + 1}...`}
                    value={batchMessages[i] || ''}
                    onChange={(e) => handleBatchMessageChange(i, e.target.value)}
                    rows={3}
                    className="resize-none text-sm"
                  />
                </div>
              )
            })}

            <p className="text-xs text-muted-foreground italic">
              💡 Tip: Cada lote recibirá el mensaje personalizado que escribas arriba. Los links se preservarán automáticamente.
            </p>
          </div>
        )}

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
