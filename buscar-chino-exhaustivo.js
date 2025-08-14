#!/usr/bin/env node

/**
 * 🔍 BÚSQUEDA EXHAUSTIVA DEL RESTAURANTE "CHINO" 
 * 
 * Búsqueda más profunda en TODAS las posibles ubicaciones de Firestore
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, getDoc, getDocs, query, where, orderBy, limit } = require('firebase/firestore');

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyC54Ytk5wO2zupIuCtFIsIUNXvP4m9qqOk",
  authDomain: "bocket-2024.firebaseapp.com",
  projectId: "bocket-2024",
  storageBucket: "bocket-2024.appspot.com",
  messagingSenderId: "537532907057",
  appId: "1:537532907057:web:dc51aacd0553b9ac2edf10"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

function logSeparator() {
  console.log('\n' + '='.repeat(80));
}

// BUSCAR EN CLIENTS/CHINO DIRECTAMENTE
async function verificarClientChino() {
  console.log('\n🔍 VERIFICANDO /clients/chino DIRECTAMENTE');
  console.log('─'.repeat(50));
  
  try {
    // Verificar si existe el documento /clients/chino
    const chinoDoc = await getDoc(doc(db, 'clients/chino'));
    
    if (chinoDoc.exists()) {
      console.log('✅ ENCONTRADO: /clients/chino existe');
      console.log('📊 Datos del documento:', chinoDoc.data());
    } else {
      console.log('❌ /clients/chino NO existe');
    }
    
    // Verificar configuración del restaurante
    const configDoc = await getDoc(doc(db, 'clients/chino/configuracion/restaurante'));
    
    if (configDoc.exists()) {
      const configData = configDoc.data();
      console.log('✅ CONFIGURACIÓN ENCONTRADA:');
      console.log('   📍 Ruta: /clients/chino/configuracion/restaurante');
      console.log('   🏷️ Nombre:', configData.nombre || 'No especificado');
      console.log('   📧 Email:', configData.email || 'No especificado');
      console.log('   📱 Teléfono:', configData.telefono || 'No especificado');
      console.log('   🎨 Color primario:', configData.colorPrimario || 'No especificado');
      console.log('   🎨 Color secundario:', configData.colorSecundario || 'No especificado');
      console.log('   📅 Fecha creación:', configData.fechaCreacion || 'No especificado');
      return { ruta: '/clients/chino/configuracion/restaurante', data: configData };
    } else {
      console.log('❌ /clients/chino/configuracion/restaurante NO existe');
    }
    
    // Verificar subcolecciones en /clients/chino
    const subcolecciones = ['usuarios', 'clientes', 'pedidos', 'reservas', 'productos', 'formularios'];
    console.log('\n📁 Verificando subcolecciones en /clients/chino:');
    
    for (const subcoleccion of subcolecciones) {
      try {
        const subSnapshot = await getDocs(collection(db, `clients/chino/${subcoleccion}`));
        if (subSnapshot.size > 0) {
          console.log(`   ✅ ${subcoleccion}: ${subSnapshot.size} documentos`);
          
          // Mostrar algunos documentos de ejemplo
          if (subSnapshot.size <= 5) {
            subSnapshot.forEach((docSnap, index) => {
              const data = docSnap.data();
              console.log(`      ${index + 1}. ${docSnap.id}: ${data.nombre || data.name || 'Sin nombre'}`);
            });
          }
        } else {
          console.log(`   ❌ ${subcoleccion}: 0 documentos`);
        }
      } catch (subError) {
        console.log(`   ❌ ${subcoleccion}: Error accediendo (${subError.message})`);
      }
    }
    
    return null;
  } catch (error) {
    console.error('❌ Error verificando /clients/chino:', error);
    return null;
  }
}

// BUSCAR EN TODAS LAS VARIACIONES DE "CHINO"
async function buscarVariacionesChino() {
  console.log('\n🔍 BUSCANDO VARIACIONES DE "CHINO"');
  console.log('─'.repeat(50));
  
  const variaciones = [
    'chino', 'china', 'restaurante-chino', 'restaurantechino', 
    'chino-restaurant', 'china-restaurant', 'comida-china',
    'food-china', 'dragon-chino', 'jardin-chino'
  ];
  
  const resultados = [];
  
  for (const variacion of variaciones) {
    try {
      console.log(`\n🔍 Verificando variación: "${variacion}"`);
      
      // Verificar en /clients/{variacion}
      const configDoc = await getDoc(doc(db, `clients/${variacion}/configuracion/restaurante`));
      
      if (configDoc.exists()) {
        const configData = configDoc.data();
        console.log(`✅ ENCONTRADO: /clients/${variacion}/configuracion/restaurante`);
        console.log('   🏷️ Nombre:', configData.nombre || 'No especificado');
        console.log('   📧 Email:', configData.email || 'No especificado');
        
        resultados.push({
          variacion: variacion,
          ruta: `/clients/${variacion}/configuracion/restaurante`,
          data: configData
        });
      } else {
        console.log(`❌ No existe: /clients/${variacion}`);
      }
    } catch (error) {
      console.log(`❌ Error con "${variacion}":`, error.message);
    }
  }
  
  return resultados;
}

// BUSCAR EN FORMULARIOS CON DIFERENTES QUERIES
async function buscarEnFormulariosDetallado() {
  console.log('\n🔍 BÚSQUEDA DETALLADA EN FORMULARIOS');
  console.log('─'.repeat(50));
  
  try {
    const formulariosCollection = collection(db, 'clients/worldfood/Formularios');
    
    // Obtener TODOS los formularios sin filtros
    const allSnapshot = await getDocs(formulariosCollection);
    console.log(`📊 Total de formularios en worldfood: ${allSnapshot.size}`);
    
    const resultados = [];
    let contador = 0;
    
    allSnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const docId = docSnap.id;
      
      // Buscar en TODOS los campos de texto posibles
      const camposBusqueda = [
        data.nombre, data.email, data.telefono, data.direccion,
        data.restauranteId, data.restauranteNombre, data.nombreRestaurante,
        data.tipoNegocio, data.descripcion, data.slug, data.chatId,
        docId
      ];
      
      const coincidencias = [];
      
      camposBusqueda.forEach((campo, index) => {
        if (campo && typeof campo === 'string' && campo.toLowerCase().includes('chin')) {
          const nombreCampo = ['nombre', 'email', 'telefono', 'direccion', 'restauranteId', 'restauranteNombre', 'nombreRestaurante', 'tipoNegocio', 'descripcion', 'slug', 'chatId', 'documentId'][index];
          coincidencias.push(`${nombreCampo}: ${campo}`);
        }
      });
      
      if (coincidencias.length > 0) {
        contador++;
        console.log(`\n✅ RESULTADO ${contador}:`);
        console.log(`   📍 Ruta: /clients/worldfood/Formularios/${docId}`);
        console.log(`   📝 Tipo: ${data.typeForm || 'No especificado'}`);
        console.log(`   🎯 Coincidencias:`);
        coincidencias.forEach(coincidencia => {
          console.log(`      - ${coincidencia}`);
        });
        
        // Mostrar todos los campos relevantes
        console.log(`   📋 Datos completos:`);
        if (data.nombre) console.log(`      Nombre: ${data.nombre}`);
        if (data.email) console.log(`      Email: ${data.email}`);
        if (data.telefono) console.log(`      Teléfono: ${data.telefono}`);
        if (data.restauranteId) console.log(`      Restaurante ID: ${data.restauranteId}`);
        if (data.timestamp) console.log(`      Fecha: ${new Date(data.timestamp).toISOString()}`);
        
        resultados.push({
          ruta: `/clients/worldfood/Formularios/${docId}`,
          data: data,
          coincidencias: coincidencias
        });
      }
    });
    
    if (resultados.length === 0) {
      console.log('❌ No se encontraron formularios con "chin*"');
    }
    
    return resultados;
  } catch (error) {
    console.error('❌ Error en búsqueda detallada de formularios:', error);
    return [];
  }
}

// BUSCAR EN USUARIOS ADMIN MÁS DETALLADO
async function buscarAdminDetallado() {
  console.log('\n🔍 BÚSQUEDA DETALLADA EN ADMIN USERS');
  console.log('─'.repeat(50));
  
  try {
    const adminSnapshot = await getDocs(collection(db, 'adminUsers'));
    console.log(`📊 Total de usuarios admin: ${adminSnapshot.size}`);
    
    const resultados = [];
    let contador = 0;
    
    adminSnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const docId = docSnap.id;
      
      // Buscar "chin" en todos los campos
      const camposBusqueda = [
        data.nombre, data.email, data.restauranteId, 
        data.restauranteAsignado, data.displayName, docId
      ];
      
      const coincidencias = [];
      
      camposBusqueda.forEach((campo, index) => {
        if (campo && typeof campo === 'string' && campo.toLowerCase().includes('chin')) {
          const nombreCampo = ['nombre', 'email', 'restauranteId', 'restauranteAsignado', 'displayName', 'uid'][index];
          coincidencias.push(`${nombreCampo}: ${campo}`);
        }
      });
      
      if (coincidencias.length > 0) {
        contador++;
        console.log(`\n✅ ADMIN ${contador}:`);
        console.log(`   📍 Ruta: /adminUsers/${docId}`);
        console.log(`   🎯 Coincidencias:`);
        coincidencias.forEach(coincidencia => {
          console.log(`      - ${coincidencia}`);
        });
        
        console.log(`   📋 Datos completos:`);
        console.log(`      UID: ${docId}`);
        console.log(`      Nombre: ${data.nombre || 'No especificado'}`);
        console.log(`      Email: ${data.email || 'No especificado'}`);
        console.log(`      Restaurante ID: ${data.restauranteId || 'No especificado'}`);
        console.log(`      Restaurante Asignado: ${data.restauranteAsignado || 'No especificado'}`);
        console.log(`      Rol: ${data.rol || 'No especificado'}`);
        console.log(`      Activo: ${data.activo ? 'Sí' : 'No'}`);
        
        resultados.push({
          ruta: `/adminUsers/${docId}`,
          data: data,
          coincidencias: coincidencias
        });
      }
    });
    
    return resultados;
  } catch (error) {
    console.error('❌ Error en búsqueda detallada de admin:', error);
    return [];
  }
}

// VERIFICAR ESTRUCTURA ESPECÍFICA PARA CHINO
async function verificarEstructuraEspecifica() {
  console.log('\n🔍 VERIFICANDO ESTRUCTURA ESPECÍFICA PARA CHINO');
  console.log('─'.repeat(50));
  
  const rutasEspecificas = [
    'clients/chino',
    'clients/chino/configuracion',
    'clients/chino/configuracion/restaurante',
    'clients/chino/usuarios',
    'clients/chino/clientes',
    'clients/chino/pedidos',
    'clients/chino/reservas',
    'clients/chino/productos',
    'clients/chino/formularios',
    'clients/china',
    'clients/restaurante-chino',
    'restaurantes/chino',
    'restaurantes/rest_chino_024808'
  ];
  
  const resultados = [];
  
  for (const ruta of rutasEspecificas) {
    try {
      console.log(`\n🔍 Verificando: ${ruta}`);
      
      if (ruta.includes('/')) {
        // Es una ruta de documento
        const docRef = doc(db, ruta);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          console.log(`✅ EXISTE: ${ruta}`);
          const data = docSnap.data();
          console.log('   📋 Datos:', JSON.stringify(data, null, 2));
          
          resultados.push({
            ruta: ruta,
            tipo: 'documento',
            data: data
          });
        } else {
          console.log(`❌ NO EXISTE: ${ruta}`);
        }
      } else {
        // Es una colección
        const collectionRef = collection(db, ruta);
        const snapshot = await getDocs(collectionRef);
        
        if (snapshot.size > 0) {
          console.log(`✅ COLECCIÓN EXISTE: ${ruta} (${snapshot.size} documentos)`);
          
          resultados.push({
            ruta: ruta,
            tipo: 'coleccion',
            documentos: snapshot.size
          });
        } else {
          console.log(`❌ COLECCIÓN VACÍA O NO EXISTE: ${ruta}`);
        }
      }
    } catch (error) {
      console.log(`❌ ERROR verificando ${ruta}:`, error.message);
    }
  }
  
  return resultados;
}

// FUNCIÓN PRINCIPAL
async function busquedaExhaustiva() {
  console.log('🔍 BÚSQUEDA EXHAUSTIVA DEL RESTAURANTE "CHINO"');
  console.log(`📅 Fecha: ${new Date().toISOString()}`);
  logSeparator();
  
  try {
    const resultados = {
      clientChino: await verificarClientChino(),
      variaciones: await buscarVariacionesChino(),
      formularios: await buscarEnFormulariosDetallado(),
      admin: await buscarAdminDetallado(),
      estructura: await verificarEstructuraEspecifica()
    };
    
    // REPORTE FINAL
    logSeparator();
    console.log('📊 REPORTE FINAL EXHAUSTIVO');
    logSeparator();
    
    let totalEncontrados = 0;
    
    if (resultados.clientChino) {
      totalEncontrados++;
      console.log('✅ ENCONTRADO en /clients/chino');
    }
    
    if (resultados.variaciones.length > 0) {
      totalEncontrados += resultados.variaciones.length;
      console.log(`✅ ENCONTRADO ${resultados.variaciones.length} variaciones en /clients`);
    }
    
    if (resultados.formularios.length > 0) {
      totalEncontrados += resultados.formularios.length;
      console.log(`✅ ENCONTRADO ${resultados.formularios.length} formularios`);
    }
    
    if (resultados.admin.length > 0) {
      totalEncontrados += resultados.admin.length;
      console.log(`✅ ENCONTRADO ${resultados.admin.length} usuarios admin`);
    }
    
    if (resultados.estructura.length > 0) {
      totalEncontrados += resultados.estructura.length;
      console.log(`✅ ENCONTRADO ${resultados.estructura.length} estructuras específicas`);
    }
    
    console.log(`\n🎯 TOTAL DE RESULTADOS VÁLIDOS: ${totalEncontrados}`);
    
    if (totalEncontrados === 0) {
      console.log('\n❌ NO SE ENCONTRÓ EL RESTAURANTE "CHINO" EN NINGUNA UBICACIÓN');
      console.log('💡 POSIBLES CAUSAS:');
      console.log('   1. El restaurante no ha sido creado aún');
      console.log('   2. Se usa un nombre diferente (verificar con variaciones)');
      console.log('   3. Está en una estructura no contemplada');
      console.log('   4. Problemas de permisos en Firestore');
    } else {
      console.log('\n✅ RESTAURANTE "CHINO" ENCONTRADO EXITOSAMENTE');
      console.log('📍 Revisa los detalles arriba para las rutas exactas');
    }
    
    return totalEncontrados > 0;
    
  } catch (error) {
    console.error('\n💥 Error en búsqueda exhaustiva:', error);
    return false;
  }
}

// Ejecutar el script
if (require.main === module) {
  busquedaExhaustiva()
    .then((exito) => {
      console.log(`\n🏁 Búsqueda exhaustiva ${exito ? 'EXITOSA' : 'SIN RESULTADOS'}`);
      process.exit(exito ? 0 : 1);
    })
    .catch((error) => {
      console.error('\n💥 Error ejecutando búsqueda exhaustiva:', error);
      process.exit(1);
    });
}

module.exports = { busquedaExhaustiva };