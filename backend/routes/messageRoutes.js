/**
 * Rutas de Mensajes
 */

import express from 'express';
import { MessageController } from '../controllers/MessageController.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

// POST /api/messages/send - Enviar mensaje individual (soporta archivo adjunto)
router.post('/send', upload.single('file'), MessageController.sendMessage);

// POST /api/messages/bulk - Enviar mensajes masivos (soporta archivo adjunto)
router.post('/bulk', upload.single('file'), MessageController.sendBulkMessages);

// POST /api/messages/mention-all - Mencionar a todos en un grupo (soporta archivo adjunto)
router.post('/mention-all', upload.single('file'), MessageController.mentionAll);

// POST /api/messages/channel - Enviar mensaje a canal (soporta archivo adjunto)
router.post('/channel', upload.single('file'), MessageController.sendToChannel);

// GET /api/messages/preview - Obtener preview de link
router.get('/preview', MessageController.getLinkPreview);

// POST /api/messages/previews - Obtener previews de texto
router.post('/previews', MessageController.getPreviewsFromText);

export default router;
