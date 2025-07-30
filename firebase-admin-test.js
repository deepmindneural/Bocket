#!/usr/bin/env node

/**
 * 🔥 Test Firebase con Admin SDK - Acceso completo
 * 
 * Este script usa Firebase Admin SDK para acceso completo a los datos
 * Ejecutar con: node firebase-admin-test.js
 */

const admin = require('firebase-admin');
const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword, connectAuthEmulator } = require('firebase/auth');
const { getFirestore, collection, getDocs, connectFirestoreEmulator } = require('firebase/firestore');

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyC54Ytk5wO2zupIuCtFIsIUNXvP4m9qqOk",
  authDomain: "bocket-2024.firebaseapp.com",
  projectId: "bocket-2024",
  storageBucket: "bocket-2024.appspot.com",
  messagingSenderId: "537532907057",
  appId: "1:537532907057:web:dc51aacd0553b9ac2edf10"
};

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  gray: '\x1b[90m'
};

class FirebaseDeepAnalyzer {
  constructor() {
    this.adminApp = null;
    this.clientApp = null;
    this.clientAuth = null;
    this.clientFirestore = null;
    this.adminFirestore = null;
    this.adminStorage = null;
  }

  log(message, color = 'white') {
    console.log(`${colors[color]}${message}${colors.reset}`);
  }

  separator(char = '=', length = 60) {
    this.log(char.repeat(length), 'cyan');
  }

  async initializeFirebase() {
    this.log('🔥 INICIALIZANDO FIREBASE CON MÚLTIPLES MÉTODOS', 'magenta');
    this.separator();

    // Método 1: Cliente SDK (lo que ya probamos)
    await this.initializeClientSDK();

    // Método 2: Admin SDK (si tenemos service account)
    await this.initializeAdminSDK();

    // Método 3: Intentar con diferentes configuraciones de reglas
    await this.testSecurityRules();
  }

  async initializeClientSDK() {
    try {
      this.log('\n📱 INICIALIZANDO CLIENT SDK...', 'blue');
      
      this.clientApp = initializeApp(firebaseConfig);
      this.clientAuth = getAuth(this.clientApp);
      this.clientFirestore = getFirestore(this.clientApp);
      
      this.log('✅ Client SDK inicializado', 'green');
      
      // Intentar autenticación anónima
      try {
        const userCredential = await this.clientAuth.signInAnonymously();
        this.log('✅ Autenticación anónima exitosa', 'green');
        this.log(`   👤 Usuario: ${userCredential.user.uid}`, 'cyan');
      } catch (authError) {
        this.log(`⚠️  Autenticación anónima falló: ${authError.code}`, 'yellow');
        this.log(`   📄 Mensaje: ${authError.message}`, 'gray');
      }
      
    } catch (error) {
      this.log(`❌ Error Client SDK: ${error.message}`, 'red');
    }
  }

  async initializeAdminSDK() {
    try {
      this.log('\n🔐 INTENTANDO ADMIN SDK...', 'blue');
      
      // Intento 1: Con service account (si existe)
      try {
        const serviceAccount = require('./firebase-service-account.json');
        this.adminApp = admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          projectId: firebaseConfig.projectId,
          storageBucket: firebaseConfig.storageBucket
        });
        
        this.adminFirestore = admin.firestore();
        this.adminStorage = admin.storage();
        
        this.log('✅ Admin SDK con service account inicializado', 'green');
        return true;
      } catch (serviceError) {
        this.log('⚠️  Service account no encontrado', 'yellow');
      }

      // Intento 2: Admin SDK con configuración básica
      try {
        this.adminApp = admin.initializeApp({
          projectId: firebaseConfig.projectId,
          storageBucket: firebaseConfig.storageBucket
        }, 'admin-app');
        
        this.log('✅ Admin SDK básico inicializado', 'green');
      } catch (adminError) {
        this.log(`❌ Admin SDK falló: ${adminError.message}`, 'red');
      }
      
    } catch (error) {
      this.log(`❌ Error general Admin SDK: ${error.message}`, 'red');
    }
  }

  async testSecurityRules() {
    this.log('\n🛡️  PROBANDO REGLAS DE SEGURIDAD...', 'blue');
    
    const testCollections = [
      'usuarios',
      'restaurantes', 
      'usuariosRestaurantes',
      'test',
      'public', // Colección que podría ser pública
      'config'  // Configuración global
    ];

    for (const collectionName of testCollections) {
      await this.testCollectionAccess(collectionName);
    }
  }

  async testCollectionAccess(collectionName) {
    const results = [];
    
    // Test 1: Sin autenticación
    try {
      const collectionRef = collection(this.clientFirestore, collectionName);
      const snapshot = await getDocs(collectionRef);
      results.push({
        method: 'Sin Auth',
        success: true,
        count: snapshot.size,
        docs: snapshot.docs.map(doc => ({ id: doc.id, data: doc.data() }))
      });
    } catch (error) {
      results.push({
        method: 'Sin Auth',
        success: false,
        error: error.code || error.message
      });
    }

    // Test 2: Con autenticación anónima (si está disponible)
    if (this.clientAuth.currentUser) {
      try {
        const collectionRef = collection(this.clientFirestore, collectionName);
        const snapshot = await getDocs(collectionRef);
        results.push({
          method: 'Auth Anónima',
          success: true,
          count: snapshot.size,
          docs: snapshot.docs.map(doc => ({ id: doc.id, data: doc.data() }))
        });
      } catch (error) {
        results.push({
          method: 'Auth Anónima',
          success: false,
          error: error.code || error.message
        });
      }
    }

    // Test 3: Con Admin SDK (si está disponible)
    if (this.adminFirestore) {
      try {
        const collectionRef = this.adminFirestore.collection(collectionName);
        const snapshot = await collectionRef.get();
        results.push({
          method: 'Admin SDK',
          success: true,
          count: snapshot.size,
          docs: snapshot.docs.map(doc => ({ id: doc.id, data: doc.data() }))
        });
      } catch (error) {
        results.push({
          method: 'Admin SDK',
          success: false,
          error: error.code || error.message
        });
      }
    }

    // Mostrar resultados
    this.log(`\n📁 Colección: ${collectionName}`, 'cyan');
    for (const result of results) {
      if (result.success) {
        this.log(`   ✅ ${result.method}: ${result.count} documentos`, 'green');
        if (result.count > 0) {
          this.log(`      📄 IDs: ${result.docs.map(d => d.id).join(', ')}`, 'white');
          
          // Mostrar algunos datos del primer documento
          if (result.docs[0] && result.docs[0].data) {
            this.log(`      📋 Datos de muestra:`, 'yellow');
            const sampleData = result.docs[0].data;
            Object.entries(sampleData).slice(0, 3).forEach(([key, value]) => {
              const displayValue = typeof value === 'object' ? '[objeto]' : String(value).substring(0, 50);
              this.log(`         ${key}: ${displayValue}`, 'white');
            });
          }
        }
      } else {
        this.log(`   ❌ ${result.method}: ${result.error}`, 'red');
      }
    }
  }

  async inspectDatabaseStructure() {
    this.log('\n🔍 INSPECCIONANDO ESTRUCTURA COMPLETA...', 'blue');
    this.separator('-', 40);

    if (this.adminFirestore) {
      try {
        // Con Admin SDK podemos listar todas las colecciones
        const collections = await this.adminFirestore.listCollections();
        
        this.log(`📁 Colecciones encontradas: ${collections.length}`, 'green');
        
        for (const collection of collections) {
          this.log(`\n📂 ${collection.id}`, 'cyan');
          
          const snapshot = await collection.limit(10).get();
          this.log(`   📊 Documentos (primeros 10): ${snapshot.size}`, 'blue');
          
          snapshot.forEach(doc => {
            this.log(`      📄 ${doc.id}`, 'white');
            const data = doc.data();
            Object.entries(data).slice(0, 2).forEach(([key, value]) => {
              this.log(`         ${key}: ${String(value).substring(0, 30)}`, 'gray');
            });
          });
        }
      } catch (error) {
        this.log(`❌ Error listando colecciones: ${error.message}`, 'red');
      }
    } else {
      this.log('⚠️  Admin SDK no disponible - estructura limitada', 'yellow');
    }
  }

  async inspectStorage() {
    this.log('\n📁 INSPECCIONANDO STORAGE...', 'blue');
    this.separator('-', 40);

    if (this.adminStorage) {
      try {
        const bucket = this.adminStorage.bucket();
        const [files] = await bucket.getFiles({ maxResults: 50 });
        
        this.log(`📄 Archivos encontrados: ${files.length}`, 'green');
        
        for (const file of files) {
          this.log(`   📄 ${file.name}`, 'white');
          this.log(`      📏 Tamaño: ${file.metadata.size} bytes`, 'gray');
          this.log(`      📅 Creado: ${file.metadata.timeCreated}`, 'gray');
        }
        
      } catch (error) {
        this.log(`❌ Error accediendo a Storage: ${error.message}`, 'red');
      }
    } else {
      this.log('⚠️  Admin SDK no disponible para Storage', 'yellow');
    }
  }

  async runCompleteAnalysis() {
    await this.initializeFirebase();
    await this.inspectDatabaseStructure();
    await this.inspectStorage();
    
    this.separator();
    this.log('🎯 ANÁLISIS COMPLETADO', 'magenta');
    this.log('Si no ves datos, posibles causas:', 'yellow');
    this.log('1. Las reglas de seguridad requieren autenticación', 'white');
    this.log('2. Los datos están en colecciones con nombres diferentes', 'white');
    this.log('3. Necesitas un service account para acceso completo', 'white');
    this.log('4. Los datos están en subcoleções anidadas', 'white');
    this.separator();
  }
}

// Ejecutar análisis
async function main() {
  const analyzer = new FirebaseDeepAnalyzer();
  await analyzer.runCompleteAnalysis();
}

if (require.main === module) {
  main().catch(error => {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  });
}

module.exports = FirebaseDeepAnalyzer;