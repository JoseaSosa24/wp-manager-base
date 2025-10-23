/**
 * Rutas de Mensajes
 */

import express from 'express';
import { MessageController } from '../controllers/MessageController.js';
import { upload } from '../middleware/upload.js';
import { validateUrls, sanitizeUrls } from '../middleware/urlValidator.js';
import { writeLimiter, uploadLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Middleware de validación para campos que pueden contener URLs
const urlFields = ['url', 'link', 'preview'];

// POST /api/messages/send - Enviar mensaje individual (soporta archivo adjunto)
router.post('/send', 
  uploadLimiter,
  upload.single('file'),
  validateUrls(urlFields),
  sanitizeUrls(urlFields),
  MessageController.sendMessage
);

// POST /api/messages/bulk - Enviar mensajes masivos (soporta archivo adjunto)
router.post('/bulk', 
  uploadLimiter,
  writeLimiter,
  upload.single('file'),
  validateUrls(urlFields),
  sanitizeUrls(urlFields),
  MessageController.sendBulkMessages
);

// POST /api/messages/mention-all - Mencionar a todos en un grupo (soporta archivo adjunto)
router.post('/mention-all', 
  uploadLimiter,
  writeLimiter,
  upload.single('file'),
  validateUrls(urlFields),
  sanitizeUrls(urlFields),
  MessageController.mentionAll
);

// POST /api/messages/channel - Enviar mensaje a canal (soporta archivo adjunto)
router.post('/channel', 
  uploadLimiter,
  writeLimiter,
  upload.single('file'),
  validateUrls(urlFields),
  sanitizeUrls(urlFields),
  MessageController.sendToChannel
);

// GET /api/messages/preview - Obtener preview de link
router.get('/preview', 
  writeLimiter,
  validateUrls(['url']),
  sanitizeUrls(['url']),
  MessageController.getLinkPreview
);

// POST /api/messages/previews - Obtener previews de texto
router.post('/previews', 
  writeLimiter,
  validateUrls(urlFields),
  sanitizeUrls(urlFields),
  MessageController.getPreviewsFromText
);

// POST /api/messages/poll - Crear una encuesta en un chat
router.post('/poll', 
  writeLimiter,
  MessageController.createPoll
);

export default router;
