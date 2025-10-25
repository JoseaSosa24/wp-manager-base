"use client"

import { useState, useMemo } from 'react'
import { useGroups, useLeaveGroup } from '@/hooks/useGroups'
import { useMessages } from '@/hooks/useMessages'
import { DataList, DataGrid, DataStack } from '@/components/DataList'
import { DataControls } from '@/components/DataControls'
import { GroupGridItem } from '@/components/GroupGridItem'
import { QuickSendModal } from '@/components/QuickSendModal'
import { ParticipantsModal } from '@/components/ParticipantsModal'
import { GroupStatsModal } from '@/components/GroupStatsModal'
import { EmptyState } from '@/components/EmptyState'
import { Users, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export default function GroupsPageNew() {
  const { data: groups, isLoading, refetch } = useGroups()
  const { mentionAll, loading: sendingMessage, getLinkPreview } = useMessages()
  const leaveGroupMutation = useLeaveGroup()

  // UI State
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('name')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null)

  // Modal State
  const [sendModalOpen, setSendModalOpen] = useState(false)
  const [participantsModalOpen, setParticipantsModalOpen] = useState(false)
  const [statsModalOpen, setStatsModalOpen] = useState(false)
  const [modalGroupId, setModalGroupId] = useState<string | null>(null)

  // Filter and sort groups
  const filteredAndSortedGroups = useMemo(() => {
    let result = [...(groups || [])]

    // Filter by search term
    if (searchTerm) {
      result = result.filter((group: any) =>
        group.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Sort
    result.sort((a: any, b: any) => {
      let comparison = 0
      if (sortBy === 'name') {
        comparison = a.name.localeCompare(b.name)
      } else if (sortBy === 'participants') {
        comparison = a.participantsCount - b.participantsCount
      } else if (sortBy === 'activity') {
        comparison = (a.timestamp || 0) - (b.timestamp || 0)
      }
      return sortDirection === 'asc' ? comparison : -comparison
    })

    return result
  }, [groups, searchTerm, sortBy, sortDirection])

  // Get group data by ID
  const getGroupById = (id: string) => {
    return groups?.find((g: any) => g.id === id)
  }

  // Action Handlers
  const handleSendMessage = (groupId: string) => {
    setModalGroupId(groupId)
    setSendModalOpen(true)
  }

  const handleManageParticipants = async (groupId: string) => {
    setModalGroupId(groupId)
    setParticipantsModalOpen(true)
  }

  const handleViewStats = (groupId: string) => {
    setModalGroupId(groupId)
    setStatsModalOpen(true)
  }

  const handleDelete = async (groupId: string) => {
    const group = getGroupById(groupId)
    if (!group) return

    // Confirmar acción
    if (window.confirm(`¿Estás seguro de que quieres salir del grupo "${group.name}"?`)) {
      await leaveGroupMutation.mutateAsync(groupId)
    }
  }

  // Send message from modal
  const handleSendFromModal = async (data: {
    message: string
    file: File | null
    linkPreview: boolean
    mentionAll: boolean
  }) => {
    if (!modalGroupId) return

    if (data.mentionAll) {
      await mentionAll({
        groupId: modalGroupId,
        message: data.message,
        file: data.file,
        linkPreview: data.linkPreview
      })
    } else {
      // TODO: Send regular message without mention
      console.log('Send regular message')
    }
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Gestión de Grupos
          </h1>
          <p className="text-muted-foreground">
            Administra tus grupos de WhatsApp con herramientas avanzadas
          </p>
        </div>

        {/* Main Content */}
        <DataList
          title="Grupos de WhatsApp"
          description="Selecciona un grupo para ver detalles y realizar acciones"
          count={filteredAndSortedGroups.length}
          isLoading={isLoading}
          isEmpty={!isLoading && filteredAndSortedGroups.length === 0}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onRefresh={refetch}
          emptyState={
            <EmptyState
              icon={Users}
              title="No hay grupos disponibles"
              description="Actualiza para cargar tus grupos de WhatsApp"
            />
          }
        >
          {/* Search and Sort Controls */}
          <div className="mb-6">
            <DataControls
              searchPlaceholder="Buscar grupo..."
              searchValue={searchTerm}
              onSearchChange={setSearchTerm}
              sortOptions={[
                { value: 'name', label: 'Nombre' },
                { value: 'participants', label: 'Miembros' },
                { value: 'activity', label: 'Actividad' },
              ]}
              sortValue={sortBy}
              sortDirection={sortDirection}
              onSortChange={(value, direction) => {
                setSortBy(value)
                setSortDirection(direction)
              }}
            />
          </div>

          {/* Groups Grid/List */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Cargando grupos...</p>
            </div>
          ) : viewMode === 'grid' ? (
            <DataGrid columns={3}>
              {filteredAndSortedGroups.map((group: any) => (
                <GroupGridItem
                  key={group.id}
                  group={group}
                  viewMode="grid"
                  isSelected={selectedGroup === group.id}
                  onSelect={() => setSelectedGroup(group.id)}
                  onSendMessage={() => handleSendMessage(group.id)}
                  onManageParticipants={() => handleManageParticipants(group.id)}
                  onViewStats={() => handleViewStats(group.id)}
                  onDelete={() => handleDelete(group.id)}
                />
              ))}
            </DataGrid>
          ) : (
            <DataStack>
              {filteredAndSortedGroups.map((group: any) => (
                <GroupGridItem
                  key={group.id}
                  group={group}
                  viewMode="list"
                  isSelected={selectedGroup === group.id}
                  onSelect={() => setSelectedGroup(group.id)}
                  onSendMessage={() => handleSendMessage(group.id)}
                  onManageParticipants={() => handleManageParticipants(group.id)}
                  onViewStats={() => handleViewStats(group.id)}
                  onDelete={() => handleDelete(group.id)}
                />
              ))}
            </DataStack>
          )}
        </DataList>
      </div>

      {/* Modals */}
      {modalGroupId && (
        <>
          <QuickSendModal
            isOpen={sendModalOpen}
            onClose={() => setSendModalOpen(false)}
            groupName={getGroupById(modalGroupId)?.name || ''}
            groupId={modalGroupId}
            participantsCount={getGroupById(modalGroupId)?.participantsCount || 0}
            onSendMessage={handleSendFromModal}
            onGetLinkPreview={getLinkPreview}
          />

          <ParticipantsModal
            isOpen={participantsModalOpen}
            onClose={() => setParticipantsModalOpen(false)}
            groupName={getGroupById(modalGroupId)?.name || ''}
            groupId={modalGroupId}
          />

          <GroupStatsModal
            isOpen={statsModalOpen}
            onClose={() => setStatsModalOpen(false)}
            groupName={getGroupById(modalGroupId)?.name || ''}
            groupId={modalGroupId}
          />
        </>
      )}
    </div>
  )
}
