# Firebase Database Setup - Bocket CRM

## Configuración de Base de Datos

Este script inicializa la estructura completa de Firebase Firestore con las interfaces proporcionadas por el cliente.

### Estructuras Creadas

#### 1. **Colección Restaurantes**
```
restaurantes/
├── rest_donpepe_001/
├── rest_marinacafe_002/
└── [otros restaurantes]/
```

#### 2. **Sub-colecciones por Restaurante** (Multi-tenant)
```
restaurantes/{restauranteId}/
├── clientes/          # Interface finalUser
├── reservas/          # Interface VenueBooking  
├── pedidos/           # Interface OrderTodelivery
└── configuracion/     # Índices y configuración
```

#### 3. **Colecciones Globales**
```
├── usuarios/          # Administradores
└── configuracion/     # Configuración global
```

### Interfaces Implementadas

#### **finalUser (Clientes)**
```javascript
{
  id: string,                    // Número de WhatsApp
  restauranteId: string,         // Multi-tenant
  isGroup: boolean,              // Es grupo de WhatsApp
  creation: string,              // Fecha de creación
  isEnterprise: boolean,         // Es cuenta empresarial
  isBusiness: boolean,           // Es cuenta de negocios
  isMyContact: boolean,          // Está en contactos
  isUser: boolean,               // Es usuario de WhatsApp
  isWAContact: boolean,          // Está registrado en WhatsApp
  isBlocked: boolean,            // Está bloqueado
  wappLabels: string[],          // Etiquetas de WhatsApp
  name: string,                  // Nombre del contacto
  pushname: string,              // Nombre público
  sectionHeader: string,         // Encabezado de sección
  shortName: string,             // Nombre corto
  sourceType: 'chatBot'|'manual'|'api',  // Origen
  respType: 'manualTemp'|'bot'|'manual', // Tipo respuesta
  labels: string,                // Etiquetas personalizadas
  whatsAppName: string,          // Nombre principal WhatsApp
  isSpam: boolean,               // Marcado como spam
  email: string,                 // Email del contacto
  company: string,               // Empresa
  address: string,               // Dirección
  image: string,                 // URL imagen perfil
  lastUpdate: string,            // Última actualización
  userInteractions: {            // Estadísticas interacciones
    whatsapp: number,
    controller: number,
    chatbot: number,
    api: number,
    campaing: number,
    client: number,
    others: number,
    wappController: number,
    ai: number,
    fee: number
  }
}
```

#### **VenueBooking (Reservas)**
```javascript
{
  id: string,                    // ID único de reserva
  restauranteId: string,         // Multi-tenant
  contact: string,               // Contacto WhatsApp
  contactNameBooking: string,    // Nombre para la reserva
  peopleBooking: string,         // Número personas (texto)
  finalPeopleBooking: number,    // Número personas (número)
  dateBooking: string,           // Fecha de reserva
  statusBooking: 'pending'|'accepted'|'rejected', // Estado
  detailsBooking: string,        // Detalles opcionales
  reconfirmDate: string,         // Fecha reconfirmación
  reconfirmStatus: 'pending'|'accepted'|'rejected' // Estado reconfirmación
}
```

#### **OrderTodelivery (Pedidos)**
```javascript
{
  id: string,                    // ID único del pedido
  restauranteId: string,         // Multi-tenant
  contact: string,               // Contacto WhatsApp
  contactNameOrder: string,      // Nombre del contacto
  orderType: 'delivery'|'pickUp'|'insideOrder', // Tipo pedido
  resumeOrder: string,           // Resumen del pedido
  addressToDelivery: string,     // Dirección entrega
  statusBooking: 'pending'|'accepted'|'rejected'|'inProcess'|'inDelivery'|'deliveried' // Estado
}
```

## Instrucciones de Uso

### 1. Configurar Credenciales Firebase

Edita el archivo `firebase-init-database.js` y reemplaza las credenciales:

```javascript
const serviceAccount = {
  "type": "service_account",
  "project_id": "TU_PROJECT_ID",
  "private_key": "TU_PRIVATE_KEY",
  "client_email": "TU_CLIENT_EMAIL",
  // ... otras credenciales
};
```

### 2. Instalar Dependencias

```bash
npm install firebase-admin
```

### 3. Ejecutar el Script

```bash
cd src/scripts
node firebase-init-database.js
```

### 4. Verificar en Firebase Console

Ve a Firebase Console → Firestore Database y verifica que se crearon:

- ✅ Colección `restaurantes` con sub-colecciones
- ✅ Colección `usuarios` 
- ✅ Colección `configuracion`
- ✅ Datos de ejemplo en cada colección

## Características

### Multi-tenant
- Cada restaurante tiene sus propias sub-colecciones
- Datos completamente separados por `restauranteId`
- Administradores específicos por restaurante

### Estructura Escalable
- Preparado para múltiples restaurantes
- Índices configurados para consultas eficientes
- Configuración flexible por restaurante

### Datos de Ejemplo
El script incluye datos de prueba para:
- 2 restaurantes ejemplo
- Clientes con interfaces WhatsApp completas
- Reservas con estados y reconfirmaciones
- Pedidos con diferentes tipos (delivery, pickup, interno)

### Seguridad
- Estructura preparada para reglas de seguridad Firebase
- Separación clara entre datos de diferentes restaurantes
- Roles y permisos definidos

## Próximos Pasos

Después de ejecutar este script:

1. **Configurar reglas de seguridad** en Firebase Console
2. **Activar servicios** en Angular (ClienteService, ReservaService, PedidoService)
3. **Configurar autenticación** Firebase Auth
4. **Probar CRUD** desde la aplicación Angular

## Troubleshooting

### Error: "Permission denied"
- Verifica las credenciales de service account
- Asegúrate que el service account tenga permisos de Firestore

### Error: "Project not found"
- Verifica el `project_id` en las credenciales
- Confirma que el proyecto Firebase existe

### Error: "Collection already exists"
- El script es seguro de ejecutar múltiples veces
- No eliminará datos existentes, solo agregará nuevos