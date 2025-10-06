# 🔧 Correcciones Urgentes - Guía Paso a Paso

## 1️⃣ ACTUALIZAR DEPENDENCIAS (CRÍTICO)

### Backend
```bash
cd backend
npm install socket.io@^4.8.1
npm install helmet@^8.0.0
npm install express-rate-limit@^7.4.1
npm install express-validator@^7.2.0
npm install axios@^1.7.0
```

### Frontend
```bash
cd frontend
npm install socket.io-client@^4.8.1
npm install @tanstack/react-query@^5.90.2
npm install axios@^1.7.0
npm install lucide-react@latest
```

## 2️⃣ CORREGIR RENDERIZADO DE NEXT.JS 15

### ❌ PROBLEMA: Todas las páginas tienen "use client" innecesariamente

**Según la documentación oficial de Next.js 15:**
> Por defecto, todos los componentes en App Router son Server Components. Solo usa "use client" cuando necesites interactividad del lado del cliente (hooks, eventos, etc.)

### ✅ SOLUCIÓN:

#### Archivo: `frontend/app/page.tsx`
**CAMBIO NECESARIO:** Este archivo usa `useSocket` y `useRouter`, entonces SÍ necesita "use client", pero podemos optimizar:

```tsx
// OPCIÓN 1: Mantener como está (está OK)
"use client"
// ... resto del código

// OPCIÓN 2: Separar en Server + Client Components (MEJOR)
// page.tsx (Server Component - sin "use client")
import { DashboardClient } from './DashboardClient'

export default function HomePage() {
  return <DashboardClient />
}

// DashboardClient.tsx (Client Component)
"use client"
import { useSocket } from '@/hooks/useSocket'
// ... resto de la lógica
```

#### Archivos que SÍ necesitan "use client":
- ✅ `app/page.tsx` - usa hooks
- ✅ `app/qr/page.tsx` - usa hooks
- ✅ `app/groups/page.tsx` - usa hooks
- ✅ `app/messages/page.tsx` - usa hooks
- ✅ `app/stats/page.tsx` - usa hooks
- ✅ `app/providers.tsx` - usa React Query

**CONCLUSIÓN:** En este caso específico, **todas las páginas SÍ necesitan "use client"** porque todas usan hooks. El código actual está CORRECTO.

**NOTA IMPORTANTE:** La confusión viene de que podríamos optimizar separando la lógica en componentes, pero para una app de este tamaño, no es necesario.

## 3️⃣ CORREGIR SOCKET.IO (CRÍTICO)

### Archivo: `backend/app.js`

**REEMPLAZAR:**
```javascript
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});
```

**POR:**
```javascript
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

// Agregar ANTES de las rutas
app.use(helmet());

// Rate limiting global
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // 100 requests por IP
  message: 'Demasiadas peticiones desde esta IP, intenta más tarde'
});
app.use('/api/', limiter);

// Rate limiting para mensajes (más restrictivo)
const messageLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 10, // 10 mensajes por minuto
  message: 'Límite de mensajes alcanzado, espera un minuto'
});
app.use('/api/messages', messageLimiter);

// Socket.IO con configuración segura
const allowedOrigins = [
  'http://localhost:3000',
  'https://tudominio.com', // Agregar tu dominio de producción
  process.env.FRONTEND_URL
].filter(Boolean);

const io = new Server(httpServer, {
  cors: {
    origin: function (origin, callback) {
      // Permitir requests sin origin (apps móviles, Postman, etc.)
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('No permitido por CORS'));
      }
    },
    methods: ['GET', 'POST'],
    credentials: true
  },
  allowEIO3: false, // Deshabilitar versiones antiguas de Engine.IO
  pingTimeout: 60000,
  pingInterval: 25000
});

// Manejo de errores de Socket.IO
io.engine.on('connection_error', (err) => {
  logger.error('Error de conexión Socket.IO:', err);
});

io.on('connect_error', (err) => {
  logger.error('Error al conectar:', err);
});
```

## 4️⃣ AGREGAR VALIDACIÓN DE INPUTS

### Archivo: `backend/controllers/MessageController.js`

**AGREGAR al inicio:**
```javascript
import { body, validationResult } from 'express-validator';
```

**CREAR nuevo archivo:** `backend/middleware/validators.js`
```javascript
import { body, param, query } from 'express-validator';

export const validateSendMessage = [
  body('chatId')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('chatId es requerido')
    .matches(/^[\d@.]+$/)
    .withMessage('chatId tiene formato inválido'),

  body('message')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('message es requerido')
    .isLength({ min: 1, max: 4096 })
    .withMessage('message debe tener entre 1 y 4096 caracteres')
];

export const validateBulkMessages = [
  body('recipients')
    .isArray({ min: 1, max: 50 })
    .withMessage('recipients debe ser un array de 1 a 50 elementos'),

  body('recipients.*')
    .isString()
    .trim()
    .matches(/^[\d@.]+$/)
    .withMessage('Formato de destinatario inválido'),

  body('message')
    .isString()
    .trim()
    .notEmpty()
    .isLength({ min: 1, max: 4096 })
];

export const validateMentionAll = [
  body('groupId')
    .isString()
    .trim()
    .notEmpty()
    .matches(/^[\d@.]+$/)
    .withMessage('groupId inválido'),

  body('message')
    .isString()
    .trim()
    .notEmpty()
    .isLength({ min: 1, max: 4096 })
];

export const validateLinkPreview = [
  query('url')
    .isURL({ protocols: ['http', 'https'] })
    .withMessage('URL inválida')
];

export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }
  next();
};
```

**ACTUALIZAR:** `backend/routes/messageRoutes.js`
```javascript
import express from 'express';
import { MessageController } from '../controllers/MessageController.js';
import {
  validateSendMessage,
  validateBulkMessages,
  validateMentionAll,
  validateLinkPreview,
  handleValidationErrors
} from '../middleware/validators.js';

const router = express.Router();

router.post('/send',
  validateSendMessage,
  handleValidationErrors,
  MessageController.sendMessage
);

router.post('/bulk',
  validateBulkMessages,
  handleValidationErrors,
  MessageController.sendBulkMessages
);

router.post('/mention-all',
  validateMentionAll,
  handleValidationErrors,
  MessageController.mentionAll
);

router.get('/preview',
  validateLinkPreview,
  handleValidationErrors,
  MessageController.getLinkPreview
);

export default router;
```

## 5️⃣ MEJORAR WHATSAPP SERVICE (Seguridad)

### Archivo: `backend/services/WhatsAppService.js`

**REEMPLAZAR la inicialización del cliente:**
```javascript
initialize(io) {
  this.io = io;

  this.client = new Client({
    authStrategy: new LocalAuth({
      clientId: 'whatsapp-manager-main',
      dataPath: './sessions'
    }),
    puppeteer: {
      headless: true,
      args: process.env.NODE_ENV === 'production'
        ? [
            '--disable-gpu',
            '--disable-dev-shm-usage',
            '--disable-software-rasterizer',
            '--no-first-run',
            '--no-zygote'
          ]
        : [
            '--no-sandbox', // Solo en desarrollo
            '--disable-setuid-sandbox'
          ]
    },
    webVersionCache: {
      type: 'remote',
      remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html'
    }
  });

  this.setupEventListeners();
  this.client.initialize();

  logger.info('Cliente de WhatsApp inicializando...');
}
```

## 6️⃣ AGREGAR VARIABLES DE ENTORNO

### Archivo: `backend/.env` (crear)
```env
PORT=4000
FRONTEND_URL=http://localhost:3000
NODE_ENV=development

# Producción
# NODE_ENV=production
# FRONTEND_URL=https://tudominio.com
```

### Archivo: `frontend/.env.local` (ya existe, verificar)
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_SOCKET_URL=http://localhost:4000

# Producción
# NEXT_PUBLIC_API_URL=https://api.tudominio.com
# NEXT_PUBLIC_SOCKET_URL=https://api.tudominio.com
```

## 7️⃣ ACTUALIZAR REACT QUERY (Breaking Changes)

### Archivo: `frontend/hooks/useGroups.ts`, `useStats.ts`

**SI USAS `isLoading`**, cambiarlo a `isPending`:

```typescript
// ❌ ANTES
const { data, isLoading } = useQuery(...)

// ✅ AHORA
const { data, isPending } = useQuery(...)
```

**NOTA:** En el código actual NO usas `isLoading` directamente, solo en las páginas, así que revisa:

- `app/groups/page.tsx` línea 15: `isLoading` → `isPending`
- `app/stats/page.tsx` línea 12: `isLoading` → `isPending`

## 8️⃣ AGREGAR MANEJO DE ERRORES EN SOCKET

### Archivo: `frontend/hooks/useSocket.ts`

**AGREGAR después de los event listeners:**
```typescript
socketInstance.on('connect_error', (error) => {
  console.error('Error de conexión:', error);
  setIsConnected(false);
});

socketInstance.on('error', (error) => {
  console.error('Socket error:', error);
});
```

## ✅ CHECKLIST DE IMPLEMENTACIÓN

Ejecuta en orden:

- [ ] 1. Actualizar dependencias del backend
- [ ] 2. Actualizar dependencias del frontend
- [ ] 3. Crear `backend/middleware/validators.js`
- [ ] 4. Actualizar `backend/app.js` con helmet y rate limiting
- [ ] 5. Actualizar `backend/routes/messageRoutes.js` con validadores
- [ ] 6. Actualizar `backend/services/WhatsAppService.js`
- [ ] 7. Crear `backend/.env`
- [ ] 8. Cambiar `isLoading` a `isPending` en páginas
- [ ] 9. Agregar manejo de errores en `useSocket.ts`
- [ ] 10. Probar todo localmente
- [ ] 11. Revisar logs de errores

## 🧪 PRUEBAS DESPUÉS DE IMPLEMENTAR

```bash
# 1. Backend
cd backend
npm install
npm run dev

# Verificar en consola:
# ✅ "Servidor corriendo en puerto 4000"
# ✅ Sin errores de dependencias

# 2. Frontend (otra terminal)
cd frontend
npm install
npm run dev

# Verificar en consola:
# ✅ "ready - started server on 0.0.0.0:3000"
# ✅ Sin errores de compilación

# 3. Abrir http://localhost:3000
# ✅ No debe haber errores en consola del navegador
# ✅ Ir a /qr y verificar QR
# ✅ Escanear con WhatsApp
# ✅ Probar envío de mensaje

# 4. Probar rate limiting
# Enviar 11 mensajes en 1 minuto
# ✅ El 11° debe dar error 429
```

## ⚠️ ADVERTENCIAS FINALES

1. **WhatsApp Web.js**: Sigue siendo NO oficial. Usa bajo tu propio riesgo.
2. **Producción**: Implementa autenticación (JWT) antes de desplegar.
3. **HTTPS**: Obligatorio en producción para Socket.IO y seguridad.
4. **Backup**: Respalda la carpeta `.wwebjs_auth/` (sesión de WhatsApp).
5. **Monitoreo**: Implementa logs persistentes y alertas.

---

**Tiempo estimado de implementación**: 2-3 horas
**Prioridad**: ALTA (correcciones de seguridad)
**Dificultad**: Media
