/**
 * Controlador de Estadísticas
 * Maneja obtención y actualización de estadísticas
 */

import { logger } from '../utils/logger.js';

export class StatsController {
  /**
   * Obtiene las estadísticas actuales
   */
  static async getStats(req, res) {
    try {
      const stats = req.app.locals.stats;

      if (!stats) {
        return res.status(500).json({
          success: false,
          error: 'Estadísticas no disponibles'
        });
      }

      res.json({
        success: true,
        data: stats.toJSON()
      });
    } catch (error) {
      logger.error('Error en getStats', error);

      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Reinicia las estadísticas
   */
  static async resetStats(req, res) {
    try {
      const { Stats } = await import('../models/Stats.js');
      req.app.locals.stats = new Stats();

      logger.info('Estadísticas reiniciadas');

      res.json({
        success: true,
        data: req.app.locals.stats.toJSON()
      });
    } catch (error) {
      logger.error('Error en resetStats', error);

      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}
