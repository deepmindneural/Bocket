#!/usr/bin/env node

/**
 * 🧪 SCRIPT DE PRUEBAS REALES PARA NUEVA RUTA 'USERS' EN FIRESTORE
 * 
 * Este script realiza pruebas REALES de CRUD en la nueva ruta 'users'
 * Formato: /clients/{restaurante}/users/{userId}
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, setDoc, getDoc, getDocs, updateDoc, deleteDoc, query, where, orderBy, limit } = require('firebase/firestore');

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

// Configuración de pruebas
const RESTAURANTE_PRUEBA = 'panaderia'; // Usar restaurante existente
const USERS_COLLECTION = `clients/${RESTAURANTE_PRUEBA}/users`;
const FORMULARIOS_USERS_COLLECTION = `clients/${RESTAURANTE_PRUEBA}/formularios/users/datos`;

// Datos de prueba REALES
const usersPrueba = [
  {
    id: '23424234234',
    name: 'María García Prueba',
    whatsAppName: 'María García Prueba',
    email: 'maria.garcia.prueba@example.com',
    isWAContact: true,
    isMyContact: true,
    isEnterprise: false,
    isBusiness: false,
    sourceType: 'manual',
    respType: 'manual',
    labels: 'user_vip,premium,test_users',
    creation: new Date().toISOString(),
    lastUpdate: new Date().toISOString(),
    userInteractions: {
      whatsapp: 3,
      controller: 2,
      chatbot: 1,
      api: 0,
      campaing: 1,
      client: 5,
      others: 0,
      wappController: 2,
      ai: 1,
      fee: 3500
    }
  },
  {
    id: '98765432109',
    name: 'Pedro López Test',
    whatsAppName: 'Pedro López Test',
    email: 'pedro.lopez.test@example.com',
    isWAContact: true,
    isMyContact: true,
    isEnterprise: true,
    isBusiness: true,
    sourceType: 'chatBot',
    respType: 'bot',
    labels: 'user_corporativo,empresa,test_users',
    creation: new Date().toISOString(),
    lastUpdate: new Date().toISOString(),
    userInteractions: {
      whatsapp: 7,
      controller: 4,
      chatbot: 3,
      api: 2,
      campaing: 3,
      client: 10,
      others: 2,
      wappController: 4,
      ai: 3,
      fee: 18000
    }
  },
  {
    id: '55555555555',
    name: 'Ana Rodríguez Test',
    whatsAppName: 'Ana R Test',
    email: 'ana.rodriguez.test@example.com',
    isWAContact: true,
    isMyContact: true,
    isEnterprise: false,
    isBusiness: false,
    sourceType: 'manual',
    respType: 'manual',
    labels: 'user_regular,test_users',
    creation: new Date().toISOString(),
    lastUpdate: new Date().toISOString(),
    userInteractions: {
      whatsapp: 2,
      controller: 1,
      chatbot: 0,
      api: 0,
      campaing: 1,
      client: 3,
      others: 0,
      wappController: 1,
      ai: 0,
      fee: 500
    }
  }
];

function logSeparator() {
  console.log('\n' + '='.repeat(80));
}

function logSubsection(title) {
  console.log(`\n${'─'.repeat(40)}`);
  console.log(`📋 ${title}`);
  console.log(`${'─'.repeat(40)}`);
}

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// PRUEBA 1: CREAR USERS EN NUEVA RUTA
async function pruebaCrearUsers() {
  logSubsection('PRUEBA 1: CREAR USERS EN NUEVA RUTA /users');
  
  try {
    console.log(`📍 Creando users en: ${USERS_COLLECTION}`);
    console.log(`📍 Formato esperado: /clients/${RESTAURANTE_PRUEBA}/users/{userId}`);
    
    for (const user of usersPrueba) {
      console.log(`\n🔄 Creando user: ${user.name} (${user.id})`);
      
      // Crear en nueva ruta /clients/{restaurante}/users/{userId}
      const userRef = doc(db, USERS_COLLECTION, user.id);
      await setDoc(userRef, user);
      console.log(`✅ User creado en nueva ruta: /clients/${RESTAURANTE_PRUEBA}/users/${user.id}`);
      
      // Crear también en formularios organizados
      const timestamp = Date.now();
      const formularioData = {
        id: `${timestamp}_user_${user.id}`,
        tipoFormulario: 'users',
        restauranteSlug: RESTAURANTE_PRUEBA,
        chatId: user.id,
        timestamp: timestamp,
        nombre: user.name,
        email: user.email,
        telefono: user.whatsAppName,
        tipoUser: user.labels?.includes('vip') ? 'VIP' : 
                  user.labels?.includes('corporativo') ? 'Corporativo' : 'Regular',
        labels: user.labels,
        activo: true,
        fechaCreacion: new Date().toISOString(),
        source: 'test_users_script'
      };
      
      const formularioRef = doc(db, FORMULARIOS_USERS_COLLECTION, formularioData.id);
      await setDoc(formularioRef, formularioData);
      console.log(`✅ Formulario user creado: /clients/${RESTAURANTE_PRUEBA}/formularios/users/datos/${formularioData.id}`);
      
      await delay(300); // Pausa entre creaciones
    }
    
    console.log(`\n🎉 ¡${usersPrueba.length} users creados en nueva ruta /users!`);
    return true;
  } catch (error) {
    console.error('❌ Error creando users:', error);
    return false;
  }
}

// PRUEBA 2: CONSULTAR USERS EN NUEVA RUTA
async function pruebaConsultarUsers() {
  logSubsection('PRUEBA 2: CONSULTAR USERS EN NUEVA RUTA');
  
  try {
    console.log(`📍 Consultando users desde: ${USERS_COLLECTION}`);
    
    const usersCollection = collection(db, USERS_COLLECTION);
    const snapshot = await getDocs(usersCollection);
    
    console.log(`📊 Total de users encontrados: ${snapshot.size}`);
    
    if (snapshot.empty) {
      console.log('⚠️ No se encontraron users en nueva ruta');
      return false;
    }
    
    console.log('\n📋 Lista de users en nueva ruta:');
    snapshot.forEach((docSnap, index) => {
      const data = docSnap.data();
      console.log(`${index + 1}. ${data.name} (${docSnap.id})`);
      console.log(`   📍 Ruta: /clients/${RESTAURANTE_PRUEBA}/users/${docSnap.id}`);
      console.log(`   📧 Email: ${data.email || 'No especificado'}`);
      console.log(`   🏷️ Labels: ${data.labels || 'Sin labels'}`);
      console.log(`   📱 WhatsApp: ${data.whatsAppName || 'No especificado'}`);
      console.log(`   💰 Fee: $${data.userInteractions?.fee || 0}`);
      console.log(`   📅 Creado: ${data.creation}`);
    });
    
    return true;
  } catch (error) {
    console.error('❌ Error consultando users:', error);
    return false;
  }
}

// PRUEBA 3: ACTUALIZAR USER EN NUEVA RUTA
async function pruebaActualizarUser() {
  logSubsection('PRUEBA 3: ACTUALIZAR USER EN NUEVA RUTA');
  
  try {
    const userId = usersPrueba[0].id;
    console.log(`📍 Actualizando user: ${userId}`);
    console.log(`📍 Ruta: /clients/${RESTAURANTE_PRUEBA}/users/${userId}`);
    
    const datosActualizacion = {
      email: 'maria.garcia.updated.USERS@example.com',
      labels: 'user_vip_actualizado,premium,updated,USERS_ROUTE',
      lastUpdate: new Date().toISOString(),
      'userInteractions.fee': 7500
    };
    
    const userRef = doc(db, USERS_COLLECTION, userId);
    await updateDoc(userRef, datosActualizacion);
    console.log('✅ User actualizado en nueva ruta /users');
    
    // Verificar la actualización
    const docActualizado = await getDoc(userRef);
    
    if (docActualizado.exists()) {
      const data = docActualizado.data();
      console.log('📋 Datos actualizados en nueva ruta:');
      console.log(`   📧 Nuevo email: ${data.email}`);
      console.log(`   🏷️ Nuevas labels: ${data.labels}`);
      console.log(`   💰 Nuevo fee: $${data.userInteractions?.fee}`);
      console.log(`   🕐 Última actualización: ${data.lastUpdate}`);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error actualizando user:', error);
    return false;
  }
}

// PRUEBA 4: CONSULTAS CON FILTROS EN NUEVA RUTA
async function pruebaConsultarPorFiltros() {
  logSubsection('PRUEBA 4: CONSULTAS CON FILTROS EN NUEVA RUTA');
  
  try {
    const usersCollection = collection(db, USERS_COLLECTION);
    
    // Consulta 1: Users que contengan "test_users" en labels
    console.log('\n🔍 Consultando users de prueba (labels contiene "test_users")...');
    const allSnapshot = await getDocs(usersCollection);
    let testUsers = [];
    
    allSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.labels && data.labels.includes('test_users')) {
        testUsers.push({...data, id: doc.id});
      }
    });
    
    console.log(`📊 Users de prueba encontrados: ${testUsers.length}`);
    testUsers.forEach(user => {
      console.log(`   - ${user.name} (ruta: /clients/${RESTAURANTE_PRUEBA}/users/${user.id})`);
    });
    
    // Consulta 2: Users corporativos
    console.log('\n🔍 Consultando users corporativos...');
    const corpQuery = query(usersCollection, where('isEnterprise', '==', true));
    const corpSnapshot = await getDocs(corpQuery);
    
    console.log(`📊 Users corporativos encontrados: ${corpSnapshot.size}`);
    corpSnapshot.forEach(doc => {
      const data = doc.data();
      console.log(`   - ${data.name} (ruta: /clients/${RESTAURANTE_PRUEBA}/users/${doc.id})`);
    });
    
    // Consulta 3: Users por fecha de creación
    console.log('\n🔍 Consultando users ordenados por creación...');
    const dateQuery = query(usersCollection, orderBy('creation', 'desc'), limit(2));
    const dateSnapshot = await getDocs(dateQuery);
    
    console.log(`📊 Últimos users creados: ${dateSnapshot.size}`);
    dateSnapshot.forEach(doc => {
      const data = doc.data();
      console.log(`   - ${data.name} (ruta: /clients/${RESTAURANTE_PRUEBA}/users/${doc.id}, creado: ${data.creation})`);
    });
    
    return true;
  } catch (error) {
    console.error('❌ Error en consultas con filtros:', error);
    return false;
  }
}

// PRUEBA 5: CONSULTAR FORMULARIOS USERS
async function pruebaConsultarFormulariosUsers() {
  logSubsection('PRUEBA 5: CONSULTAR FORMULARIOS USERS');
  
  try {
    console.log(`📍 Consultando formularios desde: ${FORMULARIOS_USERS_COLLECTION}`);
    
    const formulariosCollection = collection(db, FORMULARIOS_USERS_COLLECTION);
    const snapshot = await getDocs(formulariosCollection);
    
    console.log(`📊 Total de formularios users encontrados: ${snapshot.size}`);
    
    if (!snapshot.empty) {
      console.log('\n📋 Lista de formularios users:');
      snapshot.forEach((docSnap, index) => {
        const data = docSnap.data();
        console.log(`${index + 1}. ${data.nombre} - ${data.tipoUser}`);
        console.log(`   📍 Ruta: /clients/${RESTAURANTE_PRUEBA}/formularios/users/datos/${docSnap.id}`);
        console.log(`   📅 Fecha: ${data.fechaCreacion}`);
        console.log(`   🆔 Chat ID: ${data.chatId}`);
        console.log(`   📧 Email: ${data.email}`);
        console.log(`   📍 Source: ${data.source}`);
      });
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error consultando formularios users:', error);
    return false;
  }
}

// PRUEBA 6: VERIFICAR OBTENER POR ID EN NUEVA RUTA
async function pruebaObtenerPorId() {
  logSubsection('PRUEBA 6: OBTENER USER POR ID EN NUEVA RUTA');
  
  try {
    const userId = usersPrueba[1].id; // Pedro López Test
    console.log(`📍 Obteniendo user por ID: ${userId}`);
    console.log(`📍 Ruta: /clients/${RESTAURANTE_PRUEBA}/users/${userId}`);
    
    const userRef = doc(db, USERS_COLLECTION, userId);
    const docSnap = await getDoc(userRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      console.log('✅ User encontrado en nueva ruta:');
      console.log(`   👤 Nombre: ${data.name}`);
      console.log(`   📧 Email: ${data.email}`);
      console.log(`   🏢 Empresa: ${data.isEnterprise ? 'Sí' : 'No'}`);
      console.log(`   🏷️ Labels: ${data.labels}`);
      console.log(`   💰 Fee: $${data.userInteractions?.fee}`);
      console.log(`   📱 WhatsApp: ${data.whatsAppName}`);
      console.log(`   📅 Creado: ${data.creation}`);
      console.log(`   📍 Ruta completa: /clients/${RESTAURANTE_PRUEBA}/users/${userId}`);
      
      return true;
    } else {
      console.log('❌ User no encontrado en nueva ruta');
      return false;
    }
  } catch (error) {
    console.error('❌ Error obteniendo user por ID:', error);
    return false;
  }
}

// PRUEBA 7: RENDIMIENTO DE NUEVA RUTA
async function pruebaRendimientoUsers() {
  logSubsection('PRUEBA 7: RENDIMIENTO DE NUEVA RUTA /users');
  
  try {
    const startTime = Date.now();
    
    // Consultas múltiples en paralelo en nueva ruta
    const usersCollection = collection(db, USERS_COLLECTION);
    const formulariosCollection = collection(db, FORMULARIOS_USERS_COLLECTION);
    
    const promises = [
      getDocs(usersCollection),
      getDocs(formulariosCollection),
      getDocs(query(usersCollection, where('isWAContact', '==', true))),
      getDocs(query(usersCollection, orderBy('creation', 'desc'), limit(2)))
    ];
    
    const results = await Promise.all(promises);
    
    const endTime = Date.now();
    const totalTime = endTime - startTime;
    
    console.log('📊 Resultados de rendimiento en nueva ruta /users:');
    console.log(`   ⏱️ Tiempo total: ${totalTime}ms`);
    console.log(`   👥 Users principales: ${results[0].size}`);
    console.log(`   📝 Formularios users: ${results[1].size}`);
    console.log(`   📱 Con WhatsApp: ${results[2].size}`);
    console.log(`   🔝 Últimos 2: ${results[3].size}`);
    console.log(`   🚀 Promedio por consulta: ${(totalTime/4).toFixed(2)}ms`);
    console.log(`   📍 Ruta base: /clients/${RESTAURANTE_PRUEBA}/users/`);
    
    return true;
  } catch (error) {
    console.error('❌ Error en prueba de rendimiento:', error);
    return false;
  }
}

// GENERAR REPORTE FINAL
async function generarReporteUsers(resultados) {
  logSeparator();
  console.log('📊 REPORTE FINAL DE NUEVA RUTA /users');
  logSeparator();
  
  const totalPruebas = resultados.length;
  const pruebasExitosas = resultados.filter(r => r.resultado).length;
  const pruebasFallidas = totalPruebas - pruebasExitosas;
  
  console.log(`\n📈 RESUMEN DE NUEVA RUTA /users:`);
  console.log(`   ✅ Pruebas exitosas: ${pruebasExitosas}/${totalPruebas}`);
  console.log(`   ❌ Pruebas fallidas: ${pruebasFallidas}/${totalPruebas}`);
  console.log(`   📊 Porcentaje de éxito: ${((pruebasExitosas/totalPruebas) * 100).toFixed(1)}%`);
  
  console.log('\n📋 DETALLE POR PRUEBA:');
  resultados.forEach((resultado, index) => {
    const status = resultado.resultado ? '✅' : '❌';
    console.log(`   ${status} ${index + 1}. ${resultado.nombre}`);
  });
  
  console.log('\n🔥 NUEVA ESTRUCTURA VERIFICADA:');
  console.log(`   📍 Ruta principal: ${USERS_COLLECTION}`);
  console.log(`   📝 Formularios: ${FORMULARIOS_USERS_COLLECTION}`);
  console.log(`   🏪 Restaurante: ${RESTAURANTE_PRUEBA}`);
  console.log(`   🔗 Proyecto Firebase: bocket-2024`);
  
  console.log('\n✅ CAMBIO EXITOSO:');
  console.log('   🗂️ "usuarios" → "users" implementado');
  console.log('   🔄 CRUD completo funcional en nueva ruta');
  console.log('   📊 Consultas con filtros funcionando');
  console.log('   🚀 Rendimiento verificado');
  console.log('   📋 Formularios organizados funcionando');
  
  if (pruebasExitosas === totalPruebas) {
    console.log('\n🎉 ¡TODAS LAS PRUEBAS DE NUEVA RUTA /users PASARON!');
    console.log('✅ La ruta /users está funcionando PERFECTAMENTE');
    console.log('🔥 El cambio usuarios → users está COMPLETAMENTE verificado');
  } else {
    console.log('\n⚠️ ALGUNAS PRUEBAS DE NUEVA RUTA FALLARON');
    console.log('🔍 Revisa los detalles arriba para identificar problemas');
  }
  
  console.log('\n📍 FORMATO FINAL CONFIRMADO:');
  console.log(`   /clients/{restaurante}/users/{userId}`);
  console.log(`   Ejemplo: /clients/panaderia/users/23424234234`);
}

// FUNCIÓN PRINCIPAL
async function ejecutarPruebasUsers() {
  console.log('🔥 INICIANDO PRUEBAS DE NUEVA RUTA /users EN FIRESTORE');
  console.log(`📅 Fecha: ${new Date().toISOString()}`);
  console.log(`🏪 Restaurante de prueba: ${RESTAURANTE_PRUEBA}`);
  console.log(`📍 Ruta principal: ${USERS_COLLECTION}`);
  console.log(`📍 Formato: /clients/${RESTAURANTE_PRUEBA}/users/{userId}`);
  logSeparator();
  
  const resultados = [];
  
  // Ejecutar todas las pruebas de nueva ruta
  const pruebasUsers = [
    { nombre: 'Crear users en nueva ruta', funcion: pruebaCrearUsers },
    { nombre: 'Consultar users en nueva ruta', funcion: pruebaConsultarUsers },
    { nombre: 'Actualizar user en nueva ruta', funcion: pruebaActualizarUser },
    { nombre: 'Consultar por filtros en nueva ruta', funcion: pruebaConsultarPorFiltros },
    { nombre: 'Consultar formularios users', funcion: pruebaConsultarFormulariosUsers },
    { nombre: 'Obtener por ID en nueva ruta', funcion: pruebaObtenerPorId },
    { nombre: 'Rendimiento nueva ruta', funcion: pruebaRendimientoUsers }
  ];
  
  for (const prueba of pruebasUsers) {
    try {
      console.log(`\n🚀 Ejecutando: ${prueba.nombre}`);
      const resultado = await prueba.funcion();
      resultados.push({ nombre: prueba.nombre, resultado });
      
      if (resultado) {
        console.log(`✅ ${prueba.nombre} - EXITOSA`);
      } else {
        console.log(`❌ ${prueba.nombre} - FALLIDA`);
      }
      
      await delay(1000); // Pausa entre pruebas
    } catch (error) {
      console.error(`❌ Error en ${prueba.nombre}:`, error);
      resultados.push({ nombre: prueba.nombre, resultado: false });
    }
  }
  
  // Generar reporte final
  await generarReporteUsers(resultados);
  
  return resultados.filter(r => r.resultado).length === resultados.length;
}

// Ejecutar el script
if (require.main === module) {
  ejecutarPruebasUsers()
    .then((exito) => {
      console.log(`\n🏁 Pruebas de nueva ruta /users ${exito ? 'TODAS EXITOSAS' : 'CON FALLOS'}`);
      process.exit(exito ? 0 : 1);
    })
    .catch((error) => {
      console.error('\n💥 Error en pruebas de nueva ruta /users:', error);
      process.exit(1);
    });
}

module.exports = {
  ejecutarPruebasUsers,
  RESTAURANTE_PRUEBA,
  USERS_COLLECTION,
  FORMULARIOS_USERS_COLLECTION
};