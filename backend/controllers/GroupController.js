/**
 * Controlador de Grupos
 * Maneja operaciones relacionadas con grupos y chats
 */

import { whatsappService } from '../services/WhatsAppService.js';
import { Group } from '../models/Group.js';
import { logger } from '../utils/logger.js';

export class GroupController {
  /**
   * Obtiene todos los chats
   */
  static async getChats(req, res) {
    try {
      const chats = await whatsappService.getChats();

      res.json({
        success: true,
        data: chats
      });
    } catch (error) {
      logger.error('Error en getChats', error);

      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Obtiene todos los grupos
   */
  static async getGroups(req, res) {
    try {
      const groups = await whatsappService.getGroups();

      // Actualizar estadísticas
      if (req.app.locals.stats) {
        req.app.locals.stats.updateGroups(groups.length);
      }

      res.json({
        success: true,
        data: groups
      });
    } catch (error) {
      logger.error('Error en getGroups', error);

      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Obtiene participantes de un grupo específico
   */
  static async getGroupParticipants(req, res) {
    try {
      const { groupId } = req.params;

      if (!groupId) {
        return res.status(400).json({
          success: false,
          error: 'groupId es requerido'
        });
      }

      const participants = await whatsappService.getGroupParticipants(groupId);

      res.json({
        success: true,
        data: participants
      });
    } catch (error) {
      logger.error('Error en getGroupParticipants', error);

      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Obtiene información detallada de un grupo
   */
  static async getGroupInfo(req, res) {
    try {
      const { groupId } = req.params;

      if (!groupId) {
        return res.status(400).json({
          success: false,
          error: 'groupId es requerido'
        });
      }

      const groups = await whatsappService.getGroups();
      const group = groups.find(g => g.id === groupId);

      if (!group) {
        return res.status(404).json({
          success: false,
          error: 'Grupo no encontrado'
        });
      }

      const participants = await whatsappService.getGroupParticipants(groupId);

      res.json({
        success: true,
        data: {
          ...group,
          participants
        }
      });
    } catch (error) {
      logger.error('Error en getGroupInfo', error);

      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Obtiene todos los canales (newsletters)
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
        data: channels
      });
    } catch (error) {
      logger.error('Error en getChannels', error);

      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}
