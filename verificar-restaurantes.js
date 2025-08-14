#!/usr/bin/env node

/**
 * Script para verificar qué restaurantes están disponibles en la base de datos
 * Busca en ambas estructuras: antigua y nueva
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, getDoc } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyBqU2CtmJhVrOZ9Js6I6RcWKLNKZTT6DLk",
  authDomain: "wpp-8ad15.firebaseapp.com",
  projectId: "wpp-8ad15",
  storageBucket: "wpp-8ad15.appspot.com",
  messagingSenderId: "236014245562",
  appId: "1:236014245562:web:7af88c32e10d05b1b9e2f3",
  measurementId: "G-2XSH7RDE1Y"
};

async function verificarRestaurantes() {
  try {
    console.log('🔍 VERIFICANDO RESTAURANTES DISPONIBLES...');
    console.log('='.repeat(60));
    
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    // 1. Verificar adminUsers
    console.log('\n📋 PASO 1: Verificando AdminUsers...');
    try {
      const adminUsersRef = collection(db, 'adminUsers');
      const adminSnapshot = await getDocs(adminUsersRef);
      
      if (!adminSnapshot.empty) {
        console.log(`✅ Encontrados ${adminSnapshot.size} usuarios admin:`);
        adminSnapshot.forEach(doc => {
          const data = doc.data();
          console.log(`   👤 ID: ${doc.id}`);
          console.log(`   📧 Email: ${data.email || 'N/A'}`);
          console.log(`   🏪 Restaurante: ${data.restauranteAsignado || 'N/A'}`);
          console.log(`   🆔 RestauranteID: ${data.restauranteId || 'N/A'}`);
          console.log(`   ✅ Activo: ${data.activo || 'N/A'}`);
          console.log('   ---');
        });
      } else {
        console.log('❌ No se encontraron usuarios admin');
      }
    } catch (error) {
      console.log('❌ Error accediendo a adminUsers:', error.message);
    }
    
    // 2. Verificar colección clients
    console.log('\n📋 PASO 2: Verificando Clients (Nueva Arquitectura)...');
    try {
      const clientsRef = collection(db, 'clients');
      const clientsSnapshot = await getDocs(clientsRef);
      
      if (!clientsSnapshot.empty) {
        console.log(`✅ Encontrados ${clientsSnapshot.size} clientes/restaurantes:`);
        for (const clientDoc of clientsSnapshot.docs) {
          const restauranteName = clientDoc.id;
          console.log(`\n   🏪 Restaurante: ${restauranteName}`);
          
          // Verificar configuración
          try {
            const configRef = doc(db, `clients/${restauranteName}/configuracion/restaurante`);
            const configDoc = await getDoc(configRef);
            
            if (configDoc.exists()) {
              const configData = configDoc.data();
              console.log(`   ✅ Configuración encontrada:`);
              console.log(`      📧 Email: ${configData.email || 'N/A'}`);
              console.log(`      📞 Teléfono: ${configData.telefono || 'N/A'}`);
              console.log(`      🏷️ Slug: ${configData.slug || 'N/A'}`);
              console.log(`      ✅ Activo: ${configData.activo || 'N/A'}`);
            } else {
              console.log(`   ❌ Sin configuración en /configuracion/restaurante`);
            }
          } catch (configError) {
            console.log(`   ❌ Error verificando configuración: ${configError.message}`);
          }
          
          // Verificar subcolecciones
          try {
            const subcolecciones = ['clientes', 'pedidos', 'reservas'];
            for (const subcol of subcolecciones) {
              const subRef = collection(db, `clients/${restauranteName}/${subcol}`);
              const subSnapshot = await getDocs(subRef);
              console.log(`      📊 ${subcol}: ${subSnapshot.size} documentos`);
            }
          } catch (subError) {
            console.log(`   ⚠️ Error verificando subcolecciones: ${subError.message}`);
          }
        }
      } else {
        console.log('❌ No se encontraron restaurantes en clients');
      }
    } catch (error) {
      console.log('❌ Error accediendo a clients:', error.message);
    }
    
    // 3. Verificar estructura antigua
    console.log('\n📋 PASO 3: Verificando Restaurantes (Estructura Antigua)...');
    try {
      const restaurantesRef = collection(db, 'restaurantes');
      const restaurantesSnapshot = await getDocs(restaurantesRef);
      
      if (!restaurantesSnapshot.empty) {
        console.log(`⚠️ Encontrados ${restaurantesSnapshot.size} restaurantes en estructura antigua:`);
        restaurantesSnapshot.forEach(doc => {
          const data = doc.data();
          console.log(`   🏪 ID: ${doc.id}`);
          console.log(`   📝 Nombre: ${data.nombre || 'N/A'}`);
          console.log(`   🏷️ Slug: ${data.slug || 'N/A'}`);
          console.log(`   📧 Email: ${data.email || 'N/A'}`);
          console.log(`   ✅ Activo: ${data.activo || 'N/A'}`);
          console.log('   ---');
        });
      } else {
        console.log('✅ No hay restaurantes en estructura antigua (¡Bien!)');
      }
    } catch (error) {
      console.log('❌ Error accediendo a restaurantes:', error.message);
    }
    
    // 4. Verificar worldfood (compatibilidad)
    console.log('\n📋 PASO 4: Verificando WorldFood (Compatibilidad)...');
    try {
      const worldfoodRef = collection(db, 'clients/worldfood/Formularios');
      const worldfoodSnapshot = await getDocs(worldfoodRef);
      
      if (!worldfoodSnapshot.empty) {
        console.log(`⚠️ Encontrados ${worldfoodSnapshot.size} formularios en worldfood:`);
        
        // Agrupar por tipo de formulario
        const tipos = {};
        worldfoodSnapshot.forEach(doc => {
          const data = doc.data();
          const tipo = data.typeForm || 'Sin tipo';
          if (!tipos[tipo]) tipos[tipo] = 0;
          tipos[tipo]++;
        });
        
        Object.keys(tipos).forEach(tipo => {
          console.log(`   📝 ${tipo}: ${tipos[tipo]} formularios`);
        });
      } else {
        console.log('✅ No hay formularios en worldfood');
      }
    } catch (error) {
      console.log('❌ Error accediendo a worldfood:', error.message);
    }
    
    console.log('\n🎉 VERIFICACIÓN COMPLETADA');
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('❌ Error general en la verificación:', error);
  }
}

verificarRestaurantes();