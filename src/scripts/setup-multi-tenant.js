#!/usr/bin/env node

/**
 * 🏢 Configurador Multi-Tenant para Bocket CRM
 * 
 * Este script configura la estructura multi-tenant donde cada restaurante
 * tiene sus propios datos separados usando las interfaces reales del cliente
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, setDoc, serverTimestamp, writeBatch } = require('firebase/firestore');

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyC54Ytk5wO2zupIuCtFIsIUNXvP4m9qqOk",
  authDomain: "bocket-2024.firebaseapp.com",
  projectId: "bocket-2024",
  storageBucket: "bocket-2024.appspot.com",
  messagingSenderId: "537532907057",
  appId: "1:537532907057:web:dc51aacd0553b9ac2edf10"
};

class MultiTenantSetup {
  constructor() {
    this.app = null;
    this.firestore = null;
    this.createdStructures = [];
    this.errors = [];
  }

  log(message, color = '\x1b[37m') {
    console.log(`${color}${message}\x1b[0m`);
  }

  separator(char = '=', length = 80) {
    this.log(char.repeat(length), '\x1b[36m');
  }

  async initialize() {
    this.log('🏢 CONFIGURADOR MULTI-TENANT BOCKET CRM', '\x1b[35m');
    this.separator();
    
    this.app = initializeApp(firebaseConfig);
    this.firestore = getFirestore(this.app);
    
    this.log('✅ Firebase inicializado correctamente', '\x1b[32m');
    this.log('🏗️ Configurando estructura multi-tenant', '\x1b[34m');
  }

  // Crear estructura de restaurantes
  async createRestaurantsStructure() {
    this.log('\n🍽️ CREANDO ESTRUCTURA DE RESTAURANTES', '\x1b[34m');
    
    try {
      const restaurantes = [
        {
          id: 'rest_donpepe_001',
          slug: 'don-pepe',
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
          fechaCreacion: serverTimestamp(),
          configuracion: {
            whatsapp: {
              enabled: true,
              defaultSourceType: 'chatBot',
              defaultRespType: 'bot'
            },
            reservas: {
              tiempoReconfirmacion: 24,
              estadosPermitidos: ['pending', 'accepted', 'rejected']
            },
            pedidos: {
              tiposPermitidos: ['delivery', 'pickUp', 'insideOrder'],
              estadosPermitidos: ['pending', 'accepted', 'rejected', 'inProcess', 'inDelivery', 'deliveried']
            }
          }
        },
        {
          id: 'rest_marinacafe_002',
          slug: 'marina-cafe',
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
          fechaCreacion: serverTimestamp(),
          configuracion: {
            whatsapp: {
              enabled: true,
              defaultSourceType: 'manual',
              defaultRespType: 'manual'
            },
            reservas: {
              tiempoReconfirmacion: 12,
              estadosPermitidos: ['pending', 'accepted', 'rejected']
            },
            pedidos: {
              tiposPermitidos: ['delivery', 'pickUp', 'insideOrder'],
              estadosPermitidos: ['pending', 'accepted', 'rejected', 'inProcess', 'inDelivery', 'deliveried']
            }
          }
        }
      ];

      const batch = writeBatch(this.firestore);

      for (const restaurante of restaurantes) {
        const docRef = doc(this.firestore, 'restaurantes', restaurante.id);
        batch.set(docRef, restaurante);
        this.log(`   ✅ Restaurante ${restaurante.nombre} configurado`, '\x1b[32m');
      }

      await batch.commit();
      this.createdStructures.push('restaurantes');
    } catch (error) {
      this.log(`   ❌ Error creando restaurantes: ${error.message}`, '\x1b[31m');
      this.errors.push({ structure: 'restaurantes', error: error.message });
    }
  }

  // Crear datos multi-tenant para cada restaurante
  async createMultiTenantData() {
    this.log('\n👥 CREANDO DATOS MULTI-TENANT POR RESTAURANTE', '\x1b[34m');
    
    const restaurantes = [
      { id: 'rest_donpepe_001', nombre: 'Don Pepe Parrilla' },
      { id: 'rest_marinacafe_002', nombre: 'Marina Café & Bistro' }
    ];

    for (const restaurante of restaurantes) {
      this.log(`\n🏪 Configurando datos para: ${restaurante.nombre}`, '\x1b[33m');
      
      try {
        // Clientes del restaurante
        await this.createRestaurantClients(restaurante.id);
        
        // Reservas del restaurante
        await this.createRestaurantReservations(restaurante.id);
        
        // Pedidos del restaurante
        await this.createRestaurantOrders(restaurante.id);
        
        this.log(`   ✅ Datos completos para ${restaurante.nombre}`, '\x1b[32m');
      } catch (error) {
        this.log(`   ❌ Error en ${restaurante.nombre}: ${error.message}`, '\x1b[31m');
        this.errors.push({ structure: restaurante.id, error: error.message });
      }
    }
  }

  async createRestaurantClients(restauranteId) {
    const clientesData = [
      {
        id: '573001234567',
        name: 'Pedro Martínez García',
        whatsAppName: 'Pedro M.',
        email: 'pedro.martinez@email.com',
        isWAContact: true,
        isMyContact: true,
        sourceType: 'chatBot',
        respType: 'bot',
        labels: 'cliente_vip,frecuente',
        creation: new Date().toISOString(),
        lastUpdate: new Date().toISOString(),
        restauranteId: restauranteId,
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
        name: 'Ana Lucía Rodríguez Silva',
        whatsAppName: 'Ana R.',
        email: 'ana.rodriguez@empresa.com',
        isWAContact: true,
        isMyContact: true,
        isEnterprise: true,
        isBusiness: true,
        sourceType: 'manual',
        respType: 'manual',
        labels: 'cliente_corporativo,eventos',
        creation: new Date().toISOString(),
        lastUpdate: new Date().toISOString(),
        restauranteId: restauranteId,
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

    const batch = writeBatch(this.firestore);
    
    for (const cliente of clientesData) {
      const docRef = doc(this.firestore, 'restaurantes', restauranteId, 'clientes', cliente.id);
      batch.set(docRef, cliente);
    }
    
    await batch.commit();
    this.log(`   📱 ${clientesData.length} clientes WhatsApp creados`, '\x1b[36m');
  }

  async createRestaurantReservations(restauranteId) {
    const reservasData = [
      {
        id: 'reserva_' + Date.now() + '_1',
        contact: '573001234567',
        contactNameBooking: 'Pedro Martínez García',
        peopleBooking: '4',
        finalPeopleBooking: 4,
        dateBooking: '2025-07-28T19:30:00.000Z',
        statusBooking: 'accepted',
        detailsBooking: 'Mesa cerca de la ventana, celebración de cumpleaños',
        reconfirmDate: '2025-07-27T14:30:00.000Z',
        reconfirmStatus: 'accepted',
        restauranteId: restauranteId
      },
      {
        id: 'reserva_' + Date.now() + '_2',
        contact: '573109876543',
        contactNameBooking: 'Ana Lucía Rodríguez Silva',
        peopleBooking: '6',
        finalPeopleBooking: 6,
        dateBooking: '2025-07-29T14:00:00.000Z',
        statusBooking: 'pending',
        detailsBooking: 'Cena de trabajo corporativa, requiere factura electrónica',
        restauranteId: restauranteId
      }
    ];

    const batch = writeBatch(this.firestore);
    
    for (const reserva of reservasData) {
      const docRef = doc(this.firestore, 'restaurantes', restauranteId, 'reservas', reserva.id);
      batch.set(docRef, reserva);
    }
    
    await batch.commit();
    this.log(`   📅 ${reservasData.length} reservas de venue creadas`, '\x1b[36m');
  }

  async createRestaurantOrders(restauranteId) {
    const pedidosData = [
      {
        id: 'pedido_' + Date.now() + '_1',
        contact: '573001234567',
        orderType: 'delivery',
        resumeOrder: '1x Bandeja Paisa ($35.000), 1x Jugo Natural Naranja ($8.000). Total: $43.000',
        contactNameOrder: 'Pedro Martínez García',
        addressToDelivery: 'Calle 72 #10-15, Bogotá - Barrio Rosales, Torre A Apto 502',
        statusBooking: 'inDelivery',
        restauranteId: restauranteId
      },
      {
        id: 'pedido_' + Date.now() + '_2',
        contact: '573109876543',
        orderType: 'pickUp',
        resumeOrder: '2x Café Americano ($16.000), 3x Croissant Almendras ($36.000). Total: $52.000',
        contactNameOrder: 'Ana Lucía Rodríguez Silva',
        addressToDelivery: 'Recoge en tienda - ' + (restauranteId === 'rest_donpepe_001' ? 'Don Pepe Parrilla' : 'Marina Café & Bistro'),
        statusBooking: 'accepted',
        restauranteId: restauranteId
      }
    ];

    const batch = writeBatch(this.firestore);
    
    for (const pedido of pedidosData) {
      const docRef = doc(this.firestore, 'restaurantes', restauranteId, 'pedidos', pedido.id);
      batch.set(docRef, pedido);
    }
    
    await batch.commit();
    this.log(`   🛍️ ${pedidosData.length} pedidos de delivery creados`, '\x1b[36m');
  }

  // Crear usuarios administradores
  async createAdminUsers() {
    this.log('\n👤 CREANDO USUARIOS ADMINISTRADORES', '\x1b[34m');
    
    try {
      const usuarios = [
        {
          uid: 'mock_user_1',
          email: 'admin@donpepe.com',
          nombreCompleto: 'Carlos Ramírez',
          emailVerificado: true,
          activo: true,
          idioma: 'es',
          zonaHoraria: 'America/Bogota',
          restaurantes: ['rest_donpepe_001'],
          rol: 'admin_restaurante',
          fechaCreacion: serverTimestamp(),
          fechaActualizacion: serverTimestamp()
        },
        {
          uid: 'mock_user_2',
          email: 'admin@marinacafe.com',
          nombreCompleto: 'María Isabella González',
          emailVerificado: true,
          activo: true,
          idioma: 'es',
          zonaHoraria: 'America/Bogota',
          restaurantes: ['rest_marinacafe_002'],
          rol: 'admin_restaurante',
          fechaCreacion: serverTimestamp(),
          fechaActualizacion: serverTimestamp()
        }
      ];

      const batch = writeBatch(this.firestore);

      for (const usuario of usuarios) {
        const docRef = doc(this.firestore, 'usuarios', usuario.uid);
        batch.set(docRef, usuario);
        this.log(`   ✅ Admin ${usuario.nombreCompleto} creado`, '\x1b[32m');
      }

      await batch.commit();
      this.createdStructures.push('usuarios');
    } catch (error) {
      this.log(`   ❌ Error creando usuarios: ${error.message}`, '\x1b[31m');
      this.errors.push({ structure: 'usuarios', error: error.message });
    }
  }

  showResults() {
    this.separator();
    this.log('📊 RESULTADO - ESTRUCTURA MULTI-TENANT CREADA', '\x1b[35m');
    this.separator();

    this.log(`✅ Estructuras creadas exitosamente: ${this.createdStructures.length}`, '\x1b[32m');
    for (const structure of this.createdStructures) {
      this.log(`   🏗️ ${structure}`, '\x1b[36m');
    }

    this.log('\n🏢 ARQUITECTURA MULTI-TENANT:', '\x1b[34m');
    this.log('   📂 /restaurantes/{restauranteId}/', '\x1b[37m');
    this.log('   📂 /restaurantes/{restauranteId}/clientes/{clienteId} (finalUser)', '\x1b[37m');
    this.log('   📂 /restaurantes/{restauranteId}/reservas/{reservaId} (VenueBooking)', '\x1b[37m');
    this.log('   📂 /restaurantes/{restauranteId}/pedidos/{pedidoId} (OrderTodelivery)', '\x1b[37m');
    this.log('   📂 /usuarios/{userId} (administradores)', '\x1b[37m');

    this.log('\n👥 ACCESO POR RESTAURANTE:', '\x1b[34m');
    this.log('   🏪 Don Pepe Parrilla: admin@donpepe.com / 123456', '\x1b[37m');
    this.log('   🏪 Marina Café & Bistro: admin@marinacafe.com / 123456', '\x1b[37m');

    if (this.errors.length > 0) {
      this.log(`\n❌ Errores encontrados: ${this.errors.length}`, '\x1b[31m');
      for (const error of this.errors) {
        this.log(`   ❌ ${error.structure}: ${error.error}`, '\x1b[31m');
      }
    }

    this.log('\n🎉 ESTRUCTURA MULTI-TENANT CREADA EXITOSAMENTE', '\x1b[32m');
    this.log('🔥 Firebase Console: https://console.firebase.google.com/project/bocket-2024', '\x1b[34m');
    this.log('✅ Cada restaurante ahora tiene sus datos separados e independientes', '\x1b[33m');
    
    this.separator();
    this.log(`⏰ Configuración completada: ${new Date().toLocaleString('es-CO')}`, '\x1b[90m');
  }

  async setupMultiTenant() {
    await this.initialize();
    await this.createRestaurantsStructure();
    await this.createAdminUsers();
    await this.createMultiTenantData();
    this.showResults();
  }
}

async function main() {
  const setup = new MultiTenantSetup();
  await setup.setupMultiTenant();
}

if (require.main === module) {
  main().catch(error => {
    console.error('❌ Error fatal configurando multi-tenant:', error);
    process.exit(1);
  });
}

module.exports = MultiTenantSetup;