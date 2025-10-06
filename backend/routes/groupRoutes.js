/**
 * Rutas de Grupos
 */

import express from 'express';
import { GroupController } from '../controllers/GroupController.js';

const router = express.Router();

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

export default router;
