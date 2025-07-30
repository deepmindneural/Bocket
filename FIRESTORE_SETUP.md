# 🔥 Configuración de Firestore para Bocket CRM

## 1. Configuración de Firebase Config

### Paso 1: Actualizar `src/environments/environment.ts`

```typescript
export const environment = {
  production: false,
  firebase: {
    apiKey: "TU_API_KEY",
    authDomain: "TU_PROJECT_ID.firebaseapp.com",
    projectId: "TU_PROJECT_ID",
    storageBucket: "TU_PROJECT_ID.appspot.com",
    messagingSenderId: "TU_SENDER_ID",
    appId: "TU_APP_ID"
  }
};
```

### Paso 2: Actualizar `src/environments/environment.prod.ts`

```typescript
export const environment = {
  production: true,
  firebase: {
    // Misma configuración que environment.ts
  }
};
```

## 2. Configurar AngularFire en AppModule

### Actualizar `src/app/app.module.ts`:

```typescript
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

// Firebase imports
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { environment } from '../environments/environment';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MainLayoutModule } from './layouts/main-layout.module';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule, 
    IonicModule.forRoot(), 
    AppRoutingModule,
    MainLayoutModule
  ],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    // Firebase providers
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore())
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
```

## 3. Estructura de Colecciones en Firestore

### Colecciones Principales:

1. **`usuarios`** - Usuarios globales del sistema
2. **`restaurantes`** - Configuración de cada restaurante
3. **`usuariosRestaurantes`** - Permisos por usuario-restaurante
4. **`{restauranteId}`** - Subcolecciones por cada restaurante:
   - `clientes`
   - `reservas` 
   - `pedidos`
   - `productos`
   - `configuracion`

### Ejemplo de documentos:

#### Usuario Global (`usuarios/{uid}`):
```json
{
  "uid": "firebase_uid_123",
  "email": "admin@restaurante.com",
  "nombreCompleto": "Carlos Administrador",
  "telefono": "+57 312 345 6789",
  "restaurantes": ["restaurante-abc", "restaurante-xyz"],
  "activo": true,
  "fechaCreacion": "2024-07-24T00:00:00Z"
}
```

#### Restaurante (`restaurantes/restaurante-abc`):
```json
{
  "id": "restaurante-abc",
  "nombre": "Restaurante ABC",
  "slug": "restaurante-abc",
  "email": "info@restauranteabc.com",
  "telefono": "+57 1 234 5678",
  "direccion": "Calle 123 #45-67",
  "ciudad": "Bogotá",
  "pais": "Colombia",
  "moneda": "COP",
  "activo": true,
  "planSuscripcion": "profesional",
  "fechaCreacion": "2024-07-24T00:00:00Z"
}
```

#### Cliente (`restaurante-abc/clientes/{clienteId}`):
```json
{
  "nombre": "Ana María González",
  "telefono": "+57 312 345 6789",
  "email": "ana@email.com",
  "tipoCliente": "vip",
  "activo": true,
  "fechaAlta": "2024-07-24T00:00:00Z"
}
```

## 4. Reglas de Seguridad de Firestore

### `firestore.rules`:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Usuarios solo pueden ver su propia información
    match /usuarios/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Restaurantes - solo usuarios autorizados
    match /restaurantes/{restauranteId} {
      allow read: if request.auth != null && 
        exists(/databases/$(database)/documents/usuariosRestaurantes/$(request.auth.uid + '_' + restauranteId));
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/usuariosRestaurantes/$(request.auth.uid + '_' + restauranteId)).data.rol in ['propietario', 'administrador'];
    }
    
    // Permisos usuario-restaurante
    match /usuariosRestaurantes/{userRestaurantId} {
      allow read: if request.auth != null && userRestaurantId.matches(request.auth.uid + '_.*');
      allow write: if request.auth != null; // Solo administradores deberían poder escribir
    }
    
    // Datos específicos del restaurante
    match /{restauranteId}/{document=**} {
      allow read, write: if request.auth != null && 
        exists(/databases/$(database)/documents/usuariosRestaurantes/$(request.auth.uid + '_' + restauranteId));
    }
  }
}
```

## 5. Servicios de Datos

Los servicios están ubicados en `src/app/servicios/` y manejan toda la lógica de Firebase.

### Servicios principales:
- `auth.service.ts` - Autenticación
- `restaurante.service.ts` - Gestión de restaurantes
- `cliente.service.ts` - CRUD de clientes
- `reserva.service.ts` - CRUD de reservas
- `usuario.service.ts` - Gestión de usuarios

## 6. Routing Multi-Tenant

Las rutas seguirán este patrón:
- `/login` - Página de login
- `/{restauranteSlug}/dashboard` - Dashboard del restaurante
- `/{restauranteSlug}/clientes` - Clientes del restaurante
- `/{restauranteSlug}/reservas` - Reservas del restaurante

## 7. Variables de Entorno

Asegúrate de configurar estas variables en tu proyecto de Firebase:

```bash
# En Firebase Console > Project Settings > General
Project ID: tu-project-id
Web API Key: tu-api-key
Project Number: tu-sender-id
```

## 8. Comandos de Deploy

```bash
# Instalar Firebase CLI
npm install -g firebase-tools

# Login a Firebase
firebase login

# Inicializar proyecto (solo primera vez)
firebase init

# Deploy del proyecto
ionic build --prod
firebase deploy
```

## 9. Testing de la Conexión

Para probar que la conexión funciona:

1. Abre la consola del navegador
2. Ve al dashboard del CRM
3. Revisa que no haya errores de Firebase
4. Verifica que los datos de ejemplo se muestren correctamente

## 10. Troubleshooting

### Error: "Firebase App named '[DEFAULT]' already exists"
- Revisar que AngularFire esté configurado correctamente en app.module.ts

### Error: "Missing or insufficient permissions"
- Verificar las reglas de Firestore
- Confirmar que el usuario esté autenticado

### Error: "Cannot read property 'uid' of null"
- El usuario no está autenticado
- Implementar guards de autenticación en las rutas