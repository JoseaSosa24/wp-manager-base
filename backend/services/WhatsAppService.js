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
   * Utiliza el método oficial de whatsapp-web.js con estrategias de batching
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

      logger.info(`📋 Grupo con ${participants.length} participantes`);

      // Emitir inicio de progreso
      if (this.io) {
        this.io.emit('mention_progress', {
          groupId,
          status: 'started',
          totalParticipants: participants.length,
          progress: 0
        });
      }

      // Preparar media si existe
      let media = null;
      if (options.mediaPath) {
        media = MessageMedia.fromFilePath(options.mediaPath);
        logger.info(`📎 Media cargada desde: ${options.mediaPath}`);
      } else if (options.mediaUrl) {
        media = await MessageMedia.fromUrl(options.mediaUrl);
        logger.info(`📎 Media cargada desde URL: ${options.mediaUrl}`);
      } else if (options.mediaBase64 && options.mimetype) {
        media = new MessageMedia(options.mimetype, options.mediaBase64, options.filename);
        logger.info(`📎 Media cargada desde base64`);
      }

      // Configuración de batching basada en el tamaño del grupo
      const BATCH_SIZE = 250; // Límite de WhatsApp
      const needsBatching = participants.length > BATCH_SIZE;

      if (!needsBatching) {
        // MÉTODO SIMPLE: Grupos pequeños - un solo mensaje
        return await this._sendSingleMention(chat, participants, message, media, options);
      } else {
        // MÉTODO BATCHING: Grupos grandes - múltiples mensajes
        return await this._sendBatchedMentions(chat, participants, message, media, options, BATCH_SIZE);
      }

    } catch (error) {
      logger.error(`❌ Error mencionando a todos en grupo ${groupId}`, error);

      // Emitir error
      if (this.io) {
        this.io.emit('mention_progress', {
          groupId,
          status: 'error',
          error: error.message
        });
      }

      throw error;
    }
  }


  /**
   * Envía menciones silenciosas en un solo mensaje
   * Usado para grupos <= 250 participantes
   */
  async _sendSingleMention(chat, participants, message, media, options) {
    try {
      logger.info(`📨 Enviando mención silenciosa a ${participants.length} participantes...`);

      const chatId = chat.id._serialized;

      // Construir array de menciones usando strings (formato correcto)
      const mentions = participants.map(p => p.id._serialized);

      // MENCIONES SILENCIOSAS: Solo el mensaje, sin @usuario visible
      const messageText = message || '';

      // Delay aleatorio para simular comportamiento humano (anti-ban)
      await randomDelay(1000, 2000);

      // Enviar mensaje usando el método oficial
      if (media) {
        await this.client.sendMessage(chatId, media, {
          caption: messageText,
          mentions: mentions,
          linkPreview: options.linkPreview !== false
        });
      } else {
        await this.client.sendMessage(chatId, messageText, {
          mentions: mentions,
          linkPreview: options.linkPreview !== false
        });
      }

      logger.success(`✅ Mención única enviada exitosamente (${mentions.length} usuarios)`);

      // Emitir progreso completado
      if (this.io) {
        this.io.emit('mention_progress', {
          groupId: chatId,
          status: 'completed',
          totalParticipants: participants.length,
          mentionedCount: mentions.length,
          progress: 100,
          batches: 1
        });
      }

      return {
        success: true,
        groupId: chatId,
        mentionedCount: mentions.length,
        batches: 1,
        hasMedia: !!media,
        strategy: 'single-message'
      };

    } catch (error) {
      logger.error(`❌ Error en mención única: ${error.message}`);
      throw error;
    }
  }

  /**
   * Envía menciones silenciosas en múltiples mensajes (batching)
   * Usado para grupos > 250 participantes
   */
  async _sendBatchedMentions(chat, participants, message, media, options, batchSize) {
    try {
      const totalBatches = Math.ceil(participants.length / batchSize);
      logger.info(`📦 Enviando ${totalBatches} lotes de menciones silenciosas...`);

      const chatId = chat.id._serialized;
      let totalMentioned = 0;
      let batchNumber = 0;

      // Dividir participantes en lotes
      for (let i = 0; i < participants.length; i += batchSize) {
        batchNumber++;
        const batch = participants.slice(i, i + batchSize);

        logger.info(`📤 Enviando lote ${batchNumber}/${totalBatches} (${batch.length} usuarios)...`);

        // Construir menciones para este lote usando strings
        const mentions = batch.map(p => p.id._serialized);

        // MENCIONES SILENCIOSAS: Mensaje natural sin marcadores automáticos
        const batchMessage = message || '';

        // Simular comportamiento humano con delays variables
        if (batchNumber > 1) {
          // Delay MUY largo entre lotes para parecer humano (8-15 segundos)
          const delay = Math.random() * 7000 + 8000; // 8-15 segundos
          logger.info(`⏳ Esperando ${Math.round(delay/1000)}s (simulando escritura humana)...`);
          await new Promise(resolve => setTimeout(resolve, delay));

          // Simular que el usuario está "escribiendo" (typing indicator)
          try {
            await chat.sendStateTyping();
            await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 1000)); // 1-3s typing
          } catch (err) {
            // Si no funciona, continuar igual
          }
        } else {
          // Primer lote: delay corto
          await randomDelay(1000, 2000);
        }

        // Enviar lote (solo el primer lote lleva media)
        if (media && batchNumber === 1) {
          await this.client.sendMessage(chatId, media, {
            caption: batchMessage,
            mentions: mentions,
            linkPreview: options.linkPreview !== false
          });
        } else {
          await this.client.sendMessage(chatId, batchMessage, {
            mentions: mentions,
            linkPreview: options.linkPreview !== false
          });
        }

        totalMentioned += batch.length;

        logger.success(`✅ Lote ${batchNumber}/${totalBatches} enviado (${batch.length} usuarios)`);

        // Emitir progreso
        if (this.io) {
          this.io.emit('mention_progress', {
            groupId: chat.id._serialized,
            status: 'progress',
            totalParticipants: participants.length,
            mentionedCount: totalMentioned,
            progress: Math.round((totalMentioned / participants.length) * 100),
            currentBatch: batchNumber,
            totalBatches: totalBatches
          });
        }
      }

      logger.success(`🎉 Todas las menciones enviadas (${totalMentioned} usuarios en ${totalBatches} lotes)`);

      // Emitir progreso completado
      if (this.io) {
        this.io.emit('mention_progress', {
          groupId: chat.id._serialized,
          status: 'completed',
          totalParticipants: participants.length,
          mentionedCount: totalMentioned,
          progress: 100,
          batches: totalBatches
        });
      }

      return {
        success: true,
        groupId: chat.id._serialized,
        mentionedCount: totalMentioned,
        batches: totalBatches,
        hasMedia: !!media,
        strategy: 'batched-messages'
      };

    } catch (error) {
      logger.error(`❌ Error en menciones por lotes: ${error.message}`);
      throw error;
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
