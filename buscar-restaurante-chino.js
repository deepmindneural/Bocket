#!/usr/bin/env node

/**
 * 🔍 SCRIPT PARA BUSCAR RESTAURANTE "CHINO" EN TODAS LAS RUTAS DE FIRESTORE
 * 
 * Este script busca REALMENTE en todas las estructuras donde puede estar
 * almacenado un restaurante llamado "chino".
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
  console.log(`🔍 ${title}`);
  console.log(`${'─'.repeat(60)}`);
}

// BUSCAR EN ESTRUCTURA ANTIGUA (/restaurantes)
async function buscarEnRestaurantesAntiguos() {
  logSubsection('BUSCANDO "CHINO" EN /restaurantes');
  
  try {
    const restaurantesCollection = collection(db, 'restaurantes');
    const snapshot = await getDocs(restaurantesCollection);
    
    console.log(`📊 Total de documentos en /restaurantes: ${snapshot.size}`);
    
    const resultados = [];
    
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const docId = docSnap.id;
      const nombre = data.nombre || '';
      const slug = data.slug || '';
      
      // Buscar "chino" en diferentes campos
      if (nombre.toLowerCase().includes('chino') || 
          slug.toLowerCase().includes('chino') ||
          docId.toLowerCase().includes('chino')) {
        
        const resultado = {
          ruta: `/restaurantes/${docId}`,
          documentId: docId,
          estructura: 'antigua',
          data: data,
          campoCoincidencia: []
        };
        
        if (nombre.toLowerCase().includes('chino')) resultado.campoCoincidencia.push('nombre');
        if (slug.toLowerCase().includes('chino')) resultado.campoCoincidencia.push('slug');
        if (docId.toLowerCase().includes('chino')) resultado.campoCoincidencia.push('documentId');
        
        resultados.push(resultado);
        
        console.log(`✅ ENCONTRADO en estructura antigua:`);
        console.log(`   📍 Ruta: /restaurantes/${docId}`);
        console.log(`   🆔 ID: ${docId}`);
        console.log(`   🏷️ Nombre: ${nombre}`);
        console.log(`   🔗 Slug: ${slug}`);
        console.log(`   📧 Email: ${data.email || 'No especificado'}`);
        console.log(`   📱 Teléfono: ${data.telefono || 'No especificado'}`);
        console.log(`   ✅ Activo: ${data.activo ? 'Sí' : 'No'}`);
        console.log(`   🎯 Coincidencia en: ${resultado.campoCoincidencia.join(', ')}`);
      }
    });
    
    if (resultados.length === 0) {
      console.log('❌ No se encontró "chino" en estructura antigua');
    }
    
    return resultados;
  } catch (error) {
    console.error('❌ Error buscando en restaurantes antiguos:', error);
    return [];
  }
}

// BUSCAR EN USUARIOS ADMIN (/adminUsers)
async function buscarEnUsuariosAdmin() {
  logSubsection('BUSCANDO "CHINO" EN /adminUsers');
  
  try {
    const adminUsersCollection = collection(db, 'adminUsers');
    const snapshot = await getDocs(adminUsersCollection);
    
    console.log(`📊 Total de usuarios admin: ${snapshot.size}`);
    
    const resultados = [];
    
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const docId = docSnap.id;
      const nombre = data.nombre || '';
      const email = data.email || '';
      const restauranteId = data.restauranteId || '';
      const restauranteAsignado = data.restauranteAsignado || '';
      
      // Buscar "chino" en diferentes campos
      if (nombre.toLowerCase().includes('chino') || 
          email.toLowerCase().includes('chino') ||
          restauranteId.toLowerCase().includes('chino') ||
          restauranteAsignado.toLowerCase().includes('chino')) {
        
        const resultado = {
          ruta: `/adminUsers/${docId}`,
          documentId: docId,
          estructura: 'admin',
          data: data,
          campoCoincidencia: []
        };
        
        if (nombre.toLowerCase().includes('chino')) resultado.campoCoincidencia.push('nombre');
        if (email.toLowerCase().includes('chino')) resultado.campoCoincidencia.push('email');
        if (restauranteId.toLowerCase().includes('chino')) resultado.campoCoincidencia.push('restauranteId');
        if (restauranteAsignado.toLowerCase().includes('chino')) resultado.campoCoincidencia.push('restauranteAsignado');
        
        resultados.push(resultado);
        
        console.log(`✅ ENCONTRADO en usuarios admin:`);
        console.log(`   📍 Ruta: /adminUsers/${docId}`);
        console.log(`   🆔 UID: ${docId}`);
        console.log(`   👤 Nombre: ${nombre}`);
        console.log(`   📧 Email: ${email}`);
        console.log(`   🏪 Restaurante ID: ${restauranteId}`);
        console.log(`   🏪 Restaurante Asignado: ${restauranteAsignado}`);
        console.log(`   👤 Rol: ${data.rol || 'No especificado'}`);
        console.log(`   🎯 Coincidencia en: ${resultado.campoCoincidencia.join(', ')}`);
      }
    });
    
    if (resultados.length === 0) {
      console.log('❌ No se encontró "chino" en usuarios admin');
    }
    
    return resultados;
  } catch (error) {
    console.error('❌ Error buscando en usuarios admin:', error);
    return [];
  }
}

// BUSCAR EN ESTRUCTURA CLIENTS (/clients)
async function buscarEnEstructuraClients() {
  logSubsection('BUSCANDO "CHINO" EN /clients');
  
  try {
    const clientsCollection = collection(db, 'clients');
    const snapshot = await getDocs(clientsCollection);
    
    console.log(`📊 Total de documentos en /clients: ${snapshot.size}`);
    
    const resultados = [];
    
    for (const docSnap of snapshot.docs) {
      const restauranteNombre = docSnap.id;
      
      // Verificar si el nombre del restaurante contiene "chino"
      if (restauranteNombre.toLowerCase().includes('chino')) {
        console.log(`✅ ENCONTRADO nombre de cliente/restaurante: ${restauranteNombre}`);
        
        try {
          // Verificar si existe configuración de restaurante
          const configDoc = await getDoc(doc(db, `clients/${restauranteNombre}/configuracion/restaurante`));
          
          const resultado = {
            ruta: `/clients/${restauranteNombre}`,
            documentId: restauranteNombre,
            estructura: 'clients',
            data: null,
            configuracion: null,
            campoCoincidencia: ['nombre_cliente']
          };
          
          if (configDoc.exists()) {
            const configData = configDoc.data();
            resultado.configuracion = configData;
            resultado.ruta = `/clients/${restauranteNombre}/configuracion/restaurante`;
            
            console.log(`   📍 Ruta: /clients/${restauranteNombre}`);
            console.log(`   📋 Configuración encontrada:`);
            console.log(`      🏷️ Nombre: ${configData.nombre || 'No especificado'}`);
            console.log(`      📧 Email: ${configData.email || 'No especificado'}`);
            console.log(`      📱 Teléfono: ${configData.telefono || 'No especificado'}`);
            console.log(`      🎨 Color primario: ${configData.colorPrimario || 'No especificado'}`);
            console.log(`      🎨 Color secundario: ${configData.colorSecundario || 'No especificado'}`);
          } else {
            console.log(`   ⚠️ Sin configuración de restaurante`);
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
          
          resultados.push(resultado);
          
        } catch (error) {
          console.log(`   ❌ Error consultando ${restauranteNombre}:`, error.message);
        }
      }
    }
    
    if (resultados.length === 0) {
      console.log('❌ No se encontró "chino" en estructura clients');
    }
    
    return resultados;
  } catch (error) {
    console.error('❌ Error buscando en estructura clients:', error);
    return [];
  }
}

// BUSCAR EN FORMULARIOS WORLDFOOD (/clients/worldfood/Formularios)
async function buscarEnFormulariosWorldfood() {
  logSubsection('BUSCANDO "CHINO" EN /clients/worldfood/Formularios');
  
  try {
    const formulariosCollection = collection(db, 'clients/worldfood/Formularios');
    const snapshot = await getDocs(formulariosCollection);
    
    console.log(`📊 Total de formularios en worldfood: ${snapshot.size}`);
    
    const resultados = [];
    
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const docId = docSnap.id;
      const nombre = data.nombre || '';
      const restauranteId = data.restauranteId || '';
      const typeForm = data.typeForm || '';
      
      // Buscar "chino" en diferentes campos
      if (nombre.toLowerCase().includes('chino') || 
          restauranteId.toLowerCase().includes('chino') ||
          docId.toLowerCase().includes('chino')) {
        
        const resultado = {
          ruta: `/clients/worldfood/Formularios/${docId}`,
          documentId: docId,
          estructura: 'worldfood',
          data: data,
          campoCoincidencia: []
        };
        
        if (nombre.toLowerCase().includes('chino')) resultado.campoCoincidencia.push('nombre');
        if (restauranteId.toLowerCase().includes('chino')) resultado.campoCoincidencia.push('restauranteId');
        if (docId.toLowerCase().includes('chino')) resultado.campoCoincidencia.push('documentId');
        
        resultados.push(resultado);
        
        console.log(`✅ ENCONTRADO en formularios worldfood:`);
        console.log(`   📍 Ruta: /clients/worldfood/Formularios/${docId}`);
        console.log(`   🆔 Document ID: ${docId}`);
        console.log(`   📝 Tipo de formulario: ${typeForm}`);
        console.log(`   🏷️ Nombre: ${nombre}`);
        console.log(`   🏪 Restaurante ID: ${restauranteId}`);
        console.log(`   📧 Email: ${data.email || 'No especificado'}`);
        console.log(`   📱 Teléfono: ${data.telefono || 'No especificado'}`);
        console.log(`   🎨 Color primario: ${data.colorPrimario || 'No especificado'}`);
        console.log(`   📅 Timestamp: ${data.timestamp ? new Date(data.timestamp).toISOString() : 'No especificado'}`);
        console.log(`   🎯 Coincidencia en: ${resultado.campoCoincidencia.join(', ')}`);
      }
    });
    
    if (resultados.length === 0) {
      console.log('❌ No se encontró "chino" en formularios worldfood');
    }
    
    return resultados;
  } catch (error) {
    console.error('❌ Error buscando en formularios worldfood:', error);
    return [];
  }
}

// BUSCAR EN TODAS LAS ESTRUCTURAS CLIENTS QUE CONTENGAN "CHINO" EN LA CONFIGURACIÓN
async function buscarEnConfiguracionesClients() {
  logSubsection('BUSCANDO "CHINO" EN CONFIGURACIONES DE CLIENTS');
  
  try {
    const clientsCollection = collection(db, 'clients');
    const snapshot = await getDocs(clientsCollection);
    
    console.log(`📊 Revisando configuraciones en ${snapshot.size} clients...`);
    
    const resultados = [];
    
    for (const docSnap of snapshot.docs) {
      const restauranteNombre = docSnap.id;
      
      try {
        // Verificar configuración de restaurante
        const configDoc = await getDoc(doc(db, `clients/${restauranteNombre}/configuracion/restaurante`));
        
        if (configDoc.exists()) {
          const configData = configDoc.data();
          const nombre = configData.nombre || '';
          const email = configData.email || '';
          const telefono = configData.telefono || '';
          
          // Buscar "chino" en los campos de configuración
          if (nombre.toLowerCase().includes('chino') || 
              email.toLowerCase().includes('chino') ||
              telefono.toLowerCase().includes('chino')) {
            
            const resultado = {
              ruta: `/clients/${restauranteNombre}/configuracion/restaurante`,
              documentId: restauranteNombre,
              estructura: 'clients_config',
              data: configData,
              campoCoincidencia: []
            };
            
            if (nombre.toLowerCase().includes('chino')) resultado.campoCoincidencia.push('nombre');
            if (email.toLowerCase().includes('chino')) resultado.campoCoincidencia.push('email');
            if (telefono.toLowerCase().includes('chino')) resultado.campoCoincidencia.push('telefono');
            
            resultados.push(resultado);
            
            console.log(`✅ ENCONTRADO en configuración de client:`);
            console.log(`   📍 Ruta: /clients/${restauranteNombre}/configuracion/restaurante`);
            console.log(`   🏪 Cliente: ${restauranteNombre}`);
            console.log(`   🏷️ Nombre: ${nombre}`);
            console.log(`   📧 Email: ${email}`);
            console.log(`   📱 Teléfono: ${telefono}`);
            console.log(`   🎨 Color primario: ${configData.colorPrimario || 'No especificado'}`);
            console.log(`   🎨 Color secundario: ${configData.colorSecundario || 'No especificado'}`);
            console.log(`   🎯 Coincidencia en: ${resultado.campoCoincidencia.join(', ')}`);
          }
        }
      } catch (error) {
        // Error accediendo a configuración específica
      }
    }
    
    if (resultados.length === 0) {
      console.log('❌ No se encontró "chino" en configuraciones de clients');
    }
    
    return resultados;
  } catch (error) {
    console.error('❌ Error buscando en configuraciones clients:', error);
    return [];
  }
}

// GENERAR REPORTE CONSOLIDADO
async function generarReporteConsolidado(resultados) {
  logSeparator();
  console.log('📊 REPORTE CONSOLIDADO DE BÚSQUEDA "CHINO"');
  logSeparator();
  
  const totalResultados = resultados.flat().length;
  
  if (totalResultados === 0) {
    console.log('❌ NO SE ENCONTRÓ NINGÚN RESTAURANTE "CHINO" EN LA BASE DE DATOS');
    console.log('\n💡 SUGERENCIAS:');
    console.log('   1. Verificar que el restaurante haya sido creado correctamente');
    console.log('   2. Revisar si se usa un nombre diferente (ej: "restaurante chino", "china", etc.)');
    console.log('   3. Verificar permisos de acceso a Firestore');
    console.log('   4. Confirmar que se esté buscando en el proyecto correcto');
    return;
  }
  
  console.log(`✅ TOTAL DE RESULTADOS ENCONTRADOS: ${totalResultados}`);
  
  console.log('\n📋 RESUMEN POR ESTRUCTURA:');
  const estructuraAntigua = resultados[0] || [];
  const usuariosAdmin = resultados[1] || [];
  const estructuraClients = resultados[2] || [];
  const formulariosWorldfood = resultados[3] || [];
  const configuracionesClients = resultados[4] || [];
  
  console.log(`   🏛️ Estructura antigua (/restaurantes): ${estructuraAntigua.length}`);
  console.log(`   👥 Usuarios admin (/adminUsers): ${usuariosAdmin.length}`);
  console.log(`   🏢 Estructura clients (/clients): ${estructuraClients.length}`);
  console.log(`   📝 Formularios worldfood: ${formulariosWorldfood.length}`);
  console.log(`   ⚙️ Configuraciones clients: ${configuracionesClients.length}`);
  
  console.log('\n🎯 RUTAS EXACTAS DONDE SE ENCONTRÓ "CHINO":');
  const todasLasRutas = resultados.flat();
  todasLasRutas.forEach((resultado, index) => {
    console.log(`${index + 1}. ${resultado.ruta}`);
    console.log(`   📁 Estructura: ${resultado.estructura}`);
    console.log(`   🎯 Coincidencia: ${resultado.campoCoincidencia.join(', ')}`);
    if (resultado.data && resultado.data.nombre) {
      console.log(`   🏷️ Nombre: ${resultado.data.nombre}`);
    }
  });
  
  console.log('\n✅ RESTAURANTE "CHINO" LOCALIZADO EXITOSAMENTE');
  console.log('💡 Usa las rutas exactas mostradas arriba para acceder a los datos');
}

// FUNCIÓN PRINCIPAL
async function buscarRestauranteChino() {
  console.log('🔍 BUSCANDO RESTAURANTE "CHINO" EN TODAS LAS ESTRUCTURAS DE FIRESTORE');
  console.log(`📅 Fecha: ${new Date().toISOString()}`);
  console.log(`🔗 Proyecto Firebase: bocket-2024`);
  logSeparator();
  
  try {
    console.log('🚀 Iniciando búsqueda completa de "chino"...');
    
    // Ejecutar todas las búsquedas
    const [
      estructuraAntigua, 
      usuariosAdmin, 
      estructuraClients, 
      formulariosWorldfood,
      configuracionesClients
    ] = await Promise.all([
      buscarEnRestaurantesAntiguos(),
      buscarEnUsuariosAdmin(),
      buscarEnEstructuraClients(),
      buscarEnFormulariosWorldfood(),
      buscarEnConfiguracionesClients()
    ]);
    
    // Generar reporte consolidado
    await generarReporteConsolidado([
      estructuraAntigua, 
      usuariosAdmin, 
      estructuraClients, 
      formulariosWorldfood,
      configuracionesClients
    ]);
    
    console.log('\n🏁 Búsqueda de restaurante "chino" completada');
    return true;
    
  } catch (error) {
    console.error('\n💥 Error fatal buscando restaurante "chino":', error);
    return false;
  }
}

// Ejecutar el script
if (require.main === module) {
  buscarRestauranteChino()
    .then((exito) => {
      console.log(`\n🎯 Búsqueda ${exito ? 'EXITOSA' : 'CON ERRORES'}`);
      process.exit(exito ? 0 : 1);
    })
    .catch((error) => {
      console.error('\n💥 Error ejecutando búsqueda:', error);
      process.exit(1);
    });
}

module.exports = { buscarRestauranteChino };