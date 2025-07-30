#!/usr/bin/env node

/**
 * 🏗️ Creador de Estructura CRM - Bocket
 * 
 * Este script crea todas las tablas y datos iniciales necesarios para el CRM Bocket
 * Ejecutar con: node create-crm-structure.js
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, setDoc, addDoc, serverTimestamp } = require('firebase/firestore');

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyC54Ytk5wO2zupIuCtFIsIUNXvP4m9qqOk",
  authDomain: "bocket-2024.firebaseapp.com",
  projectId: "bocket-2024",
  storageBucket: "bocket-2024.appspot.com",
  messagingSenderId: "537532907057",
  appId: "1:537532907057:web:dc51aacd0553b9ac2edf10"
};

class CRMStructureCreator {
  constructor() {
    this.app = null;
    this.firestore = null;
    this.createdTables = [];
    this.errors = [];
  }

  log(message, color = '\x1b[37m') {
    console.log(`${color}${message}\x1b[0m`);
  }

  separator(char = '=', length = 80) {
    this.log(char.repeat(length), '\x1b[36m');
  }

  async initialize() {
    this.log('🏗️ CREADOR DE ESTRUCTURA CRM BOCKET', '\x1b[35m');
    this.separator();
    
    this.app = initializeApp(firebaseConfig);
    this.firestore = getFirestore(this.app);
    
    this.log('✅ Firebase inicializado correctamente', '\x1b[32m');
    this.log(`📦 Proyecto: ${firebaseConfig.projectId}`, '\x1b[34m');
    this.log('🚀 Iniciando creación de estructura CRM...', '\x1b[33m');
  }

  async createRestaurantsTable() {
    this.log('\n🏪 CREANDO TABLA: RESTAURANTES', '\x1b[34m');
    
    try {
      // Restaurante 1: Don Pepe Parrilla
      const restaurante1 = {
        id: 'rest_donpepe_001',
        slug: 'don-pepe',
        nombre: 'Don Pepe Parrilla',
        descripcion: 'La mejor parrilla argentina de la ciudad',
        logo: 'assets/logos/don-pepe.png',
        colorPrimario: '#8B0000',
        colorSecundario: '#FFD700',
        telefono: '+57 301 234 5678',
        email: 'info@donpepe.com',
        direccion: 'Carrera 15 #85-32',
        ciudad: 'Bogotá',
        pais: 'Colombia',
        tipoNegocio: 'restaurante',
        horarioAtencion: [
          { dia: 'lunes', abierto: true, horaApertura: '12:00', horaCierre: '22:00' },
          { dia: 'martes', abierto: true, horaApertura: '12:00', horaCierre: '22:00' },
          { dia: 'miercoles', abierto: true, horaApertura: '12:00', horaCierre: '22:00' },
          { dia: 'jueves', abierto: true, horaApertura: '12:00', horaCierre: '22:00' },
          { dia: 'viernes', abierto: true, horaApertura: '12:00', horaCierre: '23:00' },
          { dia: 'sabado', abierto: true, horaApertura: '12:00', horaCierre: '23:00' },
          { dia: 'domingo', abierto: true, horaApertura: '12:00', horaCierre: '21:00' }
        ],
        capacidadMaxima: 80,
        numeroMesas: 20,
        moneda: 'COP',
        idioma: 'es',
        zonaHoraria: 'America/Bogota',
        activo: true,
        planSuscripcion: 'profesional',
        fechaVencimiento: new Date('2025-12-31'),
        limiteUsuarios: 15,
        limiteClientes: 2000,
        limiteReservas: 500,
        fechaCreacion: serverTimestamp(),
        fechaActualizacion: serverTimestamp(),
        creadoPor: 'system'
      };

      await setDoc(doc(this.firestore, 'restaurantes', 'rest_donpepe_001'), restaurante1);
      this.log('   ✅ Don Pepe Parrilla creado', '\x1b[32m');

      // Restaurante 2: Marina Café & Bistro
      const restaurante2 = {
        id: 'rest_marinacafe_002',
        slug: 'marina-cafe',
        nombre: 'Marina Café & Bistro',
        descripcion: 'Café gourmet y cocina internacional',
        logo: 'assets/logos/marina-cafe.png',
        colorPrimario: '#1E90FF',
        colorSecundario: '#FF69B4',
        telefono: '+57 312 567 8901',
        email: 'contacto@marinacafe.com',
        direccion: 'Calle 93 #11-27',
        ciudad: 'Bogotá',
        pais: 'Colombia',
        tipoNegocio: 'cafeteria',
        horarioAtencion: [
          { dia: 'lunes', abierto: true, horaApertura: '07:00', horaCierre: '20:00' },
          { dia: 'martes', abierto: true, horaApertura: '07:00', horaCierre: '20:00' },
          { dia: 'miercoles', abierto: true, horaApertura: '07:00', horaCierre: '20:00' },
          { dia: 'jueves', abierto: true, horaApertura: '07:00', horaCierre: '20:00' },
          { dia: 'viernes', abierto: true, horaApertura: '07:00', horaCierre: '21:00' },
          { dia: 'sabado', abierto: true, horaApertura: '08:00', horaCierre: '21:00' },
          { dia: 'domingo', abierto: true, horaApertura: '08:00', horaCierre: '19:00' }
        ],
        capacidadMaxima: 50,
        numeroMesas: 15,
        moneda: 'COP',
        idioma: 'es',
        zonaHoraria: 'America/Bogota',
        activo: true,
        planSuscripcion: 'basico',
        fechaVencimiento: new Date('2025-06-30'),
        limiteUsuarios: 5,
        limiteClientes: 500,
        limiteReservas: 100,
        fechaCreacion: serverTimestamp(),
        fechaActualizacion: serverTimestamp(),
        creadoPor: 'system'
      };

      await setDoc(doc(this.firestore, 'restaurantes', 'rest_marinacafe_002'), restaurante2);
      this.log('   ✅ Marina Café & Bistro creado', '\x1b[32m');

      this.createdTables.push('restaurantes');
    } catch (error) {
      this.log(`   ❌ Error creando restaurantes: ${error.message}`, '\x1b[31m');
      this.errors.push({ table: 'restaurantes', error: error.message });
    }
  }

  async createUsersTable() {
    this.log('\n👥 CREANDO TABLA: USUARIOS GLOBALES', '\x1b[34m');
    
    try {
      // Usuario admin para Don Pepe
      const usuario1 = {
        uid: 'bocket_admin_donpepe',
        email: 'admin@donpepe.com',
        nombreCompleto: 'Carlos Ramírez',
        telefono: '+57 301 234 5678',
        avatar: 'assets/avatars/carlos.jpg',
        emailVerificado: true,
        activo: true,
        idioma: 'es',
        zonaHoraria: 'America/Bogota',
        restaurantes: ['rest_donpepe_001'],
        fechaCreacion: serverTimestamp(),
        fechaActualizacion: serverTimestamp(),
        fechaUltimoAcceso: serverTimestamp()
      };

      await setDoc(doc(this.firestore, 'usuarios', 'bocket_admin_donpepe'), usuario1);
      this.log('   ✅ Admin Don Pepe creado', '\x1b[32m');

      // Usuario admin para Marina Café
      const usuario2 = {
        uid: 'bocket_admin_marina',
        email: 'admin@marinacafe.com',
        nombreCompleto: 'María Isabella González',
        telefono: '+57 312 567 8901',
        avatar: 'assets/avatars/maria.jpg',
        emailVerificado: true,
        activo: true,
        idioma: 'es',
        zonaHoraria: 'America/Bogota',
        restaurantes: ['rest_marinacafe_002'],
        fechaCreacion: serverTimestamp(),
        fechaActualizacion: serverTimestamp(),
        fechaUltimoAcceso: serverTimestamp()
      };

      await setDoc(doc(this.firestore, 'usuarios', 'bocket_admin_marina'), usuario2);
      this.log('   ✅ Admin Marina Café creado', '\x1b[32m');

      this.createdTables.push('usuarios');
    } catch (error) {
      this.log(`   ❌ Error creando usuarios: ${error.message}`, '\x1b[31m');
      this.errors.push({ table: 'usuarios', error: error.message });
    }
  }

  async createUserRestaurantsTable() {
    this.log('\n🔐 CREANDO TABLA: PERMISOS USUARIO-RESTAURANTE', '\x1b[34m');
    
    try {
      // Permisos para Carlos en Don Pepe
      const permiso1 = {
        usuarioId: 'bocket_admin_donpepe',
        restauranteId: 'rest_donpepe_001',
        nombreCompleto: 'Carlos Ramírez',
        email: 'admin@donpepe.com',
        telefono: '+57 301 234 5678',
        avatar: 'assets/avatars/carlos.jpg',
        rol: 'propietario',
        permisos: [
          { modulo: 'dashboard', acciones: ['leer'] },
          { modulo: 'clientes', acciones: ['leer', 'crear', 'editar', 'eliminar'] },
          { modulo: 'reservas', acciones: ['leer', 'crear', 'editar', 'eliminar'] },
          { modulo: 'pedidos', acciones: ['leer', 'crear', 'editar', 'eliminar'] },
          { modulo: 'productos', acciones: ['leer', 'crear', 'editar', 'eliminar'] },
          { modulo: 'reportes', acciones: ['leer', 'crear'] },
          { modulo: 'configuracion', acciones: ['leer', 'editar'] },
          { modulo: 'usuarios', acciones: ['leer', 'crear', 'editar', 'eliminar'] }
        ],
        activo: true,
        fechaUltimoAcceso: serverTimestamp(),
        notificaciones: {
          nuevasReservas: true,
          cancelacionReservas: true,
          recordatorioReservas: true,
          nuevosClientes: true,
          ventasDiarias: true,
          stockBajo: true,
          reportesSemanales: true
        },
        fechaCreacion: serverTimestamp(),
        fechaActualizacion: serverTimestamp(),
        invitadoPor: 'system'
      };

      await setDoc(doc(this.firestore, 'usuariosRestaurantes', 'bocket_admin_donpepe_rest_donpepe_001'), permiso1);
      this.log('   ✅ Permisos Carlos - Don Pepe creados', '\x1b[32m');

      // Permisos para María en Marina Café
      const permiso2 = {
        usuarioId: 'bocket_admin_marina',
        restauranteId: 'rest_marinacafe_002',
        nombreCompleto: 'María Isabella González',
        email: 'admin@marinacafe.com',
        telefono: '+57 312 567 8901',
        avatar: 'assets/avatars/maria.jpg',
        rol: 'propietario',
        permisos: [
          { modulo: 'dashboard', acciones: ['leer'] },
          { modulo: 'clientes', acciones: ['leer', 'crear', 'editar', 'eliminar'] },
          { modulo: 'reservas', acciones: ['leer', 'crear', 'editar', 'eliminar'] },
          { modulo: 'pedidos', acciones: ['leer', 'crear', 'editar', 'eliminar'] },
          { modulo: 'productos', acciones: ['leer', 'crear', 'editar', 'eliminar'] },
          { modulo: 'reportes', acciones: ['leer', 'crear'] },
          { modulo: 'configuracion', acciones: ['leer', 'editar'] },
          { modulo: 'usuarios', acciones: ['leer', 'crear', 'editar', 'eliminar'] }
        ],
        activo: true,
        fechaUltimoAcceso: serverTimestamp(),
        notificaciones: {
          nuevasReservas: true,
          cancelacionReservas: true,
          recordatorioReservas: false,
          nuevosClientes: true,
          ventasDiarias: false,
          stockBajo: true,
          reportesSemanales: false
        },
        fechaCreacion: serverTimestamp(),
        fechaActualizacion: serverTimestamp(),
        invitadoPor: 'system'
      };

      await setDoc(doc(this.firestore, 'usuariosRestaurantes', 'bocket_admin_marina_rest_marinacafe_002'), permiso2);
      this.log('   ✅ Permisos María - Marina Café creados', '\x1b[32m');

      this.createdTables.push('usuariosRestaurantes');
    } catch (error) {
      this.log(`   ❌ Error creando permisos: ${error.message}`, '\x1b[31m');
      this.errors.push({ table: 'usuariosRestaurantes', error: error.message });
    }
  }

  async createRestaurantSpecificData() {
    this.log('\n🏪 CREANDO DATOS ESPECÍFICOS POR RESTAURANTE', '\x1b[34m');
    
    await this.createClientsForRestaurant('rest_donpepe_001', 'Don Pepe');
    await this.createClientsForRestaurant('rest_marinacafe_002', 'Marina Café');
    await this.createProductsForRestaurant('rest_donpepe_001', 'Don Pepe');
    await this.createProductsForRestaurant('rest_marinacafe_002', 'Marina Café');
    await this.createReservationsForRestaurant('rest_donpepe_001', 'Don Pepe');
    await this.createReservationsForRestaurant('rest_marinacafe_002', 'Marina Café');
  }

  async createClientsForRestaurant(restauranteId, restauranteNombre) {
    this.log(`\n   👥 Creando clientes para ${restauranteNombre}...`, '\x1b[33m');
    
    try {
      const clientesMuestra = [
        {
          nombre: 'Pedro Martínez',
          apellidos: 'García López',
          email: 'pedro.martinez@email.com',
          telefono: '+57 300 123 4567',
          fechaNacimiento: '1985-03-15',
          tipoDocumento: 'CC',
          numeroDocumento: '80123456',
          direccion: 'Calle 72 #10-15',
          ciudad: 'Bogotá',
          tipoCliente: 'regular',
          estado: 'activo',
          fechaRegistro: serverTimestamp(),
          totalPedidos: 12,
          valorTotalCompras: 850000,
          fechaUltimoPedido: new Date('2025-07-20'),
          preferencias: {
            comidaFavorita: 'Carnes',
            alergias: [],
            ocasionEspecial: 'Cumpleaños'
          },
          notas: 'Cliente frecuente, prefiere mesas cerca de la ventana',
          fechaCreacion: serverTimestamp(),
          fechaActualizacion: serverTimestamp(),
          creadoPor: `bocket_admin_${restauranteId.split('_')[2]}`
        },
        {
          nombre: 'Ana Lucía',
          apellidos: 'Rodríguez Silva',
          email: 'ana.rodriguez@email.com',
          telefono: '+57 310 987 6543',
          fechaNacimiento: '1990-08-22',
          tipoDocumento: 'CC',
          numeroDocumento: '52987654',
          direccion: 'Carrera 11 #85-42',
          ciudad: 'Bogotá',
          tipoCliente: 'vip',
          estado: 'activo',
          fechaRegistro: serverTimestamp(),
          totalPedidos: 28,
          valorTotalCompras: 2150000,
          fechaUltimoPedido: new Date('2025-07-24'),
          preferencias: {
            comidaFavorita: 'Pescados y mariscos',
            alergias: ['Maní', 'Frutos secos'],
            ocasionEspecial: 'Cenas de trabajo'
          },
          notas: 'Cliente VIP, siempre pide vino tinto',
          fechaCreacion: serverTimestamp(),
          fechaActualizacion: serverTimestamp(),
          creadoPor: `bocket_admin_${restauranteId.split('_')[2]}`
        }
      ];

      for (const cliente of clientesMuestra) {
        await addDoc(collection(this.firestore, restauranteId, 'clientes'), cliente);
      }

      this.log(`      ✅ ${clientesMuestra.length} clientes creados para ${restauranteNombre}`, '\x1b[32m');
    } catch (error) {
      this.log(`      ❌ Error creando clientes para ${restauranteNombre}: ${error.message}`, '\x1b[31m');
    }
  }

  async createProductsForRestaurant(restauranteId, restauranteNombre) {
    this.log(`\n   🍽️ Creando productos para ${restauranteNombre}...`, '\x1b[33m');
    
    try {
      const productosMuestra = restauranteId.includes('donpepe') 
        ? [
            {
              nombre: 'Bandeja Paisa',
              descripcion: 'Plato típico antioqueño con frijoles, arroz, huevo, chicharrón, chorizo, morcilla, aguacate y arepa',
              categoria: 'Platos Típicos',
              precio: 35000,
              disponible: true,
              ingredientes: ['Frijoles', 'Arroz', 'Huevo', 'Chicharrón', 'Chorizo', 'Morcilla', 'Aguacate', 'Arepa'],
              alergenos: ['Huevo'],
              tiempoPreparacion: 25,
              imagen: 'assets/productos/bandeja-paisa.jpg',
              popularidad: 95,
              calorias: 850,
              fechaCreacion: serverTimestamp(),
              fechaActualizacion: serverTimestamp(),
              creadoPor: `bocket_admin_${restauranteId.split('_')[2]}`
            },
            {
              nombre: 'Churrasco Argentino',
              descripcion: 'Jugoso corte de carne a la parrilla acompañado de papas al horno y ensalada fresca',
              categoria: 'Carnes',
              precio: 45000,
              disponible: true,
              ingredientes: ['Carne de res', 'Papas', 'Ensalada mixta', 'Chimichurri'],
              alergenos: [],
              tiempoPreparacion: 20,
              imagen: 'assets/productos/churrasco.jpg',
              popularidad: 88,
              calorias: 650,
              fechaCreacion: serverTimestamp(),
              fechaActualizacion: serverTimestamp(),
              creadoPor: `bocket_admin_${restauranteId.split('_')[2]}`
            }
          ]
        : [
            {
              nombre: 'Café Americano',
              descripcion: 'Café colombiano de origen, tostado medio, servido en taza de 240ml',
              categoria: 'Bebidas Calientes',
              precio: 8000,
              disponible: true,
              ingredientes: ['Café colombiano', 'Agua'],
              alergenos: [],
              tiempoPreparacion: 5,
              imagen: 'assets/productos/cafe-americano.jpg',
              popularidad: 92,
              calorias: 5,
              fechaCreacion: serverTimestamp(),
              fechaActualizacion: serverTimestamp(),
              creadoPor: `bocket_admin_${restauranteId.split('_')[2]}`
            },
            {
              nombre: 'Croissant de Almendras',
              descripcion: 'Croissant artesanal relleno de crema de almendras y almendras laminadas',
              categoria: 'Repostería',
              precio: 12000,
              disponible: true,
              ingredientes: ['Harina', 'Mantequilla', 'Crema de almendras', 'Almendras'],
              alergenos: ['Gluten', 'Frutos secos', 'Lácteos'],
              tiempoPreparacion: 3,
              imagen: 'assets/productos/croissant-almendras.jpg',
              popularidad: 78,
              calorias: 320,
              fechaCreacion: serverTimestamp(),
              fechaActualizacion: serverTimestamp(),
              creadoPor: `bocket_admin_${restauranteId.split('_')[2]}`
            }
          ];

      for (const producto of productosMuestra) {
        await addDoc(collection(this.firestore, restauranteId, 'productos'), producto);
      }

      this.log(`      ✅ ${productosMuestra.length} productos creados para ${restauranteNombre}`, '\x1b[32m');
    } catch (error) {
      this.log(`      ❌ Error creando productos para ${restauranteNombre}: ${error.message}`, '\x1b[31m');
    }
  }

  async createReservationsForRestaurant(restauranteId, restauranteNombre) {
    this.log(`\n   📅 Creando reservas para ${restauranteNombre}...`, '\x1b[33m');
    
    try {
      const reservasMuestra = [
        {
          cliente: 'Pedro Martínez García',
          email: 'pedro.martinez@email.com',
          telefono: '+57 300 123 4567',
          fechaReserva: new Date('2025-07-27T19:30:00'),
          numeroPersonas: 4,
          mesa: restauranteId.includes('donpepe') ? 'Mesa 12' : 'Mesa 5',
          estado: 'confirmada',
          tipoEvento: 'cena',
          ocasionEspecial: 'Cumpleaños',
          solicitudesEspeciales: 'Mesa cerca de la ventana, cumpleaños',
          tiempoEstimado: 120,
          recordatorioEnviado: false,
          fechaCreacion: serverTimestamp(),
          fechaActualizacion: serverTimestamp(),
          creadoPor: `bocket_admin_${restauranteId.split('_')[2]}`
        },
        {
          cliente: 'Ana Lucía Rodríguez',
          email: 'ana.rodriguez@email.com',
          telefono: '+57 310 987 6543',
          fechaReserva: new Date('2025-07-28T14:00:00'),
          numeroPersonas: 2,
          mesa: restauranteId.includes('donpepe') ? 'Mesa 8' : 'Mesa 3',
          estado: 'pendiente',
          tipoEvento: 'almuerzo',
          ocasionEspecial: 'Cena de trabajo',
          solicitudesEspeciales: 'Mesa tranquila para conversación',
          tiempoEstimado: 90,
          recordatorioEnviado: false,
          fechaCreacion: serverTimestamp(),
          fechaActualizacion: serverTimestamp(),
          creadoPor: `bocket_admin_${restauranteId.split('_')[2]}`
        }
      ];

      for (const reserva of reservasMuestra) {
        await addDoc(collection(this.firestore, restauranteId, 'reservas'), reserva);
      }

      this.log(`      ✅ ${reservasMuestra.length} reservas creadas para ${restauranteNombre}`, '\x1b[32m');
    } catch (error) {
      this.log(`      ❌ Error creando reservas para ${restauranteNombre}: ${error.message}`, '\x1b[31m');
    }
  }

  showResults() {
    this.separator();
    this.log('📊 RESULTADO DE LA CREACIÓN DE ESTRUCTURA CRM', '\x1b[35m');
    this.separator();

    this.log(`✅ Tablas creadas exitosamente: ${this.createdTables.length}`, '\x1b[32m');
    for (const table of this.createdTables) {
      this.log(`   📁 ${table}`, '\x1b[36m');
    }

    if (this.errors.length > 0) {
      this.log(`\n❌ Errores encontrados: ${this.errors.length}`, '\x1b[31m');
      for (const error of this.errors) {
        this.log(`   ❌ ${error.table}: ${error.error}`, '\x1b[31m');
      }
    }

    this.log('\n🎉 ESTRUCTURA CRM BOCKET CREADA EXITOSAMENTE', '\x1b[32m');
    this.log('🔥 Firebase Console: https://console.firebase.google.com/project/bocket-2024', '\x1b[34m');
    this.log('✅ Ya puedes usar el AuthService en modo Firebase', '\x1b[33m');
    
    this.separator();
    this.log(`⏰ Creación completada: ${new Date().toLocaleString('es-CO')}`, '\x1b[90m');
  }

  async createCompleteCRMStructure() {
    await this.initialize();
    await this.createRestaurantsTable();
    await this.createUsersTable();
    await this.createUserRestaurantsTable();
    await this.createRestaurantSpecificData();
    this.showResults();
  }
}

async function main() {
  const creator = new CRMStructureCreator();
  await creator.createCompleteCRMStructure();
}

if (require.main === module) {
  main().catch(error => {
    console.error('❌ Error fatal creando estructura:', error);
    process.exit(1);
  });
}

module.exports = CRMStructureCreator;