/**
 * Rutas de Mensajes
 */

import express from 'express';
import { MessageController } from '../controllers/MessageController.js';

const router = express.Router();

// POST /api/messages/send - Enviar mensaje individual
router.post('/send', MessageController.sendMessage);

// POST /api/messages/bulk - Enviar mensajes masivos
router.post('/bulk', MessageController.sendBulkMessages);

// POST /api/messages/mention-all - Mencionar a todos en un grupo
router.post('/mention-all', MessageController.mentionAll);

// POST /api/messages/channel - Enviar mensaje a canal
router.post('/channel', MessageController.sendToChannel);

// GET /api/messages/preview - Obtener preview de link
router.get('/preview', MessageController.getLinkPreview);

// POST /api/messages/previews - Obtener previews de texto
router.post('/previews', MessageController.getPreviewsFromText);

export default router;
