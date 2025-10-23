/**
 * Rutas de Canales (Newsletters)
 * Gestión completa de canales de WhatsApp
 */

import express from 'express';
import { ChannelController } from '../controllers/ChannelController.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

// GET /api/channels - Obtener todos los canales del usuario
router.get('/', ChannelController.getChannels);

// POST /api/channels/create - Crear un nuevo canal (soporta imagen de perfil)
router.post('/create', upload.single('file'), ChannelController.createChannel);

// POST /api/channels/search - Buscar canales públicos
router.post('/search', ChannelController.searchChannels);

// POST /api/channels/subscribe - Suscribirse a un canal
router.post('/subscribe', ChannelController.subscribe);

// POST /api/channels/unsubscribe - Desuscribirse de un canal
router.post('/unsubscribe', ChannelController.unsubscribe);

// DELETE /api/channels/:channelId - Eliminar un canal (solo propietario)
router.delete('/:channelId', ChannelController.deleteChannel);

// GET /api/channels/invite/:inviteCode - Obtener canal por código de invitación
router.get('/invite/:inviteCode', ChannelController.getByInviteCode);

export default router;
