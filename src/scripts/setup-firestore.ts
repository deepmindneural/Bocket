/**
 * Script para configurar la estructura inicial de Firestore
 * Ejecutar después de configurar Firebase Authentication
 */

import { environment } from '../environments/environment';

// Datos iniciales para crear en Firestore
export const initialFirestoreData = {
  // Usuarios de ejemplo (estos se crearán manualmente en Firebase Auth)
  usuarios: [
    {
      uid: 'admin_donpepe_001', // Se generará automáticamente en Firebase Auth
      email: 'admin@donpepe.com',
      nombreCompleto: 'Carlos Ramírez',
      emailVerificado: true,
      activo: true,
      idioma: 'es',
      zonaHoraria: 'America/Bogota',
      restaurantes: ['rest_donpepe_001'],
      fechaCreacion: new Date(),
      fechaActualizacion: new Date()
    },
    {
      uid: 'admin_marina_002', // Se generará automáticamente en Firebase Auth
      email: 'admin@marinacafe.com',
      nombreCompleto: 'María Isabella González',
      emailVerificado: true,
      activo: true,
      idioma: 'es',
      zonaHoraria: 'America/Bogota',
      restaurantes: ['rest_marinacafe_002'],
      fechaCreacion: new Date(),
      fechaActualizacion: new Date()
    }
  ],

  // Restaurantes
  restaurantes: [
    {
      id: 'rest_donpepe_001',
      slug: 'don-pepe-parrilla',
      nombre: 'Don Pepe Parrilla',
      logo: 'assets/logo.png',
      colorPrimario: '#8B0000',
      colorSecundario: '#FFD700',
      telefono: '+57 301 234 5678',
      email: 'info@donpepe.com',
      direccion: 'Carrera 15 #85-32',
      ciudad: 'Bogotá',
      descripcion: 'La mejor parrilla argentina de la ciudad',
      activo: true,
      propietarioId: 'admin_donpepe_001',
      fechaCreacion: new Date(),
      fechaActualizacion: new Date()
    },
    {
      id: 'rest_marinacafe_002',
      slug: 'marina-cafe-bistro',
      nombre: 'Marina Café & Bistro',
      logo: 'assets/logo.png',
      colorPrimario: '#1E90FF',
      colorSecundario: '#FF69B4',
      telefono: '+57 312 567 8901',
      email: 'contacto@marinacafe.com',
      direccion: 'Calle 93 #11-27',
      ciudad: 'Bogotá',
      descripcion: 'Café gourmet y cocina internacional',
      activo: true,
      propietarioId: 'admin_marina_002',
      fechaCreacion: new Date(),
      fechaActualizacion: new Date()
    }
  ],

  // Permisos de usuarios en restaurantes
  usuariosRestaurantes: [
    {
      id: 'admin_donpepe_001_rest_donpepe_001',
      usuarioId: 'admin_donpepe_001',
      restauranteId: 'rest_donpepe_001',
      rol: 'propietario',
      permisos: ['clientes', 'reservas', 'pedidos', 'productos', 'reportes', 'configuracion'],
      activo: true,
      fechaAsignacion: new Date(),
      asignadoPor: 'admin_donpepe_001'
    },
    {
      id: 'admin_marina_002_rest_marinacafe_002',
      usuarioId: 'admin_marina_002',
      restauranteId: 'rest_marinacafe_002',
      rol: 'propietario',
      permisos: ['clientes', 'reservas', 'pedidos', 'productos', 'reportes', 'configuracion'],
      activo: true,
      fechaAsignacion: new Date(),
      asignadoPor: 'admin_marina_002'
    }
  ]
};

// Reglas de seguridad de Firestore
export const firestoreRules = `
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Usuarios solo pueden leer/escribir sus propios datos
    match /usuarios/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
    
    // Restaurantes - solo propietarios y usuarios autorizados
    match /restaurantes/{restauranteId} {
      allow read: if request.auth != null && 
        (resource.data.propietarioId == request.auth.uid ||
         exists(/databases/$(database)/documents/usuariosRestaurantes/$(request.auth.uid + '_' + restauranteId)));
      allow write: if request.auth != null && 
        resource.data.propietarioId == request.auth.uid;
    }
    
    // Permisos de usuarios en restaurantes
    match /usuariosRestaurantes/{documento} {
      allow read: if request.auth != null && 
        documento.matches(request.auth.uid + '_.*');
      allow write: if request.auth != null && 
        // Solo propietarios pueden modificar permisos
        get(/databases/$(database)/documents/restaurantes/$(documento.split('_')[1])).data.propietarioId == request.auth.uid;
    }
    
    // Datos del restaurante (clientes, reservas, etc.)
    match /restaurantes/{restauranteId}/{collection}/{documento} {
      allow read, write: if request.auth != null && 
        (get(/databases/$(database)/documents/restaurantes/$(restauranteId)).data.propietarioId == request.auth.uid ||
         exists(/databases/$(database)/documents/usuariosRestaurantes/$(request.auth.uid + '_' + restauranteId)));
    }
  }
}
`;

console.log('📋 INSTRUCCIONES PARA CONFIGURAR FIRESTORE:');
console.log('');
console.log('1. Ve a Firebase Console: https://console.firebase.google.com/');
console.log('2. Selecciona tu proyecto: bocket-2024');
console.log('');
console.log('🔐 CONFIGURAR AUTHENTICATION:');
console.log('3. Ve a Authentication > Users');
console.log('4. Crea los siguientes usuarios:');
console.log('   - admin@donpepe.com (password: 123456)');
console.log('   - admin@marinacafe.com (password: 123456)');
console.log('');
console.log('🗄️ CONFIGURAR FIRESTORE:');
console.log('5. Ve a Firestore Database');
console.log('6. Crea las siguientes colecciones manualmente:');
console.log('');
console.log('📁 Colección: usuarios');
console.log('   Documentos: usar los UIDs generados por Firebase Auth');
console.log('');
console.log('📁 Colección: restaurantes');
console.log('   Documentos: rest_donpepe_001, rest_marinacafe_002');
console.log('');
console.log('📁 Colección: usuariosRestaurantes');
console.log('   Documentos: {uid}_rest_donpepe_001, {uid}_rest_marinacafe_002');
console.log('');
console.log('🔒 CONFIGURAR REGLAS DE SEGURIDAD:');
console.log('7. Ve a Firestore Database > Reglas');
console.log('8. Copia y pega las reglas de seguridad del código');
console.log('');
console.log('⚡ Para migrar de MOCK a FIREBASE:');
console.log('9. En el código, cambiar: authService.setUseFirebase(true)');