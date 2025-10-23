/**
 * Controlador de Canales (Newsletters)
 * Maneja operaciones completas de gestión de canales de WhatsApp
 */

import { whatsappService } from '../services/WhatsAppService.js';
import { logger } from '../utils/logger.js';
import path from 'path';

export class ChannelController {
  /**
   * Obtiene todos los canales donde el usuario es propietario o administrador
   * GET /api/channels
   */
  static async getChannels(req, res) {
    try {
      const channels = await whatsappService.getChannels();

      // Actualizar estadísticas
      if (req.app.locals.stats) {
        req.app.locals.stats.updateChannels(channels.length);
      }

      res.json({
        success: true,
        data: channels,
        count: channels.length
      });
    } catch (error) {
      logger.error('Error en getChannels', error);

      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Crea un nuevo canal
   * POST /api/channels/create
   * Body: { title, description?, file? }
   */
  static async createChannel(req, res) {
    try {
      const { title, description } = req.body;

      if (!title) {
        return res.status(400).json({
          success: false,
          error: 'El título del canal es requerido'
        });
      }

      const options = {};

      // Descripción opcional
      if (description) {
        options.description = description;
      }

      // Imagen de perfil opcional
      if (req.file) {
        options.mediaPath = req.file.path;
        logger.info(`Imagen de canal adjuntada: ${req.file.originalname}`);
      }

      const result = await whatsappService.createChannel(title, options);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Error en createChannel', error);

      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Busca canales públicos
   * POST /api/channels/search
   * Body: { searchText, skipSubscribed?, limit?, countryCodes? }
   */
  static async searchChannels(req, res) {
    try {
      const { searchText, skipSubscribed, limit, countryCodes } = req.body;

      if (!searchText) {
        return res.status(400).json({
          success: false,
          error: 'El texto de búsqueda es requerido'
        });
      }

      const options = {
        skipSubscribed: skipSubscribed || false,
        limit: limit || 50
      };

      if (countryCodes && Array.isArray(countryCodes)) {
        options.countryCodes = countryCodes;
      }

      const channels = await whatsappService.searchChannels(searchText, options);

      res.json({
        success: true,
        data: channels,
        count: channels.length
      });
    } catch (error) {
      logger.error('Error en searchChannels', error);

      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Suscribirse a un canal
   * POST /api/channels/subscribe
   * Body: { channelId }
   */
  static async subscribe(req, res) {
    try {
      const { channelId } = req.body;

      if (!channelId) {
        return res.status(400).json({
          success: false,
          error: 'channelId es requerido'
        });
      }

      const result = await whatsappService.subscribeToChannel(channelId);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Error en subscribe', error);

      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Desuscribirse de un canal
   * POST /api/channels/unsubscribe
   * Body: { channelId, deleteLocal? }
   */
  static async unsubscribe(req, res) {
    try {
      const { channelId, deleteLocal } = req.body;

      if (!channelId) {
        return res.status(400).json({
          success: false,
          error: 'channelId es requerido'
        });
      }

      const result = await whatsappService.unsubscribeFromChannel(
        channelId,
        deleteLocal || false
      );

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Error en unsubscribe', error);

      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Elimina un canal (solo propietario)
   * DELETE /api/channels/:channelId
   */
  static async deleteChannel(req, res) {
    try {
      const { channelId } = req.params;

      if (!channelId) {
        return res.status(400).json({
          success: false,
          error: 'channelId es requerido'
        });
      }

      const result = await whatsappService.deleteChannel(channelId);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Error en deleteChannel', error);

      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Obtiene información de un canal por código de invitación
   * GET /api/channels/invite/:inviteCode
   */
  static async getByInviteCode(req, res) {
    try {
      const { inviteCode } = req.params;

      if (!inviteCode) {
        return res.status(400).json({
          success: false,
          error: 'inviteCode es requerido'
        });
      }

      const channel = await whatsappService.getChannelByInviteCode(inviteCode);

      res.json({
        success: true,
        data: channel
      });
    } catch (error) {
      logger.error('Error en getByInviteCode', error);

      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}
