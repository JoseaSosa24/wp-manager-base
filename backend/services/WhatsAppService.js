/**
 * Servicio principal de WhatsApp
 * Maneja conexión, QR, envío de mensajes y gestión de grupos
 */

import pkg from 'whatsapp-web.js';
const { Client, LocalAuth, MessageMedia } = pkg;
import qrcode from 'qrcode';
import { logger } from '../utils/logger.js';
import { randomDelay } from '../utils/delay.js';
import fs from 'fs/promises';
import path from 'path';

class WhatsAppService {
  constructor() {
    this.client = null;
    this.isReady = false;
    this.qrCode = null;
    this.io = null;
  }

  /**
   * Inicializa el cliente de WhatsApp
   */
  initialize(io) {
    this.io = io;

    this.client = new Client({
      authStrategy: new LocalAuth(),
      puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      }
    });

    this.setupEventListeners();
    this.client.initialize();

    logger.info('Cliente de WhatsApp inicializando...');
  }

  /**
   * Configura los listeners de eventos
   */
  setupEventListeners() {
    this.client.on('qr', async (qr) => {
      logger.info('Código QR generado');
      const qrImage = await qrcode.toDataURL(qr);
      this.qrCode = qrImage;

      if (this.io) {
        this.io.emit('qr', { qr: qrImage });
      }
    });

    this.client.on('ready', () => {
      this.isReady = true;
      logger.success('Cliente de WhatsApp conectado');

      if (this.io) {
        this.io.emit('ready', { message: 'WhatsApp conectado correctamente' });
      }
    });

    this.client.on('authenticated', () => {
      logger.success('WhatsApp autenticado');
      if (this.io) {
        this.io.emit('authenticated');
      }
    });

    this.client.on('auth_failure', (error) => {
      logger.error('Error de autenticación', error);
      if (this.io) {
        this.io.emit('auth_failure', { error: error.message });
      }
    });

    this.client.on('disconnected', (reason) => {
      this.isReady = false;
      logger.warning('Cliente desconectado', { reason });
      if (this.io) {
        this.io.emit('disconnected', { reason });
      }
    });

    this.client.on('message', async (message) => {
      if (this.io) {
        this.io.emit('message_received', {
          from: message.from,
          body: message.body,
          timestamp: message.timestamp
        });
      }
    });
  }

  /**
   * Obtiene el estado de la conexión
   */
  getStatus() {
    return {
      isReady: this.isReady,
      hasQR: !!this.qrCode
    };
  }

  /**
   * Obtiene el código QR actual
   */
  getQR() {
    return this.qrCode;
  }

  /**
   * Envía un mensaje individual
   * Soporta archivos multimedia y links con vista previa
   */
  async sendMessage(chatId, message, options = {}) {
    if (!this.isReady) {
      throw new Error('Cliente de WhatsApp no está listo');
    }

    try {
      let media = null;

      // Preparar media si existe
      if (options.mediaPath) {
        media = MessageMedia.fromFilePath(options.mediaPath);
        logger.info(`Media cargada desde: ${options.mediaPath}`);
      } else if (options.mediaUrl) {
        media = await MessageMedia.fromUrl(options.mediaUrl);
        logger.info(`Media cargada desde URL: ${options.mediaUrl}`);
      } else if (options.mediaBase64 && options.mimetype) {
        media = new MessageMedia(options.mimetype, options.mediaBase64, options.filename);
        logger.info(`Media cargada desde base64`);
      }

      // Enviar mensaje
      if (media) {
        const sendOptions = {};
        if (message) {
          sendOptions.caption = message;
        }
        await this.client.sendMessage(chatId, media, sendOptions);
      } else {
        await this.client.sendMessage(chatId, message, {
          linkPreview: options.linkPreview !== false
        });
      }

      logger.success(`Mensaje enviado a ${chatId}`);
      return { success: true, chatId, message, hasMedia: !!media };
    } catch (error) {
      logger.error(`Error enviando mensaje a ${chatId}`, error);
      throw error;
    }
  }

  /**
   * Envía mensajes masivos con delay entre cada uno
   * Soporta archivos multimedia y links con vista previa
   */
  async sendBulkMessages(recipients, message, options = {}) {
    if (!this.isReady) {
      throw new Error('Cliente de WhatsApp no está listo');
    }

    const results = [];

    for (const recipient of recipients) {
      try {
        await this.sendMessage(recipient, message, options);
        results.push({ recipient, success: true });

        // Delay aleatorio entre mensajes para evitar bloqueos
        await randomDelay(2000, 4000);
      } catch (error) {
        logger.error(`Error enviando mensaje masivo a ${recipient}`, error);
        results.push({ recipient, success: false, error: error.message });
      }
    }

    return results;
  }

  /**
   * Obtiene todos los chats (incluye canales)
   */
  async getChats() {
    if (!this.isReady) {
      throw new Error('Cliente de WhatsApp no está listo');
    }

    try {
      const chats = await this.client.getChats();
      return chats.map(chat => ({
        id: chat.id._serialized,
        name: chat.name,
        isGroup: chat.isGroup,
        isNewsletter: chat.id.server === 'newsletter',
        timestamp: chat.timestamp,
        unreadCount: chat.unreadCount
      }));
    } catch (error) {
      logger.error('Error obteniendo chats', error);
      throw error;
    }
  }

  /**
   * Obtiene todos los canales (newsletters)
   */
  async getChannels() {
    if (!this.isReady) {
      throw new Error('Cliente de WhatsApp no está listo');
    }

    try {
      const chats = await this.client.getChats();
      const channels = chats.filter(chat => chat.id.server === 'newsletter');

      return channels.map(channel => ({
        id: channel.id._serialized,
        name: channel.name,
        timestamp: channel.timestamp
      }));
    } catch (error) {
      logger.error('Error obteniendo canales', error);
      throw error;
    }
  }

  /**
   * Obtiene todos los grupos
   */
  async getGroups() {
    if (!this.isReady) {
      throw new Error('Cliente de WhatsApp no está listo');
    }

    try {
      const chats = await this.client.getChats();
      const groups = chats.filter(chat => chat.isGroup);

      return groups.map(group => ({
        id: group.id._serialized,
        name: group.name,
        participantsCount: group.participants?.length || 0,
        timestamp: group.timestamp
      }));
    } catch (error) {
      logger.error('Error obteniendo grupos', error);
      throw error;
    }
  }

  /**
   * Obtiene los participantes de un grupo
   */
  async getGroupParticipants(groupId) {
    if (!this.isReady) {
      throw new Error('Cliente de WhatsApp no está listo');
    }

    try {
      const chat = await this.client.getChatById(groupId);

      if (!chat.isGroup) {
        throw new Error('El chat especificado no es un grupo');
      }

      return chat.participants.map(p => ({
        id: p.id._serialized,
        isAdmin: p.isAdmin,
        isSuperAdmin: p.isSuperAdmin
      }));
    } catch (error) {
      logger.error(`Error obteniendo participantes del grupo ${groupId}`, error);
      throw error;
    }
  }

  /**
   * Menciona a todos los miembros de un grupo (optimizado para grupos grandes)
   * Utiliza estrategia de batching para grupos con +256 participantes
   * Soporta archivos multimedia y links con vista previa
   */
  async mentionAllInGroup(groupId, message, options = {}) {
    if (!this.isReady) {
      throw new Error('Cliente de WhatsApp no está listo');
    }

    try {
      const chat = await this.client.getChatById(groupId);

      if (!chat.isGroup) {
        throw new Error('El chat especificado no es un grupo');
      }

      // Obtener participantes
      const participants = chat.participants || [];

      if (participants.length === 0) {
        throw new Error('No se encontraron participantes en el grupo');
      }

      // Construir todas las menciones
      const allMentions = participants.map(p => `${p.id.user}@c.us`);

      // Límite de WhatsApp: ~256 menciones por mensaje
      const MENTION_LIMIT = 250;

      logger.info(`Mencionando silenciosamente a ${allMentions.length} participantes...`);

      // Preparar media si existe
      let media = null;
      if (options.mediaPath) {
        media = MessageMedia.fromFilePath(options.mediaPath);
        logger.info(`Media cargada desde: ${options.mediaPath}`);
      } else if (options.mediaUrl) {
        media = await MessageMedia.fromUrl(options.mediaUrl);
        logger.info(`Media cargada desde URL: ${options.mediaUrl}`);
      } else if (options.mediaBase64 && options.mimetype) {
        media = new MessageMedia(options.mimetype, options.mediaBase64, options.filename);
        logger.info(`Media cargada desde base64`);
      }

      // Preparar opciones de envío
      const sendOptions = {
        mentions: allMentions.slice(0, MENTION_LIMIT),
        linkPreview: options.linkPreview !== false // Por defecto true para links
      };

      // Agregar caption si hay media
      if (media && message) {
        sendOptions.caption = message;
      }

      if (allMentions.length <= MENTION_LIMIT) {
        // Grupo pequeño: enviar en un solo mensaje
        if (media) {
          await chat.sendMessage(media, sendOptions);
        } else {
          await chat.sendMessage(message, sendOptions);
        }
        logger.success(`✓ Mención silenciosa enviada (${allMentions.length} notificados)`);

        return {
          success: true,
          groupId,
          mentionedCount: allMentions.length,
          batches: 1,
          hasMedia: !!media
        };

      } else {
        // Grupo grande: dividir en lotes
        const chunks = [];
        for (let i = 0; i < allMentions.length; i += MENTION_LIMIT) {
          chunks.push(allMentions.slice(i, i + MENTION_LIMIT));
        }

        logger.info(`Dividiendo en ${chunks.length} lotes para ${allMentions.length} participantes`);

        // Enviar primer lote con el mensaje principal
        if (media) {
          await chat.sendMessage(media, { ...sendOptions, mentions: chunks[0] });
        } else {
          await chat.sendMessage(message, { ...sendOptions, mentions: chunks[0] });
        }
        logger.info(`✓ Lote 1/${chunks.length} enviado (${chunks[0].length} menciones)`);

        // Pequeña pausa para evitar rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Enviar lotes restantes con mensaje vacío (solo notificaciones)
        for (let i = 1; i < chunks.length; i++) {
          await chat.sendMessage('', { mentions: chunks[i] });
          logger.info(`✓ Lote ${i + 1}/${chunks.length} enviado (${chunks[i].length} menciones)`);

          // Pausa entre lotes
          if (i < chunks.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }

        logger.success(`✓ Mención silenciosa completada (${allMentions.length} notificados en ${chunks.length} lotes)`);

        return {
          success: true,
          groupId,
          mentionedCount: allMentions.length,
          batches: chunks.length,
          hasMedia: !!media
        };
      }

    } catch (error) {
      logger.error(`Error mencionando a todos en grupo ${groupId}`, error);

      // Fallback: enviar sin menciones
      try {
        const chat = await this.client.getChatById(groupId);
        if (options.mediaPath || options.mediaUrl || options.mediaBase64) {
          let media;
          if (options.mediaPath) {
            media = MessageMedia.fromFilePath(options.mediaPath);
          } else if (options.mediaUrl) {
            media = await MessageMedia.fromUrl(options.mediaUrl);
          } else {
            media = new MessageMedia(options.mimetype, options.mediaBase64, options.filename);
          }
          await chat.sendMessage(media, { caption: message });
        } else {
          await chat.sendMessage(message, { linkPreview: options.linkPreview !== false });
        }
        return {
          success: true,
          groupId,
          mentionedCount: 0,
          batches: 0,
          warning: 'Enviado sin menciones (error en menciones)'
        };
      } catch (fallbackError) {
        throw error;
      }
    }
  }

  /**
   * Envía mensaje a un canal (Newsletter)
   * Soporta archivos multimedia y links con vista previa
   */
  async sendToChannel(channelId, message, options = {}) {
    if (!this.isReady) {
      throw new Error('Cliente de WhatsApp no está listo');
    }

    try {
      let media = null;

      // Preparar media si existe
      if (options.mediaPath) {
        media = MessageMedia.fromFilePath(options.mediaPath);
      } else if (options.mediaUrl) {
        media = await MessageMedia.fromUrl(options.mediaUrl);
      } else if (options.mediaBase64 && options.mimetype) {
        media = new MessageMedia(options.mimetype, options.mediaBase64, options.filename);
      }

      // Enviar mensaje
      if (media) {
        const sendOptions = {};
        if (message) {
          sendOptions.caption = message;
        }
        await this.client.sendMessage(channelId, media, sendOptions);
      } else {
        await this.client.sendMessage(channelId, message, {
          linkPreview: options.linkPreview !== false
        });
      }

      logger.success(`Mensaje enviado al canal ${channelId}`);
      return { success: true, channelId, message, hasMedia: !!media };
    } catch (error) {
      logger.error(`Error enviando mensaje al canal ${channelId}`, error);
      throw error;
    }
  }

  /**
   * Desconecta el cliente
   */
  async disconnect() {
    if (this.client) {
      await this.client.destroy();
      this.isReady = false;
      logger.info('Cliente de WhatsApp desconectado');
    }
  }
}

// Exportar instancia singleton
export const whatsappService = new WhatsAppService();
