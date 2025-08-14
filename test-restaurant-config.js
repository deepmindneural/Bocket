#!/usr/bin/env node

/**
 * Test script to verify restaurant configuration structure
 * This script checks if the restaurant data exists and where it's located
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, doc, getDoc, setDoc } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyBqU2CtmJhVrOZ9Js6I6RcWKLNKZTT6DLk",
  authDomain: "wpp-8ad15.firebaseapp.com",
  projectId: "wpp-8ad15",
  storageBucket: "wpp-8ad15.appspot.com",
  messagingSenderId: "236014245562",
  appId: "1:236014245562:web:7af88c32e10d05b1b9e2f3",
  measurementId: "G-2XSH7RDE1Y"
};

async function testRestaurantConfig() {
  try {
    console.log('🔍 Testing restaurant configuration structure...');
    
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    const restaurantId = 'rest_pan_087820';
    
    // 1. Check adminUsers document
    console.log('\n📋 STEP 1: Checking adminUsers document...');
    const adminDocRef = doc(db, 'adminUsers', restaurantId);
    const adminDoc = await getDoc(adminDocRef);
    
    if (adminDoc.exists()) {
      const adminData = adminDoc.data();
      console.log('✅ AdminUsers document found:', adminData);
      
      const restauranteAsignado = adminData.restauranteAsignado;
      if (restauranteAsignado) {
        console.log(`🏪 Restaurant assigned: ${restauranteAsignado}`);
        
        // 2. Check restaurant configuration in new structure
        console.log('\n📋 STEP 2: Checking restaurant configuration...');
        const configPath = `clients/${restauranteAsignado}/configuracion/restaurante`;
        console.log(`📍 Looking for configuration at: ${configPath}`);
        
        const configDocRef = doc(db, configPath);
        const configDoc = await getDoc(configDocRef);
        
        if (configDoc.exists()) {
          console.log('✅ Restaurant configuration found:', configDoc.data());
        } else {
          console.log('❌ Restaurant configuration NOT found');
          console.log('🔧 Creating default configuration...');
          
          // Create default configuration
          const defaultConfig = {
            nombre: restauranteAsignado,
            slug: restauranteAsignado.toLowerCase().replace(/[^a-z0-9]/g, ''),
            restauranteId: restaurantId,
            email: `info@${restauranteAsignado.toLowerCase()}.com`,
            telefono: '+57 300 123 4567',
            direccion: 'Dirección por definir',
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
            limiteUsuarios: 50,
            limiteClientes: 1000,
            limiteReservas: 500,
            fechaCreacion: new Date(),
            fechaActualizacion: new Date(),
            creadoPor: 'sistema'
          };
          
          await setDoc(configDocRef, defaultConfig);
          console.log('✅ Default configuration created');
        }
      } else {
        console.log('❌ restauranteAsignado not found in adminUsers');
      }
    } else {
      console.log('❌ AdminUsers document NOT found');
      console.log('🔧 You may need to create the adminUsers document first');
    }
    
    // 3. Check old structure for comparison
    console.log('\n📋 STEP 3: Checking old restaurant structure...');
    const oldRestaurantDocRef = doc(db, 'restaurantes', restaurantId);
    const oldRestaurantDoc = await getDoc(oldRestaurantDocRef);
    
    if (oldRestaurantDoc.exists()) {
      console.log('⚠️ Old structure found:', oldRestaurantDoc.data());
      console.log('💡 Consider migrating this data to the new structure');
    } else {
      console.log('✅ No old structure found (good!)');
    }
    
    console.log('\n🎉 Restaurant configuration test completed!');
    
  } catch (error) {
    console.error('❌ Error testing restaurant configuration:', error);
  }
}

testRestaurantConfig();