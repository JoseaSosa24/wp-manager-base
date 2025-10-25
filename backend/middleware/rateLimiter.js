import rateLimit from 'express-rate-limit';

const baseConfig = {
  windowMs: 15 * 60 * 1000,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: 'Demasiadas solicitudes. Por favor, intente más tarde.',
      retryAfter: req.rateLimit?.resetTime ? Math.ceil((req.rateLimit.resetTime - Date.now()) / 1000) : 60,
    });
  }
};

export const generalLimiter = rateLimit({
  ...baseConfig,
  max: 100
});

export const strictLimiter = rateLimit({
  ...baseConfig,
  windowMs: 60 * 60 * 1000,
  max: 30
});

export const writeLimiter = rateLimit({
  ...baseConfig,
  windowMs: 60 * 60 * 1000,
  max: 50,
  skip: (req) => ['GET', 'HEAD', 'OPTIONS'].includes(req.method)
});

export const uploadLimiter = rateLimit({
  ...baseConfig,
  windowMs: 60 * 60 * 1000,
  max: 10
});