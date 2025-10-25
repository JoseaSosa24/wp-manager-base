"use client"

import { Users, MessageCircle, Trash2, BarChart3, UserPlus, MoreVertical, Clock, Activity } from 'lucide-react'
import { Card } from './Card'
import { Badge } from './Badge'
import { Button } from './Button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './Tooltip'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './DropdownMenu'
import { cn } from '@/utils/cn'
import { formatRelativeTime } from '@/utils/formatTime'

interface GroupGridItemProps {
  group: {
    id: string
    name: string
    participantsCount: number
    timestamp: number
    isActive?: boolean
    lastActivity?: number
  }
  viewMode: 'grid' | 'list'
  isSelected?: boolean
  onSelect?: () => void
  onSendMessage?: () => void
  onManageParticipants?: () => void
  onViewStats?: () => void
  onDelete?: () => void
}

export function GroupGridItem({
  group,
  viewMode,
  isSelected,
  onSelect,
  onSendMessage,
  onManageParticipants,
  onViewStats,
  onDelete
}: GroupGridItemProps) {
  if (viewMode === 'list') {
    return (
      <Card className={cn(
        "transition-all hover:shadow-md cursor-pointer group",
        isSelected && "ring-2 ring-primary shadow-lg"
      )}>
        <div className="p-4 flex items-center gap-4">
          {/* Icon */}
          <div
            onClick={onSelect}
            className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors",
              isSelected
                ? "bg-primary text-primary-foreground"
                : "bg-muted group-hover:bg-muted/80"
            )}
          >
            <Users className="w-6 h-6" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0" onClick={onSelect}>
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold text-base truncate">
                {group.name}
              </h4>
              {group.isActive && (
                <Badge variant="success" className="text-xs">
                  <Activity className="w-3 h-3 mr-1" />
                  Activo
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {group.participantsCount} miembros
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {formatRelativeTime(group.timestamp)}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 w-9 p-0"
                    onClick={(e) => {
                      e.stopPropagation()
                      onSendMessage?.()
                    }}
                  >
                    <MessageCircle className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Enviar mensaje</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 w-9 p-0"
                    onClick={(e) => {
                      e.stopPropagation()
                      onManageParticipants?.()
                    }}
                  >
                    <UserPlus className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Gestionar participantes</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 w-9 p-0"
                    onClick={(e) => {
                      e.stopPropagation()
                      onViewStats?.()
                    }}
                  >
                    <BarChart3 className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Ver estadísticas</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 w-9 p-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onSendMessage}>
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Enviar mensaje
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onManageParticipants}>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Gestionar participantes
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onViewStats}>
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Ver estadísticas
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={onDelete}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Eliminar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </Card>
    )
  }

  // Grid View
  return (
    <Card className={cn(
      "transition-all hover:shadow-lg cursor-pointer group",
      isSelected && "ring-2 ring-primary shadow-xl"
    )}>
      <div className="p-6">
        {/* Header with Icon and Actions */}
        <div className="flex items-start justify-between mb-4">
          <div
            onClick={onSelect}
            className={cn(
              "w-14 h-14 rounded-xl flex items-center justify-center transition-all",
              isSelected
                ? "bg-primary text-primary-foreground scale-105"
                : "bg-muted group-hover:bg-muted/80 group-hover:scale-105"
            )}
          >
            <Users className="w-7 h-7" />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onSendMessage}>
                <MessageCircle className="w-4 h-4 mr-2" />
                Enviar mensaje
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onManageParticipants}>
                <UserPlus className="w-4 h-4 mr-2" />
                Gestionar participantes
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onViewStats}>
                <BarChart3 className="w-4 h-4 mr-2" />
                Ver estadísticas
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={onDelete}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Group Name */}
        <div onClick={onSelect} className="mb-4">
          <h3 className="font-semibold text-lg mb-1 truncate group-hover:text-primary transition-colors">
            {group.name}
          </h3>
          {group.isActive && (
            <Badge variant="success" className="text-xs">
              <Activity className="w-3 h-3 mr-1" />
              Activo
            </Badge>
          )}
        </div>

        {/* Metadata */}
        <div className="space-y-3 mb-4" onClick={onSelect}>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-1.5">
              <Users className="w-4 h-4" />
              Miembros
            </span>
            <span className="font-semibold">{group.participantsCount}</span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              Creado
            </span>
            <span className="font-medium text-xs">
              {formatRelativeTime(group.timestamp)}
            </span>
          </div>

          {group.lastActivity && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <Activity className="w-4 h-4" />
                Última actividad
              </span>
              <span className="font-medium text-xs">
                {formatRelativeTime(group.lastActivity)}
              </span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-2">
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={(e) => {
                    e.stopPropagation()
                    onSendMessage?.()
                  }}
                >
                  <MessageCircle className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Enviar mensaje</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={(e) => {
                    e.stopPropagation()
                    onManageParticipants?.()
                  }}
                >
                  <UserPlus className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Gestionar participantes</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={(e) => {
                    e.stopPropagation()
                    onViewStats?.()
                  }}
                >
                  <BarChart3 className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Ver estadísticas</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </Card>
  )
}
