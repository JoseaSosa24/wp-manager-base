import { useState } from 'react'
import { Button } from './Button'
import { Input } from './Input'
import { Search, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'
import { cn } from '@/utils/cn'

export interface SortOption {
  value: string
  label: string
}

interface DataControlsProps {
  searchPlaceholder?: string
  searchValue?: string
  onSearchChange?: (value: string) => void
  sortOptions?: SortOption[]
  sortValue?: string
  sortDirection?: 'asc' | 'desc'
  onSortChange?: (value: string, direction: 'asc' | 'desc') => void
  className?: string
}

export function DataControls({
  searchPlaceholder = "Buscar...",
  searchValue = "",
  onSearchChange,
  sortOptions = [],
  sortValue,
  sortDirection = 'asc',
  onSortChange,
  className
}: DataControlsProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleSortClick = (value: string) => {
    if (value === sortValue) {
      // Toggle direction if same sort
      const newDirection = sortDirection === 'asc' ? 'desc' : 'asc'
      onSortChange?.(value, newDirection)
    } else {
      // New sort, default to asc
      onSortChange?.(value, 'asc')
    }
    setIsOpen(false)
  }

  const currentSort = sortOptions.find(opt => opt.value === sortValue)

  return (
    <div className={cn("flex flex-col sm:flex-row gap-3", className)}>
      {/* Search */}
      {onSearchChange && (
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
      )}

      {/* Sort */}
      {sortOptions.length > 0 && onSortChange && (
        <div className="relative">
          <Button
            variant="outline"
            onClick={() => setIsOpen(!isOpen)}
            className="gap-2 min-w-[180px] justify-between"
          >
            <span className="flex items-center gap-2">
              {sortDirection === 'asc' ? (
                <ArrowUp className="w-4 h-4" />
              ) : (
                <ArrowDown className="w-4 h-4" />
              )}
              {currentSort?.label || 'Ordenar'}
            </span>
            <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
          </Button>

          {isOpen && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsOpen(false)}
              />

              {/* Dropdown */}
              <div className="absolute right-0 mt-2 w-56 glass rounded-lg border shadow-lg z-50 py-1">
                {sortOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleSortClick(option.value)}
                    className={cn(
                      "w-full px-4 py-2 text-left text-sm hover:bg-muted/50 transition-colors flex items-center justify-between",
                      sortValue === option.value && "bg-muted/30"
                    )}
                  >
                    <span>{option.label}</span>
                    {sortValue === option.value && (
                      sortDirection === 'asc' ? (
                        <ArrowUp className="w-4 h-4 text-primary" />
                      ) : (
                        <ArrowDown className="w-4 h-4 text-primary" />
                      )
                    )}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
