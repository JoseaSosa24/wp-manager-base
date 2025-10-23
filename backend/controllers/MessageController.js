/**
 * Controlador de Mensajes
 * Maneja todas las operaciones relacionadas con envío de mensajes
 */

import { whatsappService } from '../services/WhatsAppService.js';
import { linkPreviewService } from '../services/LinkPreviewService.js';
import { Message } from '../models/Message.js';
import { logger } from '../utils/logger.js';
import { deleteFile } from '../middleware/upload.js';
import path from 'path';

export class MessageController {
  /**
   * Envía un mensaje individual
   * Soporta archivos multimedia
   */
  static async sendMessage(req, res) {
    let uploadedFilePath = null;

    try {
      const { chatId, message } = req.body;

      if (!chatId) {
        return res.status(400).json({
          success: false,
          error: 'chatId es requerido'
        });
      }

      // Preparar opciones
      const options = {
        linkPreview: req.body.linkPreview !== false
      };

      // Si hay archivo adjunto
      if (req.file) {
        uploadedFilePath = req.file.path;
        options.mediaPath = uploadedFilePath;
        options.mimetype = req.file.mimetype;
        options.filename = req.file.originalname;
      }

      const result = await whatsappService.sendMessage(chatId, message || '', options);

      // Eliminar archivo temporal
      if (uploadedFilePath) {
        deleteFile(uploadedFilePath);
      }

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

      // Limpiar archivo en caso de error
      if (uploadedFilePath) {
        deleteFile(uploadedFilePath);
      }

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
   * Soporta archivos multimedia
   */
  static async sendBulkMessages(req, res) {
    let uploadedFilePath = null;

    try {
      let { recipients, message } = req.body;

      // Si recipients viene como string (desde FormData), parsearlo
      if (typeof recipients === 'string') {
        try {
          recipients = JSON.parse(recipients);
        } catch (e) {
          return res.status(400).json({
            success: false,
            error: 'recipients debe ser un array válido'
          });
        }
      }

      if (!recipients || !Array.isArray(recipients)) {
        return res.status(400).json({
          success: false,
          error: 'recipients (array) es requerido'
        });
      }

      // Preparar opciones
      const options = {
        linkPreview: req.body.linkPreview !== false
      };

      // Si hay archivo adjunto
      if (req.file) {
        uploadedFilePath = req.file.path;
        options.mediaPath = uploadedFilePath;
        options.mimetype = req.file.mimetype;
        options.filename = req.file.originalname;
      }

      const results = await whatsappService.sendBulkMessages(recipients, message || '', options);

      // Eliminar archivo temporal
      if (uploadedFilePath) {
        deleteFile(uploadedFilePath);
      }

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

      // Limpiar archivo en caso de error
      if (uploadedFilePath) {
        deleteFile(uploadedFilePath);
      }

      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Envía mensaje con mención a todos en un grupo
   * Soporta archivos multimedia y opciones avanzadas
   */
  static async mentionAll(req, res) {
    let uploadedFilePath = null;

    try {
      const { groupId, message } = req.body;

      if (!groupId) {
        return res.status(400).json({
          success: false,
          error: 'groupId es requerido'
        });
      }

      // Preparar opciones
      // FormData envía strings, convertir a boolean
      const linkPreviewValue = req.body.linkPreview === 'false' ? false : true;
      const options = {
        linkPreview: linkPreviewValue
      };

      // Si hay archivo adjunto
      if (req.file) {
        uploadedFilePath = req.file.path;
        options.mediaPath = uploadedFilePath;
        options.mimetype = req.file.mimetype;
        options.filename = req.file.originalname;

        logger.info(`Archivo recibido: ${req.file.originalname} (${req.file.mimetype})`);
      }

      // Enviar mensaje
      const result = await whatsappService.mentionAllInGroup(groupId, message || '', options);

      // Eliminar archivo temporal después de enviarlo
      if (uploadedFilePath) {
        deleteFile(uploadedFilePath);
      }

      if (req.app.locals.stats) {
        req.app.locals.stats.incrementMessagesSent();
      }

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Error en mentionAll', error);

      // Limpiar archivo en caso de error
      if (uploadedFilePath) {
        deleteFile(uploadedFilePath);
      }

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
   * Soporta archivos multimedia
   */
  static async sendToChannel(req, res) {
    let uploadedFilePath = null;

    try {
      const { channelId, message } = req.body;

      if (!channelId) {
        return res.status(400).json({
          success: false,
          error: 'channelId es requerido'
        });
      }

      // Preparar opciones
      const options = {
        linkPreview: req.body.linkPreview !== false
      };

      // Si hay archivo adjunto
      if (req.file) {
        uploadedFilePath = req.file.path;
        options.mediaPath = uploadedFilePath;
        options.mimetype = req.file.mimetype;
        options.filename = req.file.originalname;
      }

      const result = await whatsappService.sendToChannel(channelId, message || '', options);

      // Eliminar archivo temporal
      if (uploadedFilePath) {
        deleteFile(uploadedFilePath);
      }

      if (req.app.locals.stats) {
        req.app.locals.stats.incrementMessagesSent();
      }

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Error en sendToChannel', error);

      // Limpiar archivo en caso de error
      if (uploadedFilePath) {
        deleteFile(uploadedFilePath);
      }

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

  static async createPoll(req, res) {
    logger.info('Request received for createPoll', req.body);
    try {
      const { chatId, pollName, pollOptions, mentionAll } = req.body;

      if (!chatId || !pollName || !pollOptions) {
        logger.error('Validation failed for createPoll', { chatId, pollName, pollOptions });
        return res.status(400).json({
          success: false,
          error: 'chatId, pollName y pollOptions son requeridos'
        });
      }

      const options = pollOptions.map(opt => opt.name);

      let result;
      if (mentionAll) {
        const chat = await whatsappService.client.getChatById(chatId);
        if (!chat.isGroup) {
          throw new Error('El chat especificado no es un grupo');
        }
        const participants = chat.participants || [];
        const mentions = participants.map(p => p.id._serialized);

        if (mentions.length > 250) {
          // Send the poll first
          result = await whatsappService.sendPoll(chatId, pollName, options);

          // Then send the mentions in batches with a message indicating the poll was sent
          await whatsappService.mentionAllInGroup(chatId, `¡Se ha creado una nueva encuesta: "${pollName}"!`, {});
        } else {
          // Send the poll with mentions
          result = await whatsappService.sendPoll(chatId, pollName, options, { mentions });
        }
      } else {
        result = await whatsappService.sendPoll(chatId, pollName, options);
      }

      if (req.app.locals.stats) {
        req.app.locals.stats.incrementMessagesSent();
      }

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Error in createPoll', error);

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
