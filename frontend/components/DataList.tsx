import { ReactNode } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './Card'
import { Button } from './Button'
import { RefreshCw, LayoutGrid, LayoutList } from 'lucide-react'
import { cn } from '@/utils/cn'

interface DataListProps {
  title: string
  description?: string
  count?: number
  children: ReactNode
  isLoading?: boolean
  isEmpty?: boolean
  emptyState?: ReactNode
  actions?: ReactNode
  viewMode?: 'grid' | 'list'
  onViewModeChange?: (mode: 'grid' | 'list') => void
  onRefresh?: () => void
  className?: string
}

export function DataList({
  title,
  description,
  count,
  children,
  isLoading,
  isEmpty,
  emptyState,
  actions,
  viewMode,
  onViewModeChange,
  onRefresh,
  className
}: DataListProps) {
  return (
    <Card className={cn("glass", className)}>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <CardTitle className="text-2xl">
                {title}
              </CardTitle>
              {count !== undefined && (
                <span className="px-3 py-1 text-sm font-medium rounded-full bg-primary/10 text-primary">
                  {count}
                </span>
              )}
            </div>
            {description && (
              <p className="text-sm text-muted-foreground">
                {description}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            {onViewModeChange && (
              <div className="flex glass rounded-lg p-1">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => onViewModeChange('grid')}
                  className="h-8 w-8 p-0"
                >
                  <LayoutGrid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => onViewModeChange('list')}
                  className="h-8 w-8 p-0"
                >
                  <LayoutList className="w-4 h-4" />
                </Button>
              </div>
            )}

            {/* Refresh Button */}
            {onRefresh && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                disabled={isLoading}
                className="gap-2"
              >
                <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
                <span className="hidden sm:inline">Actualizar</span>
              </Button>
            )}

            {/* Custom Actions */}
            {actions}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {isEmpty && emptyState ? (
          emptyState
        ) : (
          children
        )}
      </CardContent>
    </Card>
  )
}

// Grid Container Component
interface DataGridProps {
  children: ReactNode
  columns?: 1 | 2 | 3 | 4
  className?: string
}

export function DataGrid({ children, columns = 1, className }: DataGridProps) {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
  }

  return (
    <div className={cn('grid gap-4', gridCols[columns], className)}>
      {children}
    </div>
  )
}

// List Container Component
interface DataStackProps {
  children: ReactNode
  className?: string
}

export function DataStack({ children, className }: DataStackProps) {
  return (
    <div className={cn('flex flex-col gap-3', className)}>
      {children}
    </div>
  )
}
