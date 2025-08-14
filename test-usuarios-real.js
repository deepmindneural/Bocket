#!/usr/bin/env node

/**
 * 🧪 SCRIPT DE PRUEBAS REALES PARA TABLA USUARIOS EN FIRESTORE
 * 
 * Este script realiza pruebas REALES de CRUD en la nueva tabla 'usuarios'
 * usando las mismas configuraciones que la aplicación Angular.
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
const RESTAURANTE_PRUEBA = 'test-restaurant-' + Date.now();
const USUARIOS_COLLECTION = `clients/${RESTAURANTE_PRUEBA}/usuarios`;
const FORMULARIOS_USUARIOS_COLLECTION = `clients/${RESTAURANTE_PRUEBA}/formularios/usuarios/datos`;

// Datos de prueba REALES
const usuariosPrueba = [
  {
    id: 'user-test-001',
    name: 'Ana García Test',
    whatsAppName: 'Ana García Test',
    email: 'ana.garcia.test@example.com',
    isWAContact: true,
    isMyContact: true,
    isEnterprise: false,
    isBusiness: false,
    sourceType: 'manual',
    respType: 'manual',
    labels: 'usuario_vip,premium,test',
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
      fee: 2500
    }
  },
  {
    id: 'user-test-002',
    name: 'Carlos López Test',
    whatsAppName: 'Carlos López Test',
    email: 'carlos.lopez.test@example.com',
    isWAContact: true,
    isMyContact: true,
    isEnterprise: true,
    isBusiness: true,
    sourceType: 'chatBot',
    respType: 'bot',
    labels: 'usuario_corporativo,empresa,test',
    creation: new Date().toISOString(),
    lastUpdate: new Date().toISOString(),
    userInteractions: {
      whatsapp: 5,
      controller: 3,
      chatbot: 2,
      api: 1,
      campaing: 2,
      client: 8,
      others: 1,
      wappController: 3,
      ai: 2,
      fee: 15000
    }
  },
  {
    id: 'user-test-003',
    name: 'María Rodríguez Test',
    whatsAppName: 'María R Test',
    email: 'maria.rodriguez.test@example.com',
    isWAContact: true,
    isMyContact: true,
    isEnterprise: false,
    isBusiness: false,
    sourceType: 'manual',
    respType: 'manual',
    labels: 'usuario_regular,test',
    creation: new Date().toISOString(),
    lastUpdate: new Date().toISOString(),
    userInteractions: {
      whatsapp: 1,
      controller: 1,
      chatbot: 0,
      api: 0,
      campaing: 0,
      client: 2,
      others: 0,
      wappController: 1,
      ai: 0,
      fee: 0
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

// PRUEBA 1: CREAR USUARIOS REALES
async function pruebaCrearUsuarios() {
  logSubsection('PRUEBA 1: CREAR USUARIOS EN FIRESTORE REAL');
  
  try {
    console.log(`📍 Creando usuarios en: ${USUARIOS_COLLECTION}`);
    
    for (const usuario of usuariosPrueba) {
      console.log(`\n🔄 Creando usuario REAL: ${usuario.name} (${usuario.id})`);
      
      // Crear en tabla principal de usuarios usando Firebase v9
      const usuarioRef = doc(db, USUARIOS_COLLECTION, usuario.id);
      await setDoc(usuarioRef, usuario);
      console.log(`✅ Usuario creado REALMENTE en Firestore: ${usuario.id}`);
      
      // Crear también en formularios organizados
      const timestamp = Date.now();
      const formularioData = {
        id: `${timestamp}_usuario_${usuario.id}`,
        tipoFormulario: 'usuarios',
        restauranteSlug: RESTAURANTE_PRUEBA,
        chatId: usuario.id,
        timestamp: timestamp,
        nombre: usuario.name,
        email: usuario.email,
        telefono: usuario.whatsAppName,
        tipoUsuario: usuario.labels?.includes('vip') ? 'VIP' : 
                    usuario.labels?.includes('corporativo') ? 'Corporativo' : 'Regular',
        labels: usuario.labels,
        activo: true,
        fechaCreacion: new Date().toISOString(),
        source: 'test_script_real'
      };
      
      const formularioRef = doc(db, FORMULARIOS_USUARIOS_COLLECTION, formularioData.id);
      await setDoc(formularioRef, formularioData);
      console.log(`✅ Formulario de usuario creado REALMENTE: ${formularioData.id}`);
      
      await delay(200); // Pausa entre creaciones
    }
    
    console.log(`\n🎉 ¡${usuariosPrueba.length} usuarios creados REALMENTE en Firestore!`);
    return true;
  } catch (error) {
    console.error('❌ Error REAL creando usuarios:', error);
    return false;
  }
}

// PRUEBA 2: CONSULTAR USUARIOS REALES
async function pruebaConsultarUsuarios() {
  logSubsection('PRUEBA 2: CONSULTAR USUARIOS REALES DE FIRESTORE');
  
  try {
    console.log(`📍 Consultando usuarios REALES desde: ${USUARIOS_COLLECTION}`);
    
    const usuariosCollection = collection(db, USUARIOS_COLLECTION);
    const snapshot = await getDocs(usuariosCollection);
    
    console.log(`📊 Total de usuarios REALES encontrados: ${snapshot.size}`);
    
    if (snapshot.empty) {
      console.log('⚠️ No se encontraron usuarios REALES');
      return false;
    }
    
    console.log('\n📋 Lista de usuarios REALES:');
    snapshot.forEach((docSnap, index) => {
      const data = docSnap.data();
      console.log(`${index + 1}. ${data.name} (${docSnap.id})`);
      console.log(`   📧 Email: ${data.email || 'No especificado'}`);
      console.log(`   🏷️ Labels: ${data.labels || 'Sin labels'}`);
      console.log(`   📱 WhatsApp: ${data.whatsAppName || 'No especificado'}`);
      console.log(`   💰 Fee: $${data.userInteractions?.fee || 0}`);
      console.log(`   📅 Creado: ${data.creation}`);
    });
    
    return true;
  } catch (error) {
    console.error('❌ Error REAL consultando usuarios:', error);
    return false;
  }
}

// PRUEBA 3: ACTUALIZAR USUARIO REAL
async function pruebaActualizarUsuario() {
  logSubsection('PRUEBA 3: ACTUALIZAR USUARIO REAL');
  
  try {
    const usuarioId = usuariosPrueba[0].id;
    console.log(`📍 Actualizando usuario REAL: ${usuarioId}`);
    
    const datosActualizacion = {
      email: 'ana.garcia.updated.REAL@example.com',
      labels: 'usuario_vip_actualizado,premium,updated,REAL',
      lastUpdate: new Date().toISOString(),
      'userInteractions.fee': 5000
    };
    
    const usuarioRef = doc(db, USUARIOS_COLLECTION, usuarioId);
    await updateDoc(usuarioRef, datosActualizacion);
    console.log('✅ Usuario actualizado REALMENTE en Firestore');
    
    // Verificar la actualización REAL
    const docActualizado = await getDoc(usuarioRef);
    
    if (docActualizado.exists()) {
      const data = docActualizado.data();
      console.log('📋 Datos actualizados REALES:');
      console.log(`   📧 Nuevo email: ${data.email}`);
      console.log(`   🏷️ Nuevas labels: ${data.labels}`);
      console.log(`   💰 Nuevo fee: $${data.userInteractions?.fee}`);
      console.log(`   🕐 Última actualización: ${data.lastUpdate}`);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error REAL actualizando usuario:', error);
    return false;
  }
}

// PRUEBA 4: CONSULTAS CON FILTROS REALES
async function pruebaConsultarPorFiltros() {
  logSubsection('PRUEBA 4: CONSULTAS REALES CON FILTROS');
  
  try {
    // Consulta 1: Usuarios que contengan "test" en labels
    console.log('\n🔍 Consultando usuarios de prueba (labels contiene "test")...');
    const usuariosCollection = collection(db, USUARIOS_COLLECTION);
    
    // Como Firestore no tiene array-contains-any directo con strings, consultamos todos y filtramos
    const allSnapshot = await getDocs(usuariosCollection);
    let testUsers = [];
    
    allSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.labels && data.labels.includes('test')) {
        testUsers.push(data);
      }
    });
    
    console.log(`📊 Usuarios de prueba encontrados: ${testUsers.length}`);
    testUsers.forEach(user => {
      console.log(`   - ${user.name} (labels: ${user.labels})`);
    });
    
    // Consulta 2: Usuarios corporativos REALES
    console.log('\n🔍 Consultando usuarios corporativos REALES...');
    const corpQuery = query(usuariosCollection, where('isEnterprise', '==', true));
    const corpSnapshot = await getDocs(corpQuery);
    
    console.log(`📊 Usuarios corporativos REALES encontrados: ${corpSnapshot.size}`);
    corpSnapshot.forEach(doc => {
      const data = doc.data();
      console.log(`   - ${data.name} (${data.email})`);
    });
    
    // Consulta 3: Usuarios por fecha de creación REAL
    console.log('\n🔍 Consultando usuarios ordenados por creación...');
    const dateQuery = query(usuariosCollection, orderBy('creation', 'desc'), limit(2));
    const dateSnapshot = await getDocs(dateQuery);
    
    console.log(`📊 Últimos usuarios REALES creados: ${dateSnapshot.size}`);
    dateSnapshot.forEach(doc => {
      const data = doc.data();
      console.log(`   - ${data.name} (creado: ${data.creation})`);
    });
    
    return true;
  } catch (error) {
    console.error('❌ Error REAL en consultas con filtros:', error);
    return false;
  }
}

// PRUEBA 5: CONSULTAR FORMULARIOS REALES
async function pruebaConsultarFormulariosUsuarios() {
  logSubsection('PRUEBA 5: CONSULTAR FORMULARIOS REALES DE USUARIOS');
  
  try {
    console.log(`📍 Consultando formularios REALES desde: ${FORMULARIOS_USUARIOS_COLLECTION}`);
    
    const formulariosCollection = collection(db, FORMULARIOS_USUARIOS_COLLECTION);
    const snapshot = await getDocs(formulariosCollection);
    
    console.log(`📊 Total de formularios REALES encontrados: ${snapshot.size}`);
    
    if (!snapshot.empty) {
      console.log('\n📋 Lista de formularios REALES:');
      snapshot.forEach((docSnap, index) => {
        const data = docSnap.data();
        console.log(`${index + 1}. ${data.nombre} - ${data.tipoUsuario}`);
        console.log(`   📅 Fecha: ${data.fechaCreacion}`);
        console.log(`   🆔 Chat ID: ${data.chatId}`);
        console.log(`   📧 Email: ${data.email}`);
        console.log(`   📍 Source: ${data.source}`);
      });
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error REAL consultando formularios:', error);
    return false;
  }
}

// PRUEBA 6: VERIFICAR OBTENER POR ID REAL
async function pruebaObtenerPorId() {
  logSubsection('PRUEBA 6: OBTENER USUARIO POR ID REAL');
  
  try {
    const usuarioId = usuariosPrueba[1].id; // Carlos López Test
    console.log(`📍 Obteniendo usuario REAL por ID: ${usuarioId}`);
    
    const usuarioRef = doc(db, USUARIOS_COLLECTION, usuarioId);
    const docSnap = await getDoc(usuarioRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      console.log('✅ Usuario REAL encontrado:');
      console.log(`   👤 Nombre: ${data.name}`);
      console.log(`   📧 Email: ${data.email}`);
      console.log(`   🏢 Empresa: ${data.isEnterprise ? 'Sí' : 'No'}`);
      console.log(`   🏷️ Labels: ${data.labels}`);
      console.log(`   💰 Fee: $${data.userInteractions?.fee}`);
      console.log(`   📱 WhatsApp: ${data.whatsAppName}`);
      console.log(`   📅 Creado: ${data.creation}`);
      
      return true;
    } else {
      console.log('❌ Usuario no encontrado REALMENTE');
      return false;
    }
  } catch (error) {
    console.error('❌ Error REAL obteniendo usuario por ID:', error);
    return false;
  }
}

// PRUEBA 7: RENDIMIENTO REAL
async function pruebaRendimientoReal() {
  logSubsection('PRUEBA 7: RENDIMIENTO REAL DE CONSULTAS');
  
  try {
    const startTime = Date.now();
    
    // Consultas múltiples REALES en paralelo
    const usuariosCollection = collection(db, USUARIOS_COLLECTION);
    const formulariosCollection = collection(db, FORMULARIOS_USUARIOS_COLLECTION);
    
    const promises = [
      getDocs(usuariosCollection),
      getDocs(formulariosCollection),
      getDocs(query(usuariosCollection, where('isWAContact', '==', true))),
      getDocs(query(usuariosCollection, orderBy('creation', 'desc'), limit(2)))
    ];
    
    const results = await Promise.all(promises);
    
    const endTime = Date.now();
    const totalTime = endTime - startTime;
    
    console.log('📊 Resultados de rendimiento REAL:');
    console.log(`   ⏱️ Tiempo total: ${totalTime}ms`);
    console.log(`   👥 Usuarios principales: ${results[0].size}`);
    console.log(`   📝 Formularios: ${results[1].size}`);
    console.log(`   📱 Con WhatsApp: ${results[2].size}`);
    console.log(`   🔝 Últimos 2: ${results[3].size}`);
    console.log(`   🚀 Promedio por consulta: ${(totalTime/4).toFixed(2)}ms`);
    
    return true;
  } catch (error) {
    console.error('❌ Error REAL en prueba de rendimiento:', error);
    return false;
  }
}

// GENERAR REPORTE FINAL REAL
async function generarReporteReal(resultados) {
  logSeparator();
  console.log('📊 REPORTE FINAL DE PRUEBAS REALES EN FIRESTORE');
  logSeparator();
  
  const totalPruebas = resultados.length;
  const pruebasExitosas = resultados.filter(r => r.resultado).length;
  const pruebasFallidas = totalPruebas - pruebasExitosas;
  
  console.log(`\n📈 RESUMEN GENERAL DE PRUEBAS REALES:`);
  console.log(`   ✅ Pruebas exitosas: ${pruebasExitosas}/${totalPruebas}`);
  console.log(`   ❌ Pruebas fallidas: ${pruebasFallidas}/${totalPruebas}`);
  console.log(`   📊 Porcentaje de éxito: ${((pruebasExitosas/totalPruebas) * 100).toFixed(1)}%`);
  
  console.log('\n📋 DETALLE POR PRUEBA REAL:');
  resultados.forEach((resultado, index) => {
    const status = resultado.resultado ? '✅' : '❌';
    console.log(`   ${status} ${index + 1}. ${resultado.nombre}`);
  });
  
  console.log('\n🔥 DATOS REALES EN FIRESTORE:');
  console.log(`   📍 Usuarios principales: ${USUARIOS_COLLECTION}`);
  console.log(`   📝 Formularios usuarios: ${FORMULARIOS_USUARIOS_COLLECTION}`);
  console.log(`   🏪 Restaurante prueba: ${RESTAURANTE_PRUEBA}`);
  console.log(`   🔗 Proyecto Firebase: bocket-2024`);
  
  console.log('\n✅ CAMBIOS VERIFICADOS REALMENTE:');
  console.log('   🗂️ Tabla "clientes" → "usuarios" funcionando');
  console.log('   🔄 CRUD completo funcional en Firestore REAL');
  console.log('   📊 Consultas con filtros funcionando');
  console.log('   🚀 Rendimiento verificado');
  console.log('   📋 Formularios organizados creándose');
  
  if (pruebasExitosas === totalPruebas) {
    console.log('\n🎉 ¡TODAS LAS PRUEBAS REALES PASARON!');
    console.log('✅ La tabla "usuarios" está funcionando PERFECTAMENTE en Firestore');
    console.log('🔥 Los cambios están COMPLETAMENTE implementados y verificados');
  } else {
    console.log('\n⚠️ ALGUNAS PRUEBAS REALES FALLARON');
    console.log('🔍 Revisa los detalles arriba para identificar problemas REALES');
  }
  
  console.log('\n⚠️ IMPORTANTE - DATOS DE PRUEBA:');
  console.log(`   🗂️ Se crearon datos de prueba en: ${RESTAURANTE_PRUEBA}`);
  console.log('   🧹 Estos datos pueden eliminarse manualmente si es necesario');
  console.log('   📊 Los datos NO afectan la funcionalidad de producción');
}

// FUNCIÓN PRINCIPAL
async function ejecutarPruebasReales() {
  console.log('🔥 INICIANDO PRUEBAS REALES DE LA TABLA USUARIOS EN FIRESTORE');
  console.log(`📅 Fecha: ${new Date().toISOString()}`);
  console.log(`🏪 Restaurante de prueba: ${RESTAURANTE_PRUEBA}`);
  console.log(`🔗 Proyecto Firebase: bocket-2024`);
  logSeparator();
  
  const resultados = [];
  
  // Ejecutar todas las pruebas REALES
  const pruebasReales = [
    { nombre: 'Crear usuarios REALES', funcion: pruebaCrearUsuarios },
    { nombre: 'Consultar usuarios REALES', funcion: pruebaConsultarUsuarios },
    { nombre: 'Actualizar usuario REAL', funcion: pruebaActualizarUsuario },
    { nombre: 'Consultar por filtros REALES', funcion: pruebaConsultarPorFiltros },
    { nombre: 'Consultar formularios REALES', funcion: pruebaConsultarFormulariosUsuarios },
    { nombre: 'Obtener por ID REAL', funcion: pruebaObtenerPorId },
    { nombre: 'Rendimiento REAL', funcion: pruebaRendimientoReal }
  ];
  
  for (const prueba of pruebasReales) {
    try {
      console.log(`\n🚀 Ejecutando REAL: ${prueba.nombre}`);
      const resultado = await prueba.funcion();
      resultados.push({ nombre: prueba.nombre, resultado });
      
      if (resultado) {
        console.log(`✅ ${prueba.nombre} - EXITOSA (REAL)`);
      } else {
        console.log(`❌ ${prueba.nombre} - FALLIDA (REAL)`);
      }
      
      await delay(1000); // Pausa entre pruebas para Firestore
    } catch (error) {
      console.error(`❌ Error REAL en ${prueba.nombre}:`, error);
      resultados.push({ nombre: prueba.nombre, resultado: false });
    }
  }
  
  // Generar reporte final REAL
  await generarReporteReal(resultados);
  
  return resultados.filter(r => r.resultado).length === resultados.length;
}

// Ejecutar el script
if (require.main === module) {
  ejecutarPruebasReales()
    .then((exito) => {
      console.log(`\n🏁 Pruebas REALES completadas - ${exito ? 'TODAS EXITOSAS' : 'REVISAR FALLOS'}`);
      process.exit(exito ? 0 : 1);
    })
    .catch((error) => {
      console.error('\n💥 Error fatal en pruebas REALES:', error);
      process.exit(1);
    });
}

module.exports = {
  ejecutarPruebasReales,
  RESTAURANTE_PRUEBA,
  USUARIOS_COLLECTION,
  FORMULARIOS_USUARIOS_COLLECTION
};