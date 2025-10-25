"use client"

import { useState, useEffect } from 'react'
import { Modal } from './Modal'
import { Button } from './Button'
import { Input } from './Input'
import { Badge } from './Badge'
import {
  Users,
  Search,
  UserPlus,
  UserMinus,
  Crown,
  Shield,
  Loader2,
  TrendingUp,
  MessageSquare,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ShieldCheck,
  ShieldOff,
  MoreVertical
} from 'lucide-react'
import { cn } from '@/utils/cn'
import { formatRelativeTime } from '@/utils/formatTime'
import {
  useGroupParticipants,
  useAddParticipants,
  useRemoveParticipant,
  usePromoteParticipants,
  useDemoteParticipants
} from '@/hooks/useGroups'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/DropdownMenu'

interface Participant {
  id: string
  isAdmin?: boolean
  isSuperAdmin?: boolean
}

interface ParticipantsModalProps {
  isOpen: boolean
  onClose: () => void
  groupName: string
  groupId: string
}

export function ParticipantsModal({
  isOpen,
  onClose,
  groupName,
  groupId
}: ParticipantsModalProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [newNumber, setNewNumber] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Hooks
  const { data: participants = [], isLoading: loading } = useGroupParticipants(isOpen ? groupId : null)
  const addParticipantsMutation = useAddParticipants()
  const removeParticipantMutation = useRemoveParticipant()
  const promoteParticipantsMutation = usePromoteParticipants()
  const demoteParticipantsMutation = useDemoteParticipants()

  const filteredParticipants = participants.filter(p =>
    p.id.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Pagination
  const totalPages = Math.ceil(filteredParticipants.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedParticipants = filteredParticipants.slice(startIndex, endIndex)

  const adminCount = participants.filter(p => p.isAdmin || p.isSuperAdmin).length
  const memberCount = participants.length - adminCount

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])

  const handleAddParticipant = async () => {
    if (!newNumber) return

    await addParticipantsMutation.mutateAsync({
      groupId,
      participants: [newNumber]
    })

    setNewNumber('')
  }

  const handleRemoveParticipant = async (participantId: string) => {
    await removeParticipantMutation.mutateAsync({
      groupId,
      participantId
    })
  }

  const handlePromoteParticipant = async (participantId: string) => {
    await promoteParticipantsMutation.mutateAsync({
      groupId,
      participants: [participantId]
    })
  }

  const handleDemoteParticipant = async (participantId: string) => {
    await demoteParticipantsMutation.mutateAsync({
      groupId,
      participants: [participantId]
    })
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Gestionar Participantes - ${groupName}`}
      size="5xl"
    >
      <div className="space-y-4">
        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground">Total</span>
            </div>
            <p className="text-xl font-bold">{participants.length}</p>
          </div>

          <div className="p-3 rounded-lg bg-success/10 border border-success/20">
            <div className="flex items-center gap-2 mb-1">
              <Shield className="w-4 h-4 text-success" />
              <span className="text-xs text-muted-foreground">Admins</span>
            </div>
            <p className="text-xl font-bold">{adminCount}</p>
          </div>

          <div className="p-3 rounded-lg bg-info/10 border border-info/20">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-info" />
              <span className="text-xs text-muted-foreground">Miembros</span>
            </div>
            <p className="text-xl font-bold">{memberCount}</p>
          </div>
        </div>

        {/* Add Participant Form */}
        <div className="p-3 rounded-lg bg-muted/50 border">
          <div className="flex gap-2">
            <Input
              placeholder="Añadir número de teléfono (ej: 1234567890)"
              value={newNumber}
              onChange={(e) => setNewNumber(e.target.value)}
              className="flex-1"
            />
            <Button
              onClick={handleAddParticipant}
              disabled={addParticipantsMutation.isPending || !newNumber}
              size="sm"
            >
              {addParticipantsMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Añadir
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar participante por ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Participants Table */}
        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : filteredParticipants.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">
                  {searchTerm ? 'No se encontraron participantes' : 'No hay participantes'}
                </p>
              </div>
            ) : (
              <>
                <table className="w-full">
                  <thead className="bg-muted/50 border-b">
                    <tr>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Participante
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        ID
                      </th>
                      <th className="text-center py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Rol
                      </th>
                      <th className="text-center py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {paginatedParticipants.map((participant) => (
                      <tr
                        key={participant.id}
                        className="hover:bg-muted/30 transition-colors"
                      >
                        {/* Avatar & Name */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                              participant.isSuperAdmin
                                ? "bg-gradient-to-br from-yellow-500 to-orange-500"
                                : participant.isAdmin
                                ? "bg-gradient-to-br from-blue-500 to-purple-500"
                                : "bg-muted"
                            )}>
                              {participant.isSuperAdmin ? (
                                <Crown className="w-5 h-5 text-white" />
                              ) : participant.isAdmin ? (
                                <Shield className="w-5 h-5 text-white" />
                              ) : (
                                <Users className="w-5 h-5 text-muted-foreground" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-sm">
                                {participant.id.split('@')[0]}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {participant.isSuperAdmin
                                  ? 'Propietario del grupo'
                                  : participant.isAdmin
                                  ? 'Administrador'
                                  : 'Miembro regular'}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Full ID */}
                        <td className="py-3 px-4">
                          <code className="text-xs bg-muted px-2 py-1 rounded">
                            {participant.id}
                          </code>
                        </td>

                        {/* Role Badge */}
                        <td className="py-3 px-4 text-center">
                          {participant.isSuperAdmin && (
                            <Badge variant="default" className="text-xs">
                              <Crown className="w-3 h-3 mr-1" />
                              Propietario
                            </Badge>
                          )}
                          {participant.isAdmin && !participant.isSuperAdmin && (
                            <Badge variant="secondary" className="text-xs">
                              <Shield className="w-3 h-3 mr-1" />
                              Admin
                            </Badge>
                          )}
                          {!participant.isAdmin && !participant.isSuperAdmin && (
                            <Badge variant="outline" className="text-xs">
                              <Users className="w-3 h-3 mr-1" />
                              Miembro
                            </Badge>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-1">
                            {!participant.isSuperAdmin && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                  >
                                    <MoreVertical className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  {!participant.isAdmin && (
                                    <DropdownMenuItem
                                      onClick={() => handlePromoteParticipant(participant.id)}
                                      disabled={promoteParticipantsMutation.isPending}
                                    >
                                      <ShieldCheck className="w-4 h-4 mr-2 text-success" />
                                      Dar Admin
                                    </DropdownMenuItem>
                                  )}
                                  {participant.isAdmin && (
                                    <DropdownMenuItem
                                      onClick={() => handleDemoteParticipant(participant.id)}
                                      disabled={demoteParticipantsMutation.isPending}
                                    >
                                      <ShieldOff className="w-4 h-4 mr-2 text-warning" />
                                      Quitar Admin
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => handleRemoveParticipant(participant.id)}
                                    disabled={removeParticipantMutation.isPending}
                                    className="text-destructive focus:text-destructive"
                                  >
                                    <UserMinus className="w-4 h-4 mr-2" />
                                    Eliminar
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                            {participant.isSuperAdmin && (
                              <span className="text-xs text-muted-foreground italic">
                                Sin acciones
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between px-4 py-3 border-t bg-muted/20">
                    <div className="text-sm text-muted-foreground">
                      Mostrando {startIndex + 1} a {Math.min(endIndex, filteredParticipants.length)} de {filteredParticipants.length} participantes
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(1)}
                        disabled={currentPage === 1}
                        className="h-8 w-8 p-0"
                      >
                        <ChevronsLeft className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="h-8 w-8 p-0"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <div className="flex items-center gap-1 px-3">
                        <span className="text-sm font-medium">{currentPage}</span>
                        <span className="text-sm text-muted-foreground">de</span>
                        <span className="text-sm font-medium">{totalPages}</span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className="h-8 w-8 p-0"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(totalPages)}
                        disabled={currentPage === totalPages}
                        className="h-8 w-8 p-0"
                      >
                        <ChevronsRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </div>
    </Modal>
  )
}
