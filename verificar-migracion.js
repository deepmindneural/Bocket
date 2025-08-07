#!/usr/bin/env node

/**
 * 🔍 Script de Verificación de Migración - Bocket CRM
 * 
 * Este script verifica que los datos se hayan migrado correctamente a la nueva arquitectura
 * 
 * Ejecutar con: node verificar-migracion.js
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, getDoc, getDocs } = require('firebase/firestore');

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

class VerificadorMigracion {
  constructor() {
    this.app = null;
    this.firestore = null;
    this.estadisticas = {
      restaurantesNueva: 0,
      clientesNueva: 0,
      reservasNueva: 0,
      pedidosNueva: 0
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

  // Verificar restaurantes en nueva arquitectura
  async verificarRestaurantes() {
    try {
      log('\n🏪 VERIFICANDO RESTAURANTES EN NUEVA ARQUITECTURA', 'bright');
      
      const clientsRef = collection(this.firestore, 'clients');
      const snapshot = await getDocs(clientsRef);
      
      let restaurantesEncontrados = 0;
      
      for (const clientDoc of snapshot.docs) {
        const restauranteId = clientDoc.id;
        
        try {
          // Verificar si existe el documento de info del restaurante
          const infoRef = doc(this.firestore, `clients/${restauranteId}/info`, 'restaurante');
          const infoSnap = await getDoc(infoRef);
          
          if (infoSnap.exists()) {
            const data = infoSnap.data();
            restaurantesEncontrados++;
            log(`✅ Restaurante: ${data.nombre} (${restauranteId})`, 'green');
            
            // Verificar si tiene usuarios admin
            await this.verificarUsuariosAdmin(restauranteId);
            
            // Verificar datos operacionales
            await this.verificarDatosOperacionales(restauranteId);
          }
        } catch (error) {
          log(`⚠️ Error verificando ${restauranteId}: ${error.message}`, 'yellow');
        }
      }
      
      this.estadisticas.restaurantesNueva = restaurantesEncontrados;
      log(`\n📊 Total restaurantes en nueva arquitectura: ${restaurantesEncontrados}`, 'cyan');
      
    } catch (error) {
      log(`❌ Error verificando restaurantes: ${error.message}`, 'red');
    }
  }

  // Verificar usuarios admin de un restaurante
  async verificarUsuariosAdmin(restauranteId) {
    try {
      const usersRef = collection(this.firestore, `clients/${restauranteId}/users`);
      const snapshot = await getDocs(usersRef);
      
      if (snapshot.size > 0) {
        log(`   👤 Usuarios admin: ${snapshot.size}`, 'blue');
        snapshot.forEach(doc => {
          const userData = doc.data();
          log(`      - ${userData.nombre} (${userData.email})`, 'white');
        });
      } else {
        log(`   ⚠️ Sin usuarios admin`, 'yellow');
      }
    } catch (error) {
      log(`   ❌ Error verificando usuarios: ${error.message}`, 'red');
    }
  }

  // Verificar datos operacionales (clientes, reservas, pedidos)
  async verificarDatosOperacionales(restauranteId) {
    try {
      // Verificar clientes
      const clientesRef = collection(this.firestore, `clients/${restauranteId}/data/clientes`);
      const clientesSnapshot = await getDocs(clientesRef);
      const numClientes = clientesSnapshot.size;
      
      if (numClientes > 0) {
        log(`   👥 Clientes: ${numClientes}`, 'cyan');
        this.estadisticas.clientesNueva += numClientes;
      }
      
      // Verificar reservas
      const reservasRef = collection(this.firestore, `clients/${restauranteId}/data/reservas`);
      const reservasSnapshot = await getDocs(reservasRef);
      const numReservas = reservasSnapshot.size;
      
      if (numReservas > 0) {
        log(`   📅 Reservas: ${numReservas}`, 'magenta');
        this.estadisticas.reservasNueva += numReservas;
      }
      
      // Verificar pedidos
      const pedidosRef = collection(this.firestore, `clients/${restauranteId}/data/pedidos`);
      const pedidosSnapshot = await getDocs(pedidosRef);
      const numPedidos = pedidosSnapshot.size;
      
      if (numPedidos > 0) {
        log(`   🛒 Pedidos: ${numPedidos}`, 'blue');
        this.estadisticas.pedidosNueva += numPedidos;
      }
      
    } catch (error) {
      log(`   ❌ Error verificando datos operacionales: ${error.message}`, 'red');
    }
  }

  // Comparar con estructura antigua
  async compararConEstructuraAntigua() {
    try {
      log('\n🔄 COMPARANDO CON ESTRUCTURA ANTIGUA', 'bright');
      
      const formulariosRef = collection(this.firestore, 'clients/worldfood/Formularios');
      const snapshot = await getDocs(formulariosRef);
      
      const estadisticasAntiguas = {
        restaurantes: 0,
        clientes: 0,
        reservas: 0,
        pedidos: 0
      };
      
      snapshot.forEach(doc => {
        const data = doc.data();
        const typeForm = data.typeForm;
        
        if (typeForm === 'restaurante') {
          estadisticasAntiguas.restaurantes++;
        } else if (typeForm === 'cliente' || (typeForm && typeForm.includes('cliente'))) {
          estadisticasAntiguas.clientes++;
        } else if (typeForm && typeForm.includes('reservas')) {
          estadisticasAntiguas.reservas++;
        } else if (typeForm && typeForm.includes('pedidos')) {
          estadisticasAntiguas.pedidos++;
        }
      });
      
      log('📊 COMPARACIÓN:', 'cyan');
      log(`🏪 Restaurantes - Antigua: ${estadisticasAntiguas.restaurantes} | Nueva: ${this.estadisticas.restaurantesNueva}`, 'white');
      log(`👥 Clientes - Antigua: ${estadisticasAntiguas.clientes} | Nueva: ${this.estadisticas.clientesNueva}`, 'white');
      log(`📅 Reservas - Antigua: ${estadisticasAntiguas.reservas} | Nueva: ${this.estadisticas.reservasNueva}`, 'white');
      log(`🛒 Pedidos - Antigua: ${estadisticasAntiguas.pedidos} | Nueva: ${this.estadisticas.pedidosNueva}`, 'white');
      
      // Verificar integridad
      const integridad = {
        restaurantes: this.estadisticas.restaurantesNueva >= estadisticasAntiguas.restaurantes,
        clientes: this.estadisticas.clientesNueva >= estadisticasAntiguas.clientes,
        reservas: this.estadisticas.reservasNueva >= estadisticasAntiguas.reservas,
        pedidos: this.estadisticas.pedidosNueva >= estadisticasAntiguas.pedidos
      };
      
      log('\n✅ INTEGRIDAD DE DATOS:', 'bright');
      Object.entries(integridad).forEach(([tipo, ok]) => {
        log(`${ok ? '✅' : '❌'} ${tipo}: ${ok ? 'OK' : 'POSIBLE PÉRDIDA DE DATOS'}`, ok ? 'green' : 'red');
      });
      
    } catch (error) {
      log(`❌ Error comparando estructuras: ${error.message}`, 'red');
    }
  }

  // Método principal
  async ejecutar() {
    log('🔍 VERIFICACIÓN DE MIGRACIÓN DE DATOS', 'bright');
    log('='.repeat(50), 'cyan');
    
    const inicializado = await this.inicializar();
    if (!inicializado) {
      log('❌ No se pudo inicializar. Terminando...', 'red');
      return;
    }

    await this.verificarRestaurantes();
    await this.compararConEstructuraAntigua();

    log('\n✅ VERIFICACIÓN COMPLETADA', 'bright');
    log('='.repeat(50), 'cyan');
  }
}

// Ejecutar la verificación
const verificador = new VerificadorMigracion();
verificador.ejecutar().catch(error => {
  console.error('❌ Error fatal durante la verificación:', error);
  process.exit(1);
});