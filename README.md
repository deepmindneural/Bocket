# Bocket CRM - Sistema de Gestión para Restaurantes

Bocket CRM es un sistema de gestión integral multi-tenant diseñado específicamente para restaurantes. Permite a múltiples restaurantes utilizar la misma aplicación con datos completamente aislados, branding personalizado y configuraciones específicas para cada establecimiento.

## 🚀 Características Principales

### ✨ Multi-tenant Architecture
- **Aislamiento completo** de datos por restaurante
- **Branding personalizado** con colores y logos propios
- **Configuraciones independientes** para cada establecimiento

### 📱 Tecnologías Modernas
- **Ionic 8 + Angular 20** - Framework híbrido para web y móvil
- **Firebase** - Backend completo (Firestore, Auth, Storage)
- **Material Design + PrimeNG** - UI profesional y responsive

### 🎯 Módulos Funcionales
- **Dashboard** - Estadísticas y métricas en tiempo real
- **Gestión de Clientes** - Registro y seguimiento de clientes
- **Reservas** - Sistema completo de reservaciones
- **Pedidos** - Gestión de pedidos con estados y seguimiento
- **Productos** - Catálogo y gestión de inventario
- **Reportes** - Analytics avanzado y reportes ejecutivos

## 🛠️ Instalación

### Prerrequisitos
- Node.js 18+
- npm o yarn
- Angular CLI 20+
- Ionic CLI 7+

### Configuración
```bash
# Clonar el repositorio
git clone https://github.com/deepmindneural/Bocket.git
cd Bocket

# Instalar dependencias
npm install

# Configurar Firebase
# Copiar tus credenciales de Firebase en src/environments/

# Ejecutar en desarrollo
ionic serve
```

## 🏗️ Arquitectura

### Multi-tenancy
El sistema utiliza un modelo de **slug-based multi-tenancy**:
- Cada restaurante tiene su propia URL: `domain.com/{restaurant-slug}/`
- Datos completamente aislados en Firestore por `restauranteId`
- Autenticación y autorización por restaurante

### Estructura Firebase
```
firestore/
├── usuarios/                # Usuarios globales
├── restaurantes/           # Configuraciones de restaurantes
├── usuariosRestaurantes/   # Permisos usuario-restaurante
└── {restauranteId}/       # Datos aislados por restaurante
    ├── clientes/
    ├── reservas/
    ├── pedidos/
    └── productos/
```

## 📱 Funcionalidades

### Dashboard Avanzado
- Estadísticas en tiempo real
- Gráficos interactivos con Chart.js
- Métricas de ventas, pedidos y clientes
- Actividad reciente del restaurante

### Sistema de Pedidos
- Estados completos: Pendiente → Aceptado → En Proceso → En Delivery → Entregado
- Filtros avanzados por fecha, estado y tipo
- Información detallada con timestamps
- Gestión visual con tarjetas interactivas

### Gestión de Clientes
- Registro completo de información
- Historial de pedidos y reservas
- Sistema de seguimiento y notas

### Reservaciones
- Calendario interactivo
- Gestión de mesas y capacidades
- Confirmaciones automáticas
- Estados de reserva

## 🔧 Desarrollo

### Comandos Disponibles
```bash
# Desarrollo
ionic serve                    # Servidor de desarrollo
ionic serve --host 0.0.0.0   # Acceso externo/móvil

# Construcción
ionic build                   # Build de producción
npm run build:prod           # Build optimizado

# Testing
npm run test                 # Ejecutar tests
npm run lint                 # Verificar código

# Mobile
ionic capacitor add ios      # Agregar plataforma iOS
ionic capacitor add android  # Agregar plataforma Android
ionic capacitor run ios      # Ejecutar en iOS
ionic capacitor run android  # Ejecutar en Android
```

### Estructura del Proyecto
```
src/
├── app/
│   ├── auth/              # Autenticación
│   ├── admin/             # Panel administrativo
│   ├── dashboard/         # Dashboard principal
│   ├── modulos/           # Módulos funcionales
│   │   ├── clientes/
│   │   ├── pedidos/
│   │   ├── reservas/
│   │   └── productos/
│   ├── servicios/         # Servicios Angular
│   ├── modelos/           # Interfaces TypeScript
│   ├── guards/            # Guards de ruta
│   └── layouts/           # Componentes de layout
├── assets/                # Recursos estáticos
└── environments/          # Configuraciones de entorno
```

## 🔒 Configuración de Firebase

### Firestore Security Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Reglas multi-tenant
    match /restaurantes/{restauranteId}/{document=**} {
      allow read, write: if request.auth != null && 
        hasRestaurantAccess(restauranteId);
    }
  }
}
```

### Variables de Entorno
```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  firebase: {
    apiKey: "tu-api-key",
    authDomain: "tu-proyecto.firebaseapp.com",
    projectId: "tu-proyecto-id",
    // ... más configuración
  }
};
```

## 📊 Características Técnicas

### Performance
- **Lazy Loading** - Carga bajo demanda de módulos
- **OnPush Change Detection** - Optimización de rendimiento
- **PWA Ready** - Funcionalidad offline
- **Responsive Design** - Adaptable a todos los dispositivos

### Seguridad
- **Autenticación Firebase** - Seguridad robusta
- **Guards de ruta** - Protección de acceso
- **Validación multi-nivel** - Frontend y backend
- **Aislamiento de datos** - Por restaurante

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE.md](LICENSE.md) para detalles.

## 🆘 Soporte

Para soporte y consultas:
- 📧 Email: support@bocket-crm.com
- 📱 WhatsApp: +57 300 000 0000
- 🌐 Web: https://bocket-crm.com

---

**Desarrollado con ❤️ para la industria restaurantera**