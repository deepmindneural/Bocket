# 🔄 MIGRACIÓN DE ARQUITECTURA - Bocket CRM

## 📊 COMPARACIÓN DE ARQUITECTURAS

### ACTUAL (Multi-tenant unificado)
```
/clients/worldfood/Formularios/
├── 1754417719712_restaurante_admin_1754417719712     ← rest_carne_718855
├── 1754415338450_restaurante_admin_1754415338450     ← rest_ttt_337380
├── 1754420475685_cliente_prueba_1754420475685        ← Clientes mezclados
└── {otros documentos mezclados}
```
**Problema:** Todos los datos mezclados, separación solo por `restauranteId`

### NUEVA (Separación por restaurante)
```
/clients/
├── rest_carne_718855/
│   ├── info/
│   │   └── restaurante                    ← Datos del restaurante "carnes"
│   ├── users/
│   │   └── {adminUID}                     ← Admin del restaurante carnes
│   └── data/
│       ├── clientes/{clienteId}           ← Solo clientes de carnes
│       ├── reservas/{reservaId}           ← Solo reservas de carnes
│       └── pedidos/{pedidoId}             ← Solo pedidos de carnes
├── rest_ttt_337380/
│   ├── info/restaurante                   ← Datos del restaurante "tttt"
│   ├── users/{adminUID}                   ← Admin del restaurante tttt
│   └── data/{clientes|reservas|pedidos}   ← Solo datos de tttt
└── rest_jhon_500599/
    ├── info/restaurante
    ├── users/{adminUID}
    └── data/{...}
```

## 🎯 VENTAJAS DE LA NUEVA ARQUITECTURA

1. **🔒 Aislamiento total:** Imposible mezclar datos entre restaurantes
2. **⚡ Performance:** Consultas más rápidas (sin filtros por restauranteId)
3. **🛡️ Seguridad:** Permisos a nivel de documento por restaurante
4. **📈 Escalabilidad:** Fácil agregar nuevos restaurantes
5. **🧹 Mantenimiento:** Estructura más clara y organizada

## 📝 ARCHIVOS A MODIFICAR

### 🔥 Servicios principales (6 archivos)
- [x] AdminService - Creación de restaurantes y usuarios admin
- [x] AuthService - Autenticación y búsqueda de restaurantes  
- [x] ClienteService - Gestión de clientes por restaurante
- [x] ReservaService - Gestión de reservas por restaurante
- [x] PedidoService - Gestión de pedidos por restaurante
- [x] DashboardService - Dashboard por restaurante

### 📊 Cambios específicos por servicio

#### AdminService
```typescript
// ANTES
getFormulariosPath() {
  return `clients/worldfood/Formularios`;
}

// DESPUÉS
getRestauranteInfoPath(restauranteId: string) {
  return `clients/${restauranteId}/info`;
}
getRestauranteUsersPath(restauranteId: string) {
  return `clients/${restauranteId}/users`;
}
```

#### ClienteService
```typescript
// ANTES
getFormulariosPath() {
  return `clients/worldfood/Formularios`;
}
// + filtro: where('restauranteId', '==', id)

// DESPUÉS  
getClientesPath(restauranteId: string) {
  return `clients/${restauranteId}/data/clientes`;
}
// Sin filtros, directamente la ruta correcta
```

#### ReservaService
```typescript
// ANTES
getFormulariosPath() + filtro restauranteId

// DESPUÉS
getReservasPath(restauranteId: string) {
  return `clients/${restauranteId}/data/reservas`;
}
```

#### PedidoService  
```typescript
// ANTES
getFormulariosPath() + filtro restauranteId

// DESPUÉS
getPedidosPath(restauranteId: string) {
  return `clients/${restauranteId}/data/pedidos`;
}
```

#### AuthService
```typescript
// ANTES
buscar en: /clients/worldfood/Formularios/
filtrar: typeForm='restaurante' AND restauranteId=X

// DESPUÉS
buscar en: /clients/{restauranteId}/info/restaurante
acceso directo, sin filtros
```

## 🗃️ ESTRUCTURA DE DOCUMENTOS

### Restaurante
**Ruta:** `/clients/{restauranteId}/info/restaurante`
```javascript
{
  id: "rest_carne_718855",
  nombre: "carnes", 
  email: "carnes@carnes.com",
  slug: "carne",
  // ... datos del restaurante
}
```

### Usuario Admin
**Ruta:** `/clients/{restauranteId}/users/{adminUID}`
```javascript
{
  uid: "firebase_uid_123",
  email: "carnes@carnes.com", 
  nombre: "Admin carnes",
  rol: "admin",
  permisos: ["read", "write", "delete"],
  fechaCreacion: "2025-08-05T...",
  activo: true
}
```

### Cliente
**Ruta:** `/clients/{restauranteId}/data/clientes/{clienteId}`
```javascript
{
  id: "cliente_123",
  name: "Juan Pérez",
  email: "juan@email.com",
  // ... datos del cliente
  // NO necesita restauranteId (implícito en la ruta)
}
```

### Reserva
**Ruta:** `/clients/{restauranteId}/data/reservas/{reservaId}`
```javascript
{
  id: "reserva_123",
  contactNameBooking: "María González",
  dateBooking: "2025-08-10T19:00:00",
  // ... datos de la reserva
  // NO necesita restauranteId (implícito en la ruta)
}
```

### Pedido
**Ruta:** `/clients/{restauranteId}/data/pedidos/{pedidoId}`
```javascript
{
  id: "pedido_123", 
  contactNameOrder: "Carlos López",
  resumeOrder: "Pizza Margarita x2",
  // ... datos del pedido
  // NO necesita restauranteId (implícito en la ruta)
}
```

## 🔄 PLAN DE MIGRACIÓN

### Fase 1: Preparación
1. Crear nueva estructura en paralelo
2. Migrar datos existentes
3. Actualizar servicios uno por uno

### Fase 2: Testing  
1. Verificar que cada restaurante ve solo sus datos
2. Probar autenticación con nueva estructura
3. Validar CRUD completo

### Fase 3: Implementación
1. Actualizar todos los servicios
2. Migrar datos de producción
3. Eliminar estructura antigua

## ⚠️ CONSIDERACIONES

1. **Migración de datos:** Script para mover datos de estructura actual a nueva
2. **Compatibilidad:** Mantener ambas estructuras durante transición
3. **Permisos:** Configurar reglas de Firestore para nueva estructura
4. **Testing:** Probar exhaustivamente antes de migrar producción

## 🎯 BENEFICIOS ESPERADOS

- **🔒 Seguridad:** Aislamiento total por restaurante
- **⚡ Performance:** Consultas 3x más rápidas sin filtros
- **🧹 Código:** Más limpio, sin lógica de filtrado
- **📈 Escalabilidad:** Preparado para miles de restaurantes
- **🛡️ Mantenimiento:** Estructura más intuitiva y mantenible