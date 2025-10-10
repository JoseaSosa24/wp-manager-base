/**
 * Rutas de autenticación
 * Maneja login, logout y estado de sesión
 */

import express from 'express';
import { whatsappService } from '../services/WhatsAppService.js';
import { logger } from '../utils/logger.js';
import fs from 'fs/promises';
import path from 'path';

const router = express.Router();

/**
 * POST /api/auth/logout
 * Cierra la sesión de WhatsApp y elimina los datos de autenticación
 */
router.post('/logout', async (req, res) => {
  try {
    logger.info('Iniciando proceso de logout...');

    // Desconectar cliente de WhatsApp
    await whatsappService.disconnect();

    // Eliminar archivos de sesión de LocalAuth
    try {
      const sessionPath = path.join(process.cwd(), '.wwebjs_auth');
      const sessionExists = await fs.access(sessionPath).then(() => true).catch(() => false);

      if (sessionExists) {
        await fs.rm(sessionPath, { recursive: true, force: true });
        logger.info('Archivos de sesión eliminados');
      }
    } catch (error) {
      logger.warning('No se pudieron eliminar archivos de sesión:', error.message);
    }

    // Reinicializar el servicio (esto permitirá un nuevo login)
    const io = req.app.get('io');
    if (io) {
      setTimeout(() => {
        whatsappService.initialize(io);
        logger.info('Servicio de WhatsApp reinicializado');
      }, 1000);
    }

    res.json({
      success: true,
      message: 'Sesión cerrada correctamente'
    });

  } catch (error) {
    logger.error('Error durante logout:', error);
    res.status(500).json({
      success: false,
      error: 'Error al cerrar sesión',
      details: error.message
    });
  }
});

/**
 * GET /api/auth/status
 * Obtiene el estado actual de autenticación
 */
router.get('/status', (req, res) => {
  const status = whatsappService.getStatus();
  res.json({
    success: true,
    status
  });
});

export default router;
