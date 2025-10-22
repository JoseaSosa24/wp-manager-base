"use client"

import { Progress } from '@/components/Progress'
import { Alert, AlertDescription } from '@/components/Alert'
import { CheckCircle, AlertCircle, Clock, Users } from 'lucide-react'

interface MentionProgress {
  groupId: string
  status: 'started' | 'progress' | 'completed' | 'error'
  totalParticipants?: number
  mentionedCount?: number
  currentBatch?: number
  totalBatches?: number
  progress?: number
  batches?: number
  error?: string
  warning?: string
}

interface MentionProgressBarProps {
  progress: MentionProgress | null
  groupName?: string
}

export const MentionProgressBar = ({ progress, groupName }: MentionProgressBarProps) => {
  if (!progress) return null

  const getStatusIcon = () => {
    switch (progress.status) {
      case 'started':
      case 'progress':
        return <Clock className="w-4 h-4 animate-spin text-blue-600" />
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-600" />
      default:
        return null
    }
  }

  const getStatusText = () => {
    switch (progress.status) {
      case 'started':
        return `Iniciando menciones para ${progress.totalParticipants} participantes...`
      case 'progress':
        const mentioned = progress.mentionedCount || 0
        const total = progress.totalParticipants || 0
        return `Mencionando usuarios... ${mentioned}/${total} (${progress.progress}%)`
      case 'completed':
        if (progress.warning) {
          return `⚠️ ${progress.warning}`
        }
        const batchText = progress.batches && progress.batches > 1 ? ` en ${progress.batches} lotes` : ''
        return `✅ Completado: ${progress.mentionedCount} participantes mencionados${batchText}`
      case 'error':
        return `❌ Error: ${progress.error}`
      default:
        return ''
    }
  }

  const getProgressValue = () => {
    return progress.progress || 0
  }

  const getAlertVariant = () => {
    switch (progress.status) {
      case 'error':
        return 'destructive'
      case 'completed':
        return progress.warning ? 'destructive' : 'default'
      default:
        return 'default'
    }
  }

  return (
    <div className="space-y-3">
      <Alert variant={getAlertVariant()}>
        <div className="flex items-start gap-2">
          {getStatusIcon()}
          <div className="flex-1">
            <AlertDescription>
              <div className="font-medium">
                {groupName && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                    <Users className="w-3 h-3" />
                    {groupName}
                  </div>
                )}
                {getStatusText()}
              </div>
            </AlertDescription>
          </div>
        </div>
      </Alert>

      {(progress.status === 'started' || progress.status === 'progress') && (
        <Progress
          value={getProgressValue()}
          className="w-full h-2"
        />
      )}

      {progress.status === 'progress' && (
        <div className="space-y-1">
          {progress.currentBatch && progress.totalBatches && (
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Lote {progress.currentBatch}/{progress.totalBatches}</span>
              <span>{progress.mentionedCount || 0}/{progress.totalParticipants || 0} usuarios</span>
            </div>
          )}
          {progress.totalBatches && progress.totalBatches > 1 && (
            <div className="text-xs text-muted-foreground text-center bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
              💡 Enviando en {progress.totalBatches} lotes para evitar limitaciones de WhatsApp
            </div>
          )}
        </div>
      )}
    </div>
  )
}