/**
 * Rutas de Estadísticas
 */

import express from 'express';
import { StatsController } from '../controllers/StatsController.js';

const router = express.Router();

// GET /api/stats - Obtener estadísticas
router.get('/', StatsController.getStats);

// POST /api/stats/reset - Reiniciar estadísticas
router.post('/reset', StatsController.resetStats);

export default router;
