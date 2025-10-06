/**
 * Logger estructurado para la aplicación
 */

const levels = {
  INFO: '\x1b[36m[INFO]\x1b[0m',
  SUCCESS: '\x1b[32m[SUCCESS]\x1b[0m',
  WARNING: '\x1b[33m[WARNING]\x1b[0m',
  ERROR: '\x1b[31m[ERROR]\x1b[0m'
};

export const logger = {
  info: (message, meta = {}) => {
    console.log(levels.INFO, message, Object.keys(meta).length ? meta : '');
  },

  success: (message, meta = {}) => {
    console.log(levels.SUCCESS, message, Object.keys(meta).length ? meta : '');
  },

  warning: (message, meta = {}) => {
    console.warn(levels.WARNING, message, Object.keys(meta).length ? meta : '');
  },

  error: (message, error = null) => {
    console.error(levels.ERROR, message, error?.message || error || '');
  }
};
