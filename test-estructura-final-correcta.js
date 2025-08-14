#!/usr/bin/env node

/**
 * 🧪 PRUEBAS DE ESTRUCTURA FINAL CORRECTA
 * 
 * Estructura FINAL que respeta Firestore (número PAR de segmentos):
 * /clients/{restaurante}/
 * ├── configuracion/data          
 * ├── clientes/{id}              
 * ├── pedidos/{id}               
 * ├── reservas/{id}              
 * └── formularios/               ← Carpeta de formularios organizados
 *     ├── usuarios/datos/{id}    ← Formularios de usuarios (6 segmentos ✅)
 *     ├── pedidos/datos/{id}     ← Formularios de pedidos (6 segmentos ✅)
 *     └── reservas/datos/{id}    ← Formularios de reservas (6 segmentos ✅)
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, setDoc, getDoc, getDocs, updateDoc, deleteDoc, query, where } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyBqU2CtmJhVrOZ9Js6I6RcWKLNKZTT6DLk",
  authDomain: "wpp-8ad15.firebaseapp.com",
  projectId: "wpp-8ad15",
  storageBucket: "wpp-8ad15.appspot.com",
  messagingSenderId: "236014245562",
  appId: "1:236014245562:web:7af88c32e10d05b1b9e2f3",
  measurementId: "G-2XSH7RDE1Y"
};

// Datos de prueba
const restaurantePrueba = {
  nombre: 'test-estructura-final',
  slug: 'test-estructura-final',
  id: 'rest_final_' + Date.now()
};

let testResults = {
  configuracion: { passed: 0, failed: 0, errors: [] },
  clientes: { passed: 0, failed: 0, errors: [] },
  pedidos: { passed: 0, failed: 0, errors: [] },
  reservas: { passed: 0, failed: 0, errors: [] },
  formulariosFinales: { passed: 0, failed: 0, errors: [] }
};

async function probarEstructuraFinalCorrecta() {
  try {
    console.log('🧪 INICIANDO PRUEBAS DE ESTRUCTURA FINAL CORRECTA');
    console.log('='.repeat(80));
    console.log('📝 ESTRUCTURA FINAL CORRECTA (Compatible con Firestore):');
    console.log('   /clients/{restaurante}/');
    console.log('   ├── configuracion/{id}         ← Al mismo nivel que los otros');
    console.log('   ├── clientes/{id}');
    console.log('   ├── pedidos/{id}');
    console.log('   ├── reservas/{id}');
    console.log('   └── formularios/               ← Carpeta de formularios organizados');
    console.log('       ├── usuarios/datos/{id}    ← Formularios de usuarios (6 segmentos ✅)');
    console.log('       ├── pedidos/datos/{id}     ← Formularios de pedidos (6 segmentos ✅)');
    console.log('       └── reservas/datos/{id}    ← Formularios de reservas (6 segmentos ✅)');
    console.log(`🏪 Restaurante de prueba: ${restaurantePrueba.nombre}`);
    
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    // PASO 1: Probar configuración
    console.log('\n📋 PASO 1: PRUEBAS DE CONFIGURACIÓN');
    console.log('-'.repeat(60));
    await probarConfiguracion(db);

    // PASO 2: Probar módulos principales
    console.log('\n📋 PASO 2: PRUEBAS DE MÓDULOS PRINCIPALES');
    console.log('-'.repeat(60));
    await probarModuloClientes(db);
    await probarModuloPedidos(db);
    await probarModuloReservas(db);

    // PASO 3: Probar formularios en estructura final
    console.log('\n📋 PASO 3: PRUEBAS DE FORMULARIOS ESTRUCTURA FINAL');
    console.log('-'.repeat(60));
    await probarFormulariosEstructuraFinal(db);

    // PASO 4: Crear estructura completa en Firestore
    console.log('\n📋 PASO 4: CREANDO ESTRUCTURA COMPLETA EN FIRESTORE');
    console.log('-'.repeat(60));
    await crearEstructuraCompletaFirestore(db);

    // PASO 5: Limpiar datos de prueba
    console.log('\n📋 PASO 5: LIMPIANDO DATOS DE PRUEBA');
    console.log('-'.repeat(60));
    await limpiarDatosPrueba(db);

    // Mostrar reporte final
    mostrarReporteResultados();

  } catch (error) {
    console.error('\n💥 ERROR EN LAS PRUEBAS:', error.message);
    console.error('Stack:', error.stack);
  }
}

async function probarConfiguracion(db) {
  try {
    const configData = {
      nombre: restaurantePrueba.nombre,
      slug: restaurantePrueba.slug,
      restauranteId: restaurantePrueba.id,
      email: 'test@test.com',
      telefono: '123456789',
      activo: true,
      fechaCreacion: new Date().toISOString()
    };

    // CREAR configuración: /clients/{restaurante}/configuracion/{id}
    const configRef = doc(db, `clients/${restaurantePrueba.slug}/configuracion/restaurante`);
    await setDoc(configRef, configData);
    console.log('   ✅ CREAR configuración: Exitoso');
    testResults.configuracion.passed++;

    // LEER configuración
    const configDoc = await getDoc(configRef);
    if (configDoc.exists() && configDoc.data().nombre === restaurantePrueba.nombre) {
      console.log('   ✅ LEER configuración: Exitoso');
      testResults.configuracion.passed++;
    } else {
      throw new Error('Configuración no encontrada o datos incorrectos');
    }

    // ACTUALIZAR configuración
    await updateDoc(configRef, {
      telefono: '987654321',
      fechaActualizacion: new Date().toISOString()
    });
    
    const configUpdated = await getDoc(configRef);
    if (configUpdated.exists() && configUpdated.data().telefono === '987654321') {
      console.log('   ✅ ACTUALIZAR configuración: Exitoso');
      testResults.configuracion.passed++;
    } else {
      throw new Error('Actualización de configuración falló');
    }

  } catch (error) {
    console.log(`   ❌ Error en configuración: ${error.message}`);
    testResults.configuracion.failed++;
    testResults.configuracion.errors.push(error.message);
  }
}

async function probarModuloClientes(db) {
  try {
    const clienteData = {
      id: 'cliente_test_' + Date.now(),
      nombre: 'Cliente de Prueba',
      email: 'cliente@test.com',
      activo: true,
      fechaCreacion: new Date().toISOString()
    };

    // CREAR cliente: /clients/{restaurante}/clientes/{id}
    const clienteRef = doc(db, `clients/${restaurantePrueba.slug}/clientes/${clienteData.id}`);
    await setDoc(clienteRef, clienteData);
    console.log('   ✅ CREAR cliente: Exitoso');
    testResults.clientes.passed++;

    // LEER cliente
    const clienteDoc = await getDoc(clienteRef);
    if (clienteDoc.exists() && clienteDoc.data().nombre === clienteData.nombre) {
      console.log('   ✅ LEER cliente: Exitoso');
      testResults.clientes.passed++;
    }

    // LISTAR clientes
    const clientesRef = collection(db, `clients/${restaurantePrueba.slug}/clientes`);
    const clientesSnapshot = await getDocs(clientesRef);
    if (clientesSnapshot.size >= 1) {
      console.log(`   ✅ LISTAR clientes: Exitoso (${clientesSnapshot.size} encontrados)`);
      testResults.clientes.passed++;
    }

  } catch (error) {
    console.log(`   ❌ Error en clientes: ${error.message}`);
    testResults.clientes.failed++;
    testResults.clientes.errors.push(error.message);
  }
}

async function probarModuloPedidos(db) {
  try {
    const pedidoData = {
      id: 'pedido_test_' + Date.now(),
      contact: '123456789',
      contactNameOrder: 'Cliente Pedido Test',
      resumeOrder: 'Hamburguesa con papas',
      statusBooking: 'pending',
      fechaCreacion: new Date().toISOString()
    };

    // CREAR pedido: /clients/{restaurante}/pedidos/{id}
    const pedidoRef = doc(db, `clients/${restaurantePrueba.slug}/pedidos/${pedidoData.id}`);
    await setDoc(pedidoRef, pedidoData);
    console.log('   ✅ CREAR pedido: Exitoso');
    testResults.pedidos.passed++;

    // LEER pedido
    const pedidoDoc = await getDoc(pedidoRef);
    if (pedidoDoc.exists() && pedidoDoc.data().contactNameOrder === pedidoData.contactNameOrder) {
      console.log('   ✅ LEER pedido: Exitoso');
      testResults.pedidos.passed++;
    }

    // CONSULTAR por estado
    const pedidosRef = collection(db, `clients/${restaurantePrueba.slug}/pedidos`);
    const queryEstado = query(pedidosRef, where('statusBooking', '==', 'pending'));
    const querySnapshot = await getDocs(queryEstado);
    if (querySnapshot.size >= 1) {
      console.log('   ✅ CONSULTAR pedidos por estado: Exitoso');
      testResults.pedidos.passed++;
    }

  } catch (error) {
    console.log(`   ❌ Error en pedidos: ${error.message}`);
    testResults.pedidos.failed++;
    testResults.pedidos.errors.push(error.message);
  }
}

async function probarModuloReservas(db) {
  try {
    const reservaData = {
      id: 'reserva_test_' + Date.now(),
      contact: '123456789',
      contactNameBooking: 'Cliente Reserva Test',
      peopleBooking: '4',
      statusBooking: 'pending',
      fechaCreacion: new Date().toISOString()
    };

    // CREAR reserva: /clients/{restaurante}/reservas/{id}
    const reservaRef = doc(db, `clients/${restaurantePrueba.slug}/reservas/${reservaData.id}`);
    await setDoc(reservaRef, reservaData);
    console.log('   ✅ CREAR reserva: Exitoso');
    testResults.reservas.passed++;

    // LEER reserva
    const reservaDoc = await getDoc(reservaRef);
    if (reservaDoc.exists() && reservaDoc.data().contactNameBooking === reservaData.contactNameBooking) {
      console.log('   ✅ LEER reserva: Exitoso');
      testResults.reservas.passed++;
    }

    // CONSULTAR por estado
    const reservasRef = collection(db, `clients/${restaurantePrueba.slug}/reservas`);
    const queryEstado = query(reservasRef, where('statusBooking', '==', 'pending'));
    const querySnapshot = await getDocs(queryEstado);
    if (querySnapshot.size >= 1) {
      console.log('   ✅ CONSULTAR reservas por estado: Exitoso');
      testResults.reservas.passed++;
    }

  } catch (error) {
    console.log(`   ❌ Error en reservas: ${error.message}`);
    testResults.reservas.failed++;
    testResults.reservas.errors.push(error.message);
  }
}

async function probarFormulariosEstructuraFinal(db) {
  try {
    const timestamp = Date.now();
    
    // 1. FORMULARIO DE USUARIOS: /clients/{restaurante}/formularios/usuarios/datos/{id}
    const formularioUsuario = {
      id: `${timestamp}_formulario_usuario`,
      tipoFormulario: 'usuarios',
      restauranteSlug: restaurantePrueba.slug,
      restauranteId: restaurantePrueba.id,
      chatId: 'test_chat_usuarios_123',
      nombre: 'Usuario Formulario Test',
      email: 'usuario@test.com',
      telefono: '123456789',
      fechaCreacion: new Date().toISOString()
    };

    const usuarioRef = doc(db, `clients/${restaurantePrueba.slug}/formularios/usuarios/datos/${formularioUsuario.id}`);
    await setDoc(usuarioRef, formularioUsuario);
    console.log('   ✅ CREAR formulario USUARIOS: Exitoso (/formularios/usuarios/datos/)');
    testResults.formulariosFinales.passed++;

    // 2. FORMULARIO DE PEDIDOS: /clients/{restaurante}/formularios/pedidos/datos/{id}
    const formularioPedido = {
      id: `${timestamp}_formulario_pedido`,
      tipoFormulario: 'pedidos',
      restauranteSlug: restaurantePrueba.slug,
      restauranteId: restaurantePrueba.id,
      chatId: 'test_chat_pedidos_456',
      nombreCliente: 'Cliente Pedido Formulario',
      descripcionPedido: 'Pizza grande',
      tipoPedido: 'Delivery',
      fechaCreacion: new Date().toISOString()
    };

    const pedidoFormRef = doc(db, `clients/${restaurantePrueba.slug}/formularios/pedidos/datos/${formularioPedido.id}`);
    await setDoc(pedidoFormRef, formularioPedido);
    console.log('   ✅ CREAR formulario PEDIDOS: Exitoso (/formularios/pedidos/datos/)');
    testResults.formulariosFinales.passed++;

    // 3. FORMULARIO DE RESERVAS: /clients/{restaurante}/formularios/reservas/datos/{id}
    const formularioReserva = {
      id: `${timestamp}_formulario_reserva`,
      tipoFormulario: 'reservas',
      restauranteSlug: restaurantePrueba.slug,
      restauranteId: restaurantePrueba.id,
      chatId: 'test_chat_reservas_789',
      nombreCliente: 'Cliente Reserva Formulario',
      numeroPersonas: '6',
      fechaHora: '2025-08-15 19:00',
      fechaCreacion: new Date().toISOString()
    };

    const reservaFormRef = doc(db, `clients/${restaurantePrueba.slug}/formularios/reservas/datos/${formularioReserva.id}`);
    await setDoc(reservaFormRef, formularioReserva);
    console.log('   ✅ CREAR formulario RESERVAS: Exitoso (/formularios/reservas/datos/)');
    testResults.formulariosFinales.passed++;

    // 4. LISTAR cada tipo de formulario
    const tiposFormularios = ['usuarios', 'pedidos', 'reservas'];
    
    for (const tipo of tiposFormularios) {
      const formulariosRef = collection(db, `clients/${restaurantePrueba.slug}/formularios/${tipo}/datos`);
      const snapshot = await getDocs(formulariosRef);
      if (snapshot.size >= 1) {
        console.log(`   ✅ LISTAR formularios/${tipo}/datos: Exitoso (${snapshot.size} encontrados)`);
        testResults.formulariosFinales.passed++;
      } else {
        throw new Error(`No se encontraron formularios en /formularios/${tipo}/datos`);
      }
    }

    // 5. CONSULTAR formularios por restaurante
    const formulariosPedidosRef = collection(db, `clients/${restaurantePrueba.slug}/formularios/pedidos/datos`);
    const queryRestaurante = query(formulariosPedidosRef, where('restauranteId', '==', restaurantePrueba.id));
    const querySnapshot = await getDocs(queryRestaurante);
    
    if (querySnapshot.size >= 1) {
      console.log('   ✅ CONSULTAR formularios por restaurante: Exitoso');
      testResults.formulariosFinales.passed++;
    } else {
      throw new Error('Consulta por restaurante falló');
    }

    // 6. LEER formularios individuales
    const usuarioDoc = await getDoc(usuarioRef);
    const pedidoDoc = await getDoc(pedidoFormRef);
    const reservaDoc = await getDoc(reservaFormRef);
    
    if (usuarioDoc.exists() && pedidoDoc.exists() && reservaDoc.exists()) {
      console.log('   ✅ LEER formularios individuales: Exitoso');
      testResults.formulariosFinales.passed++;
    } else {
      throw new Error('No se pudieron leer todos los formularios');
    }

  } catch (error) {
    console.log(`   ❌ Error en formularios estructura final: ${error.message}`);
    testResults.formulariosFinales.failed++;
    testResults.formulariosFinales.errors.push(error.message);
  }
}

async function crearEstructuraCompletaFirestore(db) {
  try {
    console.log('🏗️ Creando estructura completa en Firestore...');
    
    // Crear restaurantes reales con la estructura final
    const restaurantesDemo = [
      { nombre: 'carnes1', slug: 'carnes1', id: 'rest_carnes1_final' },
      { nombre: 'pizzamia', slug: 'pizzamia', id: 'rest_pizzamia_final' },
      { nombre: 'sushizen', slug: 'sushizen', id: 'rest_sushizen_final' }
    ];

    for (const restaurante of restaurantesDemo) {
      console.log(`   🏪 Creando estructura FINAL para: ${restaurante.nombre}`);
      
      // 1. Configuración
      const configRef = doc(db, `clients/${restaurante.slug}/configuracion/restaurante`);
      await setDoc(configRef, {
        nombre: restaurante.nombre,
        slug: restaurante.slug,
        restauranteId: restaurante.id,
        activo: true,
        telefono: '+57 300 123 4567',
        email: `info@${restaurante.slug}.com`,
        fechaCreacion: new Date().toISOString()
      });
      
      // 2. Cliente ejemplo
      const clienteRef = doc(db, `clients/${restaurante.slug}/clientes/cliente_demo_001`);
      await setDoc(clienteRef, {
        id: 'cliente_demo_001',
        nombre: `Cliente Demo ${restaurante.nombre}`,
        email: `cliente@${restaurante.slug}.com`,
        activo: true,
        fechaCreacion: new Date().toISOString()
      });
      
      // 3. Pedido ejemplo
      const pedidoRef = doc(db, `clients/${restaurante.slug}/pedidos/pedido_demo_001`);
      await setDoc(pedidoRef, {
        id: 'pedido_demo_001',
        contactNameOrder: `Cliente ${restaurante.nombre}`,
        resumeOrder: 'Pedido de demostración',
        statusBooking: 'pending',
        fechaCreacion: new Date().toISOString()
      });
      
      // 4. Reserva ejemplo
      const reservaRef = doc(db, `clients/${restaurante.slug}/reservas/reserva_demo_001`);
      await setDoc(reservaRef, {
        id: 'reserva_demo_001',
        contactNameBooking: `Cliente ${restaurante.nombre}`,
        peopleBooking: '4',
        statusBooking: 'pending',
        fechaCreacion: new Date().toISOString()
      });
      
      // 5. Formularios organizados con estructura FINAL
      const formUsuarioRef = doc(db, `clients/${restaurante.slug}/formularios/usuarios/datos/form_usuario_demo_001`);
      await setDoc(formUsuarioRef, {
        id: 'form_usuario_demo_001',
        tipoFormulario: 'usuarios',
        restauranteSlug: restaurante.slug,
        restauranteId: restaurante.id,
        nombre: `Usuario Demo ${restaurante.nombre}`,
        email: `usuario@${restaurante.slug}.com`,
        fechaCreacion: new Date().toISOString()
      });
      
      const formPedidoRef = doc(db, `clients/${restaurante.slug}/formularios/pedidos/datos/form_pedido_demo_001`);
      await setDoc(formPedidoRef, {
        id: 'form_pedido_demo_001',
        tipoFormulario: 'pedidos',
        restauranteSlug: restaurante.slug,
        restauranteId: restaurante.id,
        nombreCliente: `Cliente Pedido ${restaurante.nombre}`,
        descripcionPedido: 'Formulario de pedido demo',
        fechaCreacion: new Date().toISOString()
      });
      
      const formReservaRef = doc(db, `clients/${restaurante.slug}/formularios/reservas/datos/form_reserva_demo_001`);
      await setDoc(formReservaRef, {
        id: 'form_reserva_demo_001',
        tipoFormulario: 'reservas',
        restauranteSlug: restaurante.slug,
        restauranteId: restaurante.id,
        nombreCliente: `Cliente Reserva ${restaurante.nombre}`,
        numeroPersonas: '6',
        fechaCreacion: new Date().toISOString()
      });
      
      console.log(`   ✅ Estructura FINAL completa creada para: ${restaurante.nombre}`);
    }
    
    console.log('🎉 ¡Estructura FINAL completa creada en Firestore!');
    console.log('📋 Verifica en Firebase Console las rutas:');
    restaurantesDemo.forEach(rest => {
      console.log(`   🔗 /clients/${rest.slug}/`);
      console.log(`      ├── configuracion/`);
      console.log(`      ├── clientes/`);
      console.log(`      ├── pedidos/`);
      console.log(`      ├── reservas/`);
      console.log(`      └── formularios/`);
      console.log(`          ├── usuarios/datos/`);
      console.log(`          ├── pedidos/datos/`);
      console.log(`          └── reservas/datos/`);
    });

  } catch (error) {
    console.log(`❌ Error creando estructura completa: ${error.message}`);
  }
}

async function limpiarDatosPrueba(db) {
  try {
    console.log('🧹 Eliminando datos de prueba...');
    
    // Solo limpiar datos del restaurante de prueba
    const coleccionesPrincipales = ['configuracion', 'clientes', 'pedidos', 'reservas'];
    for (const coleccion of coleccionesPrincipales) {
      if (coleccion === 'configuracion') {
        const ref = doc(db, `clients/${restaurantePrueba.slug}/${coleccion}/restaurante`);
        await deleteDoc(ref);
        console.log(`   ✅ ${coleccion} eliminada`);
      } else {
        const ref = collection(db, `clients/${restaurantePrueba.slug}/${coleccion}`);
        const snapshot = await getDocs(ref);
        for (const docSnapshot of snapshot.docs) {
          await deleteDoc(doc(db, `clients/${restaurantePrueba.slug}/${coleccion}`, docSnapshot.id));
        }
        console.log(`   ✅ ${coleccion} eliminados (${snapshot.size} documentos)`);
      }
    }

    // Limpiar formularios con estructura final
    const tiposFormularios = ['usuarios', 'pedidos', 'reservas'];
    for (const tipo of tiposFormularios) {
      const ref = collection(db, `clients/${restaurantePrueba.slug}/formularios/${tipo}/datos`);
      const snapshot = await getDocs(ref);
      for (const docSnapshot of snapshot.docs) {
        await deleteDoc(doc(db, `clients/${restaurantePrueba.slug}/formularios/${tipo}/datos`, docSnapshot.id));
      }
      console.log(`   ✅ formularios/${tipo}/datos eliminados (${snapshot.size} documentos)`);
    }

    console.log('✅ Limpieza de datos de prueba completada');
    console.log('ℹ️ Los datos de demostración se mantienen para verificación');

  } catch (error) {
    console.log(`❌ Error en limpieza: ${error.message}`);
  }
}

function mostrarReporteResultados() {
  console.log('\n📊 REPORTE FINAL - ESTRUCTURA FINAL CORRECTA');
  console.log('='.repeat(80));
  
  const modulos = ['configuracion', 'clientes', 'pedidos', 'reservas', 'formulariosFinales'];
  let totalPassed = 0;
  let totalFailed = 0;
  
  modulos.forEach(modulo => {
    const result = testResults[modulo];
    totalPassed += result.passed;
    totalFailed += result.failed;
    
    const status = result.failed === 0 ? '✅' : '❌';
    console.log(`${status} ${modulo.toUpperCase()}: ${result.passed} exitosas, ${result.failed} fallidas`);
    
    if (result.errors.length > 0) {
      result.errors.forEach(error => {
        console.log(`   💥 Error: ${error}`);
      });
    }
  });
  
  console.log('\n📈 RESUMEN TOTAL:');
  console.log(`✅ Pruebas exitosas: ${totalPassed}`);
  console.log(`❌ Pruebas fallidas: ${totalFailed}`);
  console.log(`📊 Tasa de éxito: ${totalFailed === 0 ? '100.00' : ((totalPassed / (totalFailed + totalPassed)) * 100).toFixed(2)}%`);
  
  if (totalFailed === 0) {
    console.log('\n🎉 ¡TODAS LAS PRUEBAS PASARON!');
    console.log('✅ La ESTRUCTURA FINAL CORRECTA funciona perfectamente');
    console.log('🚀 Es seguro proceder con la actualización de todos los servicios');
    
    console.log('\n📋 ESTRUCTURA FINAL IMPLEMENTADA Y VALIDADA:');
    console.log('   📂 /clients/{restaurante}/configuracion/{id} → CONFIGURACIÓN');
    console.log('   📂 /clients/{restaurante}/clientes/{id} → DATOS DE CLIENTES');
    console.log('   📂 /clients/{restaurante}/pedidos/{id} → DATOS DE PEDIDOS');
    console.log('   📂 /clients/{restaurante}/reservas/{id} → DATOS DE RESERVAS');
    console.log('   📂 /clients/{restaurante}/formularios/usuarios/datos/{id} → FORMULARIOS USUARIOS');
    console.log('   📂 /clients/{restaurante}/formularios/pedidos/datos/{id} → FORMULARIOS PEDIDOS');
    console.log('   📂 /clients/{restaurante}/formularios/reservas/datos/{id} → FORMULARIOS RESERVAS');
    
    console.log('\n🎯 PRÓXIMOS PASOS:');
    console.log('   1. Actualizar todos los servicios Angular para usar estructura final');
    console.log('   2. Migrar datos de /clients/worldfood/Formularios a nuevas rutas');
    console.log('   3. Verificar funcionamiento completo del sistema');
    console.log('   4. Ejecutar pruebas finales');
    
  } else {
    console.log('\n⚠️ ALGUNAS PRUEBAS FALLARON');
    console.log('🔧 Revisar y corregir los errores antes de continuar');
  }
}

// Ejecutar pruebas
probarEstructuraFinalCorrecta();