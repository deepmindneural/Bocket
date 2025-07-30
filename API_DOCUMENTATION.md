# 📚 DOCUMENTACIÓN API - BOCKET CRM

## 🏗️ Arquitectura General

Bocket CRM es un sistema multi-tenant para gestión de restaurantes construido con:
- **Frontend**: Angular 20 + Ionic 8
- **Backend**: Firebase (Firestore, Auth, Storage)
- **Arquitectura**: Multi-tenant basada en slugs de URL

## 🔐 Autenticación

### AuthService (`/src/app/servicios/auth.service.ts`)

#### Métodos Principales

```typescript
// Iniciar sesión
async login(email: string, password: string): Promise<boolean>
// Retorna: true si el login fue exitoso, false en caso contrario
// Ejemplo: await authService.login('admin@donpepe.com', '123456')

// Cerrar sesión
async logout(): Promise<void>
// Limpia la sesión actual y redirige a /login

// Obtener usuario actual
obtenerUsuarioActual(): UsuarioGlobal | null
// Retorna el usuario autenticado o null

// Obtener restaurante actual
obtenerRestauranteActual(): any
// Retorna el restaurante activo del usuario

// Verificar si usuario tiene acceso a un restaurante
async verificarAccesoRestaurante(restauranteSlug: string): Promise<boolean>
// Valida permisos del usuario para un restaurante específico
```

### Estructura de Usuario

```typescript
interface UsuarioGlobal {
  uid: string;
  email: string;
  nombre?: string;
  telefono?: string;
  activo: boolean;
  rol?: 'admin' | 'manager' | 'empleado';
  fechaCreacion?: Date;
  ultimoAcceso?: Date;
}
```

## 📊 Servicios de Datos

### 1. ClienteService (`/src/app/servicios/cliente.service.ts`)

**Ruta Firestore**: `restaurantes/{restauranteId}/clientes`

#### Métodos CRUD

```typescript
// Obtener todos los clientes del restaurante actual
async obtenerTodos(): Promise<Cliente[]>

// Obtener cliente por ID
async obtenerPorId(id: string): Promise<Cliente | null>

// Crear nuevo cliente
async crear(cliente: Partial<Cliente>): Promise<Cliente>
// Ejemplo:
// await clienteService.crear({
//   name: 'Juan Pérez',
//   email: 'juan@email.com',
//   phone: '+573001234567'
// })

// Actualizar cliente
async actualizar(id: string, cambios: Partial<Cliente>): Promise<Cliente>

// Eliminar cliente
async eliminar(id: string): Promise<void>
```

#### Modelo Cliente

```typescript
interface Cliente {
  id: string;
  name: string;
  whatsAppName?: string;
  email: string;
  phone?: string;
  restauranteId: string;
  isWAContact: boolean;
  isMyContact: boolean;
  sourceType: 'manual' | 'whatsapp' | 'web';
  respType: string;
  labels: string;
  creation: string; // ISO date
  lastUpdate: string; // ISO date
  userInteractions: {
    whatsapp: number;
    controller: number;
    chatbot: number;
    api: number;
    campaing: number;
    client: number;
    others: number;
    wappController: number;
    ai: number;
    fee: number;
  };
}
```

### 2. PedidoService (`/src/app/servicios/pedido.service.ts`)

**Ruta Firestore**: `restaurantes/{restauranteId}/pedidos`

#### Métodos CRUD

```typescript
// Obtener todos los pedidos
async obtenerTodos(): Promise<Pedido[]>

// Obtener pedido por ID
async obtenerPorId(id: string): Promise<Pedido | null>

// Crear nuevo pedido
async crear(pedido: Partial<Pedido>): Promise<Pedido>

// Actualizar pedido
async actualizar(id: string, cambios: Partial<Pedido>): Promise<Pedido>

// Eliminar pedido
async eliminar(id: string): Promise<void>
```

#### Métodos Especializados

```typescript
// Filtrar por tipo de pedido
async obtenerPorTipo(tipo: 'delivery' | 'pickUp' | 'insideOrder'): Promise<Pedido[]>

// Filtrar por estado
async obtenerPorEstado(estado: StatusBooking): Promise<Pedido[]>

// Buscar por contacto WhatsApp
async obtenerPorContacto(contact: string): Promise<Pedido[]>

// Obtener pedidos activos
async obtenerPedidosActivos(): Promise<Pedido[]>

// Cambios de estado rápidos
async aceptarPedido(id: string): Promise<Pedido>
async rechazarPedido(id: string): Promise<Pedido>
async marcarEnProceso(id: string): Promise<Pedido>
async marcarEnDelivery(id: string): Promise<Pedido>
async marcarEntregado(id: string): Promise<Pedido>

// Búsqueda de texto
async buscarPorTexto(texto: string): Promise<Pedido[]>

// Estadísticas
async obtenerEstadisticas(): Promise<EstadisticasPedido>

// Pedidos de hoy
async obtenerPedidosHoy(): Promise<Pedido[]>
```

#### Modelo Pedido

```typescript
interface Pedido {
  id: string;
  contact: string; // WhatsApp
  contactNameOrder: string;
  orderType: 'delivery' | 'pickUp' | 'insideOrder';
  resumeOrder: string; // Resumen del pedido
  addressToDelivery?: string;
  statusBooking: 'pending' | 'accepted' | 'rejected' | 'inProcess' | 'inDelivery' | 'deliveried';
  fechaCreacion?: string;
  fechaActualizacion?: string;
  total?: number;
  items?: Array<{
    nombre: string;
    cantidad: number;
    precio: number;
  }>;
}
```

### 3. ReservaService (`/src/app/servicios/reserva.service.ts`)

**Ruta Firestore**: `restaurantes/{restauranteId}/reservas`

#### Métodos CRUD

```typescript
// CRUD básico
async obtenerTodas(): Promise<Reserva[]>
async obtenerPorId(id: string): Promise<Reserva | null>
async crear(reserva: Partial<Reserva>): Promise<Reserva>
async actualizar(id: string, cambios: Partial<Reserva>): Promise<Reserva>
async eliminar(id: string): Promise<void>
```

#### Métodos Especializados

```typescript
// Filtrar por estado
async obtenerPorEstado(estado: StatusBooking): Promise<Reserva[]>

// Reservas de una fecha específica
async obtenerPorFecha(fecha: string): Promise<Reserva[]>

// Reservas de hoy
async obtenerReservasHoy(): Promise<Reserva[]>

// Cambios de estado
async confirmarReserva(id: string): Promise<Reserva>
async rechazarReserva(id: string): Promise<Reserva>
async completarReserva(id: string): Promise<Reserva>

// Búsqueda
async buscarPorTexto(texto: string): Promise<Reserva[]>
```

#### Modelo Reserva

```typescript
interface Reserva {
  id: string;
  contact: string;
  contactNameBooking: string;
  dateBooking: string; // Fecha de la reserva
  hourBooking: string; // Hora de la reserva
  peopleBooking: number; // Número de personas
  detailsBooking?: string; // Detalles adicionales
  statusBooking: 'pending' | 'accepted' | 'rejected' | 'completed';
  creation?: string;
  lastUpdate?: string;
}
```

### 4. ProductoService (`/src/app/servicios/producto.service.ts`)

**Ruta Firestore**: `restaurantes/{restauranteId}/productos`

#### Métodos CRUD

```typescript
// CRUD básico
async obtenerTodos(): Promise<Producto[]>
async obtenerPorId(id: string): Promise<Producto | null>
async crear(producto: Partial<Producto>): Promise<Producto>
async actualizar(id: string, cambios: Partial<Producto>): Promise<Producto>
async eliminar(id: string): Promise<void>
```

#### Métodos Especializados

```typescript
// Filtrar por categoría
async obtenerPorCategoria(categoria: string): Promise<Producto[]>

// Productos disponibles
async obtenerDisponibles(): Promise<Producto[]>

// Buscar productos
async buscarProductos(termino: string): Promise<Producto[]>

// Cambiar disponibilidad
async toggleDisponibilidad(id: string): Promise<Producto>
```

#### Modelo Producto

```typescript
interface Producto {
  id: string;
  nombre: string;
  descripcion?: string;
  precio: number;
  categoria: string;
  disponible: boolean;
  imagen?: string;
  ingredientes?: string[];
  tiempoPreparacion?: number; // en minutos
  calorias?: number;
  fechaCreacion?: string;
  fechaActualizacion?: string;
}
```

### 5. RestauranteService (`/src/app/servicios/restaurante.service.ts`)

**Ruta Firestore**: `restaurantes/{restauranteId}`

#### Métodos

```typescript
// Obtener información del restaurante
async obtenerPorSlug(slug: string): Promise<Restaurante | null>
async obtenerPorId(id: string): Promise<Restaurante | null>

// Actualizar configuración
async actualizarConfiguracion(id: string, config: Partial<Restaurante>): Promise<void>

// Subir logo
async subirLogo(restauranteId: string, file: File): Promise<string>
```

#### Modelo Restaurante

```typescript
interface Restaurante {
  id: string;
  nombre: string;
  slug: string;
  descripcion?: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  website?: string;
  logo?: string;
  colorPrimario?: string;
  colorSecundario?: string;
  horariosAtencion?: {
    [dia: string]: {
      abierto: boolean;
      horaApertura?: string;
      horaCierre?: string;
    };
  };
  configuracion?: {
    moneda: string;
    idioma: string;
    timezone: string;
    permitirReservas: boolean;
    permitirDelivery: boolean;
    permitirPickup: boolean;
  };
  activo: boolean;
  fechaCreacion?: Date;
}
```

## 🛡️ Guards de Seguridad

### AuthGuard (`/src/app/guards/auth.guard.ts`)

Protege rutas que requieren autenticación:

```typescript
// Uso en rutas
{
  path: 'dashboard',
  component: DashboardComponent,
  canActivate: [AuthGuard]
}
```

### TenantGuard (`/src/app/guards/tenant.guard.ts`)

Valida acceso del usuario al restaurante específico:

```typescript
// Uso en rutas multi-tenant
{
  path: ':restauranteSlug',
  canActivate: [AuthGuard, TenantGuard],
  children: [...]
}
```

## 🔧 AdminService (`/src/app/admin/admin.service.ts`)

Servicio especial para acceso global a todos los datos (solo admin):

```typescript
// Obtener datos globales
async obtenerTodosRestaurantes(): Promise<any[]>
async obtenerTodosUsuarios(): Promise<any[]>
async obtenerTodosPedidos(): Promise<any[]>
async obtenerTodosClientes(): Promise<any[]>
async obtenerTodasReservas(): Promise<any[]>

// Estadísticas globales
async obtenerEstadisticasGlobales(): Promise<EstadisticasGlobales>

// Búsqueda global
async buscarEnTodo(termino: string): Promise<ResultadosBusqueda>
```

## 🔄 Patrones de Uso

### 1. Crear un nuevo pedido

```typescript
// En el componente
constructor(private pedidoService: PedidoService) {}

async crearPedido() {
  try {
    const nuevoPedido = await this.pedidoService.crear({
      contact: '+573001234567',
      contactNameOrder: 'Juan Pérez',
      orderType: 'delivery',
      resumeOrder: 'Pizza Grande + Coca Cola 2L',
      addressToDelivery: 'Calle 123 #45-67',
      total: 45000
    });
    
    console.log('Pedido creado:', nuevoPedido.id);
  } catch (error) {
    console.error('Error:', error);
  }
}
```

### 2. Filtrar y buscar datos

```typescript
// Obtener reservas de hoy
const reservasHoy = await this.reservaService.obtenerReservasHoy();

// Buscar clientes por nombre
const clientes = await this.clienteService.obtenerTodos();
const clientesFiltrados = clientes.filter(c => 
  c.name.toLowerCase().includes('juan')
);

// Pedidos activos
const pedidosActivos = await this.pedidoService.obtenerPedidosActivos();
```

### 3. Actualizar estados

```typescript
// Aceptar una reserva
await this.reservaService.confirmarReserva(reservaId);

// Marcar pedido como entregado
await this.pedidoService.marcarEntregado(pedidoId);

// Desactivar producto
await this.productoService.toggleDisponibilidad(productoId);
```

## 🚀 Endpoints Firebase (Rutas de Datos)

```
firestore/
├── usuarios/                           # Usuarios globales
│   └── {userId}/                      # Documento de usuario
├── restaurantes/                       # Todos los restaurantes
│   └── {restauranteId}/               # Documento de restaurante
│       ├── clientes/                  # Subcolección de clientes
│       ├── pedidos/                   # Subcolección de pedidos
│       ├── reservas/                  # Subcolección de reservas
│       └── productos/                 # Subcolección de productos
└── usuariosRestaurantes/              # Relaciones usuario-restaurante
    └── {uid}_{restauranteId}/         # Permisos por restaurante
```

## 🔑 Credenciales de Prueba

```javascript
// Desarrollo
{
  email: 'admin@donpepe.com',
  password: '123456',
  restaurante: 'Don Pepe Restaurant'
}

{
  email: 'admin@marinacafe.com',
  password: '123456',
  restaurante: 'Marina Café & Bistro'
}
```

## 📝 Notas Importantes

1. **Multi-tenancy**: Todos los servicios filtran automáticamente por el restaurante del usuario actual
2. **Firebase SDK**: Se usa Firebase SDK v9 nativo para evitar errores NG0203
3. **Timestamps**: Las fechas se almacenan como strings ISO para compatibilidad
4. **IDs**: Se generan automáticamente con formato `{prefijo}_{timestamp}_{random}`
5. **Seguridad**: Las reglas de Firestore deben validar el acceso por restaurante

## 🔗 URLs de Acceso

```
# Login
/login

# Dashboard por restaurante
/{restauranteSlug}/dashboard

# Módulos
/{restauranteSlug}/clientes
/{restauranteSlug}/pedidos
/{restauranteSlug}/reservas
/{restauranteSlug}/productos
/{restauranteSlug}/reportes

# Admin (sin slug)
/admin
```