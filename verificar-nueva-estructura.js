#!/usr/bin/env node

/**
 * 🏗️ Script de Verificación - Nueva Arquitectura - Bocket CRM
 * 
 * Este script verifica si existen restaurantes en la nueva arquitectura:
 * - /adminUsers/{adminUID} (usuarios administradores)
 * - /clients/{nombreRestaurante}/info/restaurante (información de restaurantes)
 * - /clients/{nombreRestaurante}/Formularios/* (datos migrados)
 * 
 * Ejecutar con: node verificar-nueva-estructura.js
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, getDoc } = require('firebase/firestore');

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

class VerificadorNuevaEstructura {
  constructor() {
    this.app = null;
    this.firestore = null;
    this.restaurantesEncontrados = [];
    this.adminUsersEncontrados = [];
    this.estadisticas = {
      adminUsers: 0,
      restaurantesNuevaEstructura: 0,
      clientesNuevaEstructura: 0,
      reservasNuevaEstructura: 0,
      pedidosNuevaEstructura: 0
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

  // Verificar usuarios administradores en /adminUsers
  async verificarAdminUsers() {
    try {
      log('\n1️⃣ VERIFICANDO /adminUsers/', 'bright');
      log('━'.repeat(50), 'cyan');
      
      const adminUsersRef = collection(this.firestore, 'adminUsers');
      const snapshot = await getDocs(adminUsersRef);
      
      if (snapshot.empty) {
        log('⚠️ No se encontraron usuarios administradores en /adminUsers/', 'yellow');
        return;
      }
      
      this.estadisticas.adminUsers = snapshot.size;
      log(`✅ ${snapshot.size} usuario(s) administrador(es) encontrado(s)`, 'green');
      
      snapshot.forEach((doc, index) => {
        const data = doc.data();
        const adminUser = {
          uid: doc.id,
          email: data.email || 'Sin email',
          nombre: data.nombre || 'Sin nombre',
          restauranteAsignado: data.restauranteAsignado || 'Sin restaurante',
          restauranteId: data.restauranteId || 'Sin ID',
          rol: data.rol || 'Sin rol',
          activo: data.activo !== undefined ? data.activo : 'No definido',
          fechaCreacion: data.fechaCreacion || 'Sin fecha'
        };
        
        this.adminUsersEncontrados.push(adminUser);
        
        log(`\n👤 ADMIN #${index + 1}:`, 'magenta');
        log(`   🆔 UID: ${adminUser.uid}`, 'white');
        log(`   📧 Email: ${adminUser.email}`, 'cyan');
        log(`   📛 Nombre: ${adminUser.nombre}`, 'green');
        log(`   🏪 Restaurante Asignado: ${adminUser.restauranteAsignado}`, 'blue');
        log(`   🏷️ Restaurante ID: ${adminUser.restauranteId}`, 'yellow');
        log(`   👑 Rol: ${adminUser.rol}`, 'magenta');
        log(`   ⚡ Activo: ${adminUser.activo}`, adminUser.activo ? 'green' : 'red');
      });
      
    } catch (error) {
      log(`❌ Error verificando adminUsers: ${error.message}`, 'red');
    }
  }

  // Verificar restaurantes en nueva estructura /clients/{nombreRestaurante}/info/restaurante
  async verificarRestaurantesNuevaEstructura() {
    try {
      log('\n2️⃣ VERIFICANDO /clients/{nombreRestaurante}/info/restaurante', 'bright');
      log('━'.repeat(60), 'cyan');
      
      // Intentar obtener nombres de restaurantes desde adminUsers
      const nombresRestaurantes = this.adminUsersEncontrados
        .map(admin => admin.restauranteAsignado)
        .filter(nombre => nombre && nombre !== 'Sin restaurante');
      
      if (nombresRestaurantes.length === 0) {
        log('⚠️ No hay nombres de restaurantes desde adminUsers para verificar', 'yellow');
        
        // Intentar nombres conocidos basados en los slugs de la estructura antigua
        const nombresConocidos = ['ss', 'ttt', 'ewe', 'carne', 'jhon', 'do'];
        log('🔍 Probando con nombres conocidos de la estructura antigua...', 'blue');
        
        for (const nombre of nombresConocidos) {
          await this.verificarRestauranteEspecifico(nombre);
        }
        return;
      }
      
      log(`🔍 Verificando ${nombresRestaurantes.length} restaurante(s) desde adminUsers...`, 'blue');
      
      for (const nombreRestaurante of nombresRestaurantes) {
        await this.verificarRestauranteEspecifico(nombreRestaurante);
      }
      
    } catch (error) {
      log(`❌ Error verificando restaurantes nueva estructura: ${error.message}`, 'red');
    }
  }

  // Verificar un restaurante específico en la nueva estructura
  async verificarRestauranteEspecifico(nombreRestaurante) {
    try {
      log(`\n🏪 Verificando restaurante: ${nombreRestaurante}`, 'cyan');
      
      // Verificar información del restaurante
      const restauranteInfoRef = doc(this.firestore, `clients/${nombreRestaurante}/info/restaurante`);
      const restauranteDoc = await restauranteInfoRef.get();
      
      if (restauranteDoc.exists()) {
        const data = restauranteDoc.data();
        this.estadisticas.restaurantesNuevaEstructura++;
        
        const restauranteInfo = {
          nombre: nombreRestaurante,
          id: data.id || 'Sin ID',
          nombreCompleto: data.nombre || 'Sin nombre',
          slug: data.slug || 'Sin slug',
          email: data.email || 'Sin email',
          telefono: data.telefono || 'Sin teléfono',
          ciudad: data.ciudad || 'Sin ciudad',
          activo: data.activo !== undefined ? data.activo : 'No definido',
          fechaCreacion: data.fechaCreacion || 'Sin fecha'
        };
        
        this.restaurantesEncontrados.push(restauranteInfo);
        
        log(`   ✅ ENCONTRADO en /clients/${nombreRestaurante}/info/restaurante`, 'green');
        log(`   📛 Nombre: ${restauranteInfo.nombreCompleto}`, 'white');
        log(`   🆔 ID: ${restauranteInfo.id}`, 'yellow');
        log(`   🔗 Slug: ${restauranteInfo.slug}`, 'blue');
        log(`   📧 Email: ${restauranteInfo.email}`, 'cyan');
        log(`   📞 Teléfono: ${restauranteInfo.telefono}`, 'magenta');
        log(`   🏙️ Ciudad: ${restauranteInfo.ciudad}`, 'white');
        log(`   ⚡ Activo: ${restauranteInfo.activo}`, restauranteInfo.activo ? 'green' : 'red');
        
        // Verificar datos migrados
        await this.verificarDatosMigrados(nombreRestaurante);
      } else {
        log(`   ❌ NO ENCONTRADO en /clients/${nombreRestaurante}/info/restaurante`, 'red');
      }
      
    } catch (error) {
      log(`   ❌ Error verificando ${nombreRestaurante}: ${error.message}`, 'red');
    }
  }

  // Verificar datos migrados en /clients/{nombreRestaurante}/Formularios/
  async verificarDatosMigrados(nombreRestaurante) {
    try {
      log(`   🔍 Verificando datos migrados...`, 'blue');
      
      const colecciones = ['clientes', 'reservas', 'pedidos'];
      
      for (const coleccion of colecciones) {
        try {
          const coleccionRef = collection(this.firestore, `clients/${nombreRestaurante}/${coleccion}`);
          const snapshot = await getDocs(coleccionRef);
          
          const cantidad = snapshot.size;
          if (cantidad > 0) {
            this.estadisticas[`${coleccion}NuevaEstructura`] += cantidad;
            log(`      📊 ${coleccion}: ${cantidad} documento(s)`, 'green');
          } else {
            log(`      📊 ${coleccion}: 0 documento(s)`, 'yellow');
          }
        } catch (error) {
          log(`      ❌ Error consultando ${coleccion}: ${error.message}`, 'red');
        }
      }
    } catch (error) {
      log(`   ❌ Error verificando datos migrados: ${error.message}`, 'red');
    }
  }

  // Comparar con estructura antigua
  async compararConEstructuraAntigua() {
    try {
      log('\n3️⃣ COMPARACIÓN CON ESTRUCTURA ANTIGUA', 'bright');
      log('━'.repeat(50), 'cyan');
      
      // Obtener restaurantes de estructura antigua
      const formulariosRef = collection(this.firestore, 'clients/worldfood/Formularios');
      const snapshot = await getDocs(formulariosRef);
      
      const restaurantesAntiguos = new Set();
      const datosAntiguos = {
        restaurantes: 0,
        clientes: 0,
        reservas: 0,
        pedidos: 0
      };
      
      snapshot.forEach(doc => {
        const data = doc.data();
        const restauranteId = data.restauranteId;
        const typeForm = data.typeForm;
        
        if (restauranteId) {
          restaurantesAntiguos.add(restauranteId);
        }
        
        if (typeForm === 'restaurante') {
          datosAntiguos.restaurantes++;
        } else if (typeForm === 'cliente' || typeForm?.includes('cliente manual')) {
          datosAntiguos.clientes++;
        } else if (typeForm?.includes('reservas')) {
          datosAntiguos.reservas++;
        } else if (typeForm?.includes('pedidos')) {
          datosAntiguos.pedidos++;
        }
      });
      
      log(`📊 ESTRUCTURA ANTIGUA:`, 'yellow');
      log(`   🏪 Restaurantes únicos: ${restaurantesAntiguos.size}`, 'white');
      log(`   📄 Docs restaurante: ${datosAntiguos.restaurantes}`, 'white');
      log(`   👤 Docs clientes: ${datosAntiguos.clientes}`, 'white');
      log(`   📅 Docs reservas: ${datosAntiguos.reservas}`, 'white');
      log(`   🍕 Docs pedidos: ${datosAntiguos.pedidos}`, 'white');
      
      log(`\n📊 NUEVA ESTRUCTURA:`, 'green');
      log(`   👤 Admin Users: ${this.estadisticas.adminUsers}`, 'white');
      log(`   🏪 Restaurantes: ${this.estadisticas.restaurantesNuevaEstructura}`, 'white');
      log(`   👤 Clientes migrados: ${this.estadisticas.clientesNuevaEstructura}`, 'white');
      log(`   📅 Reservas migradas: ${this.estadisticas.reservasNuevaEstructura}`, 'white');
      log(`   🍕 Pedidos migrados: ${this.estadisticas.pedidosNuevaEstructura}`, 'white');
      
      // Estado de migración
      log('\n📈 ESTADO DE MIGRACIÓN:', 'bright');
      const restaurantesMigrados = this.estadisticas.restaurantesNuevaEstructura;
      const restaurantesAntiguosCount = datosAntiguos.restaurantes;
      
      if (restaurantesMigrados === 0) {
        log('❌ MIGRACIÓN NO EJECUTADA: No se encontraron restaurantes en la nueva estructura', 'red');
      } else if (restaurantesMigrados < restaurantesAntiguosCount) {
        log(`⚠️ MIGRACIÓN PARCIAL: ${restaurantesMigrados}/${restaurantesAntiguosCount} restaurantes migrados`, 'yellow');
      } else {
        log(`✅ MIGRACIÓN COMPLETA: ${restaurantesMigrados}/${restaurantesAntiguosCount} restaurantes migrados`, 'green');
      }
      
    } catch (error) {
      log(`❌ Error comparando estructuras: ${error.message}`, 'red');
    }
  }

  // Generar reporte final
  generarReporteFinal() {
    log('\n' + '='.repeat(80), 'cyan');
    log('📋 REPORTE FINAL - VERIFICACIÓN DE NUEVA ARQUITECTURA', 'bright');
    log('='.repeat(80), 'cyan');
    
    if (this.estadisticas.adminUsers === 0 && this.estadisticas.restaurantesNuevaEstructura === 0) {
      log('\n❌ CONCLUSIÓN: LA MIGRACIÓN NO SE HA EJECUTADO', 'red');
      log('💡 Los datos siguen en la estructura antigua:', 'yellow');
      log('   • /clients/worldfood/Formularios/ ✅ (estructura antigua)', 'yellow');
      log('   • /adminUsers/ ❌ (nueva estructura)', 'yellow');
      log('   • /clients/{nombreRestaurante}/info/ ❌ (nueva estructura)', 'yellow');
    } else if (this.estadisticas.restaurantesNuevaEstructura > 0) {
      log('\n✅ CONCLUSIÓN: LA MIGRACIÓN SE HA EJECUTADO PARCIAL O TOTALMENTE', 'green');
      log('📊 Resumen de estructuras:', 'white');
      log('   • ESTRUCTURA ANTIGUA: /clients/worldfood/Formularios/ ✅', 'yellow');
      log('   • ESTRUCTURA NUEVA: Detectada ✅', 'green');
      log(`     - AdminUsers: ${this.estadisticas.adminUsers}`, 'green');
      log(`     - Restaurantes: ${this.estadisticas.restaurantesNuevaEstructura}`, 'green');
      log(`     - Clientes: ${this.estadisticas.clientesNuevaEstructura}`, 'green');
      log(`     - Reservas: ${this.estadisticas.reservasNuevaEstructura}`, 'green');
      log(`     - Pedidos: ${this.estadisticas.pedidosNuevaEstructura}`, 'green');
    }
    
    log('\n💡 PRÓXIMOS PASOS:', 'bright');
    if (this.estadisticas.restaurantesNuevaEstructura === 0) {
      log('1. Ejecutar el script de migración: node migrar-datos-nueva-arquitectura.js', 'yellow');
      log('2. Verificar que la migración se complete exitosamente', 'yellow');
      log('3. Volver a ejecutar esta verificación', 'yellow');
    } else {
      log('1. ✅ La nueva arquitectura está funcionando', 'green');
      log('2. Verificar que la aplicación esté configurada para usar la nueva estructura', 'yellow');
      log('3. Considerar deprecar la estructura antigua después de pruebas', 'yellow');
    }
  }

  // Método principal
  async ejecutar() {
    log('🏗️ VERIFICACIÓN DE NUEVA ARQUITECTURA BOCKET CRM', 'bright');
    log('='.repeat(80), 'cyan');
    
    const inicializado = await this.inicializar();
    if (!inicializado) {
      log('❌ No se pudo inicializar. Terminando...', 'red');
      return;
    }

    await this.verificarAdminUsers();
    await this.verificarRestaurantesNuevaEstructura();
    await this.compararConEstructuraAntigua();
    this.generarReporteFinal();

    log('\n🎯 VERIFICACIÓN COMPLETADA', 'bright');
    log('='.repeat(80), 'cyan');
  }
}

// Ejecutar el script
const verificador = new VerificadorNuevaEstructura();
verificador.ejecutar().catch(error => {
  console.error('❌ Error fatal:', error);
  process.exit(1);
});