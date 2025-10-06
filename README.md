# 📱 WhatsApp Manager

Aplicación moderna para administrar grupos y canales de WhatsApp con una interfaz elegante tipo dashboard.

## ✨ Características

- 🔐 Conexión segura mediante código QR
- 💬 Envío de mensajes individuales y masivos
- 👥 Mención masiva a todos los miembros de un grupo
- 📢 Envío de mensajes a canales de WhatsApp
- 📊 Dashboard con estadísticas en tiempo real
- 🔗 Preview automático de links (Open Graph)
- 🎨 Interfaz moderna y responsiva
- ⚡ Comunicación en tiempo real con Socket.io

## 🛠️ Stack Tecnológico

### Frontend
- **Framework**: Next.js 15
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS + Componentes tipo Shadcn UI
- **Estado**: Zustand + React Query
- **Real-time**: Socket.io-client
- **Iconos**: Lucide React

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **WhatsApp**: whatsapp-web.js
- **Real-time**: Socket.io
- **Arquitectura**: MVC + Services

## 📁 Estructura del Proyecto

```
whatsapp-manager/
├── backend/
│   ├── app.js                    # Entry point
│   ├── controllers/              # Controladores MVC
│   ├── services/                 # Lógica de negocio
│   ├── models/                   # Modelos de datos
│   ├── routes/                   # Rutas de API
│   └── utils/                    # Utilidades
└── frontend/
    ├── app/                      # Páginas Next.js 15
    ├── components/               # Componentes UI
    ├── hooks/                    # Custom hooks
    ├── utils/                    # Utilidades
    └── styles/                   # Estilos globales
```

## 🚀 Instalación

### 1. Instalar pnpm (si no lo tienes)

```bash
npm install -g pnpm
```

### 2. Clonar e instalar

```bash
git clone <repo-url>
cd whatsapp-manager
pnpm install -r
```

### 3. Configurar variables de entorno

Crear archivo `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_SOCKET_URL=http://localhost:4000
```

## 🎮 Uso

### Desarrollo (un solo comando)

```bash
pnpm dev
```

Esto inicia backend y frontend simultáneamente.

O por separado:
```bash
pnpm dev:backend
pnpm dev:frontend
```

La aplicación estará disponible en:
- Frontend: http://localhost:3000
- Backend API: http://localhost:4000

### Producción

**Backend:**
```bash
cd backend
npm start
```

**Frontend:**
```bash
cd frontend
npm run build
npm start
```

## 📖 Guía de Uso

### 1. Conectar WhatsApp
1. Accede a http://localhost:3000/qr
2. Escanea el código QR con tu WhatsApp
3. Espera la confirmación de conexión

### 2. Enviar Mensajes
- **Individual**: Selecciona un chat y envía un mensaje
- **Masivo**: Ingresa múltiples destinatarios (uno por línea)
- **Canal**: Envía mensajes a tus canales de WhatsApp

### 3. Gestionar Grupos
- Visualiza todos tus grupos
- Menciona a todos los participantes con un solo clic
- Ve estadísticas de participantes

### 4. Ver Estadísticas
- Mensajes enviados y fallidos
- Tasa de éxito
- Grupos y canales activos

## 🔌 API Endpoints

### Mensajes
- `POST /api/messages/send` - Enviar mensaje individual
- `POST /api/messages/bulk` - Enviar mensajes masivos
- `POST /api/messages/mention-all` - Mencionar a todos en grupo
- `POST /api/messages/channel` - Enviar a canal
- `GET /api/messages/preview` - Preview de link

### Grupos
- `GET /api/groups` - Listar grupos
- `GET /api/groups/chats` - Listar todos los chats
- `GET /api/groups/:id` - Info de grupo
- `GET /api/groups/:id/participants` - Participantes

### Estadísticas
- `GET /api/stats` - Obtener estadísticas
- `POST /api/stats/reset` - Reiniciar estadísticas

## 🎯 Eventos Socket.io

### Cliente → Servidor
- `request_qr` - Solicitar código QR

### Servidor → Cliente
- `qr` - Código QR generado
- `ready` - WhatsApp conectado
- `authenticated` - Autenticación exitosa
- `auth_failure` - Error de autenticación
- `disconnected` - Desconexión
- `status` - Estado de conexión

## 🗄️ Preparado para Base de Datos

El código está estructurado para agregar persistencia fácilmente:

1. Los modelos en `backend/models/` están listos para adaptarse a Mongoose (MongoDB) o Sequelize (PostgreSQL)
2. Los controladores usan estos modelos, facilitando la integración
3. Solo necesitas:
   - Instalar el ORM (mongoose o sequelize)
   - Actualizar los modelos con schemas de BD
   - Conectar a la BD en `app.js`

## 🚢 Despliegue

### Frontend (Vercel)
```bash
cd frontend
vercel deploy
```

### Backend (Railway/Render)
1. Conecta tu repositorio
2. Configura el directorio raíz: `backend`
3. Comando de inicio: `npm start`
4. Variables de entorno: `FRONTEND_URL`

## 🔧 Personalización

### Colores del tema
Edita `frontend/styles/globals.css` para cambiar los colores:
```css
:root {
  --primary: 142 76% 36%; /* Verde WhatsApp */
  /* ... más colores */
}
```

### Logo y branding
- Agrega tu logo en `frontend/public/`
- Actualiza metadata en `frontend/app/layout.tsx`

## 📝 Notas Importantes

- **Límites de WhatsApp**: Implementa delays entre mensajes masivos para evitar bloqueos
- **Sesión persistente**: La sesión de WhatsApp se guarda en `.wwebjs_auth/`
- **Sin base de datos**: Por defecto no persiste mensajes, solo estadísticas en memoria

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -m 'Agrega nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📄 Licencia

MIT License - ver archivo LICENSE para más detalles

## 🙏 Agradecimientos

- [whatsapp-web.js](https://github.com/pedroslopez/whatsapp-web.js)
- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Shadcn UI](https://ui.shadcn.com/)

---

Desarrollado con ❤️ usando Next.js 15 y WhatsApp Web.js
