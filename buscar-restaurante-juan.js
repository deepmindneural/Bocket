#!/usr/bin/env node

/**
 * 🔍 Script de Búsqueda Específica - Restaurante Juan - Bocket CRM
 * 
 * Este script busca específicamente el restaurante con email: jua@juan.com
 * Lo busca en TODAS las posibles ubicaciones:
 * 
 * 1. /restaurantes/ (ruta antigua)
 * 2. /clients/worldfood/Formularios/ (ruta nueva multi-tenant)
 * 3. Cualquier otra colección donde pueda estar
 * 
 * Ejecutar con: node buscar-restaurante-juan.js
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, where, doc, getDoc } = require('firebase/firestore');

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

class BuscadorRestauranteJuan {
  constructor() {
    this.app = null;
    this.firestore = null;
    this.emailsBuscados = ['jua@juan.com', 't@t.com']; // Buscar ambos emails
    this.resultados = [];
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

  // Buscar en la ruta antigua /restaurantes/
  async buscarEnRutaAntigua() {
    try {
      log('\n🔍 Buscando en ruta antigua: /restaurantes/', 'cyan');
      
      const restaurantesRef = collection(this.firestore, 'restaurantes');
      const query1 = query(restaurantesRef, where('email', '==', this.emailBuscado));
      const snapshot = await getDocs(query1);

      if (!snapshot.empty) {
        log(`✅ ¡ENCONTRADO en /restaurantes/!`, 'green');
        
        snapshot.forEach((doc, index) => {
          const data = doc.data();
          const resultado = {
            ubicacion: '/restaurantes/',
            documentId: doc.id,
            data: data
          };
          this.resultados.push(resultado);
          
          log(`\n📄 DOCUMENTO #${index + 1}:`, 'bright');
          log(`   📍 Ubicación: /restaurantes/${doc.id}`, 'yellow');
          log(`   📧 Email: ${data.email || 'Sin email'}`, 'green');
          log(`   📛 Nombre: ${data.nombre || 'Sin nombre'}`, 'white');
          log(`   🔗 Slug: ${data.slug || 'Sin slug'}`, 'blue');
          log(`   ⚡ Activo: ${data.activo}`, data.activo ? 'green' : 'red');
          log(`   📅 Fecha Creación: ${data.fechaCreacion ? (data.fechaCreacion.toDate ? data.fechaCreacion.toDate() : data.fechaCreacion) : 'Sin fecha'}`, 'cyan');
        });
      } else {
        log('❌ No encontrado en /restaurantes/', 'red');
      }
    } catch (error) {
      log(`❌ Error buscando en /restaurantes/: ${error.message}`, 'red');
    }
  }

  // Buscar en la ruta nueva multi-tenant
  async buscarEnRutaNueva() {
    try {
      log('\n🔍 Buscando en ruta nueva: /clients/worldfood/Formularios/', 'cyan');
      
      const formulariosRef = collection(this.firestore, 'clients/worldfood/Formularios');
      
      // Buscar por cada email
      for (const email of this.emailsBuscados) {
        log(`\n🔍 Buscando email: ${email}`, 'yellow');
        const queryEmail = query(formulariosRef, where('email', '==', email));
        const snapshotEmail = await getDocs(queryEmail);

        if (!snapshotEmail.empty) {
          log(`✅ ¡ENCONTRADO en /clients/worldfood/Formularios/ (email: ${email})!`, 'green');
          
          snapshotEmail.forEach((doc, index) => {
            const data = doc.data();
            const resultado = {
              ubicacion: '/clients/worldfood/Formularios/',
              documentId: doc.id,
              data: data
            };
            this.resultados.push(resultado);
            
            log(`\n📄 DOCUMENTO #${index + 1}:`, 'bright');
            log(`   📍 Ubicación: /clients/worldfood/Formularios/${doc.id}`, 'yellow');
            log(`   🏷️  TypeForm: ${data.typeForm || 'Sin tipo'}`, 'blue');
            log(`   🏪 Restaurante ID: ${data.restauranteId || 'Sin restauranteId'}`, 'magenta');
            log(`   📧 Email: ${data.email || 'Sin email'}`, 'green');
            log(`   📛 Nombre: ${data.nombre || 'Sin nombre'}`, 'white');
            log(`   🔗 Slug: ${data.slug || 'Sin slug'}`, 'blue');
            log(`   💬 ChatId: ${data.chatId || 'Sin chatId'}`, 'cyan');
            log(`   ⏰ Timestamp: ${data.timestamp || 'Sin timestamp'}`, 'white');
            log(`   ⚡ Activo: ${data.activo}`, data.activo ? 'green' : 'red');
          });
        } else {
          log(`❌ No encontrado email: ${email}`, 'red');
        }
      }

      // También buscar por typeForm = 'restaurante' (por si el email no coincide exactamente)
      log('\n🔍 Buscando todos los restaurantes en Formularios para verificar...', 'yellow');
      const queryRestaurantes = query(formulariosRef, where('typeForm', '==', 'restaurante'));
      const snapshotRestaurantes = await getDocs(queryRestaurantes);

      if (!snapshotRestaurantes.empty) {
        log(`📊 Encontrados ${snapshotRestaurantes.size} restaurante(s) en Formularios:`, 'blue');
        
        snapshotRestaurantes.forEach((doc, index) => {
          const data = doc.data();
          log(`\n🏪 RESTAURANTE #${index + 1}:`, 'bright');
          log(`   📍 Document ID: ${doc.id}`, 'white');
          log(`   📧 Email: ${data.email || 'Sin email'}`, data.email === this.emailBuscado ? 'green' : 'white');
          log(`   📛 Nombre: ${data.nombre || 'Sin nombre'}`, 'white');
          log(`   🔗 Slug: ${data.slug || 'Sin slug'}`, 'blue');
          
          // Si encontramos el email que buscamos, agregarlo a resultados
          if (data.email === this.emailBuscado) {
            const resultado = {
              ubicacion: '/clients/worldfood/Formularios/',
              documentId: doc.id,
              data: data
            };
            this.resultados.push(resultado);
            log(`   🎯 ¡ESTE ES EL QUE BUSCAMOS!`, 'green');
          }
        });
      } else {
        log('❌ No hay restaurantes en /clients/worldfood/Formularios/', 'red');
      }

    } catch (error) {
      log(`❌ Error buscando en /clients/worldfood/Formularios/: ${error.message}`, 'red');
    }
  }

  // Buscar en otras colecciones posibles
  async buscarEnOtrasColecciones() {
    try {
      log('\n🔍 Buscando en otras colecciones posibles...', 'cyan');
      
      const coleccionesPosibles = ['usuarios', 'clientes', 'forms', 'data'];
      
      for (const coleccion of coleccionesPosibles) {
        try {
          log(`   Verificando /${coleccion}/...`, 'yellow');
          const ref = collection(this.firestore, coleccion);
          const q = query(ref, where('email', '==', this.emailBuscado));
          const snapshot = await getDocs(q);
          
          if (!snapshot.empty) {
            log(`   ✅ ¡Encontrado en /${coleccion}/!`, 'green');
            
            snapshot.forEach((doc) => {
              const data = doc.data();
              const resultado = {
                ubicacion: `/${coleccion}/`,
                documentId: doc.id,
                data: data
              };
              this.resultados.push(resultado);
              
              log(`      📄 Documento: ${doc.id}`, 'white');
              log(`      📧 Email: ${data.email}`, 'green');
              log(`      📛 Nombre: ${data.nombre || data.displayName || 'Sin nombre'}`, 'white');
            });
          } else {
            log(`   ❌ No encontrado en /${coleccion}/`, 'white');
          }
        } catch (error) {
          log(`   ⚠️  Error accediendo a /${coleccion}/: ${error.message}`, 'yellow');
        }
      }
    } catch (error) {
      log(`❌ Error buscando en otras colecciones: ${error.message}`, 'red');
    }
  }

  // Mostrar resumen final
  mostrarResumen() {
    log('\n' + '='.repeat(80), 'cyan');
    log('📋 RESUMEN DE BÚSQUEDA', 'bright');
    log('='.repeat(80), 'cyan');
    
    log(`🎯 Emails buscados: ${this.emailsBuscados.join(', ')}`, 'yellow');
    log(`📊 Resultados encontrados: ${this.resultados.length}`, 'green');
    
    if (this.resultados.length === 0) {
      log('\n❌ NO SE ENCONTRÓ EL RESTAURANTE', 'red');
      log('💡 Posibles causas:', 'yellow');
      log('   • El email podría tener variaciones (mayúsculas, espacios)', 'white');
      log('   • El restaurante podría estar en otra colección', 'white');
      log('   • El restaurante podría no haberse guardado correctamente', 'white');
      log('   • Podría estar en una subcollección no verificada', 'white');
    } else {
      log('\n✅ RESTAURANTE(S) ENCONTRADO(S):', 'green');
      
      this.resultados.forEach((resultado, index) => {
        log(`\n🏪 RESULTADO #${index + 1}:`, 'bright');
        log(`   📍 Ubicación: ${resultado.ubicacion}${resultado.documentId}`, 'yellow');
        log(`   📧 Email: ${resultado.data.email}`, 'green');
        log(`   📛 Nombre: ${resultado.data.nombre || 'Sin nombre'}`, 'white');
        log(`   🔗 Slug: ${resultado.data.slug || 'Sin slug'}`, 'blue');
        
        if (resultado.data.typeForm) {
          log(`   🏷️  TypeForm: ${resultado.data.typeForm}`, 'cyan');
        }
        
        if (resultado.data.restauranteId) {
          log(`   🏪 Restaurante ID: ${resultado.data.restauranteId}`, 'magenta');
        }
        
        log(`   ⚡ Activo: ${resultado.data.activo}`, resultado.data.activo ? 'green' : 'red');
      });
    }
  }

  // Método principal
  async ejecutar() {
    log('🔍 BÚSQUEDA DE RESTAURANTES CREADOS', 'bright');
    log(`Emails objetivo: ${this.emailsBuscados.join(', ')}`, 'yellow');
    log('=' .repeat(80), 'cyan');
    
    const inicializado = await this.inicializar();
    if (!inicializado) {
      log('❌ No se pudo inicializar. Terminando...', 'red');
      return;
    }

    // Buscar en todas las ubicaciones posibles
    await this.buscarEnRutaAntigua();
    await this.buscarEnRutaNueva();
    await this.buscarEnOtrasColecciones();

    // Mostrar resumen
    this.mostrarResumen();

    log('\n🎯 BÚSQUEDA COMPLETADA', 'bright');
  }
}

// Ejecutar el script
const buscador = new BuscadorRestauranteJuan();
buscador.ejecutar().catch(error => {
  console.error('❌ Error fatal:', error);
  process.exit(1);
});