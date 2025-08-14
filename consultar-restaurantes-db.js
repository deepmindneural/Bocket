#!/usr/bin/env node

/**
 * 🔍 SCRIPT PARA CONSULTAR TODOS LOS RESTAURANTES EN LA BASE DE DATOS
 * 
 * Este script consulta REALMENTE todas las estructuras donde pueden estar
 * almacenados los restaurantes en Firestore.
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, getDoc, getDocs, query, where } = require('firebase/firestore');

// Configuración de Firebase (la misma que usa la aplicación)
const firebaseConfig = {
  apiKey: "AIzaSyC54Ytk5wO2zupIuCtFIsIUNXvP4m9qqOk",
  authDomain: "bocket-2024.firebaseapp.com",
  projectId: "bocket-2024",
  storageBucket: "bocket-2024.appspot.com",
  messagingSenderId: "537532907057",
  appId: "1:537532907057:web:dc51aacd0553b9ac2edf10"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

function logSeparator() {
  console.log('\n' + '='.repeat(80));
}

function logSubsection(title) {
  console.log(`\n${'─'.repeat(60)}`);
  console.log(`📋 ${title}`);
  console.log(`${'─'.repeat(60)}`);
}

// CONSULTAR RESTAURANTES EN ESTRUCTURA ANTIGUA
async function consultarRestaurantesAntiguos() {
  logSubsection('RESTAURANTES EN ESTRUCTURA ANTIGUA (/restaurantes)');
  
  try {
    const restaurantesCollection = collection(db, 'restaurantes');
    const snapshot = await getDocs(restaurantesCollection);
    
    console.log(`📊 Total de restaurantes en estructura antigua: ${snapshot.size}`);
    
    if (snapshot.empty) {
      console.log('⚠️ No se encontraron restaurantes en /restaurantes');
      return [];
    }
    
    const restaurantes = [];
    console.log('\n📋 Lista de restaurantes antiguos:');
    
    snapshot.forEach((docSnap, index) => {
      const data = docSnap.data();
      const restaurante = {
        id: docSnap.id,
        ...data,
        estructura: 'antigua'
      };
      restaurantes.push(restaurante);
      
      console.log(`${index + 1}. ${data.nombre || 'Sin nombre'} (${docSnap.id})`);
      console.log(`   📧 Email: ${data.email || 'No especificado'}`);
      console.log(`   📍 Ciudad: ${data.ciudad || 'No especificada'}`);
      console.log(`   📱 Teléfono: ${data.telefono || 'No especificado'}`);
      console.log(`   🏷️ Slug: ${data.slug || 'No especificado'}`);
      console.log(`   ✅ Activo: ${data.activo ? 'Sí' : 'No'}`);
      console.log(`   📅 Creado: ${data.fechaCreacion ? new Date(data.fechaCreacion.seconds * 1000).toISOString() : 'No especificado'}`);
    });
    
    return restaurantes;
  } catch (error) {
    console.error('❌ Error consultando restaurantes antiguos:', error);
    return [];
  }
}

// CONSULTAR USUARIOS ADMIN (NUEVA ARQUITECTURA)
async function consultarUsuariosAdmin() {
  logSubsection('USUARIOS ADMIN (/adminUsers)');
  
  try {
    const adminUsersCollection = collection(db, 'adminUsers');
    const snapshot = await getDocs(adminUsersCollection);
    
    console.log(`📊 Total de usuarios admin: ${snapshot.size}`);
    
    if (snapshot.empty) {
      console.log('⚠️ No se encontraron usuarios admin en /adminUsers');
      return [];
    }
    
    const adminsInfo = [];
    console.log('\n📋 Lista de usuarios admin y sus restaurantes:');
    
    snapshot.forEach((docSnap, index) => {
      const data = docSnap.data();
      const adminInfo = {
        uid: docSnap.id,
        ...data,
        estructura: 'admin'
      };
      adminsInfo.push(adminInfo);
      
      console.log(`${index + 1}. ${data.nombre || 'Sin nombre'} (${docSnap.id})`);
      console.log(`   📧 Email: ${data.email || 'No especificado'}`);
      console.log(`   🏪 Restaurante ID: ${data.restauranteId || 'No especificado'}`);
      console.log(`   🏪 Restaurante Asignado: ${data.restauranteAsignado || 'No especificado'}`);
      console.log(`   👤 Rol: ${data.rol || 'No especificado'}`);
      console.log(`   ✅ Activo: ${data.activo ? 'Sí' : 'No'}`);
      console.log(`   📅 Último acceso: ${data.ultimoAcceso ? new Date(data.ultimoAcceso.seconds * 1000).toISOString() : 'Nunca'}`);
    });
    
    return adminsInfo;
  } catch (error) {
    console.error('❌ Error consultando usuarios admin:', error);
    return [];
  }
}

// CONSULTAR ESTRUCTURA CLIENTS
async function consultarEstructuraClients() {
  logSubsection('ESTRUCTURA CLIENTS (/clients)');
  
  try {
    const clientsCollection = collection(db, 'clients');
    const snapshot = await getDocs(clientsCollection);
    
    console.log(`📊 Total de documentos en /clients: ${snapshot.size}`);
    
    if (snapshot.empty) {
      console.log('⚠️ No se encontraron documentos en /clients');
      return [];
    }
    
    const clientsInfo = [];
    console.log('\n📋 Estructura de clients:');
    
    for (const docSnap of snapshot.docs) {
      const restauranteNombre = docSnap.id;
      console.log(`\n🏪 Cliente/Restaurante: ${restauranteNombre}`);
      
      try {
        // Verificar si existe configuración de restaurante
        const configDoc = await getDoc(doc(db, `clients/${restauranteNombre}/configuracion/restaurante`));
        
        if (configDoc.exists()) {
          const configData = configDoc.data();
          console.log('   📋 Configuración encontrada:');
          console.log(`      🏷️ Nombre: ${configData.nombre || 'No especificado'}`);
          console.log(`      📧 Email: ${configData.email || 'No especificado'}`);
          console.log(`      📱 Teléfono: ${configData.telefono || 'No especificado'}`);
          console.log(`      🎨 Color primario: ${configData.colorPrimario || 'No especificado'}`);
          console.log(`      🎨 Color secundario: ${configData.colorSecundario || 'No especificado'}`);
          
          clientsInfo.push({
            nombre: restauranteNombre,
            configuracion: configData,
            estructura: 'clients'
          });
        } else {
          console.log('   ⚠️ Sin configuración de restaurante');
          clientsInfo.push({
            nombre: restauranteNombre,
            estructura: 'clients',
            configuracion: null
          });
        }
        
        // Verificar subcolecciones
        const subcolecciones = ['usuarios', 'clientes', 'pedidos', 'reservas', 'productos', 'formularios'];
        
        for (const subcoleccion of subcolecciones) {
          try {
            const subSnapshot = await getDocs(collection(db, `clients/${restauranteNombre}/${subcoleccion}`));
            if (subSnapshot.size > 0) {
              console.log(`      📁 ${subcoleccion}: ${subSnapshot.size} documentos`);
            }
          } catch (subError) {
            // Subcolección no existe o sin permisos
          }
        }
        
      } catch (error) {
        console.log(`   ❌ Error consultando ${restauranteNombre}:`, error.message);
      }
    }
    
    return clientsInfo;
  } catch (error) {
    console.error('❌ Error consultando estructura clients:', error);
    return [];
  }
}

// CONSULTAR FORMULARIOS WORLDFOOD (COMPATIBILIDAD)
async function consultarFormulariosWorldfood() {
  logSubsection('FORMULARIOS WORLDFOOD (COMPATIBILIDAD)');
  
  try {
    const formulariosCollection = collection(db, 'clients/worldfood/Formularios');
    const restaurantesQuery = query(formulariosCollection, where('typeForm', '==', 'restaurante'));
    const snapshot = await getDocs(restaurantesQuery);
    
    console.log(`📊 Total de formularios de restaurante en worldfood: ${snapshot.size}`);
    
    if (snapshot.empty) {
      console.log('⚠️ No se encontraron formularios de restaurante en worldfood');
      return [];
    }
    
    const restaurantesWorldfood = [];
    console.log('\n📋 Restaurantes en formularios worldfood:');
    
    snapshot.forEach((docSnap, index) => {
      const data = docSnap.data();
      const restaurante = {
        documentId: docSnap.id,
        ...data,
        estructura: 'worldfood'
      };
      restaurantesWorldfood.push(restaurante);
      
      console.log(`${index + 1}. ${data.nombre || 'Sin nombre'} (${docSnap.id})`);
      console.log(`   🆔 Restaurante ID: ${data.restauranteId || 'No especificado'}`);
      console.log(`   📧 Email: ${data.email || 'No especificado'}`);
      console.log(`   📱 Teléfono: ${data.telefono || 'No especificado'}`);
      console.log(`   🎨 Color primario: ${data.colorPrimario || 'No especificado'}`);
      console.log(`   🎨 Color secundario: ${data.colorSecundario || 'No especificado'}`);
      console.log(`   📅 Timestamp: ${data.timestamp ? new Date(data.timestamp).toISOString() : 'No especificado'}`);
    });
    
    return restaurantesWorldfood;
  } catch (error) {
    console.error('❌ Error consultando formularios worldfood:', error);
    return [];
  }
}

// GENERAR REPORTE CONSOLIDADO
async function generarReporteConsolidado(restaurantesAntiguos, adminsInfo, clientsInfo, worldfoodInfo) {
  logSeparator();
  console.log('📊 REPORTE CONSOLIDADO DE RESTAURANTES');
  logSeparator();
  
  console.log('\n📈 RESUMEN POR ESTRUCTURA:');
  console.log(`   🏛️ Estructura antigua (/restaurantes): ${restaurantesAntiguos.length}`);
  console.log(`   👥 Usuarios admin (/adminUsers): ${adminsInfo.length}`);
  console.log(`   🏢 Estructura clients (/clients): ${clientsInfo.length}`);
  console.log(`   📝 Formularios worldfood: ${worldfoodInfo.length}`);
  
  const totalRestaurantes = new Set();
  
  // Agregar nombres únicos
  restaurantesAntiguos.forEach(r => totalRestaurantes.add(r.nombre || r.id));
  adminsInfo.forEach(a => {
    if (a.restauranteAsignado) totalRestaurantes.add(a.restauranteAsignado);
  });
  clientsInfo.forEach(c => totalRestaurantes.add(c.nombre));
  worldfoodInfo.forEach(w => totalRestaurantes.add(w.nombre));
  
  console.log(`\n🎯 TOTAL DE RESTAURANTES ÚNICOS: ${totalRestaurantes.size}`);
  
  console.log('\n📋 LISTA DE RESTAURANTES ÚNICOS:');
  Array.from(totalRestaurantes).sort().forEach((nombre, index) => {
    console.log(`   ${index + 1}. ${nombre}`);
  });
  
  console.log('\n🔍 ANÁLISIS DE CONSISTENCIA:');
  
  // Verificar restaurantes con múltiples referencias
  const restaurantesConReferencias = {};
  
  restaurantesAntiguos.forEach(r => {
    const nombre = r.nombre || r.id;
    if (!restaurantesConReferencias[nombre]) restaurantesConReferencias[nombre] = [];
    restaurantesConReferencias[nombre].push('estructura_antigua');
  });
  
  adminsInfo.forEach(a => {
    if (a.restauranteAsignado) {
      if (!restaurantesConReferencias[a.restauranteAsignado]) restaurantesConReferencias[a.restauranteAsignado] = [];
      restaurantesConReferencias[a.restauranteAsignado].push('admin_user');
    }
  });
  
  clientsInfo.forEach(c => {
    if (!restaurantesConReferencias[c.nombre]) restaurantesConReferencias[c.nombre] = [];
    restaurantesConReferencias[c.nombre].push('clients_structure');
  });
  
  worldfoodInfo.forEach(w => {
    if (!restaurantesConReferencias[w.nombre]) restaurantesConReferencias[w.nombre] = [];
    restaurantesConReferencias[w.nombre].push('worldfood_forms');
  });
  
  console.log('\n📊 RESTAURANTES POR NÚMERO DE REFERENCIAS:');
  Object.entries(restaurantesConReferencias).forEach(([nombre, referencias]) => {
    console.log(`   ${nombre}: ${referencias.length} referencias (${referencias.join(', ')})`);
  });
  
  console.log('\n✅ RESTAURANTES ACTIVOS Y FUNCIONALES:');
  Object.entries(restaurantesConReferencias).forEach(([nombre, referencias]) => {
    const tieneAdmin = referencias.includes('admin_user');
    const tieneClients = referencias.includes('clients_structure');
    const funcional = tieneAdmin && tieneClients;
    
    const status = funcional ? '✅' : '⚠️';
    console.log(`   ${status} ${nombre} - ${funcional ? 'FUNCIONAL' : 'REQUIERE CONFIGURACIÓN'}`);
  });
}

// FUNCIÓN PRINCIPAL
async function consultarTodosLosRestaurantes() {
  console.log('🔍 CONSULTANDO TODOS LOS RESTAURANTES EN LA BASE DE DATOS');
  console.log(`📅 Fecha: ${new Date().toISOString()}`);
  console.log(`🔗 Proyecto Firebase: bocket-2024`);
  logSeparator();
  
  try {
    console.log('🚀 Iniciando consulta completa de restaurantes...');
    
    // Ejecutar todas las consultas
    const [restaurantesAntiguos, adminsInfo, clientsInfo, worldfoodInfo] = await Promise.all([
      consultarRestaurantesAntiguos(),
      consultarUsuariosAdmin(),
      consultarEstructuraClients(),
      consultarFormulariosWorldfood()
    ]);
    
    // Generar reporte consolidado
    await generarReporteConsolidado(restaurantesAntiguos, adminsInfo, clientsInfo, worldfoodInfo);
    
    console.log('\n🏁 Consulta de restaurantes completada exitosamente');
    return true;
    
  } catch (error) {
    console.error('\n💥 Error fatal consultando restaurantes:', error);
    return false;
  }
}

// Ejecutar el script
if (require.main === module) {
  consultarTodosLosRestaurantes()
    .then((exito) => {
      console.log(`\n🎯 Consulta ${exito ? 'EXITOSA' : 'CON ERRORES'}`);
      process.exit(exito ? 0 : 1);
    })
    .catch((error) => {
      console.error('\n💥 Error ejecutando consulta:', error);
      process.exit(1);
    });
}

module.exports = { consultarTodosLosRestaurantes };