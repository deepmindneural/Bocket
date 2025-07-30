#!/usr/bin/env node

/**
 * 🔍 TEST DEPENDENCY INJECTION
 * Verificar si el problema es específico del AdminService o un problema más amplio
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

async function testDependencyInjection() {
  console.log('🔍 TEST DEPENDENCY INJECTION - Verificando conexión Firebase');
  console.log('='.repeat(60));
  
  try {
    // Inicializar Firebase directamente con v9+
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    console.log('✅ Firebase v9+ inicializado correctamente');

    // Test básico: obtener restaurantes
    console.log('\n📋 TEST: Obtener restaurantes');
    const restaurantesRef = collection(db, 'restaurantes');
    const restaurantesSnapshot = await getDocs(restaurantesRef);
    
    const restaurantes = [];
    restaurantesSnapshot.forEach(doc => {
      const data = doc.data();
      restaurantes.push({ id: doc.id, nombre: data.nombre || 'Sin nombre' });
    });
    
    console.log(`✅ Restaurantes encontrados: ${restaurantes.length}`);
    restaurantes.forEach(r => {
      console.log(`   - ${r.nombre} (${r.id})`);
    });

    // Test: obtener usuarios
    console.log('\n👤 TEST: Obtener usuarios');
    const usuariosRef = collection(db, 'usuarios');
    const usuariosSnapshot = await getDocs(usuariosRef);
    
    const usuarios = [];
    usuariosSnapshot.forEach(doc => {
      const data = doc.data();
      usuarios.push({ id: doc.id, email: data.email || 'Sin email' });
    });
    
    console.log(`✅ Usuarios encontrados: ${usuarios.length}`);
    usuarios.forEach(u => {
      console.log(`   - ${u.email} (${u.id})`);
    });

    console.log('\n' + '='.repeat(60));
    console.log('🎉 CONEXIÓN FIREBASE FUNCIONAL');
    console.log('👉 El problema es específico de AngularFire dependency injection en Angular');
    console.log('💡 SOLUCIÓN: Verificar configuración de providers en Angular');

  } catch (error) {
    console.error('\n❌ ERROR EN TEST FIREBASE:', error.message);
    console.error('Stack:', error);
  }
}

testDependencyInjection();