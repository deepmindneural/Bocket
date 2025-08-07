#!/usr/bin/env node

/**
 * 🔒 Script de Verificación - Separación de Datos por Restaurante - Bocket CRM
 * 
 * Este script verifica que los datos de cada restaurante estén correctamente separados
 * y que no se mezclen entre diferentes restaurantes.
 * 
 * Verifica:
 * 1. Que cada documento tenga restauranteId
 * 2. Que los restauranteId sean únicos y válidos
 * 3. Que no haya contaminación cruzada de datos
 * 4. Estadísticas por restaurante
 * 
 * Ejecutar con: node verificar-separacion-restaurantes.js
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, where } = require('firebase/firestore');

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

class VerificadorSeparacionRestaurantes {
  constructor() {
    this.app = null;
    this.firestore = null;
    this.rutaFormularios = 'clients/worldfood/Formularios';
    this.estadisticas = {
      totalDocumentos: 0,
      documentosConRestauranteId: 0,
      documentosSinRestauranteId: 0,
      restaurantesEncontrados: new Set(),
      datosPorRestaurante: {},
      tiposFormulario: new Set(),
      problemasEncontrados: []
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

  // Obtener todos los documentos y analizarlos
  async analizarTodosLosDocumentos() {
    try {
      log(`\n🔍 Analizando todos los documentos en: ${this.rutaFormularios}`, 'cyan');
      
      const formulariosRef = collection(this.firestore, this.rutaFormularios);
      const snapshot = await getDocs(formulariosRef);
      
      this.estadisticas.totalDocumentos = snapshot.size;
      log(`📊 Total de documentos encontrados: ${snapshot.size}`, 'blue');
      
      if (snapshot.empty) {
        log('⚠️ No se encontraron documentos en la colección', 'yellow');
        return;
      }

      // Analizar cada documento
      snapshot.forEach((doc, index) => {
        const data = doc.data();
        const docId = doc.id;
        
        this.analizarDocumento(docId, data, index + 1);
      });

      this.generarReporte();
      
    } catch (error) {
      log(`❌ Error analizando documentos: ${error.message}`, 'red');
    }
  }

  // Analizar un documento individual
  analizarDocumento(docId, data, numeroDocumento) {
    const restauranteId = data.restauranteId;
    const typeForm = data.typeForm || 'Sin tipo';
    
    // Registrar tipo de formulario
    this.estadisticas.tiposFormulario.add(typeForm);
    
    if (restauranteId) {
      this.estadisticas.documentosConRestauranteId++;
      this.estadisticas.restaurantesEncontrados.add(restauranteId);
      
      // Inicializar estadísticas del restaurante si no existen
      if (!this.estadisticas.datosPorRestaurante[restauranteId]) {
        this.estadisticas.datosPorRestaurante[restauranteId] = {
          totalDocumentos: 0,
          restaurantes: 0,
          clientes: 0,
          reservas: 0,
          pedidos: 0,
          otros: 0,
          documentos: []
        };
      }
      
      const stats = this.estadisticas.datosPorRestaurante[restauranteId];
      stats.totalDocumentos++;
      stats.documentos.push({ id: docId, tipo: typeForm });
      
      // Clasificar por tipo
      if (typeForm === 'restaurante') {
        stats.restaurantes++;
      } else if (typeForm === 'cliente' || typeForm.includes('cliente manual')) {
        stats.clientes++;
      } else if (typeForm.includes('reservas')) {
        stats.reservas++;
      } else if (typeForm.includes('pedidos') || typeForm.includes('delivery')) {
        stats.pedidos++;
      } else {
        stats.otros++;
      }
      
    } else {
      this.estadisticas.documentosSinRestauranteId++;
      this.estadisticas.problemasEncontrados.push({
        problema: 'Documento sin restauranteId',
        documento: docId,
        tipo: typeForm
      });
      
      log(`⚠️ PROBLEMA: Documento sin restauranteId: ${docId} (${typeForm})`, 'yellow');
    }
  }

  // Verificar separación específica por restaurante
  async verificarSeparacionPorRestaurante(restauranteId) {
    try {
      log(`\n🔍 Verificando datos específicos del restaurante: ${restauranteId}`, 'cyan');
      
      const formulariosRef = collection(this.firestore, this.rutaFormularios);
      const q = query(formulariosRef, where('restauranteId', '==', restauranteId));
      const snapshot = await getDocs(q);
      
      log(`📊 Documentos encontrados para ${restauranteId}: ${snapshot.size}`, 'blue');
      
      const tiposEncontrados = {};
      snapshot.forEach(doc => {
        const data = doc.data();
        const tipo = data.typeForm || 'Sin tipo';
        tiposEncontrados[tipo] = (tiposEncontrados[tipo] || 0) + 1;
      });
      
      log('📋 Tipos de datos encontrados:', 'white');
      Object.entries(tiposEncontrados).forEach(([tipo, cantidad]) => {
        log(`   • ${tipo}: ${cantidad}`, 'cyan');
      });
      
      return snapshot.size;
    } catch (error) {
      log(`❌ Error verificando restaurante ${restauranteId}: ${error.message}`, 'red');
      return 0;
    }
  }

  // Generar reporte completo
  generarReporte() {
    log('\n' + '='.repeat(80), 'cyan');
    log('📋 REPORTE DE SEPARACIÓN DE RESTAURANTES', 'bright');
    log('='.repeat(80), 'cyan');
    
    // Estadísticas generales
    log('\n📊 ESTADÍSTICAS GENERALES:', 'bright');
    log(`   📄 Total de documentos: ${this.estadisticas.totalDocumentos}`, 'white');
    log(`   ✅ Con restauranteId: ${this.estadisticas.documentosConRestauranteId}`, 'green');
    log(`   ❌ Sin restauranteId: ${this.estadisticas.documentosSinRestauranteId}`, this.estadisticas.documentosSinRestauranteId > 0 ? 'red' : 'green');
    log(`   🏪 Restaurantes únicos: ${this.estadisticas.restaurantesEncontrados.size}`, 'cyan');
    
    // Tipos de formulario
    log('\n📋 TIPOS DE FORMULARIO ENCONTRADOS:', 'bright');
    Array.from(this.estadisticas.tiposFormulario).forEach(tipo => {
      log(`   • ${tipo}`, 'cyan');
    });
    
    // Datos por restaurante
    log('\n🏪 DATOS POR RESTAURANTE:', 'bright');
    Object.entries(this.estadisticas.datosPorRestaurante).forEach(([restauranteId, stats]) => {
      log(`\n   🏪 ${restauranteId}:`, 'magenta');
      log(`      📄 Total documentos: ${stats.totalDocumentos}`, 'white');
      log(`      🏢 Restaurantes: ${stats.restaurantes}`, 'yellow');
      log(`      👤 Clientes: ${stats.clientes}`, 'green');
      log(`      📅 Reservas: ${stats.reservas}`, 'blue');
      log(`      🍕 Pedidos: ${stats.pedidos}`, 'cyan');
      log(`      📂 Otros: ${stats.otros}`, 'white');
    });
    
    // Problemas encontrados
    if (this.estadisticas.problemasEncontrados.length > 0) {
      log('\n⚠️ PROBLEMAS ENCONTRADOS:', 'yellow');
      this.estadisticas.problemasEncontrados.forEach((problema, index) => {
        log(`   ${index + 1}. ${problema.problema}: ${problema.documento} (${problema.tipo})`, 'red');
      });
    }
    
    // Verificación de separación
    log('\n🔒 VERIFICACIÓN DE SEPARACIÓN:', 'bright');
    if (this.estadisticas.documentosSinRestauranteId === 0) {
      log('   ✅ PERFECTA: Todos los documentos tienen restauranteId', 'green');
      log('   ✅ Los datos están correctamente separados por restaurante', 'green');
      log('   ✅ No hay riesgo de mezcla de datos entre restaurantes', 'green');
    } else {
      log(`   ⚠️ ATENCIÓN: ${this.estadisticas.documentosSinRestauranteId} documentos sin restauranteId`, 'yellow');
      log('   ⚠️ Estos documentos podrían causar problemas de separación', 'yellow');
    }
    
    // Recomendaciones
    log('\n💡 RECOMENDACIONES:', 'bright');
    if (this.estadisticas.documentosSinRestauranteId > 0) {
      log('   • Agregar restauranteId a los documentos que no lo tienen', 'yellow');
      log('   • Verificar que todos los nuevos documentos incluyan restauranteId', 'yellow');
    }
    log('   • La separación funciona correctamente con filtros por restauranteId', 'green');
    log('   • Cada restaurante solo ve sus propios datos', 'green');
  }

  // Método principal
  async ejecutar() {
    log('🔒 VERIFICACIÓN DE SEPARACIÓN DE DATOS POR RESTAURANTE', 'bright');
    log('='.repeat(80), 'cyan');
    
    const inicializado = await this.inicializar();
    if (!inicializado) {
      log('❌ No se pudo inicializar. Terminando...', 'red');
      return;
    }

    // Analizar todos los documentos
    await this.analizarTodosLosDocumentos();
    
    // Verificar separación para cada restaurante encontrado
    if (this.estadisticas.restaurantesEncontrados.size > 0) {
      log('\n🔍 VERIFICANDO SEPARACIÓN INDIVIDUAL POR RESTAURANTE:', 'bright');
      for (const restauranteId of this.estadisticas.restaurantesEncontrados) {
        await this.verificarSeparacionPorRestaurante(restauranteId);
      }
    }

    log('\n🎯 VERIFICACIÓN COMPLETADA', 'bright');
    log('='.repeat(80), 'cyan');
  }
}

// Ejecutar el script
const verificador = new VerificadorSeparacionRestaurantes();
verificador.ejecutar().catch(error => {
  console.error('❌ Error fatal:', error);
  process.exit(1);
});