"use client"

import { Modal } from './Modal'
import { Button } from './Button'
import { Card, CardContent, CardHeader, CardTitle } from './Card'
import { Badge } from './Badge'
import { Progress } from './Progress'
import {
  BarChart3,
  MessageSquare,
  Users,
  TrendingUp,
  TrendingDown,
  Activity,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Zap,
  Loader2
} from 'lucide-react'
import { formatRelativeTime } from '@/utils/formatTime'
import { useGroupStats } from '@/hooks/useGroups'

interface GroupStatsModalProps {
  isOpen: boolean
  onClose: () => void
  groupName: string
  groupId: string
}

export function GroupStatsModal({
  isOpen,
  onClose,
  groupName,
  groupId
}: GroupStatsModalProps) {
  // Fetch stats from API
  const { data: stats, isLoading } = useGroupStats(isOpen ? groupId : null)

  // Default stats if none provided
  const defaultStats = {
    totalMessages: 0,
    messagesSent: 0,
    messagesFailed: 0,
    participantsCount: 0,
    adminCount: 0,
    memberCount: 0,
    activeParticipants: 0,
    lastActivity: Date.now(),
    createdAt: Date.now(),
    successRate: 0,
  }

  const groupStats = stats || defaultStats
  const successRate = groupStats.messagesSent > 0
    ? Math.round((groupStats.messagesSent / (groupStats.messagesSent + groupStats.messagesFailed)) * 100)
    : 0

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Estadísticas - ${groupName}`}
      size="2xl"
    >
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Cargando estadísticas...</p>
        </div>
      ) : (
        <div className="space-y-6">
        {/* Overview Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-2 border-primary/20 bg-primary/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 text-primary-foreground" />
                </div>
                <span className="text-xs text-muted-foreground">Mensajes</span>
              </div>
              <p className="text-2xl font-bold">{groupStats.totalMessages}</p>
              <p className="text-xs text-muted-foreground mt-1">Total enviados</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-success/20 bg-success/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-success flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 text-success-foreground" />
                </div>
                <span className="text-xs text-muted-foreground">Exitosos</span>
              </div>
              <p className="text-2xl font-bold text-success">{groupStats.messagesSent}</p>
              <p className="text-xs text-muted-foreground mt-1">Entregados</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-destructive/20 bg-destructive/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-destructive flex items-center justify-center">
                  <XCircle className="w-4 h-4 text-destructive-foreground" />
                </div>
                <span className="text-xs text-muted-foreground">Fallidos</span>
              </div>
              <p className="text-2xl font-bold text-destructive">{groupStats.messagesFailed}</p>
              <p className="text-xs text-muted-foreground mt-1">No entregados</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-info/20 bg-info/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-info flex items-center justify-center">
                  <Users className="w-4 h-4 text-info-foreground" />
                </div>
                <span className="text-xs text-muted-foreground">Miembros</span>
              </div>
              <p className="text-2xl font-bold text-info">{groupStats.participantsCount}</p>
              <p className="text-xs text-muted-foreground mt-1">Participantes</p>
            </CardContent>
          </Card>
        </div>

        {/* Success Rate */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Tasa de Éxito
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Mensajes entregados exitosamente
              </span>
              <span className="text-2xl font-bold">{successRate}%</span>
            </div>
            <Progress value={successRate} className="h-3" />
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center justify-between p-3 rounded-lg bg-success/10">
                <span className="text-muted-foreground">Entregados</span>
                <span className="font-semibold text-success">{groupStats.messagesSent}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-destructive/10">
                <span className="text-muted-foreground">Fallidos</span>
                <span className="font-semibold text-destructive">{groupStats.messagesFailed}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Activity Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Actividad del Grupo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Última actividad</span>
                </div>
                <span className="text-sm font-medium">
                  {formatRelativeTime(groupStats.lastActivity)}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Creado</span>
                </div>
                <span className="text-sm font-medium">
                  {formatRelativeTime(groupStats.createdAt)}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Miembros activos</span>
                </div>
                <Badge variant="success">
                  {groupStats.activeParticipants || 0}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Rendimiento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Promedio de respuesta</span>
                </div>
                <span className="text-sm font-medium">
                  {groupStats.averageResponseTime ? `${groupStats.averageResponseTime}m` : 'N/A'}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Hora pico</span>
                </div>
                <span className="text-sm font-medium">
                  {groupStats.peakActivityHour ? `${groupStats.peakActivityHour}:00` : 'N/A'}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Estado</span>
                </div>
                <Badge variant="success">
                  Activo
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Insights */}
        <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-2 border-primary/10">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Insights y Recomendaciones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              {successRate >= 90 && (
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                  <span>Excelente tasa de entrega. El grupo está muy activo.</span>
                </li>
              )}
              {successRate < 90 && successRate >= 70 && (
                <li className="flex items-start gap-2">
                  <Activity className="w-4 h-4 text-warning mt-0.5 flex-shrink-0" />
                  <span>Tasa de entrega aceptable. Considera revisar participantes inactivos.</span>
                </li>
              )}
              {successRate < 70 && (
                <li className="flex items-start gap-2">
                  <XCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                  <span>Tasa de entrega baja. Revisa la lista de participantes y números válidos.</span>
                </li>
              )}
              <li className="flex items-start gap-2">
                <TrendingUp className="w-4 h-4 text-info mt-0.5 flex-shrink-0" />
                <span>
                  Este grupo tiene {groupStats.participantsCount} miembros.
                  {groupStats.participantsCount > 100 && ' Considera segmentar para mensajes más efectivos.'}
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
          <Button>
            <BarChart3 className="w-4 h-4 mr-2" />
            Exportar Reporte
          </Button>
        </div>
        </div>
      )}
    </Modal>
  )
}
