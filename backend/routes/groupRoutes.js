/**
 * Rutas de Grupos
 */

import express from 'express';
import { GroupController } from '../controllers/GroupController.js';

const router = express.Router();

// ============================================
// CONSULTAS (GET)
// ============================================

// GET /api/groups/chats - Obtener todos los chats
router.get('/chats', GroupController.getChats);

// GET /api/groups/channels - Obtener todos los canales
router.get('/channels', GroupController.getChannels);

// GET /api/groups - Obtener todos los grupos
router.get('/', GroupController.getGroups);

// GET /api/groups/:groupId - Obtener info de un grupo
router.get('/:groupId', GroupController.getGroupInfo);

// GET /api/groups/:groupId/participants - Obtener participantes
router.get('/:groupId/participants', GroupController.getGroupParticipants);

// GET /api/groups/:groupId/stats - Obtener estadísticas del grupo
router.get('/:groupId/stats', GroupController.getGroupStats);

// GET /api/groups/:groupId/invite - Obtener código de invitación
router.get('/:groupId/invite', GroupController.getInviteCode);

// ============================================
// MODIFICACIONES (POST/PUT/PATCH)
// ============================================

// POST /api/groups/:groupId/participants - Añadir participantes
router.post('/:groupId/participants', GroupController.addParticipants);

// POST /api/groups/:groupId/promote - Promocionar a admins
router.post('/:groupId/promote', GroupController.promoteParticipants);

// POST /api/groups/:groupId/demote - Degradar admins
router.post('/:groupId/demote', GroupController.demoteParticipants);

// PUT /api/groups/:groupId/description - Actualizar descripción
router.put('/:groupId/description', GroupController.updateDescription);

// PUT /api/groups/:groupId/name - Actualizar nombre
router.put('/:groupId/name', GroupController.updateName);

// POST /api/groups/:groupId/invite/revoke - Revocar código de invitación
router.post('/:groupId/invite/revoke', GroupController.revokeInviteCode);

// ============================================
// ELIMINACIONES (DELETE)
// ============================================

// DELETE /api/groups/:groupId - Salir del grupo
router.delete('/:groupId', GroupController.leaveGroup);

// DELETE /api/groups/:groupId/participants/:participantId - Eliminar participante
router.delete('/:groupId/participants/:participantId', GroupController.removeParticipants);

export default router;
