/**
 * Servidor principal - Express + Socket.io
 * Entry point del backend
 */

import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

import { whatsappService } from './services/WhatsAppService.js';
import { Stats } from './models/Stats.js';
import { logger } from './utils/logger.js';

import messageRoutes from './routes/messageRoutes.js';
import groupRoutes from './routes/groupRoutes.js';
import statsRoutes from './routes/statsRoutes.js';
import authRoutes from './routes/authRoutes.js';
import channelRoutes from './routes/channelRoutes.js';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 4000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Inicializar estadísticas en app.locals
app.locals.stats = new Stats();

// Hacer io accesible en las rutas
app.set('io', io);

// Health check
app.get('/health', (req, res) => {
  const status = whatsappService.getStatus();
  res.json({
    success: true,
    status: 'Server running',
    whatsapp: status
  });
});

// Rutas API
app.use('/api/messages', messageRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/channels', channelRoutes);

// Manejo de Socket.io
io.on('connection', (socket) => {
  logger.info(`Cliente conectado: ${socket.id}`);

  // Enviar estado actual
  socket.emit('status', whatsappService.getStatus());

  // Solicitar QR
  socket.on('request_qr', () => {
    const qr = whatsappService.getQR();
    if (qr) {
      socket.emit('qr', { qr });
    }
  });

  // Desconexión
  socket.on('disconnect', () => {
    logger.info(`Cliente desconectado: ${socket.id}`);
  });
});

// Inicializar WhatsApp
whatsappService.initialize(io);

// Manejo de errores
app.use((err, req, res, next) => {
  logger.error('Error en la aplicación', err);

  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Error interno del servidor'
  });
});

// Iniciar servidor
httpServer.listen(PORT, () => {
  logger.success(`Servidor corriendo en puerto ${PORT}`);
  logger.info(`Frontend esperado en: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
});

// Manejo de cierre graceful
process.on('SIGINT', async () => {
  logger.info('Cerrando servidor...');
  await whatsappService.disconnect();
  process.exit(0);
});

export default app;
