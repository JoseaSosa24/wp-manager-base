"use client"

import { useState } from 'react'
import { useGroups } from '@/hooks/useGroups'
import { useMessages } from '@/hooks/useMessages'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/Card'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import { Textarea } from '@/components/Textarea'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/Table'
import { Badge } from '@/components/Badge'
import { ArrowLeft, Users, Send, Loader2, AtSign } from 'lucide-react'
import Link from 'next/link'
import { formatRelativeTime } from '@/utils/formatTime'

export default function GroupsPage() {
  const { data: groups, isLoading, refetch } = useGroups()
  const { mentionAll, loading } = useMessages()
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null)
  const [message, setMessage] = useState('')

  const handleMentionAll = async () => {
    if (!selectedGroup || !message) return

    await mentionAll({ groupId: selectedGroup, message })
    setMessage('')
    setSelectedGroup(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <Link href="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lista de grupos */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Grupos de WhatsApp
                    </CardTitle>
                    <CardDescription>
                      {groups?.length || 0} grupos encontrados
                    </CardDescription>
                  </div>
                  <Button onClick={() => refetch()} variant="outline" size="sm">
                    Actualizar
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : groups && groups.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nombre</TableHead>
                          <TableHead>Participantes</TableHead>
                          <TableHead>Última actividad</TableHead>
                          <TableHead>Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {groups.map((group: any) => (
                          <TableRow key={group.id}>
                            <TableCell className="font-medium">{group.name}</TableCell>
                            <TableCell>
                              <Badge variant="secondary">
                                {group.participantsCount} miembros
                              </Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground text-sm">
                              {formatRelativeTime(group.timestamp)}
                            </TableCell>
                            <TableCell>
                              <Button
                                size="sm"
                                variant={selectedGroup === group.id ? 'default' : 'outline'}
                                onClick={() => setSelectedGroup(group.id)}
                              >
                                {selectedGroup === group.id ? 'Seleccionado' : 'Seleccionar'}
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No se encontraron grupos
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Panel de acciones */}
          <div>
            <Card className={selectedGroup ? 'border-primary' : ''}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AtSign className="w-5 h-5" />
                  Mencionar a todos
                </CardTitle>
                <CardDescription>
                  Envía un mensaje mencionando a todos los participantes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedGroup ? (
                  <>
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Grupo seleccionado
                      </label>
                      <Badge variant="success" className="w-full justify-center py-2">
                        {groups?.find((g: any) => g.id === selectedGroup)?.name}
                      </Badge>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Mensaje
                      </label>
                      <Textarea
                        placeholder="Escribe tu mensaje aquí..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        rows={6}
                      />
                    </div>

                    <Button
                      className="w-full"
                      onClick={handleMentionAll}
                      disabled={loading || !message}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Enviando...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Mencionar a todos
                        </>
                      )}
                    </Button>

                    <Button
                      variant="ghost"
                      className="w-full"
                      onClick={() => {
                        setSelectedGroup(null)
                        setMessage('')
                      }}
                    >
                      Cancelar
                    </Button>
                  </>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Selecciona un grupo para comenzar
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
