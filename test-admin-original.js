#!/usr/bin/env node

/**
 * 🔍 TEST ADMIN ORIGINAL
 * Verificar que los métodos originales del AdminService funcionen
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyC54Ytk5wO2zupIuCtFIsIUNXvP4m9qqOk",
  authDomain: "bocket-2024.firebaseapp.com",
  projectId: "bocket-2024",
  storageBucket: "bocket-2024.appspot.com",
  messagingSenderId: "537532907057",
  appId: "1:537532907057:web:dc51aacd0553b9ac2edf10"
};

async function testAdminOriginal() {
  console.log('🔍 TEST ADMIN ORIGINAL - Verificando funcionalidad básica');
  console.log('='.repeat(60));
  
  try {
    // Inicializar Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    console.log('✅ Firebase inicializado correctamente');

    // Test 1: obtenerTodosRestaurantes (método original)
    console.log('\n📋 TEST 1: obtenerTodosRestaurantes');
    const restaurantesRef = collection(db, 'restaurantes');
    const restaurantesSnapshot = await getDocs(restaurantesRef);
    
    const restaurantes = [];
    restaurantesSnapshot.forEach(doc => {
      const data = doc.data();
      restaurantes.push({ id: doc.id, ...data });
    });
    
    console.log(`✅ Restaurantes encontrados: ${restaurantes.length}`);
    restaurantes.forEach(r => {
      console.log(`   - ${r.nombre} (${r.id})`);
    });

    // Test 2: obtenerTodosUsuarios
    console.log('\n👤 TEST 2: obtenerTodosUsuarios');
    const usuariosRef = collection(db, 'usuarios');
    const usuariosSnapshot = await getDocs(usuariosRef);
    
    const usuarios = [];
    usuariosSnapshot.forEach(doc => {
      const data = doc.data();
      usuarios.push({ id: doc.id, ...data });
    });
    
    console.log(`✅ Usuarios encontrados: ${usuarios.length}`);
    usuarios.forEach(u => {
      console.log(`   - ${u.email || u.nombre || u.id}`);
    });

    // Test 3: obtenerTodosPedidos (verificar subcollecciones)
    console.log('\n🍽️ TEST 3: obtenerTodosPedidos');
    const restaurantesIds = ['rest_donpepe_001', 'rest_marinacafe_002'];
    let totalPedidos = 0;
    
    for (const restauranteId of restaurantesIds) {
      try {
        const pedidosRef = collection(db, `restaurantes/${restauranteId}/pedidos`);
        const pedidosSnapshot = await getDocs(pedidosRef);
        console.log(`   ${restauranteId}: ${pedidosSnapshot.size} pedidos`);
        totalPedidos += pedidosSnapshot.size;
      } catch (error) {
        console.log(`   ❌ Error en ${restauranteId}: ${error.message}`);
      }
    }
    
    console.log(`✅ Total pedidos: ${totalPedidos}`);

    // Test 4: obtenerTodosClientes
    console.log('\n👥 TEST 4: obtenerTodosClientes');
    let totalClientes = 0;
    
    for (const restauranteId of restaurantesIds) {
      try {
        const clientesRef = collection(db, `restaurantes/${restauranteId}/clientes`);
        const clientesSnapshot = await getDocs(clientesRef);
        console.log(`   ${restauranteId}: ${clientesSnapshot.size} clientes`);
        totalClientes += clientesSnapshot.size;
      } catch (error) {
        console.log(`   ❌ Error en ${restauranteId}: ${error.message}`);
      }
    }
    
    console.log(`✅ Total clientes: ${totalClientes}`);

    // Test 5: obtenerTodasReservas
    console.log('\n📅 TEST 5: obtenerTodasReservas');
    let totalReservas = 0;
    
    for (const restauranteId of restaurantesIds) {
      try {
        const reservasRef = collection(db, `restaurantes/${restauranteId}/reservas`);
        const reservasSnapshot = await getDocs(reservasRef);
        console.log(`   ${restauranteId}: ${reservasSnapshot.size} reservas`);
        totalReservas += reservasSnapshot.size;
      } catch (error) {
        console.log(`   ❌ Error en ${restauranteId}: ${error.message}`);
      }
    }
    
    console.log(`✅ Total reservas: ${totalReservas}`);

    console.log('\n' + '='.repeat(60));
    console.log('📊 RESUMEN:');
    console.log(`✅ Restaurantes: ${restaurantes.length}`);
    console.log(`✅ Usuarios: ${usuarios.length}`);
    console.log(`✅ Pedidos: ${totalPedidos}`);
    console.log(`✅ Clientes: ${totalClientes}`);
    console.log(`✅ Reservas: ${totalReservas}`);

    if (restaurantes.length === 0 && usuarios.length === 0) {
      console.log('\n❌ NO SE ENCONTRARON DATOS - PROBLEMA DE CONEXIÓN FIRESTORE');
    } else {
      console.log('\n🎉 DATOS DE FIRESTORE ACCESIBLES - El problema es en la aplicación Angular');
    }

  } catch (error) {
    console.error('\n❌ ERROR FATAL:', error.message);
    console.error('Stack:', error);
  }
}

testAdminOriginal();