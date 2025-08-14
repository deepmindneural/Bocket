#!/usr/bin/env node

/**
 * Script para verificar qué restaurantes están disponibles en bocket-2024
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, getDoc, setDoc } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyC54Ytk5wO2zupIuCtFIsIUNXvP4m9qqOk",
  authDomain: "bocket-2024.firebaseapp.com",
  projectId: "bocket-2024",
  storageBucket: "bocket-2024.appspot.com",
  messagingSenderId: "537532907057",
  appId: "1:537532907057:web:dc51aacd0553b9ac2edf10"
};

async function verificarRestaurantesBocket2024() {
  try {
    console.log('🔍 VERIFICANDO RESTAURANTES EN BOCKET-2024...');
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
        
        // Crear usuario admin de ejemplo
        console.log('🔧 Creando usuario admin de ejemplo...');
        const adminData = {
          email: 'admin@restaurante.com',
          nombre: 'Administrador',
          rol: 'admin',
          activo: true,
          restauranteAsignado: 'carnes1',
          restauranteId: 'rest_carnes1_001',
          fechaCreacion: new Date(),
          ultimoAcceso: new Date()
        };
        
        await setDoc(doc(db, 'adminUsers', 'rest_carnes1_001'), adminData);
        console.log('✅ Usuario admin creado: rest_carnes1_001');
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
              console.log(`   ❌ Sin configuración, creando configuración de ejemplo...`);
              
              // Crear configuración de ejemplo
              const defaultConfig = {
                nombre: restauranteName,
                slug: restauranteName.toLowerCase(),
                restauranteId: `rest_${restauranteName}_001`,
                email: `info@${restauranteName}.com`,
                telefono: '+57 300 123 4567',
                direccion: 'Calle 123 #45-67',
                ciudad: 'Bogotá',
                pais: 'Colombia',
                tipoNegocio: 'restaurante',
                moneda: 'COP',
                idioma: 'es',
                zonaHoraria: 'America/Bogota',
                colorPrimario: '#004aad',
                colorSecundario: '#d636a0',
                activo: true,
                planSuscripcion: 'profesional',
                fechaCreacion: new Date(),
                fechaActualizacion: new Date(),
                creadoPor: 'sistema'
              };
              
              await setDoc(configRef, defaultConfig);
              console.log(`   ✅ Configuración creada para ${restauranteName}`);
            }
          } catch (configError) {
            console.log(`   ❌ Error con configuración: ${configError.message}`);
          }
        }
      } else {
        console.log('❌ No se encontraron restaurantes en clients');
        console.log('🔧 Creando restaurante de ejemplo...');
        
        // Crear restaurante de ejemplo
        const exampleConfig = {
          nombre: 'Carnes1',
          slug: 'carnes1',
          restauranteId: 'rest_carnes1_001',
          email: 'info@carnes1.com',
          telefono: '+57 300 123 4567',
          direccion: 'Avenida Principal 123',
          ciudad: 'Bogotá',
          pais: 'Colombia',
          tipoNegocio: 'restaurante',
          moneda: 'COP',
          idioma: 'es',
          zonaHoraria: 'America/Bogota',
          colorPrimario: '#e74c3c',
          colorSecundario: '#c0392b',
          activo: true,
          planSuscripcion: 'profesional',
          fechaCreacion: new Date(),
          fechaActualizacion: new Date(),
          creadoPor: 'sistema'
        };
        
        await setDoc(doc(db, 'clients/carnes1/configuracion/restaurante'), exampleConfig);
        console.log('✅ Restaurante "carnes1" creado');
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
        console.log('✅ No hay restaurantes en estructura antigua');
      }
    } catch (error) {
      console.log('❌ Error accediendo a restaurantes:', error.message);
    }
    
    console.log('\n🎉 VERIFICACIÓN Y CONFIGURACIÓN COMPLETADA');
    console.log('='.repeat(60));
    console.log('📋 RESUMEN:');
    console.log('   🏪 Restaurante disponible: carnes1');
    console.log('   👤 Usuario admin: rest_carnes1_001');
    console.log('   📧 Email login: admin@restaurante.com');
    console.log('   🔑 Puedes usar este usuario para hacer login');
    
  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

verificarRestaurantesBocket2024();