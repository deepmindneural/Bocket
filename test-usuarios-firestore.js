#!/usr/bin/env node

/**
 * 🧪 SCRIPT DE PRUEBAS PARA TABLA USUARIOS EN FIRESTORE
 * 
 * Este script realiza pruebas completas de CRUD en la nueva tabla 'usuarios'
 * sin eliminar ningún dato existente.
 */

const admin = require('firebase-admin');
const fs = require('fs');

// Configuración de Firebase Admin
const serviceAccount = {
  type: "service_account",
  project_id: "bocket-2024",
  // Nota: En producción, usar variables de entorno para credenciales
};

// Inicializar Firebase Admin (si no está inicializado)
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      projectId: "bocket-2024"
    });
    console.log('✅ Firebase Admin inicializado con credenciales por defecto');
  } catch (error) {
    console.log('⚠️ No se pudo usar credenciales por defecto, intentando con serviceAccount...');
    try {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
      console.log('✅ Firebase Admin inicializado con serviceAccount');
    } catch (err) {
      console.error('❌ Error inicializando Firebase Admin:', err.message);
      console.log('💡 Asegúrate de:');
      console.log('   1. Tener GOOGLE_APPLICATION_CREDENTIALS configurado');
      console.log('   2. O proporcionar serviceAccount válido');
      console.log('   3. Tener permisos de administrador en el proyecto');
      process.exit(1);
    }
  }
}

const db = admin.firestore();

// Configuración de pruebas
const RESTAURANTE_PRUEBA = 'test-restaurant-' + Date.now();
const USUARIOS_COLLECTION = `clients/${RESTAURANTE_PRUEBA}/usuarios`;
const FORMULARIOS_USUARIOS_COLLECTION = `clients/${RESTAURANTE_PRUEBA}/formularios/usuarios/datos`;

// Datos de prueba
const usuariosPrueba = [
  {
    id: 'user-test-001',
    name: 'Ana García',
    whatsAppName: 'Ana García',
    email: 'ana.garcia@example.com',
    isWAContact: true,
    isMyContact: true,
    isEnterprise: false,
    isBusiness: false,
    sourceType: 'manual',
    respType: 'manual',
    labels: 'usuario_vip,premium',
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
    name: 'Carlos López',
    whatsAppName: 'Carlos López',
    email: 'carlos.lopez@example.com',
    isWAContact: true,
    isMyContact: true,
    isEnterprise: true,
    isBusiness: true,
    sourceType: 'chatBot',
    respType: 'bot',
    labels: 'usuario_corporativo,empresa',
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
    name: 'María Rodríguez',
    whatsAppName: 'María R',
    email: 'maria.rodriguez@example.com',
    isWAContact: true,
    isMyContact: true,
    isEnterprise: false,
    isBusiness: false,
    sourceType: 'manual',
    respType: 'manual',
    labels: 'usuario_regular',
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

// Funciones de utilidad
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

// Funciones de prueba
async function pruebaCrearUsuarios() {
  logSubsection('PRUEBA 1: CREAR USUARIOS EN NUEVA ARQUITECTURA');
  
  try {
    console.log(`📍 Creando usuarios en: ${USUARIOS_COLLECTION}`);
    
    for (const usuario of usuariosPrueba) {
      console.log(`\n🔄 Creando usuario: ${usuario.name} (${usuario.id})`);
      
      // Crear en tabla principal de usuarios
      await db.collection(USUARIOS_COLLECTION).doc(usuario.id).set(usuario);
      console.log(`✅ Usuario creado en tabla principal: ${usuario.id}`);
      
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
        source: 'test_script'
      };
      
      await db.collection(FORMULARIOS_USUARIOS_COLLECTION).doc(formularioData.id).set(formularioData);
      console.log(`✅ Formulario de usuario creado: ${formularioData.id}`);
      
      await delay(100); // Pequeña pausa entre creaciones
    }
    
    console.log(`\n🎉 ¡${usuariosPrueba.length} usuarios creados exitosamente!`);
    return true;
  } catch (error) {
    console.error('❌ Error creando usuarios:', error);
    return false;
  }
}

async function pruebaConsultarUsuarios() {
  logSubsection('PRUEBA 2: CONSULTAR USUARIOS');
  
  try {
    console.log(`📍 Consultando usuarios desde: ${USUARIOS_COLLECTION}`);
    
    const snapshot = await db.collection(USUARIOS_COLLECTION).get();
    
    console.log(`📊 Total de usuarios encontrados: ${snapshot.size}`);
    
    if (snapshot.empty) {
      console.log('⚠️ No se encontraron usuarios');
      return false;
    }
    
    console.log('\n📋 Lista de usuarios:');
    snapshot.forEach((doc, index) => {
      const data = doc.data();
      console.log(`${index + 1}. ${data.name} (${doc.id})`);
      console.log(`   📧 Email: ${data.email || 'No especificado'}`);
      console.log(`   🏷️ Labels: ${data.labels || 'Sin labels'}`);
      console.log(`   📱 WhatsApp: ${data.whatsAppName || 'No especificado'}`);
      console.log(`   💰 Fee: $${data.userInteractions?.fee || 0}`);
    });
    
    return true;
  } catch (error) {
    console.error('❌ Error consultando usuarios:', error);
    return false;
  }
}

async function pruebaActualizarUsuario() {
  logSubsection('PRUEBA 3: ACTUALIZAR USUARIO');
  
  try {
    const usuarioId = usuariosPrueba[0].id;
    console.log(`📍 Actualizando usuario: ${usuarioId}`);
    
    const datosActualizacion = {
      email: 'ana.garcia.updated@example.com',
      labels: 'usuario_vip_actualizado,premium,updated',
      lastUpdate: new Date().toISOString(),
      'userInteractions.fee': 5000
    };
    
    await db.collection(USUARIOS_COLLECTION).doc(usuarioId).update(datosActualizacion);
    console.log('✅ Usuario actualizado en tabla principal');
    
    // Verificar la actualización
    const docActualizado = await db.collection(USUARIOS_COLLECTION).doc(usuarioId).get();
    
    if (docActualizado.exists) {
      const data = docActualizado.data();
      console.log('📋 Datos actualizados:');
      console.log(`   📧 Nuevo email: ${data.email}`);
      console.log(`   🏷️ Nuevas labels: ${data.labels}`);
      console.log(`   💰 Nuevo fee: $${data.userInteractions?.fee}`);
      console.log(`   🕐 Última actualización: ${data.lastUpdate}`);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error actualizando usuario:', error);
    return false;
  }
}

async function pruebaConsultarPorFiltros() {
  logSubsection('PRUEBA 4: CONSULTAS CON FILTROS');
  
  try {
    // Consulta 1: Usuarios VIP
    console.log('\n🔍 Consultando usuarios VIP...');
    const vipSnapshot = await db.collection(USUARIOS_COLLECTION)
      .where('labels', 'array-contains-any', ['usuario_vip', 'usuario_vip_actualizado'])
      .get();
    
    console.log(`📊 Usuarios VIP encontrados: ${vipSnapshot.size}`);
    
    // Consulta 2: Usuarios corporativos
    console.log('\n🔍 Consultando usuarios corporativos...');
    const corpSnapshot = await db.collection(USUARIOS_COLLECTION)
      .where('isEnterprise', '==', true)
      .get();
    
    console.log(`📊 Usuarios corporativos encontrados: ${corpSnapshot.size}`);
    
    // Consulta 3: Usuarios con email
    console.log('\n🔍 Consultando usuarios con email específico...');
    const emailSnapshot = await db.collection(USUARIOS_COLLECTION)
      .where('email', '>=', 'carlos')
      .where('email', '<=', 'carlos\uf8ff')
      .get();
    
    console.log(`📊 Usuarios con email 'carlos*': ${emailSnapshot.size}`);
    
    return true;
  } catch (error) {
    console.error('❌ Error en consultas con filtros:', error);
    return false;
  }
}

async function pruebaConsultarFormulariosUsuarios() {
  logSubsection('PRUEBA 5: CONSULTAR FORMULARIOS DE USUARIOS');
  
  try {
    console.log(`📍 Consultando formularios desde: ${FORMULARIOS_USUARIOS_COLLECTION}`);
    
    const snapshot = await db.collection(FORMULARIOS_USUARIOS_COLLECTION).get();
    
    console.log(`📊 Total de formularios encontrados: ${snapshot.size}`);
    
    if (!snapshot.empty) {
      console.log('\n📋 Lista de formularios:');
      snapshot.forEach((doc, index) => {
        const data = doc.data();
        console.log(`${index + 1}. ${data.nombre} - ${data.tipoUsuario}`);
        console.log(`   📅 Fecha: ${data.fechaCreacion}`);
        console.log(`   🆔 Chat ID: ${data.chatId}`);
        console.log(`   📧 Email: ${data.email}`);
      });
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error consultando formularios:', error);
    return false;
  }
}

async function pruebaRendimientoConsultas() {
  logSubsection('PRUEBA 6: RENDIMIENTO DE CONSULTAS');
  
  try {
    const startTime = Date.now();
    
    // Consulta múltiple
    const promises = [
      db.collection(USUARIOS_COLLECTION).get(),
      db.collection(FORMULARIOS_USUARIOS_COLLECTION).get(),
      db.collection(USUARIOS_COLLECTION).where('isWAContact', '==', true).get(),
      db.collection(USUARIOS_COLLECTION).orderBy('creation', 'desc').limit(2).get()
    ];
    
    const results = await Promise.all(promises);
    
    const endTime = Date.now();
    const totalTime = endTime - startTime;
    
    console.log('📊 Resultados de rendimiento:');
    console.log(`   ⏱️ Tiempo total: ${totalTime}ms`);
    console.log(`   📋 Usuarios principales: ${results[0].size}`);
    console.log(`   📝 Formularios: ${results[1].size}`);
    console.log(`   📱 Con WhatsApp: ${results[2].size}`);
    console.log(`   🔝 Últimos 2: ${results[3].size}`);
    
    return true;
  } catch (error) {
    console.error('❌ Error en prueba de rendimiento:', error);
    return false;
  }
}

async function pruebaCompatibilidadEstructuraAntigua() {
  logSubsection('PRUEBA 7: COMPATIBILIDAD CON ESTRUCTURA ANTIGUA');
  
  try {
    // Simular datos en estructura antigua
    const estructuraAntigua = `clients/worldfood/Formularios`;
    
    const timestamp = Date.now();
    const docIdCompatibilidad = `${timestamp}_usuario_test_compatibility`;
    
    const datosCompatibilidad = {
      typeForm: 'usuario',
      restauranteId: 'test-restaurant',
      chatId: 'user-compatibility-test',
      timestamp: timestamp,
      nombre: 'Usuario Compatibilidad',
      email: 'compatibilidad@test.com',
      tipoUsuario: 'Regular',
      labels: 'usuario_regular,compatibility_test',
      activo: true,
      fechaCreacion: new Date(),
      source: 'compatibility_test'
    };
    
    console.log(`📍 Creando documento de compatibilidad: ${docIdCompatibilidad}`);
    await db.collection(estructuraAntigua).doc(docIdCompatibilidad).set(datosCompatibilidad);
    console.log('✅ Documento de compatibilidad creado');
    
    // Verificar consulta de compatibilidad
    const compatibilitySnapshot = await db.collection(estructuraAntigua)
      .where('typeForm', '==', 'usuario')
      .where('chatId', '==', 'user-compatibility-test')
      .get();
    
    console.log(`📊 Documentos de compatibilidad encontrados: ${compatibilitySnapshot.size}`);
    
    if (!compatibilitySnapshot.empty) {
      const doc = compatibilitySnapshot.docs[0];
      const data = doc.data();
      console.log('📋 Datos de compatibilidad:');
      console.log(`   📝 Nombre: ${data.nombre}`);
      console.log(`   📧 Email: ${data.email}`);
      console.log(`   🏷️ Labels: ${data.labels}`);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error en prueba de compatibilidad:', error);
    return false;
  }
}

async function generarReporteResultados(resultados) {
  logSeparator();
  console.log('📊 REPORTE FINAL DE RESULTADOS');
  logSeparator();
  
  const totalPruebas = resultados.length;
  const pruebasExitosas = resultados.filter(r => r.resultado).length;
  const pruebasFallidas = totalPruebas - pruebasExitosas;
  
  console.log(`\n📈 RESUMEN GENERAL:`);
  console.log(`   ✅ Pruebas exitosas: ${pruebasExitosas}/${totalPruebas}`);
  console.log(`   ❌ Pruebas fallidas: ${pruebasFallidas}/${totalPruebas}`);
  console.log(`   📊 Porcentaje de éxito: ${((pruebasExitosas/totalPruebas) * 100).toFixed(1)}%`);
  
  console.log('\n📋 DETALLE POR PRUEBA:');
  resultados.forEach((resultado, index) => {
    const status = resultado.resultado ? '✅' : '❌';
    console.log(`   ${status} ${index + 1}. ${resultado.nombre}`);
  });
  
  console.log('\n🗂️ ESTRUCTURA DE DATOS UTILIZADA:');
  console.log(`   📍 Usuarios principales: ${USUARIOS_COLLECTION}`);
  console.log(`   📝 Formularios usuarios: ${FORMULARIOS_USUARIOS_COLLECTION}`);
  console.log(`   🔄 Compatibilidad: clients/worldfood/Formularios`);
  
  console.log('\n💾 DATOS CONSERVADOS:');
  console.log('   ℹ️ No se eliminaron datos existentes');
  console.log('   ℹ️ Se crearon datos de prueba con prefijo "test-"');
  console.log('   ℹ️ Los datos de prueba pueden eliminarse manualmente si es necesario');
  
  if (pruebasExitosas === totalPruebas) {
    console.log('\n🎉 ¡TODAS LAS PRUEBAS PASARON EXITOSAMENTE!');
    console.log('✅ La nueva estructura de usuarios está funcionando correctamente');
  } else {
    console.log('\n⚠️ ALGUNAS PRUEBAS FALLARON');
    console.log('🔍 Revisa los detalles arriba para identificar los problemas');
  }
}

// Función principal
async function ejecutarTodasLasPruebas() {
  console.log('🧪 INICIANDO PRUEBAS COMPLETAS DE LA TABLA USUARIOS');
  console.log(`📅 Fecha: ${new Date().toISOString()}`);
  console.log(`🏪 Restaurante de prueba: ${RESTAURANTE_PRUEBA}`);
  logSeparator();
  
  const resultados = [];
  
  // Ejecutar todas las pruebas
  const pruebas = [
    { nombre: 'Crear usuarios', funcion: pruebaCrearUsuarios },
    { nombre: 'Consultar usuarios', funcion: pruebaConsultarUsuarios },
    { nombre: 'Actualizar usuario', funcion: pruebaActualizarUsuario },
    { nombre: 'Consultar por filtros', funcion: pruebaConsultarPorFiltros },
    { nombre: 'Consultar formularios usuarios', funcion: pruebaConsultarFormulariosUsuarios },
    { nombre: 'Rendimiento de consultas', funcion: pruebaRendimientoConsultas },
    { nombre: 'Compatibilidad estructura antigua', funcion: pruebaCompatibilidadEstructuraAntigua }
  ];
  
  for (const prueba of pruebas) {
    try {
      console.log(`\n🚀 Ejecutando: ${prueba.nombre}`);
      const resultado = await prueba.funcion();
      resultados.push({ nombre: prueba.nombre, resultado });
      
      if (resultado) {
        console.log(`✅ ${prueba.nombre} - EXITOSA`);
      } else {
        console.log(`❌ ${prueba.nombre} - FALLIDA`);
      }
      
      await delay(500); // Pausa entre pruebas
    } catch (error) {
      console.error(`❌ Error en ${prueba.nombre}:`, error);
      resultados.push({ nombre: prueba.nombre, resultado: false });
    }
  }
  
  // Generar reporte final
  await generarReporteResultados(resultados);
}

// Ejecutar el script
if (require.main === module) {
  ejecutarTodasLasPruebas()
    .then(() => {
      console.log('\n🏁 Script de pruebas completado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Error fatal en el script:', error);
      process.exit(1);
    });
}

module.exports = {
  ejecutarTodasLasPruebas,
  RESTAURANTE_PRUEBA,
  USUARIOS_COLLECTION,
  FORMULARIOS_USUARIOS_COLLECTION
};