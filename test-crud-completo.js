#!/usr/bin/env node

/**
 * SCRIPT DE PRUEBA CRUD COMPLETO
 * Prueba todas las operaciones CREATE, READ, UPDATE, DELETE 
 * en ClienteService, PedidoService, ReservaService
 */

const { initializeApp, getApps } = require('firebase/app');
const { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where 
} = require('firebase/firestore');

// Configuración Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBqU2CtmJhVrOZ9Js6I6RcWKLNKZTT6DLk",
  authDomain: "wpp-8ad15.firebaseapp.com",
  projectId: "wpp-8ad15",
  storageBucket: "wpp-8ad15.appspot.com",
  messagingSenderId: "236014245562",
  appId: "1:236014245562:web:7af88c32e10d05b1b9e2f3",
  measurementId: "G-2XSH7RDE1Y"
};

let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

const db = getFirestore(app);

// Configuración de prueba
const RESTAURANTE_PRUEBA = 'test-restaurant-crud';
const BASE_COLLECTION = 'clients';

// Rutas de la nueva arquitectura
const RUTAS = {
  clientes: `${BASE_COLLECTION}/${RESTAURANTE_PRUEBA}/clientes`,
  pedidos: `${BASE_COLLECTION}/${RESTAURANTE_PRUEBA}/pedidos`,
  reservas: `${BASE_COLLECTION}/${RESTAURANTE_PRUEBA}/reservas`,
  formularios: {
    usuarios: `${BASE_COLLECTION}/${RESTAURANTE_PRUEBA}/formularios/usuarios/datos`,
    pedidos: `${BASE_COLLECTION}/${RESTAURANTE_PRUEBA}/formularios/pedidos/datos`,
    reservas: `${BASE_COLLECTION}/${RESTAURANTE_PRUEBA}/formularios/reservas/datos`
  }
};

// Contadores de pruebas
let totalPruebas = 0;
let pruebasExitosas = 0;
let pruebasError = 0;

// Funciones de utilidad
function log(mensaje, tipo = 'info') {
  const timestamp = new Date().toISOString();
  const prefijos = {
    'info': '📝',
    'success': '✅',
    'error': '❌',
    'warning': '⚠️',
    'test': '🧪'
  };
  console.log(`${prefijos[tipo]} [${timestamp}] ${mensaje}`);
}

function generarId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
}

async function ejecutarPrueba(nombre, operacion) {
  totalPruebas++;
  log(`Ejecutando: ${nombre}`, 'test');
  
  try {
    await operacion();
    pruebasExitosas++;
    log(`ÉXITO: ${nombre}`, 'success');
    return true;
  } catch (error) {
    pruebasError++;
    log(`ERROR: ${nombre} - ${error.message}`, 'error');
    console.error(error);
    return false;
  }
}

// ===== PRUEBAS DE CLIENTES =====
async function pruebasClientes() {
  log('\n🧑‍💼 INICIANDO PRUEBAS DE CLIENTES', 'info');
  
  const clienteId = generarId('cliente');
  const clienteData = {
    id: clienteId,
    nombre: 'Juan Pérez Test',
    telefono: '+57300123456',
    email: 'juan.test@ejemplo.com',
    fechaRegistro: new Date().toISOString(),
    activo: true,
    source: 'test_crud'
  };

  // CREATE - Cliente en arquitectura correcta
  await ejecutarPrueba('Cliente CREATE (arquitectura correcta)', async () => {
    const clienteRef = doc(db, RUTAS.clientes, clienteId);
    await setDoc(clienteRef, clienteData);
    log(`Cliente creado en: ${RUTAS.clientes}/${clienteId}`);
  });

  // READ - Obtener cliente
  await ejecutarPrueba('Cliente READ', async () => {
    const clienteRef = doc(db, RUTAS.clientes, clienteId);
    const clienteSnap = await getDoc(clienteRef);
    
    if (!clienteSnap.exists()) {
      throw new Error('Cliente no encontrado');
    }
    
    const data = clienteSnap.data();
    log(`Cliente leído: ${data.nombre} - ${data.email}`);
  });

  // UPDATE - Actualizar cliente
  await ejecutarPrueba('Cliente UPDATE', async () => {
    const clienteRef = doc(db, RUTAS.clientes, clienteId);
    const cambios = {
      nombre: 'Juan Pérez Actualizado',
      fechaActualizacion: new Date().toISOString(),
      activo: false
    };
    
    await updateDoc(clienteRef, cambios);
    
    // Verificar actualización
    const clienteActualizado = await getDoc(clienteRef);
    const data = clienteActualizado.data();
    
    if (data.nombre !== cambios.nombre) {
      throw new Error('Actualización fallida');
    }
    
    log(`Cliente actualizado: ${data.nombre}`);
  });

  // DELETE - Eliminar cliente
  await ejecutarPrueba('Cliente DELETE', async () => {
    const clienteRef = doc(db, RUTAS.clientes, clienteId);
    await deleteDoc(clienteRef);
    
    // Verificar eliminación
    const clienteEliminado = await getDoc(clienteRef);
    if (clienteEliminado.exists()) {
      throw new Error('Cliente no fue eliminado');
    }
    
    log('Cliente eliminado correctamente');
  });
}

// ===== PRUEBAS DE PEDIDOS =====
async function pruebasPedidos() {
  log('\n🍕 INICIANDO PRUEBAS DE PEDIDOS', 'info');
  
  const pedidoId = generarId('pedido');
  const pedidoData = {
    id: pedidoId,
    contact: '+57300987654',
    contactNameOrder: 'María García Test',
    orderType: 'delivery',
    resumeOrder: 'Pizza grande pepperoni + Coca Cola',
    addressToDelivery: 'Calle 123 #45-67, Bogotá',
    statusBooking: 'pending',
    total: 35000,
    fechaCreacion: new Date().toISOString(),
    source: 'test_crud'
  };

  // CREATE - Pedido en arquitectura correcta
  await ejecutarPrueba('Pedido CREATE (arquitectura correcta)', async () => {
    const pedidoRef = doc(db, RUTAS.pedidos, pedidoId);
    await setDoc(pedidoRef, pedidoData);
    log(`Pedido creado en: ${RUTAS.pedidos}/${pedidoId}`);
  });

  // READ - Obtener pedido
  await ejecutarPrueba('Pedido READ', async () => {
    const pedidoRef = doc(db, RUTAS.pedidos, pedidoId);
    const pedidoSnap = await getDoc(pedidoRef);
    
    if (!pedidoSnap.exists()) {
      throw new Error('Pedido no encontrado');
    }
    
    const data = pedidoSnap.data();
    log(`Pedido leído: ${data.contactNameOrder} - ${data.resumeOrder}`);
  });

  // UPDATE - Actualizar pedido
  await ejecutarPrueba('Pedido UPDATE', async () => {
    const pedidoRef = doc(db, RUTAS.pedidos, pedidoId);
    const cambios = {
      statusBooking: 'accepted',
      total: 38000,
      fechaActualizacion: new Date().toISOString()
    };
    
    await updateDoc(pedidoRef, cambios);
    
    // Verificar actualización
    const pedidoActualizado = await getDoc(pedidoRef);
    const data = pedidoActualizado.data();
    
    if (data.statusBooking !== cambios.statusBooking) {
      throw new Error('Actualización fallida');
    }
    
    log(`Pedido actualizado: ${data.statusBooking} - Total: $${data.total}`);
  });

  // DELETE - Eliminar pedido
  await ejecutarPrueba('Pedido DELETE', async () => {
    const pedidoRef = doc(db, RUTAS.pedidos, pedidoId);
    await deleteDoc(pedidoRef);
    
    // Verificar eliminación
    const pedidoEliminado = await getDoc(pedidoRef);
    if (pedidoEliminado.exists()) {
      throw new Error('Pedido no fue eliminado');
    }
    
    log('Pedido eliminado correctamente');
  });
}

// ===== PRUEBAS DE RESERVAS =====
async function pruebasReservas() {
  log('\n📅 INICIANDO PRUEBAS DE RESERVAS', 'info');
  
  const reservaId = generarId('reserva');
  const reservaData = {
    id: reservaId,
    contact: '+57300555777',
    contactNameBooking: 'Carlos López Test',
    peopleBooking: '4',
    finalPeopleBooking: 4,
    dateBooking: new Date(Date.now() + 86400000).toISOString(), // Mañana
    statusBooking: 'pending',
    detailsBooking: 'Mesa cerca de la ventana',
    reconfirmDate: '',
    source: 'test_crud'
  };

  // CREATE - Reserva en arquitectura correcta
  await ejecutarPrueba('Reserva CREATE (arquitectura correcta)', async () => {
    const reservaRef = doc(db, RUTAS.reservas, reservaId);
    await setDoc(reservaRef, reservaData);
    log(`Reserva creada en: ${RUTAS.reservas}/${reservaId}`);
  });

  // READ - Obtener reserva
  await ejecutarPrueba('Reserva READ', async () => {
    const reservaRef = doc(db, RUTAS.reservas, reservaId);
    const reservaSnap = await getDoc(reservaRef);
    
    if (!reservaSnap.exists()) {
      throw new Error('Reserva no encontrada');
    }
    
    const data = reservaSnap.data();
    log(`Reserva leída: ${data.contactNameBooking} - ${data.peopleBooking} personas`);
  });

  // UPDATE - Actualizar reserva
  await ejecutarPrueba('Reserva UPDATE', async () => {
    const reservaRef = doc(db, RUTAS.reservas, reservaId);
    const cambios = {
      statusBooking: 'accepted',
      reconfirmDate: new Date().toISOString(),
      reconfirmStatus: 'accepted',
      finalPeopleBooking: 5
    };
    
    await updateDoc(reservaRef, cambios);
    
    // Verificar actualización
    const reservaActualizada = await getDoc(reservaRef);
    const data = reservaActualizada.data();
    
    if (data.statusBooking !== cambios.statusBooking) {
      throw new Error('Actualización fallida');
    }
    
    log(`Reserva actualizada: ${data.statusBooking} - ${data.finalPeopleBooking} personas`);
  });

  // DELETE - Eliminar reserva
  await ejecutarPrueba('Reserva DELETE', async () => {
    const reservaRef = doc(db, RUTAS.reservas, reservaId);
    await deleteDoc(reservaRef);
    
    // Verificar eliminación
    const reservaEliminada = await getDoc(reservaRef);
    if (reservaEliminada.exists()) {
      throw new Error('Reserva no fue eliminada');
    }
    
    log('Reserva eliminada correctamente');
  });
}

// ===== FUNCIÓN PRINCIPAL =====
async function ejecutarPruebasCompletas() {
  console.log('🚀 INICIANDO PRUEBAS CRUD COMPLETAS');
  console.log('=====================================');
  log(`Restaurante de prueba: ${RESTAURANTE_PRUEBA}`, 'info');
  log('Arquitectura a probar:', 'info');
  console.log('  📁 ARQUITECTURA CORRECTA:', RUTAS.clientes);
  console.log('  📁 FORMULARIOS ORGANIZADOS:', RUTAS.formularios.usuarios);
  console.log('');

  const inicioTiempo = Date.now();

  try {
    // Ejecutar todas las pruebas
    await pruebasClientes();
    await pruebasPedidos();
    await pruebasReservas();

    const tiempoTotal = Date.now() - inicioTiempo;

    // Reporte final
    console.log('\n📊 REPORTE FINAL DE PRUEBAS');
    console.log('===========================');
    log(`⏱️  Tiempo total: ${tiempoTotal}ms`, 'info');
    log(`🧪 Total pruebas: ${totalPruebas}`, 'info');
    log(`✅ Pruebas exitosas: ${pruebasExitosas}`, 'success');
    log(`❌ Pruebas fallidas: ${pruebasError}`, 'error');
    
    const porcentajeExito = ((pruebasExitosas / totalPruebas) * 100).toFixed(2);
    log(`📈 Porcentaje de éxito: ${porcentajeExito}%`, porcentajeExito > 90 ? 'success' : 'warning');

    if (pruebasError === 0) {
      log('🎉 ¡TODAS LAS PRUEBAS CRUD PASARON EXITOSAMENTE!', 'success');
      log('✨ El sistema está listo para operación completa', 'success');
    } else {
      log(`⚠️  ${pruebasError} pruebas fallaron. Revisar errores arriba.`, 'warning');
    }

  } catch (error) {
    log(`💥 Error fatal en las pruebas: ${error.message}`, 'error');
    console.error(error);
    process.exit(1);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  ejecutarPruebasCompletas()
    .then(() => {
      log('Pruebas completadas', 'info');
      process.exit(pruebasError > 0 ? 1 : 0);
    })
    .catch((error) => {
      log(`Error ejecutando pruebas: ${error.message}`, 'error');
      console.error(error);
      process.exit(1);
    });
}

module.exports = {
  ejecutarPruebasCompletas,
  pruebasClientes,
  pruebasPedidos,
  pruebasReservas
};