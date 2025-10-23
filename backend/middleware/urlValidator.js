import { URL } from 'url';

/**
 * Validación avanzada de URLs
 * - Verifica que la URL sea válida
 * - Comprueba el protocolo (solo permite http y https)
 * - Valida la longitud máxima
 * - Verifica caracteres especiales maliciosos
 * @param {string} url 
 * @returns {boolean}
 */
const isValidUrl = (url) => {
  try {
    const parsedUrl = new URL(url);
    
    // Solo permitir http y https
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return false;
    }

    // Verificar longitud máxima (2000 caracteres es un límite razonable)
    if (url.length > 2000) {
      return false;
    }

    // Verificar caracteres maliciosos comunes en ataques
    const maliciousPatterns = [
      /javascript:/i,
      /data:/i,
      /vbscript:/i,
      /<script/i,
      /%3Cscript/i,
      /&#x3C;script/i
    ];

    if (maliciousPatterns.some(pattern => pattern.test(url))) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
};

/**
 * Middleware para validar URLs en las solicitudes
 * Verifica tanto query params como body params
 */
export const validateUrls = (urlFields) => {
  return (req, res, next) => {
    try {
      // Validar URLs en query params
      for (const field of urlFields) {
        if (req.query[field] && !isValidUrl(req.query[field])) {
          return res.status(400).json({
            error: `URL inválida en el campo ${field}`,
            field,
            location: 'query'
          });
        }
      }

      // Validar URLs en body
      if (req.body) {
        for (const field of urlFields) {
          if (req.body[field] && !isValidUrl(req.body[field])) {
            return res.status(400).json({
              error: `URL inválida en el campo ${field}`,
              field,
              location: 'body'
            });
          }
        }
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Middleware para sanitizar URLs
 * Elimina caracteres potencialmente peligrosos
 */
export const sanitizeUrls = (urlFields) => {
  return (req, res, next) => {
    try {
      // Sanitizar URLs en query params
      for (const field of urlFields) {
        if (req.query[field]) {
          req.query[field] = encodeURI(req.query[field]);
        }
      }

      // Sanitizar URLs en body
      if (req.body) {
        for (const field of urlFields) {
          if (req.body[field]) {
            req.body[field] = encodeURI(req.body[field]);
          }
        }
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};