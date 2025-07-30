# 🔥 **Configuración Completa de Firebase para Bocket CRM**

## 📋 **Paso 1: Crear Proyecto en Firebase**

### **A. Ir a Firebase Console:**
1. Visita: https://console.firebase.google.com/
2. Clic en **"Crear un proyecto"**
3. Nombre del proyecto: `bocket-crm-produccion` (o el que prefieras)
4. Habilitar Google Analytics (opcional)
5. Clic en **"Crear proyecto"**

---

## 🔐 **Paso 2: Configurar Authentication**

### **A. Habilitar Métodos de Autenticación:**
1. En Firebase Console → **Authentication** → **Sign-in method**
2. Habilitar **Email/Password**:
   - Clic en "Email/Password"
   - Activar "Email/Password" 
   - Activar "Email link (passwordless sign-in)" (opcional)
   - Guardar

### **B. Configurar Dominios Autorizados:**
1. En **Authentication** → **Settings** → **Authorized domains**
2. Agregar tus dominios:
   - `localhost` (para desarrollo)
   - `tu-dominio.com` (para producción)

---

## 🗄️ **Paso 3: Configurar Firestore Database**

### **A. Crear Base de Datos:**
1. En Firebase Console → **Firestore Database**
2. Clic en **"Crear base de datos"**
3. Seleccionar **"Empezar en modo de prueba"** (temporalmente)
4. Elegir ubicación: **us-central1** (América)

### **B. Configurar Reglas de Seguridad:**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Usuarios globales - solo el propio usuario puede leer/escribir
    match /usuarios/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Restaurantes - solo usuarios con permisos
    match /restaurantes/{restauranteId} {
      allow read: if request.auth != null && 
        exists(/databases/$(database)/documents/usuariosRestaurantes/$(request.auth.uid + '_' + restauranteId));
      
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/usuariosRestaurantes/$(request.auth.uid + '_' + restauranteId)).data.rol in ['propietario', 'administrador'];
    }
    
    // Permisos usuario-restaurante
    match /usuariosRestaurantes/{permisoId} {
      allow read: if request.auth != null && 
        permisoId.matches(request.auth.uid + '_.*');
      
      allow write: if request.auth != null && false; // Solo se crean desde admin
    }
    
    // Datos específicos del restaurante
    match /{restauranteId}/clientes/{clienteId} {
      allow read, write: if request.auth != null && 
        exists(/databases/$(database)/documents/usuariosRestaurantes/$(request.auth.uid + '_' + restauranteId)) &&
        get(/databases/$(database)/documents/usuariosRestaurantes/$(request.auth.uid + '_' + restauranteId)).data.activo == true;
    }
    
    match /{restauranteId}/reservas/{reservaId} {
      allow read, write: if request.auth != null && 
        exists(/databases/$(database)/documents/usuariosRestaurantes/$(request.auth.uid + '_' + restauranteId)) &&
        get(/databases/$(database)/documents/usuariosRestaurantes/$(request.auth.uid + '_' + restauranteId)).data.activo == true;
    }
    
    match /{restauranteId}/pedidos/{pedidoId} {
      allow read, write: if request.auth != null && 
        exists(/databases/$(database)/documents/usuariosRestaurantes/$(request.auth.uid + '_' + restauranteId)) &&
        get(/databases/$(database)/documents/usuariosRestaurantes/$(request.auth.uid + '_' + restauranteId)).data.activo == true;
    }
    
    match /{restauranteId}/productos/{productoId} {
      allow read, write: if request.auth != null && 
        exists(/databases/$(database)/documents/usuariosRestaurantes/$(request.auth.uid + '_' + restauranteId)) &&
        get(/databases/$(database)/documents/usuariosRestaurantes/$(request.auth.uid + '_' + restauranteId)).data.activo == true;
    }
  }
}
```

### **C. Crear Estructura Inicial:**
En Firestore, crear estas colecciones con documentos de ejemplo:

```javascript
// Colección: restaurantes
// Documento: rest_ejemplo_123
{
  "id": "rest_ejemplo_123",
  "slug": "restaurante-ejemplo",
  "nombre": "Restaurante Ejemplo",
  "logo": "https://firebasestorage.googleapis.com/v0/b/tu-proyecto/o/logos%2Fejemplo.png",
  "colorPrimario": "#004aad",
  "colorSecundario": "#d636a0",
  "activo": true,
  "fechaCreacion": "2024-07-24T00:00:00Z"
}

// Colección: usuarios  
// Documento: uid_del_usuario
{
  "uid": "uid_del_usuario",
  "email": "admin@ejemplo.com",
  "nombreCompleto": "Administrador Ejemplo",
  "activo": true,
  "restaurantes": ["rest_ejemplo_123"],
  "fechaCreacion": "2024-07-24T00:00:00Z"
}

// Colección: usuariosRestaurantes
// Documento: uid_del_usuario_rest_ejemplo_123
{
  "usuarioId": "uid_del_usuario",
  "restauranteId": "rest_ejemplo_123", 
  "rol": "propietario",
  "activo": true,
  "permisos": [
    {
      "modulo": "clientes",
      "acciones": ["crear", "leer", "editar", "eliminar"]
    }
  ]
}
```

---

## 📁 **Paso 4: Configurar Storage**

### **A. Habilitar Storage:**
1. En Firebase Console → **Storage**
2. Clic en **"Comenzar"**
3. Seleccionar ubicación: **us-central1**

### **B. Configurar Reglas de Storage:**
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Logos de restaurantes - solo lectura pública
    match /logos/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Assets de restaurantes
    match /assets/{restauranteId}/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null && 
        exists(/databases/(default)/documents/usuariosRestaurantes/$(request.auth.uid + '_' + restauranteId));
    }
  }
}
```

### **C. Crear Estructura de Carpetas:**
```
Storage/
├── logos/
│   ├── default-logo.png
│   ├── restaurante-ejemplo.png
│   └── ...
├── assets/
│   ├── rest_ejemplo_123/
│   │   ├── menu.pdf
│   │   ├── promociones/
│   │   └── ...
│   └── ...
```

---

## ⚙️ **Paso 5: Obtener Configuración para Angular**

### **A. Configuración del Proyecto:**
1. En Firebase Console → **Configuración del proyecto** (ícono de engranaje)
2. Clic en **"Tus apps"** → **"Agregar app"** → **Web**
3. Nombre de la app: `Bocket CRM Web`
4. Copiar la configuración que aparece

### **B. Actualizar environment.ts:**
```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  firebaseConfig: {
    apiKey: "AIzaSyC...", // TU API KEY REAL
    authDomain: "bocket-crm-produccion.firebaseapp.com",
    projectId: "bocket-crm-produccion", 
    storageBucket: "bocket-crm-produccion.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abc123def456",
    measurementId: "G-XXXXXXXXXX"
  }
};
```

---

## 🔧 **Paso 6: Configurar Angular con Firebase**

### **A. Instalar Dependencias:**
```bash
npm install @angular/fire firebase
```

### **B. Configurar app.module.ts:**
```typescript
import { environment } from '../environments/environment';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { provideStorage, getStorage } from '@angular/fire/storage';

@NgModule({
  imports: [
    // ... otros imports
    provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    provideStorage(() => getStorage())
  ]
})
```

---

## 🧪 **Paso 7: Probar Conexión**

### **A. Crear Usuario de Prueba:**
```typescript
// En tu servicio de auth
async crearUsuarioPrueba() {
  try {
    const credential = await createUserWithEmailAndPassword(
      this.auth, 
      'admin@ejemplo.com', 
      'password123'
    );
    
    console.log('Usuario creado:', credential.user.uid);
    
    // Crear documento en Firestore
    await setDoc(doc(this.firestore, 'usuarios', credential.user.uid), {
      email: 'admin@ejemplo.com',
      nombreCompleto: 'Admin Prueba',
      activo: true,
      fechaCreacion: new Date()
    });
    
  } catch (error) {
    console.error('Error:', error);
  }
}
```

### **B. Verificar en Firebase Console:**
1. **Authentication** → Ver usuario creado
2. **Firestore** → Ver documento en colección `usuarios`

---

## 🚀 **Paso 8: Comandos para Ejecutar**

```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
ionic serve

# O con Angular CLI
ng serve
```

---

## 📊 **Paso 9: Monitoreo y Analytics (Opcional)**

### **A. Habilitar Analytics:**
1. En Firebase Console → **Analytics**
2. Seguir el asistente de configuración

### **B. Performance Monitoring:**
```bash
npm install firebase/performance
```

---

## 🔒 **Paso 10: Seguridad Adicional**

### **A. Configurar App Check (Producción):**
1. En Firebase Console → **App Check**
2. Configurar reCAPTCHA para web

### **B. Configurar Límites de Uso:**
1. **Firestore** → **Usage** → Configurar alertas
2. **Storage** → **Usage** → Configurar límites

---

## 📝 **Resumen de URLs Importantes:**

- **Firebase Console:** https://console.firebase.google.com/
- **Documentación AngularFire:** https://github.com/angular/angularfire
- **Reglas de Firestore:** https://firebase.google.com/docs/firestore/security/rules-syntax

---

## ⚠️ **IMPORTANTE: Antes de Producción**

1. **Cambiar reglas de Firestore** de modo de prueba a producción
2. **Configurar dominio personalizado** en Hosting
3. **Habilitar backups** automáticos
4. **Configurar alertas** de uso y errores
5. **Revisar permisos** de usuarios

**¡Listo! Con esta configuración tendrás Firebase completamente funcional para el CRM multi-tenant.**