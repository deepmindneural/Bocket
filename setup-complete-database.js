const admin = require('firebase-admin');

// Configuración de Firebase usando las credenciales del entorno
const config = {
  apiKey: "AIzaSyC54Ytk5wO2zupIuCtFIsIUNXvP4m9qqOk",
  authDomain: "bocket-2024.firebaseapp.com",
  projectId: "bocket-2024",
  storageBucket: "bocket-2024.appspot.com",
  messagingSenderId: "537532907057",
  appId: "1:537532907057:web:dc51aacd0553b9ac2edf10"
};

// Inicializar Firebase Admin (usando credenciales por defecto)
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: config.projectId
  });
}

const db = admin.firestore();

console.log('🏗️  CONFIGURANDO BASE DE DATOS COMPLETA BOCKET CRM');
console.log('='.repeat(80));

// Estructura completa de la base de datos multi-tenant
const databaseStructure = {
  // Colecciones globales
  global: {
    usuarios: 'Usuarios globales del sistema',
    restaurantes: 'Configuración de restaurantes',
    usuariosRestaurantes: 'Relación usuarios-restaurantes',
    configuracion: 'Configuración global del sistema'
  },
  
  // Colecciones por restaurante (multi-tenant)
  perRestaurant: {
    clientes: 'Clientes (finalUser interface)',
    reservas: 'Reservas de mesas',
    pedidos: 'Pedidos (OrderTodelivery interface)', 
    productos: 'Catálogo de productos',
    reportes: 'Reportes y estadísticas',
    interacciones: 'Log de interacciones con clientes',
    etiquetas: 'Etiquetas personalizadas',
    campañas: 'Campañas de marketing',
    notificaciones: 'Notificaciones del restaurante'
  }
};

// Datos de ejemplo siguiendo las interfaces exactas
const sampleData = {
  // Usuarios globales
  usuarios: [
    {
      uid: 'admin_bocket_001',
      email: 'admin@bocket.co',
      nombreCompleto: 'Administrador Bocket',
      emailVerificado: true,
      activo: true,
      rol: 'super_admin',
      idioma: 'es',
      zonaHoraria: 'America/Bogota',
      restaurantes: ['rest_donpepe_001', 'rest_marinacafe_002'],
      fechaCreacion: admin.firestore.FieldValue.serverTimestamp(),
      fechaActualizacion: admin.firestore.FieldValue.serverTimestamp()
    }
  ],

  // Configuración de restaurantes
  restaurantes: [
    {
      id: 'rest_donpepe_001',
      slug: 'don-pepe',
      nombre: 'Don Pepe Parrilla',
      email: 'info@donpepe.com',
      telefono: '+57 301 234 5678',
      direccion: 'Carrera 15 #85-32',
      ciudad: 'Bogotá',
      descripcion: 'La mejor parrilla argentina de la ciudad',
      logo: 'assets/logos/don-pepe-logo.png',
      colorPrimario: '#8B0000',
      colorSecundario: '#FFD700',
      activo: true,
      configuracion: {
        // Configuración de pedidos siguiendo OrderTodelivery
        pedidos: {
          estadosPermitidos: ['pending', 'accepted', 'rejected', 'inProcess', 'inDelivery', 'deliveried'],
          tiposPermitidos: ['delivery', 'pickUp', 'insideOrder'],
          tiempoEntrega: 45, // minutos
          costoDelivery: 5000,
          montoMinimoDelivery: 25000
        },
        // Configuración de reservas
        reservas: {
          estadosPermitidos: ['pending', 'accepted', 'rejected'],
          tiempoReconfirmacion: 24, // horas
          capacidadMaxima: 80,
          horariosAtencion: {
            lunes: { abierto: '11:00', cerrado: '22:00' },
            martes: { abierto: '11:00', cerrado: '22:00' },
            miercoles: { abierto: '11:00', cerrado: '22:00' },
            jueves: { abierto: '11:00', cerrado: '22:00' },
            viernes: { abierto: '11:00', cerrado: '23:00' },
            sabado: { abierto: '12:00', cerrado: '23:00' },
            domingo: { abierto: '12:00', cerrado: '21:00' }
          }
        },
        // Configuración de WhatsApp/finalUser
        whatsapp: {
          numeroBot: '573142369478',
          respuestaAutomatica: true,
          horarioBot: {
            inicio: '08:00',
            fin: '22:00'
          }
        }
      },
      fechaCreacion: admin.firestore.FieldValue.serverTimestamp(),
      fechaActualizacion: admin.firestore.FieldValue.serverTimestamp()
    },
    {
      id: 'rest_marinacafe_002',
      slug: 'marina-cafe',
      nombre: 'Marina Café & Bistro',
      email: 'contacto@marinacafe.com',
      telefono: '+57 312 567 8901',
      direccion: 'Calle 93 #11-27',
      ciudad: 'Bogotá',
      descripcion: 'Café gourmet y cocina internacional',
      logo: 'assets/logos/marina-cafe-logo.png',
      colorPrimario: '#1E90FF',
      colorSecundario: '#FF69B4',
      activo: true,
      configuracion: {
        pedidos: {
          estadosPermitidos: ['pending', 'accepted', 'rejected', 'inProcess', 'inDelivery', 'deliveried'],
          tiposPermitidos: ['delivery', 'pickUp', 'insideOrder'],
          tiempoEntrega: 30,
          costoDelivery: 4000,
          montoMinimoDelivery: 20000
        },
        reservas: {
          estadosPermitidos: ['pending', 'accepted', 'rejected'],
          tiempoReconfirmacion: 12,
          capacidadMaxima: 50,
          horariosAtencion: {
            lunes: { abierto: '07:00', cerrado: '20:00' },
            martes: { abierto: '07:00', cerrado: '20:00' },
            miercoles: { abierto: '07:00', cerrado: '20:00' },
            jueves: { abierto: '07:00', cerrado: '20:00' },
            viernes: { abierto: '07:00', cerrado: '21:00' },
            sabado: { abierto: '08:00', cerrado: '21:00' },
            domingo: { abierto: '08:00', cerrado: '19:00' }
          }
        },
        whatsapp: {
          numeroBot: '573217589044',
          respuestaAutomatica: true,
          horarioBot: {
            inicio: '07:00',
            fin: '20:00'
          }
        }
      },
      fechaCreacion: admin.firestore.FieldValue.serverTimestamp(),
      fechaActualizacion: admin.firestore.FieldValue.serverTimestamp()
    }
  ],

  // Usuarios-Restaurantes (multi-tenant)
  usuariosRestaurantes: [
    {
      id: 'admin_bocket_001_rest_donpepe_001',
      usuarioId: 'admin_bocket_001',
      restauranteId: 'rest_donpepe_001',
      rol: 'admin',
      permisos: ['clientes', 'reservas', 'pedidos', 'productos', 'reportes', 'configuracion'],
      activo: true,
      fechaAsignacion: admin.firestore.FieldValue.serverTimestamp()
    },
    {
      id: 'admin_bocket_001_rest_marinacafe_002',
      usuarioId: 'admin_bocket_001',
      restauranteId: 'rest_marinacafe_002',
      rol: 'admin',
      permisos: ['clientes', 'reservas', 'pedidos', 'productos', 'reportes', 'configuracion'],
      activo: true,
      fechaAsignacion: admin.firestore.FieldValue.serverTimestamp()
    }
  ],

  // Clientes siguiendo interface finalUser
  clientesSample: [
    {
      // Interface finalUser completa
      id: '573001234567', // número WhatsApp
      restauranteId: 'rest_donpepe_001',
      isGroup: false,
      creation: '2025-01-15T10:30:00.000Z',
      isEnterprise: false,
      isBusiness: true,
      isMyContact: true,
      isUser: true,
      isWAContact: true,
      isBlocked: false,
      wappLabels: ['cliente_vip', 'frecuente'],
      name: 'Pedro Martínez García',
      pushname: 'Pedro M.',
      sectionHeader: '',
      shortName: 'Pedro',
      sourceType: 'chatBot',
      respType: 'bot',
      labels: 'cliente_vip,frecuente,parrilla',
      whatsAppName: 'Pedro Martínez',
      isSpam: false,
      email: 'pedro.martinez@email.com',
      company: 'Empresas ABC S.A.S',
      address: 'Calle 72 #10-15, Bogotá - Barrio Rosales, Torre A Apto 502',
      image: 'https://example.com/profile/pedro.jpg',
      lastUpdate: '2025-01-26T08:45:00.000Z',
      // Interface UserInteractions
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
        fee: 125000 // total gastado
      }
    },
    {
      id: '573109876543',
      restauranteId: 'rest_donpepe_001',
      isGroup: false,
      creation: '2025-01-20T14:20:00.000Z',
      isEnterprise: true,
      isBusiness: true,
      isMyContact: true,
      isUser: true,
      isWAContact: true,
      isBlocked: false,
      wappLabels: ['cliente_corporativo', 'eventos'],
      name: 'Ana Lucía Rodríguez Silva',
      pushname: 'Ana R.',
      sectionHeader: '',
      shortName: 'Ana',
      sourceType: 'manual',
      respType: 'manual',
      labels: 'cliente_corporativo,eventos,cenas_trabajo',
      whatsAppName: 'Ana Rodríguez',
      isSpam: false,
      email: 'ana.rodriguez@empresa.com',
      company: 'Corporación XYZ S.A.',
      address: 'Carrera 11 #93-45, Oficina 801',
      image: 'https://example.com/profile/ana.jpg',
      lastUpdate: '2025-01-26T16:30:00.000Z',
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
  ],

  // Pedidos siguiendo interface OrderTodelivery  
  pedidosSample: [
    {
      id: 'pedido_' + Date.now() + '_1',
      restauranteId: 'rest_donpepe_001',
      contact: '573001234567', // ID del finalUser
      orderType: 'delivery',
      resumeOrder: '1x Bandeja Paisa ($35.000), 1x Jugo Natural Naranja ($8.000), 1x Arepa con Queso ($5.000). Total: $48.000',
      contactNameOrder: 'Pedro Martínez García',
      addressToDelivery: 'Calle 72 #10-15, Bogotá - Barrio Rosales, Torre A Apto 502',
      statusBooking: 'inDelivery',
      fechaPedido: admin.firestore.FieldValue.serverTimestamp(),
      fechaEntregaEstimada: new Date(Date.now() + 45 * 60 * 1000), // 45 min
      valorTotal: 48000,
      valorDelivery: 5000,
      metodoPago: 'efectivo',
      observaciones: 'Sin cebolla en la bandeja, favor tocar timbre apartamento 502'
    },
    {
      id: 'pedido_' + Date.now() + '_2',
      restauranteId: 'rest_donpepe_001',
      contact: '573109876543',
      orderType: 'pickUp',
      resumeOrder: '2x Café Americano ($16.000), 3x Croissant Almendras ($36.000), 1x Cheesecake ($18.000). Total: $70.000',
      contactNameOrder: 'Ana Lucía Rodríguez Silva',
      addressToDelivery: 'Recoge en tienda - Don Pepe Parrilla',
      statusBooking: 'accepted',
      fechaPedido: admin.firestore.FieldValue.serverTimestamp(),
      fechaEntregaEstimada: new Date(Date.now() + 30 * 60 * 1000), // 30 min
      valorTotal: 70000,
      valorDelivery: 0,
      metodoPago: 'tarjeta',
      observaciones: 'Pedido corporativo, requiere factura electrónica'
    }
  ]
};

async function setupCompleteDatabase() {
  try {
    console.log('📦 PASO 1: Configurando colecciones globales...');
    
    // 1. Configurar usuarios globales
    console.log('👥 Creando usuarios globales...');
    for (const usuario of sampleData.usuarios) {
      await db.collection('usuarios').doc(usuario.uid).set(usuario);
      console.log(`   ✅ Usuario creado: ${usuario.email}`);
    }

    // 2. Configurar restaurantes
    console.log('🏪 Creando restaurantes...');
    for (const restaurante of sampleData.restaurantes) {
      await db.collection('restaurantes').doc(restaurante.id).set(restaurante);
      console.log(`   ✅ Restaurante creado: ${restaurante.nombre}`);
    }

    // 3. Configurar relaciones usuario-restaurante
    console.log('🔗 Creando relaciones usuario-restaurante...');
    for (const relacion of sampleData.usuariosRestaurantes) {
      await db.collection('usuariosRestaurantes').doc(relacion.id).set(relacion);
      console.log(`   ✅ Relación creada: ${relacion.usuarioId} -> ${relacion.restauranteId}`);
    }

    console.log('\n📊 PASO 2: Configurando colecciones por restaurante...');
    
    // 4. Para cada restaurante, crear estructura de datos
    for (const restaurante of sampleData.restaurantes) {
      const restauranteId = restaurante.id;
      console.log(`\n🏪 Configurando datos para: ${restaurante.nombre}`);

      // Crear clientes con interface finalUser
      console.log('👥 Creando clientes (finalUser)...');
      const clientesParaRestaurante = sampleData.clientesSample.filter(c => c.restauranteId === restauranteId);
      for (const cliente of clientesParaRestaurante) {
        await db.collection('restaurantes').doc(restauranteId).collection('clientes').doc(cliente.id).set(cliente);
        console.log(`   ✅ Cliente creado: ${cliente.name} (${cliente.id})`);
      }

      // Crear pedidos con interface OrderTodelivery
      console.log('🍽️  Creando pedidos (OrderTodelivery)...');
      const pedidosParaRestaurante = sampleData.pedidosSample.filter(p => p.restauranteId === restauranteId);
      for (const pedido of pedidosParaRestaurante) {
        await db.collection('restaurantes').doc(restauranteId).collection('pedidos').doc(pedido.id).set(pedido);
        console.log(`   ✅ Pedido creado: ${pedido.id} (${pedido.orderType})`);
      }

      // Crear productos de ejemplo
      console.log('🥘 Creando productos...');
      const productos = [
        {
          id: 'prod_bandeja_paisa',
          nombre: 'Bandeja Paisa',
          descripcion: 'Plato típico con frijoles, arroz, huevo, chicharrón, chorizo, arepa y aguacate',
          precio: 35000,
          categoria: 'platos_principales',
          disponible: true,
          tiempoPreparacion: 25,
          ingredientes: ['frijoles', 'arroz', 'huevo', 'chicharrón', 'chorizo', 'arepa', 'aguacate'],
          alergenos: ['gluten'],
          imagen: 'assets/productos/bandeja-paisa.jpg'
        },
        {
          id: 'prod_churrasco',
          nombre: 'Churrasco Argentino',
          descripcion: 'Corte premium de res a la parrilla con papas y ensalada',
          precio: 45000,
          categoria: 'carnes',
          disponible: true,
          tiempoPreparacion: 20,
          ingredientes: ['carne de res', 'papas', 'ensalada mixta'],
          alergenos: [],
          imagen: 'assets/productos/churrasco.jpg'
        }
      ];

      for (const producto of productos) {
        await db.collection('restaurantes').doc(restauranteId).collection('productos').doc(producto.id).set(producto);
        console.log(`   ✅ Producto creado: ${producto.nombre}`);
      }

      // Crear etiquetas personalizadas
      console.log('🏷️  Creando etiquetas...');
      const etiquetas = [
        {
          id: 'cliente_vip',
          nombre: 'Cliente VIP',
          color: '#FFD700',
          descripcion: 'Cliente con alto valor',
          activa: true
        },
        {
          id: 'cliente_corporativo',
          nombre: 'Cliente Corporativo',
          color: '#1E90FF',
          descripcion: 'Cliente empresarial',
          activa: true
        },
        {
          id: 'eventos',
          nombre: 'Eventos',
          color: '#FF69B4',
          descripcion: 'Cliente de eventos especiales',
          activa: true
        }
      ];

      for (const etiqueta of etiquetas) {
        await db.collection('restaurantes').doc(restauranteId).collection('etiquetas').doc(etiqueta.id).set(etiqueta);
        console.log(`   ✅ Etiqueta creada: ${etiqueta.nombre}`);
      }

      // Crear reporte de ejemplo
      const reporte = {
        id: `reporte_diario_${new Date().toISOString().split('T')[0]}`,
        tipo: 'diario',
        fecha: admin.firestore.FieldValue.serverTimestamp(),
        estadisticas: {
          totalClientes: clientesParaRestaurante.length,
          pedidosTotal: pedidosParaRestaurante.length,
          pedidosEnDelivery: pedidosParaRestaurante.filter(p => p.statusBooking === 'inDelivery').length,
          ventasDelDia: pedidosParaRestaurante.reduce((sum, p) => sum + p.valorTotal, 0),
          interaccionesWhatsApp: clientesParaRestaurante.reduce((sum, c) => sum + c.userInteractions.whatsapp, 0)
        },
        clientesMasActivos: clientesParaRestaurante
          .sort((a, b) => b.userInteractions.client - a.userInteractions.client)
          .slice(0, 5)
          .map(c => ({
            contact: c.id,
            nombre: c.name,
            interacciones: c.userInteractions.client,
            fee: c.userInteractions.fee
          }))
      };

      await db.collection('restaurantes').doc(restauranteId).collection('reportes').doc(reporte.id).set(reporte);
      console.log(`   ✅ Reporte creado: ${reporte.id}`);
    }

    console.log('\n' + '='.repeat(80));
    console.log('🎉 BASE DE DATOS CONFIGURADA COMPLETAMENTE');
    console.log('='.repeat(80));
    
    console.log('📊 RESUMEN:');
    console.log(`✅ ${sampleData.usuarios.length} usuarios globales`);
    console.log(`✅ ${sampleData.restaurantes.length} restaurantes`);
    console.log(`✅ ${sampleData.usuariosRestaurantes.length} relaciones usuario-restaurante`);
    console.log(`✅ ${sampleData.clientesSample.length} clientes con interface finalUser completa`);
    console.log(`✅ ${sampleData.pedidosSample.length} pedidos con interface OrderTodelivery`);
    console.log(`✅ Productos, etiquetas y reportes por restaurante`);
    
    console.log('\n🔧 COLECCIONES CREADAS:');
    console.log('📁 Globales: usuarios, restaurantes, usuariosRestaurantes');
    console.log('📁 Por restaurante: clientes, pedidos, productos, etiquetas, reportes');
    
    console.log('\n💡 PRÓXIMOS PASOS:');
    console.log('1. Actualizar formularios para usar todos los campos de finalUser');
    console.log('2. Implementar componente de estadísticas UserInteractions');
    console.log('3. Crear reglas de seguridad Firestore');
    console.log('4. Probar multi-tenancy con datos reales');

  } catch (error) {
    console.error('❌ Error configurando base de datos:', error);
  }
}

// Ejecutar configuración
setupCompleteDatabase()
  .then(() => {
    console.log('\n✅ Configuración completada exitosamente');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Error:', error);
    process.exit(1);
  });