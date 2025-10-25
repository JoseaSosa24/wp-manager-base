/**
 * Servicio principal de WhatsApp
 * Maneja conexión, QR, envío de mensajes y gestión de grupos
 */

import pkg from 'whatsapp-web.js';
const { Client, LocalAuth, MessageMedia, Poll } = pkg;
import qrcode from 'qrcode';
import { logger } from '../utils/logger.js';
import { randomDelay } from '../utils/delay.js';

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
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        executablePath: process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
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
   * Obtiene SOLO los canales que administras (donde puedes enviar mensajes)
   * Usa getChannels() oficial que retorna canales con permisos de admin
   */
  async getChannels() {
    if (!this.isReady) {
      throw new Error('Cliente de WhatsApp no está listo');
    }

    try {
      // getChannels() retorna TODOS los canales (suscritos + administrados)
      const allChannels = await this.client.getChannels();

      logger.info(`📱 getChannels() retornó: ${allChannels.length} canales totales`);

      // FILTRAR solo canales donde eres OWNER o ADMIN usando channelMetadata.membershipType
      const adminChannels = allChannels.filter(channel => {
        const membershipType = channel.channelMetadata?.membershipType || 'subscriber';
        const isAdmin = membershipType === 'owner' || membershipType === 'admin';

        logger.info(`   📢 ${channel.name}: membershipType=${membershipType}, isAdmin=${isAdmin}`);

        return isAdmin;
      });

      logger.info(`🔍 Canales filtrados (OWNER/ADMIN): ${adminChannels.length}`);

      // Mapear a nuestro formato con TODA la metadata
      const mappedChannels = adminChannels.map(channel => {
        const metadata = channel.channelMetadata || {};
        const membershipType = metadata.membershipType || 'subscriber';
        const isOwner = membershipType === 'owner';

        return {
          id: channel.id._serialized,
          name: channel.name || 'Canal sin nombre',
          description: channel.description || '',
          isOwner: isOwner,
          membershipType: membershipType, // owner, admin, subscriber
          isSubscriber: true,
          timestamp: channel.timestamp || Date.now(),
          verified: metadata.verified || false,

          // Metadata completa para el frontend
          metadata: {
            creationTime: metadata.creationTime,
            inviteCode: metadata.inviteCode,
            size: metadata.size || 0, // número de suscriptores
            verified: metadata.verified || false,
            privacy: metadata.privacy, // public, private
            website: metadata.website,
            adminCount: metadata.adminCount || 0,
            suspended: metadata.suspended || false,
            geosuspended: metadata.geosuspended || false,
            terminated: metadata.terminated || false,
            createdAtTs: metadata.createdAtTs
          }
        };
      });

      logger.success(`✅ Canales administrables retornados: ${mappedChannels.length}`);

      if (mappedChannels.length > 0) {
        logger.info(`   └─ Canales: ${mappedChannels.map(c => `${c.name} (${c.membershipType}, ${c.metadata.size} suscriptores)`).join(', ')}`);
      } else {
        logger.warning(`   └─ No administras ningún canal. Solo se muestran canales donde seas OWNER o ADMIN.`);
      }

      return mappedChannels;

    } catch (error) {
      logger.error('❌ Error obteniendo canales:', error.message);
      return [];
    }
  }

  /**
   * Crea un nuevo canal
   */
  async createChannel(title, options = {}) {
    if (!this.isReady) {
      throw new Error('Cliente de WhatsApp no está listo');
    }

    try {
      let createOptions = {};

      // Agregar descripción si existe
      if (options.description) {
        createOptions.description = options.description;
      }

      // Agregar imagen si existe
      if (options.mediaPath) {
        createOptions.picture = MessageMedia.fromFilePath(options.mediaPath);
      } else if (options.mediaBase64 && options.mimetype) {
        createOptions.picture = new MessageMedia(options.mimetype, options.mediaBase64, options.filename);
      }

      const result = await this.client.createChannel(title, createOptions);

      logger.success(`Canal creado: ${title}`);
      return {
        success: true,
        channelId: result.nid || result,
        title: result.title || title,
        inviteLink: result.inviteLink,
        createdAt: result.createdAt
      };
    } catch (error) {
      logger.error(`Error creando canal ${title}`, error);
      throw error;
    }
  }

  /**
   * Busca canales públicos
   */
  async searchChannels(searchText, options = {}) {
    if (!this.isReady) {
      throw new Error('Cliente de WhatsApp no está listo');
    }

    try {
      const searchOptions = {
        searchText: searchText,
        skipSubscribedNewsletters: options.skipSubscribed || false,
        limit: options.limit || 50
      };

      // Agregar códigos de país si existen
      if (options.countryCodes && Array.isArray(options.countryCodes)) {
        searchOptions.countryCodes = options.countryCodes;
      }

      const results = await this.client.searchChannels(searchOptions);

      return results.map(channel => ({
        id: channel.id._serialized,
        name: channel.name,
        description: channel.description || '',
        verified: channel.verified || false,
        subscriberCount: channel.subscriberCount || 0
      }));
    } catch (error) {
      logger.error(`Error buscando canales: ${searchText}`, error);
      throw error;
    }
  }

  /**
   * Suscribirse a un canal
   */
  async subscribeToChannel(channelId) {
    if (!this.isReady) {
      throw new Error('Cliente de WhatsApp no está listo');
    }

    try {
      const result = await this.client.subscribeToChannel(channelId);
      logger.success(`Suscrito al canal ${channelId}`);
      return { success: result, channelId };
    } catch (error) {
      logger.error(`Error suscribiéndose al canal ${channelId}`, error);
      throw error;
    }
  }

  /**
   * Desuscribirse de un canal
   */
  async unsubscribeFromChannel(channelId, deleteLocal = false) {
    if (!this.isReady) {
      throw new Error('Cliente de WhatsApp no está listo');
    }

    try {
      const result = await this.client.unsubscribeFromChannel(channelId, {
        deleteLocalModels: deleteLocal
      });
      logger.success(`Desuscrito del canal ${channelId}`);
      return { success: result, channelId, deleted: deleteLocal };
    } catch (error) {
      logger.error(`Error desuscribiéndose del canal ${channelId}`, error);
      throw error;
    }
  }

  /**
   * Elimina un canal (solo si eres el propietario)
   */
  async deleteChannel(channelId) {
    if (!this.isReady) {
      throw new Error('Cliente de WhatsApp no está listo');
    }

    try {
      const result = await this.client.deleteChannel(channelId);
      logger.success(`Canal eliminado: ${channelId}`);
      return { success: result, channelId };
    } catch (error) {
      logger.error(`Error eliminando canal ${channelId}`, error);
      throw error;
    }
  }

  /**
   * Obtiene un canal por código de invitación
   */
  async getChannelByInviteCode(inviteCode) {
    if (!this.isReady) {
      throw new Error('Cliente de WhatsApp no está listo');
    }

    try {
      const channel = await this.client.getChannelByInviteCode(inviteCode);

      return {
        id: channel.id._serialized,
        name: channel.name,
        description: channel.description || '',
        verified: channel.verified || false,
        subscriberCount: channel.subscriberCount || 0,
        isSubscriber: channel.isSubscriber || false
      };
    } catch (error) {
      logger.error(`Error obteniendo canal por código ${inviteCode}`, error);
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
   * Genera variaciones del mensaje para evitar spam
   * Preserva links, emojis y contenido importante
   * Si hay array de mensajes personalizados, usa esos en vez de generar variaciones
   */
  _generateMessageVariation(originalMessage, batchNumber, totalBatches, customMessages = null) {
    // Si hay mensajes personalizados, usar el correspondiente al lote
    if (customMessages && Array.isArray(customMessages) && customMessages[batchNumber - 1]) {
      logger.info(`📝 Usando mensaje personalizado para lote ${batchNumber}`);
      return customMessages[batchNumber - 1];
    }

    // Si solo hay 1 lote, devolver mensaje original
    if (totalBatches === 1) return originalMessage;

    // Extraer URLs del mensaje original
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urls = originalMessage.match(urlRegex) || [];

    // Palabras de relleno para variar (elegir aleatoriamente)
    const prefixes = [
      '',
      '👋 ',
      '🔔 ',
      'Hola! ',
      'Hey! ',
      '📢 '
    ];

    const suffixes = [
      '',
      ' ✨',
      ' 👆',
      ' 📌',
      '',
      ''
    ];

    // Para el primer lote, usar mensaje original
    if (batchNumber === 1) {
      return originalMessage;
    }

    // Para lotes siguientes, generar variaciones sutiles
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];

    // Aplicar variación: agregar prefix/suffix aleatorios
    let varied = prefix + originalMessage + suffix;

    // Asegurar que los links se preservan exactamente
    urls.forEach(url => {
      if (!varied.includes(url)) {
        varied = varied + '\n' + url;
      }
    });

    return varied.trim();
  }

  /**
   * Envía menciones silenciosas en múltiples mensajes (batching)
   * Usado para grupos > 250 participantes
   */
  async _sendBatchedMentions(chat, participants, message, media, options, batchSize) {
    try {
      const totalBatches = Math.ceil(participants.length / batchSize);
      const customMessages = options.messages || null;

      if (customMessages && customMessages.length > 0) {
        logger.info(`📦 Enviando ${totalBatches} lotes con mensajes PERSONALIZADOS...`);
        logger.info(`📝 Mensajes personalizados recibidos: ${customMessages.length}`);
      } else {
        logger.info(`📦 Enviando ${totalBatches} lotes con variaciones AUTOMÁTICAS...`);
      }

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

        // GENERAR VARIACIÓN DEL MENSAJE para cada lote (o usar mensaje personalizado si existe)
        const batchMessage = this._generateMessageVariation(message || '', batchNumber, totalBatches, customMessages);

        // Log para ver qué tipo de mensaje se está usando
        if (customMessages && customMessages[batchNumber - 1]) {
          const preview = batchMessage.substring(0, 50) + (batchMessage.length > 50 ? '...' : '');
          logger.info(`📝 Lote ${batchNumber}: Mensaje personalizado → "${preview}"`);
        } else if (batchNumber > 1 && batchMessage !== message) {
          const preview = batchMessage.substring(0, 50) + (batchMessage.length > 50 ? '...' : '');
          logger.info(`🔄 Lote ${batchNumber}: Variación automática → "${preview}"`);
        } else {
          const preview = batchMessage.substring(0, 50) + (batchMessage.length > 50 ? '...' : '');
          logger.info(`📨 Lote ${batchNumber}: Mensaje original → "${preview}"`);
        }

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

  async sendPoll(chatId, pollName, pollOptions, options = {}) {
    logger.info('Sending poll with params', { chatId, pollName, pollOptions, options });
    if (!this.isReady) {
      logger.error('WhatsApp client is not ready for sendPoll');
      throw new Error('Cliente de WhatsApp no está listo');
    }

    try {
      const poll = new Poll(pollName, pollOptions);
      logger.info('Created new Poll object', poll);
      await this.client.sendMessage(chatId, poll, options);
      logger.success(`Encuesta enviada a ${chatId}`);
      return { success: true, chatId, pollName };
    } catch (error) {
      logger.error(`Error enviando encuesta a ${chatId}`, error);
      throw error;
    }
  }

  /**
   * Sale de un grupo
   */
  async leaveGroup(groupId) {
    if (!this.isReady) {
      throw new Error('Cliente de WhatsApp no está listo');
    }

    try {
      const chat = await this.client.getChatById(groupId);

      if (!chat.isGroup) {
        throw new Error('El chat especificado no es un grupo');
      }

      await chat.leave();
      logger.success(`Saliste del grupo ${groupId}`);
      return { success: true, groupId };
    } catch (error) {
      logger.error(`Error saliendo del grupo ${groupId}`, error);
      throw error;
    }
  }

  /**
   * Añade participantes a un grupo
   * @param {string} groupId - ID del grupo
   * @param {string|string[]} participantIds - ID(s) del/los participante(s) (formato: [email protected])
   */
  async addParticipantsToGroup(groupId, participantIds) {
    if (!this.isReady) {
      throw new Error('Cliente de WhatsApp no está listo');
    }

    try {
      const chat = await this.client.getChatById(groupId);

      if (!chat.isGroup) {
        throw new Error('El chat especificado no es un grupo');
      }

      // Convertir a array si es un solo ID
      const idsArray = Array.isArray(participantIds) ? participantIds : [participantIds];

      // Añadir participantes
      const result = await chat.addParticipants(idsArray, {
        autoSendInviteV4: true,
        comment: ''
      });

      logger.success(`Participantes añadidos al grupo ${groupId}: ${idsArray.length}`);
      return {
        success: true,
        groupId,
        addedCount: idsArray.length,
        result
      };
    } catch (error) {
      logger.error(`Error añadiendo participantes al grupo ${groupId}`, error);
      throw error;
    }
  }

  /**
   * Elimina participantes de un grupo
   * @param {string} groupId - ID del grupo
   * @param {string[]} participantIds - Array de IDs de participantes
   */
  async removeParticipantsFromGroup(groupId, participantIds) {
    if (!this.isReady) {
      throw new Error('Cliente de WhatsApp no está listo');
    }

    try {
      const chat = await this.client.getChatById(groupId);

      if (!chat.isGroup) {
        throw new Error('El chat especificado no es un grupo');
      }

      // Asegurar que sea array
      const idsArray = Array.isArray(participantIds) ? participantIds : [participantIds];

      // Eliminar participantes
      const result = await chat.removeParticipants(idsArray);

      logger.success(`Participantes eliminados del grupo ${groupId}: ${idsArray.length}`);
      return {
        success: true,
        groupId,
        removedCount: idsArray.length,
        result
      };
    } catch (error) {
      logger.error(`Error eliminando participantes del grupo ${groupId}`, error);
      throw error;
    }
  }

  /**
   * Promociona participantes a administradores
   * @param {string} groupId - ID del grupo
   * @param {string[]} participantIds - Array de IDs de participantes
   */
  async promoteParticipants(groupId, participantIds) {
    if (!this.isReady) {
      throw new Error('Cliente de WhatsApp no está listo');
    }

    try {
      const chat = await this.client.getChatById(groupId);

      if (!chat.isGroup) {
        throw new Error('El chat especificado no es un grupo');
      }

      const idsArray = Array.isArray(participantIds) ? participantIds : [participantIds];
      const result = await chat.promoteParticipants(idsArray);

      logger.success(`Participantes promocionados a admin en grupo ${groupId}: ${idsArray.length}`);
      return {
        success: true,
        groupId,
        promotedCount: idsArray.length,
        result
      };
    } catch (error) {
      logger.error(`Error promocionando participantes en grupo ${groupId}`, error);
      throw error;
    }
  }

  /**
   * Degradar administradores a participantes regulares
   * @param {string} groupId - ID del grupo
   * @param {string[]} participantIds - Array de IDs de participantes
   */
  async demoteParticipants(groupId, participantIds) {
    if (!this.isReady) {
      throw new Error('Cliente de WhatsApp no está listo');
    }

    try {
      const chat = await this.client.getChatById(groupId);

      if (!chat.isGroup) {
        throw new Error('El chat especificado no es un grupo');
      }

      const idsArray = Array.isArray(participantIds) ? participantIds : [participantIds];
      const result = await chat.demoteParticipants(idsArray);

      logger.success(`Admins degradados a miembros en grupo ${groupId}: ${idsArray.length}`);
      return {
        success: true,
        groupId,
        demotedCount: idsArray.length,
        result
      };
    } catch (error) {
      logger.error(`Error degradando participantes en grupo ${groupId}`, error);
      throw error;
    }
  }

  /**
   * Actualiza la descripción de un grupo
   */
  async updateGroupDescription(groupId, description) {
    if (!this.isReady) {
      throw new Error('Cliente de WhatsApp no está listo');
    }

    try {
      const chat = await this.client.getChatById(groupId);

      if (!chat.isGroup) {
        throw new Error('El chat especificado no es un grupo');
      }

      const result = await chat.setDescription(description);
      logger.success(`Descripción actualizada en grupo ${groupId}`);
      return { success: result, groupId, description };
    } catch (error) {
      logger.error(`Error actualizando descripción del grupo ${groupId}`, error);
      throw error;
    }
  }

  /**
   * Actualiza el nombre de un grupo
   */
  async updateGroupName(groupId, name) {
    if (!this.isReady) {
      throw new Error('Cliente de WhatsApp no está listo');
    }

    try {
      const chat = await this.client.getChatById(groupId);

      if (!chat.isGroup) {
        throw new Error('El chat especificado no es un grupo');
      }

      const result = await chat.setSubject(name);
      logger.success(`Nombre actualizado en grupo ${groupId}: ${name}`);
      return { success: result, groupId, name };
    } catch (error) {
      logger.error(`Error actualizando nombre del grupo ${groupId}`, error);
      throw error;
    }
  }

  /**
   * Obtiene el código de invitación de un grupo
   */
  async getGroupInviteCode(groupId) {
    if (!this.isReady) {
      throw new Error('Cliente de WhatsApp no está listo');
    }

    try {
      const chat = await this.client.getChatById(groupId);

      if (!chat.isGroup) {
        throw new Error('El chat especificado no es un grupo');
      }

      const inviteCode = await chat.getInviteCode();
      logger.success(`Código de invitación obtenido para grupo ${groupId}`);
      return {
        success: true,
        groupId,
        inviteCode,
        inviteLink: `https://chat.whatsapp.com/${inviteCode}`
      };
    } catch (error) {
      logger.error(`Error obteniendo código de invitación del grupo ${groupId}`, error);
      throw error;
    }
  }

  /**
   * Revoca el código de invitación actual y genera uno nuevo
   */
  async revokeGroupInviteCode(groupId) {
    if (!this.isReady) {
      throw new Error('Cliente de WhatsApp no está listo');
    }

    try {
      const chat = await this.client.getChatById(groupId);

      if (!chat.isGroup) {
        throw new Error('El chat especificado no es un grupo');
      }

      const newInviteCode = await chat.revokeInvite();
      logger.success(`Código de invitación revocado en grupo ${groupId}`);
      return {
        success: true,
        groupId,
        newInviteCode,
        newInviteLink: `https://chat.whatsapp.com/${newInviteCode}`
      };
    } catch (error) {
      logger.error(`Error revocando código de invitación del grupo ${groupId}`, error);
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
