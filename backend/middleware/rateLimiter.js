import rateLimit from 'express-rate-limit';
import { networkInterfaces } from 'os';

/**
 * Obtiene la IP real del cliente, incluso detrás de proxies
 * @param {Request} req 
 * @returns {string}
 */
const getClientIp = (req) => {
  // Verificar X-Forwarded-For header
  const forwardedFor = req.headers['x-forwarded-for'];
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  
  // Verificar IP real
  return req.ip || req.connection.remoteAddress;
};

/**
 * Configuración base para el rate limiting
 */
const baseConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutos
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: getClientIp,
  handler: (req, res) => {
    res.status(429).json({
      error: 'Demasiadas solicitudes. Por favor, intente más tarde.',
      retryAfter: Math.ceil(req.rateLimit.resetTime / 1000),
    });
  }
};

/**
 * Rate limiter para endpoints generales
 */
export const generalLimiter = rateLimit({
  ...baseConfig,
  max: 100, // 100 solicitudes por ventana
});

/**
 * Rate limiter más estricto para endpoints sensibles (auth, etc)
 */
export const strictLimiter = rateLimit({
  ...baseConfig,
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 30, // 30 solicitudes por ventana
});

/**
 * Rate limiter para operaciones de escritura (POST, PUT, DELETE)
 */
export const writeLimiter = rateLimit({
  ...baseConfig,
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 50, // 50 operaciones de escritura por ventana
  skip: (req) => ['GET', 'HEAD', 'OPTIONS'].includes(req.method),
});

/**
 * Rate limiter para endpoints de archivos/uploads
 */
export const uploadLimiter = rateLimit({
  ...baseConfig,
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 10, // 10 uploads por hora
});