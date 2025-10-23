import { Badge } from './Badge'
import { Button } from './Button'
import { Radio, Crown, Users, CheckCircle, Trash2 } from 'lucide-react'
import { formatRelativeTime } from '@/utils/formatTime'
import type { Channel } from '@/hooks/useChannels'

interface ChannelListItemProps {
  channel: Channel
  viewMode: 'grid' | 'list'
  onDelete?: (channelId: string) => void
}

export function ChannelListItem({ channel, viewMode, onDelete }: ChannelListItemProps) {
  if (viewMode === 'list') {
    return (
      <div className="flex items-center gap-4 p-3 rounded-lg border hover:border-primary/30 hover:shadow-sm transition-all">
        {/* Icon */}
        <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
          <Radio className="w-5 h-5 text-primary-foreground" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-sm truncate">
              {channel.name}
            </h4>
            {channel.membershipType === 'owner' && (
              <Badge variant="default" className="text-xs py-0 h-5">
                <Crown className="w-3 h-3 mr-1" />
                Propietario
              </Badge>
            )}
            {channel.verified && (
              <Badge variant="success" className="text-xs py-0 h-5">
                <CheckCircle className="w-3 h-3" />
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {channel.metadata.size.toLocaleString()}
            </span>
            <span>•</span>
            <span>{formatRelativeTime(channel.timestamp)}</span>
          </div>
        </div>

        {/* Actions */}
        {onDelete && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(channel.id)}
            className="text-destructive hover:text-destructive h-8 w-8 p-0"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>
    )
  }

  // Grid view (card)
  return (
    <div className="p-4 rounded-xl border-2 border-border hover:border-primary/30 hover:shadow-sm transition-all">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
            <Radio className="w-6 h-6 text-primary-foreground" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h4 className="font-semibold text-base truncate">
                {channel.name}
              </h4>
              {channel.membershipType === 'owner' && (
                <Badge variant="default" className="text-xs">
                  <Crown className="w-3 h-3 mr-1" />
                  Propietario
                </Badge>
              )}
              {channel.membershipType === 'admin' && (
                <Badge variant="secondary" className="text-xs">
                  <Users className="w-3 h-3 mr-1" />
                  Administrador
                </Badge>
              )}
              {channel.verified && (
                <Badge variant="success" className="text-xs">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Verificado
                </Badge>
              )}
              {channel.metadata.privacy === 'public' && (
                <Badge variant="outline" className="text-xs">
                  Público
                </Badge>
              )}
            </div>
            {channel.description && (
              <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
                {channel.description}
              </p>
            )}
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {channel.metadata.size.toLocaleString()} suscriptores
              </span>
              {channel.metadata.adminCount > 1 && (
                <>
                  <span className="hidden sm:inline">•</span>
                  <span className="hidden sm:inline">
                    {channel.metadata.adminCount} admins
                  </span>
                </>
              )}
              <span className="hidden sm:inline">•</span>
              <span className="hidden sm:inline">
                {formatRelativeTime(channel.timestamp)}
              </span>
            </div>
          </div>
        </div>

        {onDelete && (
          <div className="flex gap-2 ml-4">
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onDelete(channel.id)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
