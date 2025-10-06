# 🏗️ Arquitectura del Proyecto

## Visión General

WhatsApp Manager sigue una arquitectura **cliente-servidor** con comunicación en tiempo real mediante WebSockets (Socket.io).

```
┌─────────────────┐         Socket.io          ┌─────────────────┐
│                 │◄──────────────────────────►│                 │
│   Frontend      │         REST API           │    Backend      │
│   (Next.js)     │◄──────────────────────────►│   (Express)     │
│                 │                             │                 │
└─────────────────┘                             └────────┬────────┘
                                                         │
                                                         ▼
                                                ┌─────────────────┐
                                                │   WhatsApp      │
                                                │   Web.js        │
                                                └─────────────────┘
```

## Backend (Express.js)

### Arquitectura MVC + Services

```
backend/
├── app.js                    # Entry point - configuración de Express y Socket.io
├── controllers/              # Capa de controladores (maneja requests HTTP)
│   ├── MessageController.js  # Lógica de mensajes
│   ├── GroupController.js    # Lógica de grupos
│   └── StatsController.js    # Lógica de estadísticas
├── services/                 # Capa de servicios (lógica de negocio)
│   ├── WhatsAppService.js    # Conexión y operaciones de WhatsApp
│   └── LinkPreviewService.js # Preview de links (Open Graph)
├── models/                   # Modelos de datos (preparados para DB)
│   ├── Message.js
│   ├── Group.js
│   └── Stats.js
├── routes/                   # Definición de rutas REST
│   ├── messageRoutes.js
│   ├── groupRoutes.js
│   └── statsRoutes.js
└── utils/                    # Utilidades compartidas
    ├── logger.js             # Logger estructurado
    ├── delay.js              # Funciones de delay
    └── formatMessage.js      # Formateo de mensajes
```

### Flujo de Datos Backend

```
Request HTTP
    ↓
Express Router
    ↓
Controller (validación y orquestación)
    ↓
Service (lógica de negocio)
    ↓
WhatsApp Web.js / APIs externas
    ↓
Response
```

### Características Clave

- **Singleton Pattern**: WhatsAppService es una instancia única compartida
- **Separation of Concerns**: Controllers ≠ Services ≠ Models
- **Error Handling**: Manejo centralizado de errores
- **Logging**: Sistema de logs estructurado con colores
- **Rate Limiting**: Delays automáticos para evitar bloqueos

## Frontend (Next.js 15)

### App Router + React Server Components

```
frontend/
├── app/                      # Next.js 15 App Router
│   ├── layout.tsx            # Layout principal
│   ├── page.tsx              # Dashboard home
│   ├── providers.tsx         # React Query provider
│   ├── qr/page.tsx           # Página de QR
│   ├── groups/page.tsx       # Gestión de grupos
│   ├── messages/page.tsx     # Envío de mensajes
│   └── stats/page.tsx        # Estadísticas
├── components/               # Componentes UI reutilizables
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Input.tsx
│   ├── Textarea.tsx
│   ├── Badge.tsx
│   └── Table.tsx
├── hooks/                    # Custom React Hooks
│   ├── useSocket.ts          # Socket.io connection
│   ├── useMessages.ts        # Operaciones de mensajes
│   ├── useGroups.ts          # Datos de grupos
│   └── useStats.ts           # Estadísticas
├── utils/                    # Utilidades
│   ├── cn.ts                 # Class name merger
│   └── formatTime.ts         # Formateo de fechas
└── styles/
    └── globals.css           # Estilos globales + Tailwind
```

### Flujo de Datos Frontend

```
User Interaction
    ↓
React Component
    ↓
Custom Hook (useMessages, useGroups, etc.)
    ↓
API Client (axios) o Socket.io
    ↓
Backend API
    ↓
Update UI (React Query cache / useState)
```

### State Management

- **Local State**: `useState` para formularios y UI temporal
- **Server State**: React Query para datos del servidor (cache automático)
- **WebSocket State**: Custom hook `useSocket` para conexión en tiempo real

## Comunicación Frontend ↔ Backend

### REST API (HTTP)

Usado para operaciones CRUD y acciones puntuales:

```typescript
// Ejemplo: Enviar mensaje
POST /api/messages/send
Body: { chatId: string, message: string }
Response: { success: boolean, data: {...} }
```

### Socket.io (WebSockets)

Usado para eventos en tiempo real:

```typescript
// Cliente escucha eventos del servidor
socket.on('qr', (data) => { /* mostrar QR */ })
socket.on('ready', () => { /* WhatsApp conectado */ })

// Cliente emite eventos al servidor
socket.emit('request_qr')
```

#### Eventos Disponibles

**Servidor → Cliente:**
- `qr` - Código QR generado
- `ready` - WhatsApp conectado
- `authenticated` - Autenticación exitosa
- `auth_failure` - Error de autenticación
- `disconnected` - Desconexión
- `status` - Estado actual
- `message_received` - Nuevo mensaje recibido

**Cliente → Servidor:**
- `request_qr` - Solicitar código QR

## Patrones de Diseño

### 1. Singleton (WhatsAppService)

```javascript
class WhatsAppService {
  constructor() {
    this.client = null
    this.isReady = false
  }
  // ...
}

export const whatsappService = new WhatsAppService()
```

### 2. Observer (Socket.io)

```javascript
// Backend emite eventos
io.emit('qr', { qr: qrImage })

// Frontend escucha eventos
socket.on('qr', (data) => setQrCode(data.qr))
```

### 3. Factory (Models)

```javascript
class Message {
  constructor(data) {
    this.id = data.id || Date.now().toString()
    // ...
  }
}
```

### 4. Custom Hooks (React)

```typescript
export const useMessages = () => {
  const [loading, setLoading] = useState(false)

  const sendMessage = async ({ chatId, message }) => {
    // lógica
  }

  return { loading, sendMessage }
}
```

## Preparación para Base de Datos

### Estructura Actual (Sin DB)

```javascript
// Estadísticas en memoria
app.locals.stats = new Stats()
```

### Migración a MongoDB (Ejemplo)

```javascript
// 1. Instalar mongoose
npm install mongoose

// 2. Crear schema
const messageSchema = new mongoose.Schema({
  chatId: String,
  content: String,
  timestamp: Date,
  status: String
})

// 3. Actualizar controladores
const message = await Message.create({ chatId, content })
```

### Migración a PostgreSQL (Ejemplo)

```javascript
// 1. Instalar sequelize
npm install sequelize pg

// 2. Definir modelo
const Message = sequelize.define('Message', {
  chatId: DataTypes.STRING,
  content: DataTypes.TEXT,
  status: DataTypes.STRING
})

// 3. Usar en controladores
const message = await Message.create({ chatId, content })
```

## Seguridad

### Backend
- ✅ CORS configurado
- ✅ Validación de inputs en controladores
- ✅ Manejo de errores centralizado
- ⚠️ Sin autenticación (agregar JWT si es necesario)

### Frontend
- ✅ Variables de entorno para URLs
- ✅ Sanitización de inputs
- ✅ HTTPS recomendado en producción

## Performance

### Backend
- Delays automáticos entre mensajes masivos
- Logs estructurados sin bloqueo
- Event listeners optimizados

### Frontend
- React Query con cache automático
- Componentes optimizados con React.memo (donde necesario)
- Lazy loading de rutas (App Router)
- Refetch inteligente (solo cuando es necesario)

## Escalabilidad

### Horizontal (Múltiples instancias)
❌ No soportado actualmente (WhatsApp session es local)

**Solución:**
- Usar Redis para compartir sesión
- Load balancer sticky sessions

### Vertical (Más recursos)
✅ Soportado - aumentar recursos del servidor

## Testing (Recomendado)

```bash
# Backend
npm install --save-dev jest supertest

# Frontend
npm install --save-dev @testing-library/react vitest
```

## CI/CD (Recomendado)

```yaml
# .github/workflows/deploy.yml
- Test backend
- Test frontend
- Build frontend
- Deploy backend (Railway)
- Deploy frontend (Vercel)
```

---

Esta arquitectura permite:
- ✅ Código limpio y mantenible
- ✅ Separación clara de responsabilidades
- ✅ Fácil testing
- ✅ Escalabilidad futura
- ✅ Migración simple a base de datos
