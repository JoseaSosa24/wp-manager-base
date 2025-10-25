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

  /**
   * Sale de un grupo (DELETE /api/groups/:groupId)
   */
  static async leaveGroup(req, res) {
    try {
      const { groupId } = req.params;

      if (!groupId) {
        return res.status(400).json({
          success: false,
          error: 'groupId es requerido'
        });
      }

      const result = await whatsappService.leaveGroup(groupId);

      res.json({
        success: true,
        data: result,
        message: 'Has salido del grupo exitosamente'
      });
    } catch (error) {
      logger.error('Error en leaveGroup', error);

      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Añade participantes a un grupo
   */
  static async addParticipants(req, res) {
    try {
      const { groupId } = req.params;
      const { participants } = req.body; // Array de números o string con @c.us

      if (!groupId) {
        return res.status(400).json({
          success: false,
          error: 'groupId es requerido'
        });
      }

      if (!participants || (Array.isArray(participants) && participants.length === 0)) {
        return res.status(400).json({
          success: false,
          error: 'participants es requerido (array de números o IDs)'
        });
      }

      // Normalizar participantes a formato @c.us si son números
      const normalizedParticipants = Array.isArray(participants)
        ? participants.map(p => p.includes('@') ? p : `${p}@c.us`)
        : (participants.includes('@') ? participants : `${participants}@c.us`);

      const result = await whatsappService.addParticipantsToGroup(groupId, normalizedParticipants);

      res.json({
        success: true,
        data: result,
        message: `Se añadieron ${result.addedCount} participante(s) al grupo`
      });
    } catch (error) {
      logger.error('Error en addParticipants', error);

      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Elimina participantes de un grupo
   */
  static async removeParticipants(req, res) {
    try {
      const { groupId, participantId } = req.params;

      if (!groupId) {
        return res.status(400).json({
          success: false,
          error: 'groupId es requerido'
        });
      }

      if (!participantId) {
        return res.status(400).json({
          success: false,
          error: 'participantId es requerido'
        });
      }

      // Normalizar participante a formato @c.us si es necesario
      const normalizedParticipant = participantId.includes('@')
        ? participantId
        : `${participantId}@c.us`;

      const result = await whatsappService.removeParticipantsFromGroup(
        groupId,
        [normalizedParticipant]
      );

      res.json({
        success: true,
        data: result,
        message: 'Participante eliminado del grupo exitosamente'
      });
    } catch (error) {
      logger.error('Error en removeParticipants', error);

      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Promociona participantes a administradores
   */
  static async promoteParticipants(req, res) {
    try {
      const { groupId } = req.params;
      const { participants } = req.body;

      if (!groupId || !participants) {
        return res.status(400).json({
          success: false,
          error: 'groupId y participants son requeridos'
        });
      }

      const normalizedParticipants = Array.isArray(participants)
        ? participants.map(p => p.includes('@') ? p : `${p}@c.us`)
        : [participants.includes('@') ? participants : `${participants}@c.us`];

      const result = await whatsappService.promoteParticipants(groupId, normalizedParticipants);

      res.json({
        success: true,
        data: result,
        message: `${result.promotedCount} participante(s) promocionado(s) a admin`
      });
    } catch (error) {
      logger.error('Error en promoteParticipants', error);

      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Degrada administradores a participantes
   */
  static async demoteParticipants(req, res) {
    try {
      const { groupId } = req.params;
      const { participants } = req.body;

      if (!groupId || !participants) {
        return res.status(400).json({
          success: false,
          error: 'groupId y participants son requeridos'
        });
      }

      const normalizedParticipants = Array.isArray(participants)
        ? participants.map(p => p.includes('@') ? p : `${p}@c.us`)
        : [participants.includes('@') ? participants : `${participants}@c.us`];

      const result = await whatsappService.demoteParticipants(groupId, normalizedParticipants);

      res.json({
        success: true,
        data: result,
        message: `${result.demotedCount} admin(s) degradado(s) a miembro`
      });
    } catch (error) {
      logger.error('Error en demoteParticipants', error);

      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Actualiza la descripción de un grupo
   */
  static async updateDescription(req, res) {
    try {
      const { groupId } = req.params;
      const { description } = req.body;

      if (!groupId) {
        return res.status(400).json({
          success: false,
          error: 'groupId es requerido'
        });
      }

      const result = await whatsappService.updateGroupDescription(groupId, description || '');

      res.json({
        success: true,
        data: result,
        message: 'Descripción actualizada exitosamente'
      });
    } catch (error) {
      logger.error('Error en updateDescription', error);

      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Actualiza el nombre de un grupo
   */
  static async updateName(req, res) {
    try {
      const { groupId } = req.params;
      const { name } = req.body;

      if (!groupId || !name) {
        return res.status(400).json({
          success: false,
          error: 'groupId y name son requeridos'
        });
      }

      const result = await whatsappService.updateGroupName(groupId, name);

      res.json({
        success: true,
        data: result,
        message: 'Nombre actualizado exitosamente'
      });
    } catch (error) {
      logger.error('Error en updateName', error);

      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Obtiene el código de invitación de un grupo
   */
  static async getInviteCode(req, res) {
    try {
      const { groupId } = req.params;

      if (!groupId) {
        return res.status(400).json({
          success: false,
          error: 'groupId es requerido'
        });
      }

      const result = await whatsappService.getGroupInviteCode(groupId);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Error en getInviteCode', error);

      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Revoca el código de invitación actual
   */
  static async revokeInviteCode(req, res) {
    try {
      const { groupId } = req.params;

      if (!groupId) {
        return res.status(400).json({
          success: false,
          error: 'groupId es requerido'
        });
      }

      const result = await whatsappService.revokeGroupInviteCode(groupId);

      res.json({
        success: true,
        data: result,
        message: 'Código de invitación revocado exitosamente'
      });
    } catch (error) {
      logger.error('Error en revokeInviteCode', error);

      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Obtiene estadísticas de un grupo específico
   */
  static async getGroupStats(req, res) {
    try {
      const { groupId } = req.params;

      if (!groupId) {
        return res.status(400).json({
          success: false,
          error: 'groupId es requerido'
        });
      }

      // Obtener información del grupo
      const groups = await whatsappService.getGroups();
      const group = groups.find(g => g.id === groupId);

      if (!group) {
        return res.status(404).json({
          success: false,
          error: 'Grupo no encontrado'
        });
      }

      // Obtener participantes
      const participants = await whatsappService.getGroupParticipants(groupId);

      // Calcular estadísticas (por ahora básicas, se pueden expandir)
      const adminCount = participants.filter(p => p.isAdmin || p.isSuperAdmin).length;
      const memberCount = participants.length - adminCount;

      // Estadísticas desde el sistema global (si existen)
      const globalStats = req.app.locals.stats || {};

      const stats = {
        groupId: group.id,
        groupName: group.name,
        totalMessages: 0, // TODO: Implementar tracking de mensajes por grupo
        messagesSent: 0,
        messagesFailed: 0,
        participantsCount: participants.length,
        adminCount: adminCount,
        memberCount: memberCount,
        activeParticipants: memberCount, // TODO: Implementar tracking de actividad
        lastActivity: group.timestamp,
        createdAt: group.timestamp,
        successRate: 0, // TODO: Calcular basado en mensajes
        timestamp: Date.now()
      };

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      logger.error('Error en getGroupStats', error);

      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}
