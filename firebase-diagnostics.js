#!/usr/bin/env node

/**
 * 🩺 Diagnóstico Firebase - Detectar por qué no veo los datos
 * 
 * Este script diagnostica problemas de conexión y acceso a datos
 * Ejecutar con: node firebase-diagnostics.js
 */

const { initializeApp } = require('firebase/app');
const { getAuth, signInAnonymously, onAuthStateChanged } = require('firebase/auth');
const { 
  getFirestore, 
  collection, 
  getDocs, 
  doc, 
  getDoc,
  query,
  where,
  orderBy,
  limit,
  startAt,
  enableNetwork,
  disableNetwork
} = require('firebase/firestore');

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyC54Ytk5wO2zupIuCtFIsIUNXvP4m9qqOk",
  authDomain: "bocket-2024.firebaseapp.com",
  projectId: "bocket-2024",
  storageBucket: "bocket-2024.appspot.com",
  messagingSenderId: "537532907057",
  appId: "1:537532907057:web:dc51aacd0553b9ac2edf10"
};

class FirebaseDiagnostics {
  constructor() {
    this.app = null;
    this.auth = null;
    this.firestore = null;
  }

  log(message, color = '\x1b[37m') {
    console.log(`${color}${message}\x1b[0m`);
  }

  async initialize() {
    this.log('🩺 DIAGNÓSTICO FIREBASE - DETECTANDO PROBLEMAS', '\x1b[35m');
    this.log('=' * 60, '\x1b[36m');
    
    this.app = initializeApp(firebaseConfig);
    this.auth = getAuth(this.app);
    this.firestore = getFirestore(this.app);
    
    this.log('✅ Firebase inicializado', '\x1b[32m');
  }

  async checkNetworkConnection() {
    this.log('\n🌐 VERIFICANDO CONEXIÓN DE RED...', '\x1b[34m');
    
    try {
      // Test directo a Firebase
      const response = await fetch(`https://${firebaseConfig.projectId}-default-rtdb.firebaseio.com/.json`);
      this.log(`✅ Conexión HTTP a Firebase: ${response.status}`, '\x1b[32m');
    } catch (error) {
      this.log(`❌ Error conexión HTTP: ${error.message}`, '\x1b[31m');
    }

    try {
      // Test Firestore específico
      await enableNetwork(this.firestore);
      this.log('✅ Red Firestore habilitada', '\x1b[32m');
    } catch (error) {
      this.log(`❌ Error red Firestore: ${error.message}`, '\x1b[31m');
    }
  }

  async checkFirestoreRules() {
    this.log('\n🛡️  VERIFICANDO REGLAS DE FIRESTORE...', '\x1b[34m');
    
    // Test de lectura en diferentes escenarios
    const testCases = [
      { name: 'Sin autenticación', auth: false },
      { name: 'Con auth anónima', auth: true }
    ];

    for (const testCase of testCases) {
      this.log(`\n📋 Caso: ${testCase.name}`, '\x1b[33m');
      
      if (testCase.auth) {
        try {
          await signInAnonymously(this.auth);
          this.log('   ✅ Autenticación anónima exitosa', '\x1b[32m');
        } catch (authError) {
          this.log(`   ❌ Auth anónima falló: ${authError.message}`, '\x1b[31m');
          continue;
        }
      }

      // Probar lectura de colecciones
      await this.testCollectionReads();
    }
  }

  async testCollectionReads() {
    const collections = [
      'usuarios',
      'restaurantes',
      'usuariosRestaurantes',
      'test'
    ];

    for (const collectionName of collections) {
      try {
        const collectionRef = collection(this.firestore, collectionName);
        const snapshot = await getDocs(collectionRef);
        
        this.log(`   📁 ${collectionName}: ${snapshot.size} docs`, 
          snapshot.size > 0 ? '\x1b[32m' : '\x1b[90m');
        
        if (snapshot.size > 0) {
          // Mostrar IDs de documentos encontrados
          const docIds = snapshot.docs.map(doc => doc.id);
          this.log(`      IDs: ${docIds.join(', ')}`, '\x1b[36m');
          
          // Mostrar datos del primer documento
          const firstDoc = snapshot.docs[0];
          const data = firstDoc.data();
          this.log(`      Datos muestra:`, '\x1b[36m');
          Object.entries(data).slice(0, 3).forEach(([key, value]) => {
            this.log(`        ${key}: ${String(value).substring(0, 50)}`, '\x1b[37m');
          });
        }
      } catch (error) {
        this.log(`   ❌ ${collectionName}: ${error.code} - ${error.message}`, '\x1b[31m');
      }
    }
  }

  async deepScanDatabase() {
    this.log('\n🔍 ESCANEO PROFUNDO DE BASE DE DATOS...', '\x1b[34m');
    
    // Intentar diferentes patrones de nombres de colecciones
    const possibleCollections = [
      // Nombres estándar
      'users', 'user', 'usuarios', 'usuario',
      'restaurants', 'restaurant', 'restaurantes', 'restaurante',
      'clients', 'client', 'clientes', 'cliente',
      'reservations', 'reservation', 'reservas', 'reserva',
      'orders', 'order', 'pedidos', 'pedido',
      'products', 'product', 'productos', 'producto',
      
      // Posibles nombres del proyecto
      'bocket', 'bocket-data', 'crm', 'crm-data',
      'app-data', 'application-data',
      
      // Posibles colecciones de configuración
      'config', 'configuration', 'settings', 'app-config',
      'metadata', 'system', 'admin',
      
      // Posibles nombres temporales o de prueba
      'temp', 'temporary', 'test-data', 'sample-data',
      'demo', 'demo-data', 'examples'
    ];

    this.log(`🔍 Probando ${possibleCollections.length} posibles nombres de colecciones...`, '\x1b[33m');
    
    const foundCollections = [];
    
    for (const collectionName of possibleCollections) {
      try {
        const collectionRef = collection(this.firestore, collectionName);
        const snapshot = await getDocs(collectionRef);
        
        if (snapshot.size > 0) {
          foundCollections.push({
            name: collectionName,
            count: snapshot.size,
            docs: snapshot.docs.map(doc => ({
              id: doc.id,
              data: doc.data()
            }))
          });
          
          this.log(`   ✅ ENCONTRADA: ${collectionName} (${snapshot.size} docs)`, '\x1b[32m');
        }
      } catch (error) {
        // Silencioso para no spam, solo mostrar errores importantes
        if (error.code !== 'permission-denied') {
          this.log(`   ⚠️  ${collectionName}: ${error.code}`, '\x1b[33m');
        }
      }
    }

    if (foundCollections.length > 0) {
      this.log('\n🎉 COLECCIONES CON DATOS ENCONTRADAS:', '\x1b[32m');
      for (const col of foundCollections) {
        this.log(`\n📁 ${col.name} (${col.count} documentos):`, '\x1b[36m');
        for (const doc of col.docs.slice(0, 3)) { // Mostrar primeros 3 docs
          this.log(`   📄 ID: ${doc.id}`, '\x1b[37m');
          Object.entries(doc.data).slice(0, 3).forEach(([key, value]) => {
            const displayValue = typeof value === 'object' ? '[objeto]' : String(value).substring(0, 50);
            this.log(`      ${key}: ${displayValue}`, '\x1b[90m');
          });
        }
      }
    } else {
      this.log('\n❌ NO SE ENCONTRARON DATOS EN NINGUNA COLECCIÓN', '\x1b[31m');
    }
  }

  async checkSpecificDocument() {
    this.log('\n🎯 PROBANDO ACCESO A DOCUMENTOS ESPECÍFICOS...', '\x1b[34m');
    
    // Intentar acceder a documentos que comúnmente existen
    const testDocuments = [
      { collection: 'usuarios', id: 'admin' },
      { collection: 'usuarios', id: 'test' },
      { collection: 'restaurantes', id: 'demo' },
      { collection: 'restaurantes', id: 'test' },
      { collection: 'config', id: 'app' },
      { collection: 'config', id: 'system' }
    ];

    for (const testDoc of testDocuments) {
      try {
        const docRef = doc(this.firestore, testDoc.collection, testDoc.id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          this.log(`   ✅ ${testDoc.collection}/${testDoc.id} EXISTE`, '\x1b[32m');
          const data = docSnap.data();
          this.log(`      Datos:`, '\x1b[36m');
          Object.entries(data).slice(0, 3).forEach(([key, value]) => {
            this.log(`        ${key}: ${String(value).substring(0, 50)}`, '\x1b[37m');
          });
        } else {
          this.log(`   ❌ ${testDoc.collection}/${testDoc.id} no existe`, '\x1b[90m');
        }
      } catch (error) {
        this.log(`   ❌ Error accediendo ${testDoc.collection}/${testDoc.id}: ${error.code}`, '\x1b[31m');
      }
    }
  }

  async checkFirebaseConsoleInfo() {
    this.log('\n📊 INFORMACIÓN DEL PROYECTO...', '\x1b[34m');
    
    this.log(`🆔 Project ID: ${firebaseConfig.projectId}`, '\x1b[37m');
    this.log(`🌐 Auth Domain: ${firebaseConfig.authDomain}`, '\x1b[37m');
    this.log(`📁 Storage Bucket: ${firebaseConfig.storageBucket}`, '\x1b[37m');
    
    this.log('\n💡 PARA VERIFICAR EN FIREBASE CONSOLE:', '\x1b[33m');
    this.log(`1. Ve a: https://console.firebase.google.com/project/${firebaseConfig.projectId}`, '\x1b[37m');
    this.log(`2. Revisa Firestore Database`, '\x1b[37m');
    this.log(`3. Verifica las reglas de seguridad`, '\x1b[37m');
    this.log(`4. Confirma que hay datos visibles en la consola`, '\x1b[37m');
  }

  async runFullDiagnostics() {
    await this.initialize();
    await this.checkNetworkConnection();
    await this.checkFirestoreRules();
    await this.deepScanDatabase();
    await this.checkSpecificDocument();
    await this.checkFirebaseConsoleInfo();
    
    this.log('\n' + '=' * 60, '\x1b[36m');
    this.log('🩺 DIAGNÓSTICO COMPLETADO', '\x1b[35m');
    this.log('\nSi aún no ves datos, verifica:', '\x1b[33m');
    this.log('1. Que los datos estén realmente en Firestore (no Realtime DB)', '\x1b[37m');
    this.log('2. Las reglas de seguridad en Firebase Console', '\x1b[37m');
    this.log('3. Que el proyecto ID sea correcto', '\x1b[37m');
    this.log('4. Permisos de lectura en las colecciones', '\x1b[37m');
    this.log('=' * 60, '\x1b[36m');
  }
}

async function main() {
  const diagnostics = new FirebaseDiagnostics();
  await diagnostics.runFullDiagnostics();
}

if (require.main === module) {
  main().catch(error => {
    console.error('❌ Error fatal en diagnóstico:', error);
    process.exit(1);
  });
}

module.exports = FirebaseDiagnostics;