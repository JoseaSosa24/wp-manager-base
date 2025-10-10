/**
 * Middleware para manejo de archivos con multer
 */

import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { logger } from '../utils/logger.js';

// Crear directorio de uploads si no existe
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  logger.info('Directorio de uploads creado');
}

// Configuración de almacenamiento
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generar nombre único: timestamp-random-originalname
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    const ext = path.extname(file.originalname);
    const nameWithoutExt = path.basename(file.originalname, ext);
    cb(null, `${nameWithoutExt}-${uniqueSuffix}${ext}`);
  }
});

// Filtro de archivos permitidos
const fileFilter = (req, file, cb) => {
  // Tipos MIME permitidos
  const allowedMimes = [
    // Imágenes
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/avif',
    'image/svg+xml',
    'image/bmp',
    'image/tiff',
    'image/heic',
    'image/heif',
    // Videos
    'video/mp4',
    'video/mpeg',
    'video/quicktime',
    'video/x-msvideo',
    'video/webm',
    'video/3gpp',
    'video/x-matroska',
    // Audio
    'audio/mpeg',
    'audio/mp3',
    'audio/ogg',
    'audio/wav',
    'audio/webm',
    'audio/aac',
    'audio/x-m4a',
    'audio/flac',
    // Documentos
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'application/zip',
    'application/x-rar-compressed'
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Tipo de archivo no permitido: ${file.mimetype}`), false);
  }
};

// Configuración de multer
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB límite
  }
});

/**
 * Elimina un archivo del sistema
 */
export const deleteFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      logger.info(`Archivo eliminado: ${filePath}`);
    }
  } catch (error) {
    logger.error('Error eliminando archivo:', error);
  }
};
