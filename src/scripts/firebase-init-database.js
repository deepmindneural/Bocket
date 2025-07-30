const admin = require('firebase-admin');

// Configuración de Firebase Admin SDK
const serviceAccount = {
  // Reemplazar con las credenciales reales del proyecto
  "type": "service_account",
  "project_id": "tu-proyecto-firebase",
  "private_key_id": "key-id",
  "private_key": "-----BEGIN PRIVATE KEY-----\nTU_PRIVATE_KEY_AQUI\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk@tu-proyecto.iam.gserviceaccount.com",
  "client_id": "client-id",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token"
};

// Inicializar Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Datos de ejemplo para inicializar las colecciones
const restaurantesIniciales = [
  {
    id: 'rest_donpepe_001',
    nombre: 'Don Pepe Parrilla',
    descripcion: 'Restaurante de parrilla tradicional',
    direccion: 'Calle 85 #15-20, Bogotá',
    telefono: '+57 1 234 5678',
    email: 'info@donpepe.com',
    logo: 'assets/logos/donpepe.png',
    activo: true,
    fechaCreacion: new Date(),
    configuracion: {
      moneda: 'COP',
      idioma: 'es',
      zona_horaria: 'America/Bogota'
    }
  },
  {
    id: 'rest_marinacafe_002',
    nombre: 'Marina Café & Bistro',
    descripcion: 'Café y bistro moderno',
    direccion: 'Carrera 11 #93-45, Bogotá',
    telefono: '+57 1 987 6543',
    email: 'info@marinacafe.com',
    logo: 'assets/logos/marina.png',
    activo: true,
    fechaCreacion: new Date(),
    configuracion: {
      moneda: 'COP',
      idioma: 'es',
      zona_horaria: 'America/Bogota'
    }
  }
];

// Datos de ejemplo para clientes (finalUser interface)
const clientesIniciales = [
  {
    id: '573001234567',
    restauranteId: 'rest_donpepe_001',
    isGroup: false,
    creation: new Date().toISOString(),
    isEnterprise: false,
    isBusiness: false,
    isMyContact: true,
    isUser: false,
    isWAContact: true,
    isBlocked: false,
    wappLabels: ['cliente_vip'],
    name: 'Pedro Martínez García',
    pushname: 'Pedro M.',
    sectionHeader: '',
    shortName: 'Pedro',
    sourceType: 'chatBot',
    respType: 'bot',
    labels: 'cliente_vip,frecuente',
    whatsAppName: 'Pedro M.',
    isSpam: false,
    email: 'pedro.martinez@email.com',
    company: 'Empresa ABC',
    address: 'Calle 123 #45-67',
    image: '',
    lastUpdate: new Date().toISOString(),
    userInteractions: {
      whatsapp: 45,
      controller: 12,
      chatbot: 23,
      api: 8,
      campaing: 3,
      client: 67,
      others: 2,
      wappController: 15,
      ai: 7,
      fee: 125000
    }
  },
  {
    id: '573109876543',
    restauranteId: 'rest_marinacafe_002',
    isGroup: false,
    creation: new Date().toISOString(),
    isEnterprise: true,
    isBusiness: true,
    isMyContact: true,
    isUser: false,
    isWAContact: true,
    isBlocked: false,
    wappLabels: ['cliente_corporativo'],
    name: 'Ana Lucía Rodríguez Silva',
    pushname: 'Ana R.',
    sectionHeader: '',
    shortName: 'Ana',
    sourceType: 'manual',
    respType: 'manual',
    labels: 'cliente_corporativo,eventos',
    whatsAppName: 'Ana R.',
    isSpam: false,
    email: 'ana.rodriguez@empresa.com',
    company: 'Corporación XYZ',
    address: 'Avenida 456 #78-90',
    image: '',
    lastUpdate: new Date().toISOString(),
    userInteractions: {
      whatsapp: 78,
      controller: 25,
      chatbot: 12,
      api: 15,
      campaing: 8,
      client: 98,
      others: 5,
      wappController: 32,
      ai: 18,
      fee: 285000
    }
  }
];

// Datos de ejemplo para reservas (VenueBooking interface)
const reservasIniciales = [
  {
    id: 'reserva_001',
    restauranteId: 'rest_donpepe_001',
    contact: '573001234567',
    contactNameBooking: 'Pedro Martínez',
    peopleBooking: '4 personas',
    finalPeopleBooking: 4,
    dateBooking: new Date(Date.now() + 86400000).toISOString(), // Mañana
    statusBooking: 'pending',
    detailsBooking: 'Mesa para celebración de cumpleaños',
    reconfirmDate: null,
    reconfirmStatus: null,
    fechaCreacion: new Date(),
    fechaActualizacion: new Date()
  },
  {
    id: 'reserva_002',
    restauranteId: 'rest_marinacafe_002',
    contact: '573109876543',
    contactNameBooking: 'Ana Rodríguez',
    peopleBooking: '6 personas',
    finalPeopleBooking: 6,
    dateBooking: new Date(Date.now() + 172800000).toISOString(), // En 2 días
    statusBooking: 'accepted',
    detailsBooking: 'Reunión de negocios',
    reconfirmDate: new Date().toISOString(),
    reconfirmStatus: 'accepted',
    fechaCreacion: new Date(),
    fechaActualizacion: new Date()
  }
];

// Datos de ejemplo para pedidos (OrderTodelivery interface)
const pedidosIniciales = [
  {
    id: 'pedido_001',
    restauranteId: 'rest_donpepe_001',
    contact: '573001234567',
    contactNameOrder: 'Pedro Martínez',
    orderType: 'delivery',
    resumeOrder: '2x Churrasco + 1x Ensalada César + 2x Gaseosa',
    addressToDelivery: 'Calle 123 #45-67, Apto 501',
    statusBooking: 'pending',
    fechaCreacion: new Date(),
    fechaActualizacion: new Date(),
    total: 85000
  },
  {
    id: 'pedido_002',
    restauranteId: 'rest_marinacafe_002',
    contact: '573109876543',
    contactNameOrder: 'Ana Rodríguez',
    orderType: 'pickUp',
    resumeOrder: '3x Café Americano + 2x Croissant + 1x Torta de chocolate',
    addressToDelivery: 'Recogida en tienda - Marina Café',
    statusBooking: 'accepted',
    fechaCreacion: new Date(),
    fechaActualizacion: new Date(),
    total: 45000
  }
];

async function inicializarBaseDatos() {
  try {
    console.log('🚀 Iniciando creación de estructuras de base de datos...');

    // 1. Crear colección de restaurantes
    console.log('📊 Creando restaurantes...');
    for (const restaurante of restaurantesIniciales) {
      await db.collection('restaurantes').doc(restaurante.id).set(restaurante);
      console.log(`✅ Restaurante creado: ${restaurante.nombre}`);
      
      // 2. Crear sub-colecciones para cada restaurante
      const restauranteRef = db.collection('restaurantes').doc(restaurante.id);
      
      // Crear colección de clientes
      console.log(`👥 Creando clientes para ${restaurante.nombre}...`);
      const clientesRestaurante = clientesIniciales.filter(c => c.restauranteId === restaurante.id);
      for (const cliente of clientesRestaurante) {
        await restauranteRef.collection('clientes').doc(cliente.id).set(cliente);
        console.log(`✅ Cliente creado: ${cliente.name}`);
      }
      
      // Crear colección de reservas
      console.log(`🍽️  Creando reservas para ${restaurante.nombre}...`);
      const reservasRestaurante = reservasIniciales.filter(r => r.restauranteId === restaurante.id);
      for (const reserva of reservasRestaurante) {
        await restauranteRef.collection('reservas').doc(reserva.id).set(reserva);
        console.log(`✅ Reserva creada: ${reserva.id}`);
      }
      
      // Crear colección de pedidos
      console.log(`🛍️  Creando pedidos para ${restaurante.nombre}...`);
      const pedidosRestaurante = pedidosIniciales.filter(p => p.restauranteId === restaurante.id);
      for (const pedido of pedidosRestaurante) {
        await restauranteRef.collection('pedidos').doc(pedido.id).set(pedido);
        console.log(`✅ Pedido creado: ${pedido.id}`);
      }
      
      // Crear índices y reglas de seguridad (documentos de configuración)
      await restauranteRef.collection('configuracion').doc('indices').set({
        createdAt: new Date(),
        indices: {
          clientes: ['name', 'email', 'whatsAppName', 'creation', 'lastUpdate'],
          reservas: ['contact', 'dateBooking', 'statusBooking', 'fechaCreacion'],
          pedidos: ['contact', 'orderType', 'statusBooking', 'fechaCreacion']
        }
      });
      
      console.log(`✅ Configuración de índices creada para ${restaurante.nombre}`);
    }

    // 3. Crear colección global de usuarios (administradores)
    console.log('👤 Creando usuarios administradores...');
    const usuariosAdmin = [
      {
        id: 'admin_donpepe',
        nombreCompleto: 'Administrador Don Pepe',
        email: 'admin@donpepe.com',
        restauranteId: 'rest_donpepe_001',
        rol: 'admin',
        activo: true,
        fechaCreacion: new Date(),
        permisos: ['clientes', 'reservas', 'pedidos', 'reportes']
      },
      {
        id: 'admin_marina',
        nombreCompleto: 'Administrador Marina',
        email: 'admin@marinacafe.com',
        restauranteId: 'rest_marinacafe_002',
        rol: 'admin',
        activo: true,
        fechaCreacion: new Date(),
        permisos: ['clientes', 'reservas', 'pedidos', 'reportes']
      }
    ];

    for (const usuario of usuariosAdmin) {
      await db.collection('usuarios').doc(usuario.id).set(usuario);
      console.log(`✅ Usuario admin creado: ${usuario.nombreCompleto}`);
    }

    // 4. Crear documento de configuración global
    await db.collection('configuracion').doc('global').set({
      version: '1.0.0',
      ultimaActualizacion: new Date(),
      configuracionGeneral: {
        maxClientesPorRestaurante: 10000,
        maxReservasPorDia: 100,
        maxPedidosPorDia: 500,
        backupAutomatico: true,
        notificacionesEmail: true
      },
      interfaces: {
        finalUser: {
          campos: [
            'id', 'isGroup', 'creation', 'isEnterprise', 'isBusiness', 
            'isMyContact', 'isUser', 'isWAContact', 'isBlocked', 'wappLabels',
            'name', 'pushname', 'sectionHeader', 'shortName', 'sourceType',
            'respType', 'labels', 'whatsAppName', 'isSpam', 'email', 
            'company', 'address', 'image', 'lastUpdate', 'userInteractions'
          ]
        },
        venueBooking: {
          campos: [
            'id', 'contact', 'contactNameBooking', 'peopleBooking', 
            'finalPeopleBooking', 'dateBooking', 'statusBooking', 
            'detailsBooking', 'reconfirmDate', 'reconfirmStatus'
          ]
        },
        orderTodelivery: {
          campos: [
            'id', 'contact', 'contactNameOrder', 'orderType', 
            'resumeOrder', 'addressToDelivery', 'statusBooking'
          ]
        }
      }
    });

    console.log('✅ Configuración global creada');

    console.log('\n🎉 ¡Base de datos inicializada exitosamente!');
    console.log('\n📋 Resumen de lo creado:');
    console.log(`📊 Restaurantes: ${restaurantesIniciales.length}`);
    console.log(`👥 Clientes: ${clientesIniciales.length}`);
    console.log(`🍽️  Reservas: ${reservasIniciales.length}`);
    console.log(`🛍️  Pedidos: ${pedidosIniciales.length}`);
    console.log(`👤 Usuarios admin: ${usuariosAdmin.length}`);
    console.log('\n📁 Estructura de colecciones:');
    console.log('├── restaurantes/');
    console.log('│   ├── [restauranteId]/');
    console.log('│   │   ├── clientes/');
    console.log('│   │   ├── reservas/');
    console.log('│   │   ├── pedidos/');
    console.log('│   │   └── configuracion/');
    console.log('├── usuarios/');
    console.log('└── configuracion/');

  } catch (error) {
    console.error('❌ Error inicializando base de datos:', error);
  } finally {
    console.log('\n🔚 Proceso completado. Cerrando conexión...');
    process.exit(0);
  }
}

// Función para verificar si las colecciones ya existen
async function verificarEstructuraExistente() {
  try {
    console.log('🔍 Verificando estructura existente...');
    
    const restaurantesSnapshot = await db.collection('restaurantes').limit(1).get();
    if (!restaurantesSnapshot.empty) {
      console.log('⚠️  Ya existen restaurantes en la base de datos.');
      console.log('¿Deseas continuar y agregar datos adicionales? (Esto no eliminará datos existentes)');
      return true;
    }
    
    return false;
  } catch (error) {
    console.log('📋 Base de datos limpia, procediendo con la inicialización...');
    return false;
  }
}

// Ejecutar el script
async function main() {
  console.log('🔥 Firebase Database Initializer - Bocket CRM');
  console.log('===============================================\n');
  
  const existeEstructura = await verificarEstructuraExistente();
  
  if (existeEstructura) {
    console.log('ℹ️  Agregando datos a la estructura existente...\n');
  }
  
  await inicializarBaseDatos();
}

// Ejecutar solo si se llama directamente
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  inicializarBaseDatos,
  verificarEstructuraExistente
};