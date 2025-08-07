#!/usr/bin/env node

/**
 * 🍽️ Script de Consulta - Restaurantes Multi-Tenant - Bocket CRM
 * 
 * Este script consulta todos los restaurantes desde la ruta multi-tenant:
 * /clients/worldfood/Formularios/{timestamp}_restaurante_{chatId}
 * 
 * Estructura:
 * - clients: colección estática del negocio
 * - worldfood: identificador del negocio
 * - Formularios: colección estática de formularios
 * - typeForm: 'restaurante' (filtro para obtener solo restaurantes)
 * 
 * Ejecutar con: node consultar-restaurantes-multi-tenant.js
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, where, orderBy } = require('firebase/firestore');

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

class RestaurantesMultiTenantConsultor {
  constructor() {
    this.app = null;
    this.firestore = null;
    this.businessId = 'worldfood';
    this.baseCollection = 'clients';
    this.formulariosCollection = 'Formularios';
  }

  // Obtener la ruta completa para los formularios
  getFormulariosPath() {
    return `${this.baseCollection}/${this.businessId}/${this.formulariosCollection}`;
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

  // Consultar todos los restaurantes
  async consultarRestaurantes() {
    try {
      const rutaFormularios = this.getFormulariosPath();
      log(`\n📍 Consultando restaurantes en: ${rutaFormularios}`, 'cyan');
      log(`🔍 Filtro: typeForm == 'restaurante'`, 'blue');

      // Crear query para obtener solo restaurantes
      const formulariosRef = collection(this.firestore, rutaFormularios);
      const restaurantesQuery = query(
        formulariosRef, 
        where('typeForm', '==', 'restaurante'),
        orderBy('timestamp', 'desc')
      );

      const snapshot = await getDocs(restaurantesQuery);
      
      if (snapshot.empty) {
        log('\n⚠️  No se encontraron restaurantes en la base de datos', 'yellow');
        log('💡 Verifica que:', 'blue');
        log('   1. Los restaurantes se hayan creado con typeForm = "restaurante"', 'white');
        log('   2. La ruta sea correcta: /clients/worldfood/Formularios/', 'white');
        log('   3. Los restaurantes tengan el campo restauranteId', 'white');
        return [];
      }

      const restaurantes = [];
      log(`\n✅ ${snapshot.size} restaurante(s) encontrado(s):`, 'green');
      log('='.repeat(80), 'cyan');

      snapshot.forEach((doc, index) => {
        const data = doc.data();
        const restaurante = {
          documentId: doc.id,
          restauranteId: data.restauranteId || 'Sin ID',
          nombre: data.nombre || 'Sin nombre',
          slug: data.slug || 'sin-slug',
          email: data.email || 'Sin email',
          telefono: data.telefono || 'Sin teléfono',
          ciudad: data.ciudad || 'Sin ciudad',
          activo: data.activo !== undefined ? data.activo : 'No definido',
          typeForm: data.typeForm || 'Sin tipo',
          chatId: data.chatId || 'Sin chatId',
          timestamp: data.timestamp || 'Sin timestamp',
          fechaCreacion: data.fechaCreacion || 'Sin fecha',
          ...data
        };

        restaurantes.push(restaurante);

        log(`\n🏪 RESTAURANTE #${index + 1}:`, 'bright');
        log(`   📄 Document ID: ${restaurante.documentId}`, 'white');
        log(`   🏷️  Restaurante ID: ${restaurante.restauranteId}`, 'yellow');
        log(`   📛 Nombre: ${restaurante.nombre}`, 'green');
        log(`   🔗 Slug: ${restaurante.slug}`, 'blue');
        log(`   📧 Email: ${restaurante.email}`, 'magenta');
        log(`   📞 Teléfono: ${restaurante.telefono}`, 'cyan');
        log(`   🏙️  Ciudad: ${restaurante.ciudad}`, 'white');
        log(`   ⚡ Activo: ${restaurante.activo}`, restaurante.activo ? 'green' : 'red');
        log(`   🏷️  TypeForm: ${restaurante.typeForm}`, 'blue');
        log(`   💬 ChatId: ${restaurante.chatId}`, 'yellow');
        log(`   ⏰ Timestamp: ${restaurante.timestamp}`, 'white');
        
        if (restaurante.fechaCreacion) {
          const fecha = restaurante.fechaCreacion.toDate ? 
            restaurante.fechaCreacion.toDate() : new Date(restaurante.fechaCreacion);
          log(`   📅 Fecha Creación: ${fecha.toLocaleString('es-CO')}`, 'green');
        }

        // Mostrar colores si existen
        if (data.colorPrimario || data.colorSecundario) {
          log(`   🎨 Colores:`, 'magenta');
          if (data.colorPrimario) log(`      • Primario: ${data.colorPrimario}`, 'white');
          if (data.colorSecundario) log(`      • Secundario: ${data.colorSecundario}`, 'white');
        }

        // Mostrar categorías si existen
        if (data.categorias && Array.isArray(data.categorias)) {
          log(`   📂 Categorías (${data.categorias.length}):`, 'cyan');
          data.categorias.forEach(cat => {
            log(`      • ${cat.nombre || cat.id} ${cat.activa ? '✅' : '❌'}`, 'white');
          });
        }

        log('─'.repeat(60), 'cyan');
      });

      return restaurantes;

    } catch (error) {
      log(`❌ Error consultando restaurantes: ${error.message}`, 'red');
      console.error('Stack trace:', error);
      return [];
    }
  }

  // Mostrar resumen estadístico
  mostrarResumen(restaurantes) {
    if (restaurantes.length === 0) return;

    log('\n📊 RESUMEN ESTADÍSTICO:', 'bright');
    log('='.repeat(50), 'cyan');
    
    const activos = restaurantes.filter(r => r.activo === true).length;
    const inactivos = restaurantes.filter(r => r.activo === false).length;
    const sinEstado = restaurantes.filter(r => r.activo === 'No definido').length;

    log(`📈 Total restaurantes: ${restaurantes.length}`, 'green');
    log(`✅ Activos: ${activos}`, 'green');
    log(`❌ Inactivos: ${inactivos}`, 'red');
    log(`❓ Sin estado: ${sinEstado}`, 'yellow');

    // Ciudades más comunes
    const ciudades = {};
    restaurantes.forEach(r => {
      if (r.ciudad && r.ciudad !== 'Sin ciudad') {
        ciudades[r.ciudad] = (ciudades[r.ciudad] || 0) + 1;
      }
    });

    if (Object.keys(ciudades).length > 0) {
      log('\n🏙️  Restaurantes por ciudad:', 'blue');
      Object.entries(ciudades)
        .sort(([,a], [,b]) => b - a)
        .forEach(([ciudad, count]) => {
          log(`   • ${ciudad}: ${count}`, 'white');
        });
    }

    // Timestamps más recientes
    const conTimestamp = restaurantes.filter(r => r.timestamp && r.timestamp !== 'Sin timestamp');
    if (conTimestamp.length > 0) {
      const masReciente = Math.max(...conTimestamp.map(r => r.timestamp));
      const masAntiguo = Math.min(...conTimestamp.map(r => r.timestamp));
      
      log('\n⏰ Rangos de tiempo:', 'magenta');
      log(`   📅 Más reciente: ${new Date(masReciente).toLocaleString('es-CO')}`, 'green');
      log(`   📅 Más antiguo: ${new Date(masAntiguo).toLocaleString('es-CO')}`, 'yellow');
    }
  }

  // Método principal
  async ejecutar() {
    log('🍽️  CONSULTA DE RESTAURANTES MULTI-TENANT', 'bright');
    log('=' .repeat(80), 'cyan');
    
    const inicializado = await this.inicializar();
    if (!inicializado) {
      log('❌ No se pudo inicializar. Terminando...', 'red');
      return;
    }

    const restaurantes = await this.consultarRestaurantes();
    this.mostrarResumen(restaurantes);

    log('\n🎯 CONSULTA COMPLETADA', 'bright');
    log(`📍 Ruta consultada: /clients/worldfood/Formularios/`, 'blue');
    log(`🔍 Filtro aplicado: typeForm == 'restaurante'`, 'blue');
    log(`📊 Resultados: ${restaurantes.length} restaurante(s)`, 'green');
  }
}

// Ejecutar el script
const consultor = new RestaurantesMultiTenantConsultor();
consultor.ejecutar().catch(error => {
  console.error('❌ Error fatal:', error);
  process.exit(1);
});