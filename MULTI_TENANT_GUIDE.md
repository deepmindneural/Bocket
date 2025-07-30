# 🏢 Sistema Multi-Tenant - Bocket CRM

## 🎯 **Cómo Funciona el Sistema Multi-Tenant**

El CRM Bocket está diseñado para que **múltiples restaurantes** puedan usar la misma aplicación, cada uno con su propia:
- **Base de datos separada**
- **Logo personalizado**
- **Colores corporativos**
- **Configuración única**

---

## 🗺️ **Arquitectura de URLs Multi-Tenant**

### **Estructura de URLs:**
```
https://bocket-crm.com/{slug-restaurante}/{modulo}

Ejemplos:
- https://bocket-crm.com/restaurante-abc/dashboard
- https://bocket-crm.com/mi-pizzeria/clientes
- https://bocket-crm.com/asadero-don-julio/reservas
```

### **Beneficios:**
- ✅ **URLs únicas** por restaurante
- ✅ **Fácil identificación** del tenant
- ✅ **SEO optimizado** por restaurante
- ✅ **Subdominios opcionales** (abc.bocket-crm.com)

---

## 📁 **Estructura de Archivos Multi-Tenant**

### **Logos por Restaurante:**
```
src/assets/
├── logo.png                    # Logo por defecto de Bocket
├── logos/
│   ├── restaurante-abc.png     # Logo de Restaurante ABC
│   ├── mi-pizzeria.png         # Logo de Mi Pizzería
│   ├── asadero-don-julio.png   # Logo de Asadero Don Julio
│   └── panaderia-san-jose.png  # Logo de Panadería San José
```

### **Configuraciones por Restaurante:**
```typescript
// En Firebase: restaurantes/{restauranteId}
{
  "slug": "restaurante-abc",
  "nombre": "Restaurante ABC",
  "logo": "https://firebasestorage.../abc-logo.png",
  "colorPrimario": "#e53e3e",
  "colorSecundario": "#3182ce",
  "moneda": "COP",
  "ciudad": "Bogotá",
  "activo": true
}
```

---

## 🔥 **Estructura de Firebase Multi-Tenant**

### **Colecciones Principales:**
```
firestore/
├── usuarios/                   # Usuarios globales del sistema
├── restaurantes/              # Configuración de cada restaurante
├── usuariosRestaurantes/      # Permisos usuario-restaurante
└── {restauranteId}/           # Datos específicos por restaurante
    ├── clientes/
    ├── reservas/
    ├── pedidos/
    └── productos/
```

### **Ejemplo de Documento de Restaurante:**
```json
// restaurantes/rest_abc_123
{
  "id": "rest_abc_123",
  "slug": "restaurante-abc",
  "nombre": "Restaurante ABC",
  "descripcion": "Comida casera y deliciosa",
  "logo": "https://storage.googleapis.com/bucket/abc-logo.png",
  "colorPrimario": "#e53e3e",
  "colorSecundario": "#3182ce",
  "telefono": "+57 1 234 5678",
  "direccion": "Calle 123 #45-67",
  "ciudad": "Bogotá",
  "moneda": "COP",
  "tipoNegocio": "restaurante",
  "horarioAtencion": [
    {
      "dia": "lunes",
      "abierto": true,
      "horaApertura": "08:00",
      "horaCierre": "22:00"
    }
  ],
  "planSuscripcion": "profesional",
  "limiteUsuarios": 10,
  "limiteClientes": 1000,
  "activo": true,
  "fechaCreacion": "2024-07-24T00:00:00Z"
}
```

---

## 🛣️ **Routing Multi-Tenant**

### **Configuración de Rutas:**
```typescript
// app-routing.module.ts
const routes: Routes = [
  {
    path: ':restauranteSlug',
    component: MainLayoutComponent,
    canActivate: [TenantGuard], // Verificar que el restaurante existe
    children: [
      {
        path: 'dashboard',
        loadChildren: () => import('./dashboard/dashboard.module').then(m => m.DashboardModule),
        canActivate: [AuthGuard]
      },
      {
        path: 'clientes',
        loadChildren: () => import('./modulos/clientes/clientes.module').then(m => m.ClientesModule),
        canActivate: [AuthGuard, PermissionGuard]
      }
      // ... más rutas
    ]
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  }
];
```

### **Guards Necesarios:**
1. **TenantGuard:** Verificar que el restaurante existe y está activo
2. **AuthGuard:** Verificar que el usuario está autenticado
3. **PermissionGuard:** Verificar permisos del usuario en el restaurante

---

## 🎨 **Personalización Visual por Restaurante**

### **Colores Dinámicos:**
```typescript
// main-layout.component.ts
async cargarConfiguracionRestaurante(slug: string) {
  const restaurante = await this.restauranteService.obtenerPorSlug(slug);
  
  if (restaurante) {
    this.restauranteActual = restaurante;
    
    // Aplicar colores dinámicamente
    this.aplicarTemaPersonalizado(restaurante);
  }
}

private aplicarTemaPersonalizado(restaurante: Restaurante) {
  const root = document.documentElement;
  root.style.setProperty('--bocket-primary-500', restaurante.colorPrimario);
  root.style.setProperty('--bocket-secondary-500', restaurante.colorSecundario);
}
```

### **Logo Dinámico:**
```html
<!-- main-layout.component.html -->
<img [src]="restauranteActual.logo" 
     [alt]="restauranteActual.nombre + ' Logo'"
     (error)="onLogoError($event)">
```

---

## 🔐 **Sistema de Permisos Multi-Tenant**

### **Niveles de Acceso:**
1. **Super Admin:** Acceso a todos los restaurantes (Bocket)
2. **Propietario:** Acceso completo a su restaurante
3. **Administrador:** Gestión operativa del restaurante
4. **Empleado:** Acceso limitado según rol

### **Documento de Permisos:**
```json
// usuariosRestaurantes/uid123_rest_abc_123
{
  "usuarioId": "uid123",
  "restauranteId": "rest_abc_123",
  "rol": "administrador",
  "permisos": [
    {
      "modulo": "clientes",
      "acciones": ["leer", "crear", "editar"]
    },
    {
      "modulo": "reservas",
      "acciones": ["leer", "crear", "editar", "eliminar"]
    }
  ],
  "activo": true
}
```

---

## 🚀 **Implementación Paso a Paso**

### **Fase 1: Configuración Básica**
1. ✅ Crear modelos de Restaurante y UsuarioRestaurante
2. ✅ Implementar estructura de carpetas para logos
3. ✅ Configurar routing dinámico básico

### **Fase 2: Guards y Servicios**
4. ⏳ Crear TenantGuard para validar restaurantes
5. ⏳ Implementar RestauranteService con Firebase
6. ⏳ Crear sistema de permisos por tenant

### **Fase 3: Personalización Visual**
7. ⏳ Implementar cambio de colores dinámico
8. ⏳ Sistema de logos personalizados
9. ⏳ Configuración de tema por restaurante

### **Fase 4: Datos Multi-Tenant**
10. ⏳ Configurar Firestore con datos separados
11. ⏳ Implementar servicios con tenant awareness
12. ⏳ Migrar datos existentes a estructura multi-tenant

---

## 💡 **Casos de Uso Reales**

### **Restaurante ABC:**
- **URL:** `bocket-crm.com/restaurante-abc`
- **Logo:** Logo rojo con texto "ABC"
- **Colores:** Rojo primario, azul secundario
- **Datos:** 500 clientes, 1200 reservas/mes

### **Mi Pizzería:**
- **URL:** `bocket-crm.com/mi-pizzeria`  
- **Logo:** Logo verde con chef de pizza
- **Colores:** Verde primario, naranja secundario
- **Datos:** 800 clientes, 2000 pedidos/mes

### **Asadero Don Julio:**
- **URL:** `bocket-crm.com/asadero-don-julio`
- **Logo:** Logo marrón con parrilla
- **Colores:** Marrón primario, dorado secundario
- **Datos:** 300 clientes, 800 reservas/mes

---

## 🛡️ **Seguridad Multi-Tenant**

### **Reglas de Firestore:**
```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Solo acceso a datos del restaurante autorizado
    match /{restauranteId}/{document=**} {
      allow read, write: if request.auth != null && 
        exists(/databases/$(database)/documents/usuariosRestaurantes/$(request.auth.uid + '_' + restauranteId));
    }
    
    // Restaurantes solo visible para usuarios autorizados
    match /restaurantes/{restauranteId} {
      allow read: if request.auth != null && 
        exists(/databases/$(database)/documents/usuariosRestaurantes/$(request.auth.uid + '_' + restauranteId));
    }
  }
}
```

---

## 📊 **Escalabilidad**

### **Capacidad del Sistema:**
- **Restaurantes:** Ilimitados
- **Usuarios por restaurante:** Según plan de suscripción
- **Datos por restaurante:** Separados completamente
- **Performance:** Optimizada por tenant

### **Planes de Suscripción:**
- **Básico:** 5 usuarios, 500 clientes
- **Profesional:** 15 usuarios, 2000 clientes  
- **Empresarial:** Usuarios ilimitados, clientes ilimitados

---

## 🎯 **Estado Actual vs. Objetivo Final**

### **✅ Implementado:**
- Modelos de datos multi-tenant
- Estructura básica de componentes
- Sistema de logos dinámicos
- Configuración de colores por restaurante

### **⏳ Por Implementar:**
- Guards de routing multi-tenant
- Servicios con tenant awareness
- Sistema de permisos completo
- Dashboard personalizado por restaurante
- Formularios CRUD multi-tenant

**Con este sistema, cada restaurante tendrá su propia instancia del CRM completamente personalizada, pero usando la misma aplicación base.**