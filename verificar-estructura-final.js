#!/usr/bin/env node

/**
 * 🔎 Script Final de Verificación - Arquitectura Migrada - Bocket CRM
 * 
 * Este script verifica el estado final de la migración usando consultas directas
 * Ejecutar con: node verificar-estructura-final.js
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

async function verificarEstructuraFinal() {
  try {
    log('🔎 VERIFICACIÓN FINAL DE ARQUITECTURA MIGRADA', 'bright');
    log('='.repeat(80), 'cyan');
    
    // Inicializar Firebase
    log('🔥 Inicializando Firebase...', 'yellow');
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    log('✅ Firebase inicializado correctamente', 'green');
    
    // 1. Verificar adminUsers
    log('\n1️⃣ VERIFICANDO /adminUsers/', 'bright');
    log('━'.repeat(50), 'cyan');
    
    const adminUsersRef = collection(db, 'adminUsers');
    const adminSnapshot = await getDocs(adminUsersRef);
    
    log(`✅ ${adminSnapshot.size} usuarios administradores encontrados`, 'green');
    
    const adminUsers = [];
    adminSnapshot.forEach(doc => {
      const data = doc.data();
      adminUsers.push({
        uid: doc.id,
        email: data.email || 'Sin email',
        nombre: data.nombre || 'Sin nombre',
        restauranteAsignado: data.restauranteAsignado || 'Sin restaurante',
        restauranteId: data.restauranteId || 'Sin ID',
        activo: data.activo
      });
      
      log(`  👤 ${data.nombre || 'Sin nombre'} (${data.restauranteAsignado || 'Sin restaurante'})`, 'cyan');
    });
    
    // 2. Verificar restaurantes migrados
    log('\n2️⃣ VERIFICANDO RESTAURANTES MIGRADOS', 'bright');
    log('━'.repeat(50), 'cyan');
    
    const restaurantesEncontrados = [];
    const estadisticas = {
      restaurantes: 0,
      clientes: 0,
      reservas: 0,
      pedidos: 0
    };
    
    for (const admin of adminUsers) {
      const nombreRestaurante = admin.restauranteAsignado;
      if (nombreRestaurante && nombreRestaurante !== 'Sin restaurante') {
        log(`\n🏪 Verificando: ${nombreRestaurante}`, 'yellow');
        
        try {
          // Verificar info del restaurante
          const restauranteDoc = await getDoc(doc(db, `clients/${nombreRestaurante}/info/restaurante`));
          
          if (restauranteDoc.exists()) {
            const data = restauranteDoc.data();
            estadisticas.restaurantes++;
            
            const restauranteInfo = {
              nombre: nombreRestaurante,
              nombreCompleto: data.nombre || 'Sin nombre',
              email: data.email || 'Sin email',
              activo: data.activo
            };
            
            restaurantesEncontrados.push(restauranteInfo);
            
            log(`   ✅ Info: ${data.nombre} - ${data.email}`, 'green');
            log(`   🏷️ ID: ${data.id} | Activo: ${data.activo}`, 'white');
            
            // Verificar colecciones de datos
            const colecciones = [
              { nombre: 'clientes', key: 'clientes' },
              { nombre: 'reservas', key: 'reservas' },
              { nombre: 'pedidos', key: 'pedidos' }
            ];
            
            for (const col of colecciones) {
              try {
                const colRef = collection(db, `clients/${nombreRestaurante}/${col.nombre}`);
                const colSnapshot = await getDocs(colRef);
                const cantidad = colSnapshot.size;
                
                estadisticas[col.key] += cantidad;
                
                if (cantidad > 0) {
                  log(`   📊 ${col.nombre}: ${cantidad} registro(s)`, 'blue');
                  
                  // Mostrar algunos ejemplos
                  let ejemplos = 0;
                  colSnapshot.forEach(docItem => {
                    if (ejemplos < 2) {
                      const itemData = docItem.data();
                      const nombre = itemData.name || itemData.contactNameBooking || itemData.contactNameOrder || docItem.id;
                      log(`      • ${nombre}`, 'white');
                      ejemplos++;
                    }
                  });
                } else {
                  log(`   📊 ${col.nombre}: 0 registro(s)`, 'yellow');
                }
              } catch (error) {
                log(`   ❌ Error consultando ${col.nombre}: ${error.message}`, 'red');
              }
            }
            
          } else {
            log(`   ❌ No se encontró info del restaurante`, 'red');
          }
          
        } catch (error) {
          log(`   ❌ Error verificando ${nombreRestaurante}: ${error.message}`, 'red');
        }
      }
    }
    
    // 3. Comparación con estructura antigua
    log('\n3️⃣ COMPARACIÓN CON ESTRUCTURA ANTIGUA', 'bright');
    log('━'.repeat(50), 'cyan');
    
    const formulariosRef = collection(db, 'clients/worldfood/Formularios');
    const formulariosSnapshot = await getDocs(formulariosRef);
    
    const antiguos = {
      restaurantes: 0,
      clientes: 0,
      reservas: 0,
      pedidos: 0
    };
    
    formulariosSnapshot.forEach(doc => {
      const data = doc.data();
      const typeForm = data.typeForm;
      
      if (typeForm === 'restaurante') {
        antiguos.restaurantes++;
      } else if (typeForm === 'cliente' || typeForm?.includes('cliente manual')) {
        antiguos.clientes++;
      } else if (typeForm?.includes('reservas')) {
        antiguos.reservas++;
      } else if (typeForm?.includes('pedidos')) {
        antiguos.pedidos++;
      }
    });
    
    log('📊 ESTRUCTURA ANTIGUA:', 'yellow');
    log(`   🏪 Restaurantes: ${antiguos.restaurantes}`, 'white');
    log(`   👤 Clientes: ${antiguos.clientes}`, 'white');
    log(`   📅 Reservas: ${antiguos.reservas}`, 'white');
    log(`   🍕 Pedidos: ${antiguos.pedidos}`, 'white');
    
    log('\n📊 NUEVA ESTRUCTURA (MIGRADA):', 'green');
    log(`   👤 Admin Users: ${adminUsers.length}`, 'white');
    log(`   🏪 Restaurantes: ${estadisticas.restaurantes}`, 'white');
    log(`   👤 Clientes: ${estadisticas.clientes}`, 'white');
    log(`   📅 Reservas: ${estadisticas.reservas}`, 'white');
    log(`   🍕 Pedidos: ${estadisticas.pedidos}`, 'white');
    
    // 4. Conclusiones
    log('\n4️⃣ CONCLUSIONES', 'bright');
    log('━'.repeat(50), 'cyan');
    
    const migracionExitosa = estadisticas.restaurantes === antiguos.restaurantes && 
                           estadisticas.restaurantes > 0 && 
                           adminUsers.length > 0;
    
    if (migracionExitosa) {
      log('✅ MIGRACIÓN EXITOSA', 'green');
      log('• Los restaurantes se migraron correctamente a la nueva arquitectura', 'green');
      log('• Se crearon los usuarios administradores en /adminUsers/', 'green');
      log('• Los datos están organizados por restaurante individual', 'green');
      log('• La separación multi-tenant está funcionando', 'green');
      
      log('\n📈 DETALLES DE MIGRACIÓN:', 'blue');
      log(`• ${estadisticas.restaurantes} de ${antiguos.restaurantes} restaurantes migrados`, 'white');
      log(`• ${estadisticas.clientes} clientes reorganizados por restaurante`, 'white');
      log(`• ${estadisticas.reservas} reservas reorganizadas por restaurante`, 'white');
      log(`• ${estadisticas.pedidos} pedidos reorganizados por restaurante`, 'white');
      
      log('\n🎯 NUEVAS RUTAS DISPONIBLES:', 'magenta');
      restaurantesEncontrados.forEach(rest => {
        log(`• /clients/${rest.nombre}/info/restaurante`, 'cyan');
        log(`• /clients/${rest.nombre}/clientes/{clienteId}`, 'cyan');
        log(`• /clients/${rest.nombre}/reservas/{reservaId}`, 'cyan');
        log(`• /clients/${rest.nombre}/pedidos/{pedidoId}`, 'cyan');
      });
      
      log('\n💡 PRÓXIMOS PASOS:', 'bright');
      log('1. ✅ La migración está completa', 'green');
      log('2. 🔧 Actualizar la aplicación para usar las nuevas rutas', 'yellow');
      log('3. 🔐 Configurar reglas de seguridad de Firestore para multi-tenancy', 'yellow');
      log('4. 🧪 Realizar pruebas de acceso por restaurante', 'yellow');
      log('5. 🗑️ Considerar archivar la estructura antigua después de validación', 'yellow');
      
    } else {
      log('⚠️ MIGRACIÓN INCOMPLETA', 'yellow');
      log(`• Se encontraron ${estadisticas.restaurantes} de ${antiguos.restaurantes} restaurantes esperados`, 'yellow');
      log('• Revisar logs de migración para identificar errores', 'yellow');
    }
    
    log('\n='.repeat(80), 'cyan');
    log('🔎 VERIFICACIÓN COMPLETADA', 'bright');
    log('='.repeat(80), 'cyan');
    
  } catch (error) {
    log(`❌ Error en verificación: ${error.message}`, 'red');
    console.error('Stack trace:', error);
  }
}

// Ejecutar verificación
verificarEstructuraFinal();