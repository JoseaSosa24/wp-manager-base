# 🚀 Guía Rápida de Inicio

## Instalación en 3 pasos

### 1️⃣ Instalar dependencias
```bash
npm run install:all
```
Esto instalará todas las dependencias del backend y frontend automáticamente.

### 2️⃣ Iniciar en modo desarrollo
```bash
npm run dev
```
Esto iniciará tanto el backend (puerto 4000) como el frontend (puerto 3000) simultáneamente.

### 3️⃣ Conectar WhatsApp
1. Abre http://localhost:3000/qr en tu navegador
2. Escanea el código QR con WhatsApp
3. ¡Listo! Ya puedes usar la aplicación

## 📱 Uso Básico

### Enviar mensaje individual
1. Ve a **Mensajes** en el dashboard
2. Selecciona **Individual**
3. Elige un chat o pega el ID
4. Escribe tu mensaje
5. Click en **Enviar**

### Enviar mensajes masivos
1. Ve a **Mensajes**
2. Selecciona **Masivo**
3. Pega los IDs de destinatarios (uno por línea)
4. Escribe tu mensaje
5. Click en **Enviar mensajes masivos**

### Mencionar a todos en un grupo
1. Ve a **Grupos**
2. Click en **Seleccionar** en el grupo deseado
3. Escribe tu mensaje
4. Click en **Mencionar a todos**

### Ver estadísticas
1. Ve a **Estadísticas**
2. Visualiza mensajes enviados, tasa de éxito, etc.
3. Click en **Actualizar** para refrescar datos

## 🔧 Comandos Útiles

### Desarrollo
```bash
# Iniciar todo (backend + frontend)
npm run dev

# Solo backend
npm run dev:backend

# Solo frontend
npm run dev:frontend
```

### Producción
```bash
# Build del frontend
npm run build:frontend

# Iniciar backend
npm run start:backend

# Iniciar frontend
npm run start:frontend
```

## ⚠️ Troubleshooting

### El QR no aparece
1. Verifica que el backend esté corriendo en puerto 4000
2. Revisa la consola del backend para ver logs
3. Intenta refrescar la página

### Error de conexión
1. Asegúrate de que ambos servidores estén corriendo
2. Verifica que los puertos 3000 y 4000 estén libres
3. Revisa la URL en [.env.local](frontend/.env.local)

### Mensajes no se envían
1. Verifica que WhatsApp esté conectado (badge verde)
2. Asegúrate de usar IDs válidos (ej: 5491112345678@c.us)
3. Revisa los logs del backend para más detalles

## 📚 Más Información

- [README completo](README.md) - Documentación completa
- [API Endpoints](README.md#-api-endpoints) - Lista de endpoints disponibles
- [Arquitectura](README.md#-estructura-del-proyecto) - Estructura del código

## 💡 Tips

- Los mensajes masivos incluyen delay automático para evitar bloqueos
- Usa el preview de links antes de enviar para verificar
- Las estadísticas se actualizan cada 5 segundos automáticamente
- La sesión de WhatsApp se guarda, no necesitas escanear QR cada vez

---

¿Necesitas ayuda? Revisa los logs en la consola o abre un issue en GitHub.
