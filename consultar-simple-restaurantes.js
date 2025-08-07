#!/usr/bin/env node

/**
 * 🔍 Script Simple - Consultar Restaurantes - Bocket CRM
 * 
 * Este script consulta restaurantes SIN orderBy para evitar problemas de índices
 * Ruta: /clients/worldfood/Formularios/
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

async function consultarRestaurantes() {
  try {
    log('🔥 Inicializando Firebase...', 'yellow');
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    const rutaFormularios = 'clients/worldfood/Formularios';
    log(`📍 Consultando: ${rutaFormularios}`, 'cyan');
    
    // Consulta simple SIN orderBy
    const formulariosRef = collection(db, rutaFormularios);
    const restaurantesQuery = query(formulariosRef, where('typeForm', '==', 'restaurante'));
    
    log('🔍 Ejecutando consulta...', 'blue');
    const snapshot = await getDocs(restaurantesQuery);
    
    log(`\n📊 Resultado: ${snapshot.size} restaurante(s) encontrado(s)`, 'green');
    
    if (snapshot.empty) {
      log('\n⚠️ No se encontraron restaurantes con typeForm = "restaurante"', 'yellow');
      
      // Intentar consultar TODOS los documentos para ver qué hay
      log('\n🔍 Consultando TODOS los documentos en Formularios...', 'cyan');
      const todosRef = collection(db, rutaFormularios);
      const todosSnapshot = await getDocs(todosRef);
      
      if (todosSnapshot.empty) {
        log('❌ La colección Formularios está completamente vacía', 'red');
      } else {
        log(`📊 Total documentos en Formularios: ${todosSnapshot.size}`, 'blue');
        
        const tipos = {};
        todosSnapshot.forEach(doc => {
          const data = doc.data();
          const tipo = data.typeForm || 'Sin typeForm';
          tipos[tipo] = (tipos[tipo] || 0) + 1;
          
          log(`\n📄 Documento: ${doc.id}`, 'white');
          log(`   🏷️ TypeForm: ${data.typeForm || 'Sin typeForm'}`, 'yellow');
          log(`   📧 Email: ${data.email || 'Sin email'}`, 'white');
          log(`   📛 Nombre: ${data.nombre || 'Sin nombre'}`, 'white');
        });
        
        log('\n📈 Resumen por tipo:', 'bright');
        Object.entries(tipos).forEach(([tipo, count]) => {
          log(`   • ${tipo}: ${count}`, 'cyan');
        });
      }
    } else {
      log('\n✅ RESTAURANTES ENCONTRADOS:', 'green');
      log('='.repeat(60), 'cyan');
      
      snapshot.forEach((doc, index) => {
        const data = doc.data();
        
        log(`\n🏪 RESTAURANTE #${index + 1}:`, 'bright');
        log(`   📄 Document ID: ${doc.id}`, 'yellow');
        log(`   🏪 Restaurante ID: ${data.restauranteId || 'Sin restauranteId'}`, 'magenta');
        log(`   📛 Nombre: ${data.nombre || 'Sin nombre'}`, 'white');
        log(`   🔗 Slug: ${data.slug || 'Sin slug'}`, 'blue');
        log(`   📧 Email: ${data.email || 'Sin email'}`, 'green');
        log(`   📞 Teléfono: ${data.telefono || 'Sin teléfono'}`, 'cyan');
        log(`   🏙️ Ciudad: ${data.ciudad || 'Sin ciudad'}`, 'white');
        log(`   ⚡ Activo: ${data.activo}`, data.activo ? 'green' : 'red');
        log(`   💬 ChatId: ${data.chatId || 'Sin chatId'}`, 'yellow');
        log(`   ⏰ Timestamp: ${data.timestamp || 'Sin timestamp'}`, 'white');
        
        if (data.timestamp) {
          const fecha = new Date(data.timestamp);
          log(`   📅 Fecha: ${fecha.toLocaleString('es-CO')}`, 'green');
        }
        
        if (data.categorias && Array.isArray(data.categorias)) {
          log(`   📂 Categorías: ${data.categorias.length}`, 'cyan');
        }
        
        log('─'.repeat(50), 'cyan');
      });
    }
    
  } catch (error) {
    log(`❌ Error: ${error.message}`, 'red');
    console.error('Stack trace:', error);
  }
}

// Ejecutar
log('🔍 CONSULTA SIMPLE DE RESTAURANTES', 'bright');
log('='.repeat(50), 'cyan');
consultarRestaurantes();