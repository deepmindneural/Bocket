#!/usr/bin/env node

/**
 * 🔄 Script de Migración de Datos - Bocket CRM
 * 
 * Este script migra los datos de la arquitectura antigua (unificada) a la nueva arquitectura (separada por restaurante)
 * 
 * ARQUITECTURA ANTIGUA:
 * /clients/worldfood/Formularios/{timestamp}_{typeForm}_{chatId}
 * 
 * NUEVA ARQUITECTURA:
 * /adminUsers/{adminUID}                                  ← Admins en raíz
 * /clients/{nombreRestaurante}/clientes/{clienteId}      ← Datos por nombre de restaurante  
 * /clients/{nombreRestaurante}/reservas/{reservaId}
 * /clients/{nombreRestaurante}/pedidos/{pedidoId}
 * /clients/{nombreRestaurante}/info/restaurante          ← Info del restaurante
 * 
 * Ejecutar con: node migrar-datos-nueva-arquitectura.js
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, setDoc, getDoc, getDocs, query, where, writeBatch } = require('firebase/firestore');

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyC54Ytk5wO2zupIuCtFIsIUNXvP4m9qqOk",
  authDomain: "bocket-2024.firebaseapp.com",
  projectId: "bocket-2024",
  storageBucket: "bocket-2024.appspot.com",
  messagingSenderId: "537532907057",
  appId: "1:537532907057:web:dc51aacd0553b9ac2edf10"
};

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bright: '\x1b[1m'
};

const log = (message, color = 'white') => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

class MigradorDatos {
  constructor() {
    this.app = null;
    this.firestore = null;
    this.rutaAntigua = 'clients/worldfood/Formularios';
    this.rutaNueva = 'clients';
    this.estadisticas = {
      restaurantesEncontrados: 0,
      restaurantesMigrados: 0,
      clientesEncontrados: 0,
      clientesMigrados: 0,
      reservasEncontradas: 0,
      reservasMigradas: 0,
      pedidosEncontrados: 0,
      pedidosMigrados: 0,
      errores: []
    };
  }

  // Inicializar Firebase
  async inicializar() {
    try {
      log('🔥 Inicializando Firebase...', 'yellow');
      this.app = initializeApp(firebaseConfig);
      this.firestore = getFirestore(this.app);
      log('✅ Firebase inicializado correctamente', 'green');
      return true;
    } catch (error) {
      log(`❌ Error inicializando Firebase: ${error.message}`, 'red');
      return false;
    }
  }

  // Obtener todos los documentos de la estructura antigua
  async obtenerDocumentosAntiguos() {
    try {
      log(`\n🔍 Consultando estructura antigua: ${this.rutaAntigua}`, 'cyan');
      
      const formulariosRef = collection(this.firestore, this.rutaAntigua);
      const snapshot = await getDocs(formulariosRef);
      
      log(`📊 Total documentos encontrados: ${snapshot.size}`, 'blue');
      
      const documentos = {
        restaurantes: [],
        clientes: [],
        reservas: [],
        pedidos: []
      };
      
      snapshot.forEach(doc => {
        const data = doc.data();
        const docId = doc.id;
        const typeForm = data.typeForm;
        
        // Clasificar documentos por tipo
        if (typeForm === 'restaurante') {
          documentos.restaurantes.push({ id: docId, data });
          this.estadisticas.restaurantesEncontrados++;
        } else if (typeForm === 'cliente' || (typeForm && typeForm.includes('cliente manual'))) {
          documentos.clientes.push({ id: docId, data });
          this.estadisticas.clientesEncontrados++;
        } else if (typeForm && typeForm.includes('reservas')) {
          documentos.reservas.push({ id: docId, data });
          this.estadisticas.reservasEncontradas++;
        } else if (typeForm && typeForm.includes('pedidos')) {
          documentos.pedidos.push({ id: docId, data });
          this.estadisticas.pedidosEncontrados++;
        }
      });
      
      log(`📋 Documentos clasificados:`, 'white');
      log(`   🏪 Restaurantes: ${documentos.restaurantes.length}`, 'yellow');
      log(`   👤 Clientes: ${documentos.clientes.length}`, 'cyan');
      log(`   📅 Reservas: ${documentos.reservas.length}`, 'magenta');
      log(`   🛒 Pedidos: ${documentos.pedidos.length}`, 'blue');
      
      return documentos;
    } catch (error) {
      log(`❌ Error obteniendo documentos antiguos: ${error.message}`, 'red');
      return null;
    }
  }

  // Migrar restaurantes
  async migrarRestaurantes(restaurantes) {
    if (restaurantes.length === 0) {
      log('⚠️ No hay restaurantes para migrar', 'yellow');
      return;
    }
    
    log(`\n🏪 MIGRANDO RESTAURANTES (${restaurantes.length})`, 'bright');
    
    for (const restaurante of restaurantes) {
      try {
        const data = restaurante.data;
        const restauranteId = data.restauranteId;
        
        if (!restauranteId) {
          log(`⚠️ Restaurante sin ID válido: ${restaurante.id}`, 'yellow');
          continue;
        }
        
        log(`📍 Migrando restaurante: ${data.nombre} (${restauranteId})`, 'cyan');
        
        // Preparar datos del restaurante para nueva estructura
        const datosRestaurante = {
          id: restauranteId,
          nombre: data.nombre || '',
          slug: data.slug || '',
          email: data.email || '',
          telefono: data.telefono || '',
          direccion: data.direccion || '',
          ciudad: data.ciudad || '',
          descripcion: data.descripcion || '',
          logo: data.logo || 'assets/logo.png',
          colorPrimario: data.colorPrimario || '#004aad',
          colorSecundario: data.colorSecundario || '#d636a0',
          activo: data.activo !== undefined ? data.activo : true,
          fechaCreacion: data.fechaCreacion || new Date(),
          fechaActualizacion: new Date(),
          configuracion: data.configuracion || {}
        };
        
        // Usar el nombre del restaurante (slug) en lugar del ID para la nueva estructura
        const nombreRestaurante = data.slug || data.nombre?.toLowerCase().replace(/[^a-z0-9]/g, '') || restauranteId;
        
        // Crear documento de información del restaurante en nueva estructura: /clients/{nombreRestaurante}/info/restaurante
        const restauranteInfoRef = doc(this.firestore, `${this.rutaNueva}/${nombreRestaurante}/info/restaurante`);
        await setDoc(restauranteInfoRef, datosRestaurante);
        
        // No necesitamos estructura de Formularios adicional
        
        // Buscar y migrar usuario admin del restaurante (ahora a /adminUsers)
        await this.migrarUsuarioAdmin(restauranteId, nombreRestaurante, data);
        
        this.estadisticas.restaurantesMigrados++;
        log(`✅ Restaurante migrado: ${data.nombre}`, 'green');
        
      } catch (error) {
        const errorMsg = `Error migrando restaurante ${restaurante.id}: ${error.message}`;
        log(`❌ ${errorMsg}`, 'red');
        this.estadisticas.errores.push(errorMsg);
      }
    }
  }

  // Migrar usuario admin del restaurante a /adminUsers
  async migrarUsuarioAdmin(restauranteId, nombreRestaurante, datosRestaurante) {
    try {
      // Buscar usuario admin en colección global de usuarios
      const usuariosRef = collection(this.firestore, 'usuarios');
      const usuarioQuery = query(usuariosRef, where('restaurantePrincipal', '==', restauranteId));
      const snapshot = await getDocs(usuarioQuery);
      
      if (!snapshot.empty) {
        const usuarioDoc = snapshot.docs[0];
        const usuarioData = usuarioDoc.data();
        
        // Preparar datos del usuario admin para nueva estructura
        const datosUsuarioAdmin = {
          uid: usuarioDoc.id,
          email: usuarioData.email || datosRestaurante.email || '',
          nombre: usuarioData.nombre || `Admin ${datosRestaurante.nombre}`,
          restauranteAsignado: nombreRestaurante,  // Referencia al restaurante por nombre
          restauranteId: restauranteId,           // Mantener ID original para referencias
          rol: 'admin',
          permisos: ['read', 'write', 'delete'],
          activo: usuarioData.activo !== undefined ? usuarioData.activo : true,
          fechaCreacion: usuarioData.fechaCreacion || new Date(),
          ultimoAcceso: usuarioData.fechaActualizacion || new Date()
        };
        
        // Crear documento en nueva estructura: /adminUsers/{adminUID}
        const usuarioAdminRef = doc(this.firestore, 'adminUsers', usuarioDoc.id);
        await setDoc(usuarioAdminRef, datosUsuarioAdmin);
        
        log(`   👤 Usuario admin migrado a /adminUsers/: ${datosUsuarioAdmin.nombre}`, 'cyan');
      } else {
        // Si no existe usuario, crear uno básico basado en datos del restaurante
        const adminId = `admin_${restauranteId}`;
        const datosUsuarioAdmin = {
          uid: adminId,
          email: datosRestaurante.email || `admin@${nombreRestaurante}.com`,
          nombre: `Admin ${datosRestaurante.nombre}`,
          restauranteAsignado: nombreRestaurante,
          restauranteId: restauranteId,
          rol: 'admin',
          permisos: ['read', 'write', 'delete'],
          activo: true,
          fechaCreacion: new Date(),
          ultimoAcceso: new Date()
        };
        
        const usuarioAdminRef = doc(this.firestore, 'adminUsers', adminId);
        await setDoc(usuarioAdminRef, datosUsuarioAdmin);
        
        log(`   👤 Usuario admin creado en /adminUsers/: ${datosUsuarioAdmin.nombre}`, 'cyan');
      }
    } catch (error) {
      log(`   ⚠️ Error migrando usuario admin: ${error.message}`, 'yellow');
    }
  }

  // Migrar clientes
  async migrarClientes(clientes) {
    if (clientes.length === 0) {
      log('⚠️ No hay clientes para migrar', 'yellow');
      return;
    }
    
    log(`\n👤 MIGRANDO CLIENTES (${clientes.length})`, 'bright');
    
    // Agrupar clientes por restaurante y convertir a nombre
    const clientesPorRestaurante = await this.agruparPorNombreRestaurante(clientes);
    
    for (const [nombreRestaurante, clientesRestaurante] of Object.entries(clientesPorRestaurante)) {
      log(`📍 Migrando ${clientesRestaurante.length} clientes para restaurante: ${nombreRestaurante}`, 'cyan');
      
      for (const cliente of clientesRestaurante) {
        try {
          const clienteData = this.extraerDatosCliente(cliente);
          
          if (!clienteData) {
            log(`⚠️ No se pudieron extraer datos del cliente: ${cliente.id}`, 'yellow');
            continue;
          }
          
          // Crear documento en nueva estructura: /clients/{nombreRestaurante}/clientes/{clienteId}
          const clienteRef = doc(this.firestore, `${this.rutaNueva}/${nombreRestaurante}/clientes/${clienteData.id}`);
          await setDoc(clienteRef, clienteData);
          
          this.estadisticas.clientesMigrados++;
          log(`   ✅ Cliente migrado: ${clienteData.name}`, 'green');
          
        } catch (error) {
          const errorMsg = `Error migrando cliente ${cliente.id}: ${error.message}`;
          log(`   ❌ ${errorMsg}`, 'red');
          this.estadisticas.errores.push(errorMsg);
        }
      }
    }
  }

  // Migrar reservas
  async migrarReservas(reservas) {
    if (reservas.length === 0) {
      log('⚠️ No hay reservas para migrar', 'yellow');
      return;
    }
    
    log(`\n📅 MIGRANDO RESERVAS (${reservas.length})`, 'bright');
    
    // Agrupar reservas por restaurante y convertir a nombre
    const reservasPorRestaurante = await this.agruparPorNombreRestaurante(reservas);
    
    for (const [nombreRestaurante, reservasRestaurante] of Object.entries(reservasPorRestaurante)) {
      log(`📍 Migrando ${reservasRestaurante.length} reservas para restaurante: ${nombreRestaurante}`, 'cyan');
      
      for (const reserva of reservasRestaurante) {
        try {
          const reservaData = this.extraerDatosReserva(reserva);
          
          if (!reservaData) {
            log(`⚠️ No se pudieron extraer datos de la reserva: ${reserva.id}`, 'yellow');
            continue;
          }
          
          // Crear documento en nueva estructura: /clients/{nombreRestaurante}/reservas/{reservaId}
          const reservaRef = doc(this.firestore, `${this.rutaNueva}/${nombreRestaurante}/reservas/${reservaData.id}`);
          await setDoc(reservaRef, reservaData);
          
          this.estadisticas.reservasMigradas++;
          log(`   ✅ Reserva migrada: ${reservaData.contactNameBooking}`, 'green');
          
        } catch (error) {
          const errorMsg = `Error migrando reserva ${reserva.id}: ${error.message}`;
          log(`   ❌ ${errorMsg}`, 'red');
          this.estadisticas.errores.push(errorMsg);
        }
      }
    }
  }

  // Migrar pedidos
  async migrarPedidos(pedidos) {
    if (pedidos.length === 0) {
      log('⚠️ No hay pedidos para migrar', 'yellow');
      return;
    }
    
    log(`\n🛒 MIGRANDO PEDIDOS (${pedidos.length})`, 'bright');
    
    // Agrupar pedidos por restaurante y convertir a nombre
    const pedidosPorRestaurante = await this.agruparPorNombreRestaurante(pedidos);
    
    for (const [nombreRestaurante, pedidosRestaurante] of Object.entries(pedidosPorRestaurante)) {
      log(`📍 Migrando ${pedidosRestaurante.length} pedidos para restaurante: ${nombreRestaurante}`, 'cyan');
      
      for (const pedido of pedidosRestaurante) {
        try {
          const pedidoData = this.extraerDatosPedido(pedido);
          
          if (!pedidoData) {
            log(`⚠️ No se pudieron extraer datos del pedido: ${pedido.id}`, 'yellow');
            continue;
          }
          
          // Crear documento en nueva estructura: /clients/{nombreRestaurante}/pedidos/{pedidoId}
          const pedidoRef = doc(this.firestore, `${this.rutaNueva}/${nombreRestaurante}/pedidos/${pedidoData.id}`);
          await setDoc(pedidoRef, pedidoData);
          
          this.estadisticas.pedidosMigrados++;
          log(`   ✅ Pedido migrado: ${pedidoData.contactNameOrder}`, 'green');
          
        } catch (error) {
          const errorMsg = `Error migrando pedido ${pedido.id}: ${error.message}`;
          log(`   ❌ ${errorMsg}`, 'red');
          this.estadisticas.errores.push(errorMsg);
        }
      }
    }
  }

  // Agrupar documentos por restaurante (mantener para compatibilidad)
  agruparPorRestaurante(documentos) {
    const grupos = {};
    
    for (const doc of documentos) {
      const restauranteId = doc.data.restauranteId;
      if (restauranteId) {
        if (!grupos[restauranteId]) {
          grupos[restauranteId] = [];
        }
        grupos[restauranteId].push(doc);
      }
    }
    
    return grupos;
  }

  // Nueva función para agrupar por nombre de restaurante
  async agruparPorNombreRestaurante(documentos) {
    const grupos = {};
    const mapaRestaurantes = await this.obtenerMapaRestaurantes();
    
    for (const doc of documentos) {
      const restauranteId = doc.data.restauranteId;
      if (restauranteId) {
        // Buscar el nombre del restaurante usando el ID
        const nombreRestaurante = mapaRestaurantes[restauranteId] || restauranteId;
        
        if (!grupos[nombreRestaurante]) {
          grupos[nombreRestaurante] = [];
        }
        grupos[nombreRestaurante].push(doc);
      }
    }
    
    return grupos;
  }

  // Crear mapa de restauranteId -> nombreRestaurante
  async obtenerMapaRestaurantes() {
    const mapa = {};
    
    try {
      const formulariosRef = collection(this.firestore, this.rutaAntigua);
      const snapshot = await getDocs(formulariosRef);
      
      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.typeForm === 'restaurante') {
          const restauranteId = data.restauranteId;
          const nombreRestaurante = data.slug || data.nombre?.toLowerCase().replace(/[^a-z0-9]/g, '') || restauranteId;
          mapa[restauranteId] = nombreRestaurante;
        }
      });
    } catch (error) {
      log(`⚠️ Error obteniendo mapa de restaurantes: ${error.message}`, 'yellow');
    }
    
    return mapa;
  }

  // Extraer datos del cliente desde formulario
  extraerDatosCliente(cliente) {
    try {
      const data = cliente.data;
      const docId = cliente.id;
      
      // Parsear chatId desde el docId
      const parts = docId.split('_');
      const chatId = parts.length >= 3 ? parts[parts.length - 1] : docId;
      const timestamp = parts.length >= 3 ? parseInt(parts[0]) : Date.now();
      
      // Extraer nombre según el formato
      let nombre = '';
      if (data.typeForm === 'cliente') {
        nombre = data.nombre || '';
      } else {
        // Buscar campo de nombre
        const nombreField = Object.keys(data).find(key => 
          key.toLowerCase().includes('nombre') && !key.toLowerCase().includes('actualizado')
        );
        if (nombreField) {
          nombre = data[nombreField] || '';
        }
      }
      
      if (!nombre) {
        return null;
      }
      
      // Extraer email
      let email = '';
      if (data.typeForm === 'cliente') {
        email = data.email || '';
      } else {
        const emailField = Object.keys(data).find(key => 
          key.toLowerCase().includes('email')
        );
        if (emailField) {
          email = data[emailField] || '';
        }
      }
      
      // Determinar labels
      let labels = data.labels || data.cliente_tipo_actualizado || 'cliente_regular';
      
      return {
        id: chatId,
        name: nombre,
        whatsAppName: nombre,
        email: email,
        isWAContact: data.cliente_activo !== false,
        isMyContact: true,
        sourceType: 'chatBot',
        respType: 'bot',
        labels: labels,
        creation: new Date(timestamp).toISOString(),
        lastUpdate: new Date().toISOString(),
        userInteractions: {
          whatsapp: 1,
          controller: 0,
          chatbot: 1,
          api: 0,
          campaing: 0,
          client: 1,
          others: 0,
          wappController: 0,
          ai: 0,
          fee: this.calcularFee(labels)
        }
      };
    } catch (error) {
      log(`Error extrayendo datos de cliente: ${error.message}`, 'red');
      return null;
    }
  }

  // Extraer datos de reserva desde formulario
  extraerDatosReserva(reserva) {
    try {
      const data = reserva.data;
      const docId = reserva.id;
      
      // Parsear información del docId
      const parts = docId.split('_');
      const chatId = parts.length >= 3 ? parts[parts.length - 1] : docId;
      const timestamp = parts.length >= 3 ? parseInt(parts[0]) : Date.now();
      
      // Extraer información de la reserva
      let contactNameBooking = '';
      let peopleBooking = '1';
      let dateBooking = new Date(timestamp).toISOString();
      let detailsBooking = '';
      
      // Buscar nombre
      const nombreField = Object.keys(data).find(key => 
        key.toLowerCase().includes('nombre') && key.toLowerCase().includes('apellido')
      );
      if (nombreField) {
        contactNameBooking = data[nombreField] || '';
      }
      
      // Buscar número de personas
      const personasField = Object.keys(data).find(key => 
        key.toLowerCase().includes('personas')
      );
      if (personasField) {
        peopleBooking = data[personasField] || '1';
      }
      
      // Buscar fecha
      const fechaField = Object.keys(data).find(key => 
        key.toLowerCase().includes('día') || key.toLowerCase().includes('hora')
      );
      if (fechaField) {
        dateBooking = this.parsearFecha(data[fechaField]) || dateBooking;
      }
      
      // Buscar detalles
      const areaField = Object.keys(data).find(key => 
        key.toLowerCase().includes('área') || key.toLowerCase().includes('preferencia')
      );
      if (areaField) {
        detailsBooking = data[areaField] || '';
      }
      
      if (!contactNameBooking) {
        return null;
      }
      
      return {
        id: docId,
        contact: chatId,
        contactNameBooking: contactNameBooking,
        peopleBooking: peopleBooking,
        finalPeopleBooking: parseInt(peopleBooking) || 1,
        dateBooking: dateBooking,
        statusBooking: data.status || 'pending',
        detailsBooking: detailsBooking,
        reconfirmDate: '',
        reconfirmStatus: null
      };
    } catch (error) {
      log(`Error extrayendo datos de reserva: ${error.message}`, 'red');
      return null;
    }
  }

  // Extraer datos de pedido desde formulario
  extraerDatosPedido(pedido) {
    try {
      const data = pedido.data;
      const docId = pedido.id;
      
      // Parsear información del docId
      const parts = docId.split('_');
      const chatId = parts.length >= 3 ? parts[parts.length - 1] : docId;
      const timestamp = parts.length >= 3 ? parseInt(parts[0]) : Date.now();
      
      // Extraer información del pedido
      let contactNameOrder = '';
      let resumeOrder = '';
      let orderType = 'delivery';
      let addressToDelivery = '';
      
      // Buscar nombre
      const nombreField = Object.keys(data).find(key => 
        key.toLowerCase().includes('nombre')
      );
      if (nombreField) {
        contactNameOrder = data[nombreField] || '';
      }
      
      // Buscar detalles del pedido
      const pedidoField = Object.keys(data).find(key => 
        key.toLowerCase().includes('pedido') || key.toLowerCase().includes('describe')
      );
      if (pedidoField) {
        resumeOrder = data[pedidoField] || '';
      }
      
      // Determinar tipo de pedido
      if (data.orderType) {
        orderType = data.orderType;
      } else if (data.typeForm && data.typeForm.includes('takeaway')) {
        orderType = 'pickUp';
      }
      
      // Buscar dirección
      const direccionField = Object.keys(data).find(key => 
        key.toLowerCase().includes('dirección') || key.toLowerCase().includes('entrega')
      );
      if (direccionField) {
        addressToDelivery = data[direccionField] || '';
      }
      
      if (!contactNameOrder && !resumeOrder) {
        return null;
      }
      
      return {
        id: docId,
        contact: chatId,
        contactNameOrder: contactNameOrder,
        orderType: orderType,
        resumeOrder: resumeOrder || 'Pedido personalizado',
        addressToDelivery: addressToDelivery,
        statusBooking: data.status || 'pending',
        fechaCreacion: new Date(timestamp).toISOString(),
        fechaActualizacion: new Date().toISOString()
      };
    } catch (error) {
      log(`Error extrayendo datos de pedido: ${error.message}`, 'red');
      return null;
    }
  }

  // Parsear fecha desde texto
  parsearFecha(fechaTexto) {
    try {
      if (!fechaTexto) return null;
      
      // Intentar diferentes formatos
      const fecha = new Date(fechaTexto);
      if (!isNaN(fecha.getTime())) {
        return fecha.toISOString();
      }
      
      return null;
    } catch (error) {
      return null;
    }
  }

  // Calcular fee basado en labels
  calcularFee(labels) {
    if (labels && labels.includes('vip')) {
      return Math.floor(Math.random() * 5000) + 5000; // 5,000 - 10,000
    } else if (labels && labels.includes('corporativo')) {
      return Math.floor(Math.random() * 10000) + 10000; // 10,000 - 20,000
    } else {
      return Math.floor(Math.random() * 2000) + 500; // 500 - 2,500
    }
  }

  // Mostrar estadísticas finales
  mostrarEstadisticas() {
    log('\n📊 ESTADÍSTICAS DE MIGRACIÓN', 'bright');
    log('='.repeat(50), 'cyan');
    
    log(`🏪 Restaurantes:`, 'yellow');
    log(`   Encontrados: ${this.estadisticas.restaurantesEncontrados}`, 'white');
    log(`   Migrados: ${this.estadisticas.restaurantesMigrados}`, 'green');
    
    log(`👤 Clientes:`, 'cyan');
    log(`   Encontrados: ${this.estadisticas.clientesEncontrados}`, 'white');
    log(`   Migrados: ${this.estadisticas.clientesMigrados}`, 'green');
    
    log(`📅 Reservas:`, 'magenta');
    log(`   Encontradas: ${this.estadisticas.reservasEncontradas}`, 'white');
    log(`   Migradas: ${this.estadisticas.reservasMigradas}`, 'green');
    
    log(`🛒 Pedidos:`, 'blue');
    log(`   Encontrados: ${this.estadisticas.pedidosEncontrados}`, 'white');
    log(`   Migrados: ${this.estadisticas.pedidosMigrados}`, 'green');
    
    if (this.estadisticas.errores.length > 0) {
      log(`\n❌ Errores (${this.estadisticas.errores.length}):`, 'red');
      this.estadisticas.errores.forEach((error, index) => {
        log(`   ${index + 1}. ${error}`, 'red');
      });
    }
    
    log('\n✅ MIGRACIÓN COMPLETADA', 'bright');
    log('='.repeat(50), 'cyan');
  }

  // Método principal
  async ejecutar() {
    log('🔄 INICIANDO MIGRACIÓN DE DATOS A NUEVA ARQUITECTURA', 'bright');
    log('='.repeat(60), 'cyan');
    
    const inicializado = await this.inicializar();
    if (!inicializado) {
      log('❌ No se pudo inicializar. Terminando...', 'red');
      return;
    }

    // Obtener documentos de estructura antigua
    const documentos = await this.obtenerDocumentosAntiguos();
    if (!documentos) {
      log('❌ No se pudieron obtener documentos antiguos. Terminando...', 'red');
      return;
    }

    // Migrar cada tipo de documento
    await this.migrarRestaurantes(documentos.restaurantes);
    await this.migrarClientes(documentos.clientes);
    await this.migrarReservas(documentos.reservas);
    await this.migrarPedidos(documentos.pedidos);

    // Mostrar estadísticas finales
    this.mostrarEstadisticas();
  }
}

// Ejecutar el script de migración
const migrador = new MigradorDatos();
migrador.ejecutar().catch(error => {
  console.error('❌ Error fatal durante la migración:', error);
  process.exit(1);
});