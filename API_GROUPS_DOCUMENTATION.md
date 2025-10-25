# 📡 API de Gestión de Grupos - WhatsApp Manager

Documentación completa de endpoints para gestión avanzada de grupos de WhatsApp.

---

## 📋 Índice

1. [Consultas (GET)](#consultas-get)
2. [Modificaciones (POST/PUT)](#modificaciones-post-put)
3. [Eliminaciones (DELETE)](#eliminaciones-delete)
4. [Ejemplos de Uso](#ejemplos-de-uso)
5. [Códigos de Error](#códigos-de-error)

---

## 🔍 Consultas (GET)

### 1. Obtener Todos los Grupos

```http
GET /api/groups
```

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "id": "1234567890@g.us",
      "name": "Mi Grupo",
      "participantsCount": 25,
      "timestamp": 1704067200000
    }
  ]
}
```

---

### 2. Obtener Información de un Grupo

```http
GET /api/groups/:groupId
```

**Parámetros:**
- `groupId` (string): ID del grupo (ej: `1234567890@g.us`)

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "id": "1234567890@g.us",
    "name": "Mi Grupo",
    "participantsCount": 25,
    "timestamp": 1704067200000,
    "participants": [
      {
        "id": "[email protected]",
        "isAdmin": false,
        "isSuperAdmin": false
      }
    ]
  }
}
```

---

### 3. Obtener Participantes de un Grupo

```http
GET /api/groups/:groupId/participants
```

**Parámetros:**
- `groupId` (string): ID del grupo

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "id": "[email protected]",
      "isAdmin": true,
      "isSuperAdmin": false
    },
    {
      "id": "[email protected]",
      "isAdmin": false,
      "isSuperAdmin": false
    }
  ]
}
```

---

### 4. Obtener Estadísticas de un Grupo

```http
GET /api/groups/:groupId/stats
```

**Parámetros:**
- `groupId` (string): ID del grupo

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "groupId": "1234567890@g.us",
    "groupName": "Mi Grupo",
    "totalMessages": 150,
    "messagesSent": 145,
    "messagesFailed": 5,
    "participantsCount": 25,
    "adminCount": 3,
    "memberCount": 22,
    "activeParticipants": 20,
    "lastActivity": 1704067200000,
    "createdAt": 1700000000000,
    "successRate": 96.7,
    "timestamp": 1704067200000
  }
}
```

---

### 5. Obtener Código de Invitación

```http
GET /api/groups/:groupId/invite
```

**Parámetros:**
- `groupId` (string): ID del grupo

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "success": true,
    "groupId": "1234567890@g.us",
    "inviteCode": "ABC123DEF456",
    "inviteLink": "https://chat.whatsapp.com/ABC123DEF456"
  }
}
```

---

### 6. Obtener Todos los Chats

```http
GET /api/groups/chats
```

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "id": "1234567890@c.us",
      "name": "Juan Pérez",
      "isGroup": false,
      "isNewsletter": false,
      "timestamp": 1704067200000,
      "unreadCount": 3
    },
    {
      "id": "9876543210@g.us",
      "name": "Grupo Trabajo",
      "isGroup": true,
      "isNewsletter": false,
      "timestamp": 1704067200000,
      "unreadCount": 0
    }
  ]
}
```

---

## ✏️ Modificaciones (POST / PUT)

### 7. Añadir Participantes a un Grupo

```http
POST /api/groups/:groupId/participants
```

**Parámetros:**
- `groupId` (string): ID del grupo

**Body:**
```json
{
  "participants": ["1234567890", "0987654321"]
}
```
*O con formato completo:*
```json
{
  "participants": ["[email protected]", "[email protected]"]
}
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "success": true,
    "groupId": "1234567890@g.us",
    "addedCount": 2,
    "result": { "status": 200 }
  },
  "message": "Se añadieron 2 participante(s) al grupo"
}
```

---

### 8. Promocionar Participantes a Administradores

```http
POST /api/groups/:groupId/promote
```

**Parámetros:**
- `groupId` (string): ID del grupo

**Body:**
```json
{
  "participants": ["1234567890", "0987654321"]
}
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "success": true,
    "groupId": "1234567890@g.us",
    "promotedCount": 2,
    "result": { "status": 200 }
  },
  "message": "2 participante(s) promocionado(s) a admin"
}
```

---

### 9. Degradar Administradores a Participantes

```http
POST /api/groups/:groupId/demote
```

**Parámetros:**
- `groupId` (string): ID del grupo

**Body:**
```json
{
  "participants": ["[email protected]"]
}
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "success": true,
    "groupId": "1234567890@g.us",
    "demotedCount": 1,
    "result": { "status": 200 }
  },
  "message": "1 admin(s) degradado(s) a miembro"
}
```

---

### 10. Actualizar Descripción del Grupo

```http
PUT /api/groups/:groupId/description
```

**Parámetros:**
- `groupId` (string): ID del grupo

**Body:**
```json
{
  "description": "Esta es la nueva descripción del grupo"
}
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "success": true,
    "groupId": "1234567890@g.us",
    "description": "Esta es la nueva descripción del grupo"
  },
  "message": "Descripción actualizada exitosamente"
}
```

---

### 11. Actualizar Nombre del Grupo

```http
PUT /api/groups/:groupId/name
```

**Parámetros:**
- `groupId` (string): ID del grupo

**Body:**
```json
{
  "name": "Nuevo Nombre del Grupo"
}
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "success": true,
    "groupId": "1234567890@g.us",
    "name": "Nuevo Nombre del Grupo"
  },
  "message": "Nombre actualizado exitosamente"
}
```

---

### 12. Revocar Código de Invitación

```http
POST /api/groups/:groupId/invite/revoke
```

**Parámetros:**
- `groupId` (string): ID del grupo

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "success": true,
    "groupId": "1234567890@g.us",
    "newInviteCode": "XYZ789GHI012",
    "newInviteLink": "https://chat.whatsapp.com/XYZ789GHI012"
  },
  "message": "Código de invitación revocado exitosamente"
}
```

---

## 🗑️ Eliminaciones (DELETE)

### 13. Salir de un Grupo

```http
DELETE /api/groups/:groupId
```

**Parámetros:**
- `groupId` (string): ID del grupo

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "success": true,
    "groupId": "1234567890@g.us"
  },
  "message": "Has salido del grupo exitosamente"
}
```

---

### 14. Eliminar Participante de un Grupo

```http
DELETE /api/groups/:groupId/participants/:participantId
```

**Parámetros:**
- `groupId` (string): ID del grupo
- `participantId` (string): ID del participante (puede ser solo el número o formato completo `[email protected]`)

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "success": true,
    "groupId": "1234567890@g.us",
    "removedCount": 1,
    "result": { "status": 200 }
  },
  "message": "Participante eliminado del grupo exitosamente"
}
```

---

## 💡 Ejemplos de Uso

### JavaScript / Fetch

```javascript
// Obtener grupos
const groups = await fetch('http://localhost:3000/api/groups')
  .then(res => res.json());

// Añadir participantes
const addResult = await fetch('http://localhost:3000/api/groups/1234567890@g.us/participants', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    participants: ['1234567890', '0987654321']
  })
}).then(res => res.json());

// Eliminar participante
const removeResult = await fetch('http://localhost:3000/api/groups/1234567890@g.us/participants/1234567890@c.us', {
  method: 'DELETE'
}).then(res => res.json());

// Obtener estadísticas
const stats = await fetch('http://localhost:3000/api/groups/1234567890@g.us/stats')
  .then(res => res.json());
```

---

### cURL

```bash
# Obtener grupos
curl http://localhost:3000/api/groups

# Añadir participantes
curl -X POST http://localhost:3000/api/groups/1234567890@g.us/participants \
  -H "Content-Type: application/json" \
  -d '{"participants": ["1234567890", "0987654321"]}'

# Actualizar nombre
curl -X PUT http://localhost:3000/api/groups/1234567890@g.us/name \
  -H "Content-Type: application/json" \
  -d '{"name": "Nuevo Nombre"}'

# Salir del grupo
curl -X DELETE http://localhost:3000/api/groups/1234567890@g.us

# Obtener estadísticas
curl http://localhost:3000/api/groups/1234567890@g.us/stats
```

---

## ❌ Códigos de Error

| Código | Descripción |
|--------|-------------|
| 400    | Parámetros faltantes o inválidos |
| 404    | Grupo no encontrado |
| 500    | Error del servidor / WhatsApp no conectado |

**Formato de Error:**
```json
{
  "success": false,
  "error": "Descripción del error"
}
```

---

## 📝 Notas Importantes

1. **Formato de IDs:**
   - Grupos: `1234567890@g.us`
   - Participantes: `1234567890@c.us`
   - Puedes enviar solo el número (ej: `1234567890`) y el sistema lo normalizará automáticamente

2. **Permisos:**
   - Solo puedes añadir/eliminar participantes si eres admin del grupo
   - Solo puedes cambiar nombre/descripción si eres admin
   - Puedes salir de cualquier grupo

3. **Estado de WhatsApp:**
   - Todos los endpoints requieren que WhatsApp esté conectado
   - Si no está conectado, recibirás error: `"Cliente de WhatsApp no está listo"`

4. **Rate Limiting:**
   - Evita hacer demasiadas peticiones seguidas
   - WhatsApp puede bloquear si detecta comportamiento automatizado excesivo

---

## 🔄 Próximas Funcionalidades

- [ ] Crear grupo nuevo
- [ ] Subir imagen de grupo
- [ ] Configurar permisos del grupo
- [ ] Tracking de mensajes por grupo
- [ ] Análisis de actividad de participantes
- [ ] Exportar participantes a CSV
- [ ] Webhooks para eventos de grupo

---

**Versión:** 1.0.0
**Última actualización:** 2024
**Basado en:** whatsapp-web.js v1.23+
