/**
 * Controlador de Mensajes
 * Maneja todas las operaciones relacionadas con envío de mensajes
 */

import { whatsappService } from '../services/WhatsAppService.js';
import { linkPreviewService } from '../services/LinkPreviewService.js';
import { Message } from '../models/Message.js';
import { logger } from '../utils/logger.js';

export class MessageController {
  /**
   * Envía un mensaje individual
   */
  static async sendMessage(req, res) {
    try {
      const { chatId, message } = req.body;

      if (!chatId || !message) {
        return res.status(400).json({
          success: false,
          error: 'chatId y message son requeridos'
        });
      }

      const result = await whatsappService.sendMessage(chatId, message);

      // Incrementar estadísticas
      if (req.app.locals.stats) {
        req.app.locals.stats.incrementMessagesSent();
      }

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Error en sendMessage', error);

      if (req.app.locals.stats) {
        req.app.locals.stats.incrementMessagesFailed();
      }

      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Envía mensajes masivos
   */
  static async sendBulkMessages(req, res) {
    try {
      const { recipients, message } = req.body;

      if (!recipients || !Array.isArray(recipients) || !message) {
        return res.status(400).json({
          success: false,
          error: 'recipients (array) y message son requeridos'
        });
      }

      const results = await whatsappService.sendBulkMessages(recipients, message);

      // Actualizar estadísticas
      if (req.app.locals.stats) {
        const successful = results.filter(r => r.success).length;
        const failed = results.filter(r => !r.success).length;

        for (let i = 0; i < successful; i++) {
          req.app.locals.stats.incrementMessagesSent();
        }

        for (let i = 0; i < failed; i++) {
          req.app.locals.stats.incrementMessagesFailed();
        }
      }

      res.json({
        success: true,
        data: {
          total: results.length,
          successful: results.filter(r => r.success).length,
          failed: results.filter(r => !r.success).length,
          results
        }
      });
    } catch (error) {
      logger.error('Error en sendBulkMessages', error);

      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Envía mensaje con mención a todos en un grupo
   */
  static async mentionAll(req, res) {
    try {
      const { groupId, message } = req.body;

      if (!groupId || !message) {
        return res.status(400).json({
          success: false,
          error: 'groupId y message son requeridos'
        });
      }

      const result = await whatsappService.mentionAllInGroup(groupId, message);

      if (req.app.locals.stats) {
        req.app.locals.stats.incrementMessagesSent();
      }

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Error en mentionAll', error);

      if (req.app.locals.stats) {
        req.app.locals.stats.incrementMessagesFailed();
      }

      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Envía mensaje a un canal
   */
  static async sendToChannel(req, res) {
    try {
      const { channelId, message } = req.body;

      if (!channelId || !message) {
        return res.status(400).json({
          success: false,
          error: 'channelId y message son requeridos'
        });
      }

      const result = await whatsappService.sendToChannel(channelId, message);

      if (req.app.locals.stats) {
        req.app.locals.stats.incrementMessagesSent();
      }

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Error en sendToChannel', error);

      if (req.app.locals.stats) {
        req.app.locals.stats.incrementMessagesFailed();
      }

      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Obtiene preview de un link
   */
  static async getLinkPreview(req, res) {
    try {
      const { url } = req.query;

      if (!url) {
        return res.status(400).json({
          success: false,
          error: 'url es requerida'
        });
      }

      const preview = await linkPreviewService.getPreview(url);

      res.json({
        success: true,
        data: preview
      });
    } catch (error) {
      logger.error('Error en getLinkPreview', error);

      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Obtiene previews de todas las URLs en un texto
   */
  static async getPreviewsFromText(req, res) {
    try {
      const { text } = req.body;

      if (!text) {
        return res.status(400).json({
          success: false,
          error: 'text es requerido'
        });
      }

      const previews = await linkPreviewService.getPreviewsFromText(text);

      res.json({
        success: true,
        data: previews
      });
    } catch (error) {
      logger.error('Error en getPreviewsFromText', error);

      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}
