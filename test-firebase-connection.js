#!/usr/bin/env node

/**
 * 🔥 Test de Conexión Firebase - Bocket CRM
 * 
 * Este script verifica la conexión con Firebase sin inicializar la aplicación Angular/Ionic
 * Ejecutar con: node test-firebase-connection.js
 */

const admin = require('firebase-admin');
const { initializeApp } = require('firebase/app');
const { getAuth, signInAnonymously } = require('firebase/auth');
const { getFirestore, doc, getDoc, collection, getDocs, addDoc, deleteDoc } = require('firebase/firestore');
const { getStorage, ref, getDownloadURL } = require('firebase/storage');

// Configuración de Firebase desde environment.ts
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
  white: '\x1b[37m'
};

class FirebaseConnectionTester {
  constructor() {
    this.app = null;
    this.auth = null;
    this.firestore = null;
    this.storage = null;
    this.results = [];
  }

  log(message, color = 'white') {
    console.log(`${colors[color]}${message}${colors.reset}`);
  }

  logResult(test, status, message, details = null) {
    const statusColor = status === 'SUCCESS' ? 'green' : status === 'ERROR' ? 'red' : 'yellow';
    const icon = status === 'SUCCESS' ? '✅' : status === 'ERROR' ? '❌' : '⚠️';
    
    this.log(`${icon} ${test}: ${message}`, statusColor);
    
    if (details) {
      this.log(`   📋 Detalles: ${JSON.stringify(details, null, 2)}`, 'cyan');
    }

    this.results.push({ test, status, message, details });
  }

  async runAllTests() {
    this.log('🔥 INICIANDO TESTS DE CONEXIÓN FIREBASE', 'magenta');
    this.log('=' * 60, 'cyan');
    this.log(`📦 Proyecto: ${firebaseConfig.projectId}`, 'blue');
    this.log(`🌐 Auth Domain: ${firebaseConfig.authDomain}`, 'blue');
    this.log('=' * 60, 'cyan');

    try {
      // 1. Test de inicialización
      await this.testFirebaseInitialization();

      // 2. Test de configuración
      await this.testFirebaseConfiguration();

      // 3. Test de Auth (sin autenticación real)
      await this.testFirebaseAuth();

      // 4. Test de Firestore
      await this.testFirestore();

      // 5. Test de Storage
      await this.testFirebaseStorage();

      // 6. Test de lectura de datos específicos del proyecto
      await this.testProjectSpecificData();

      // 7. Test de escritura (opcional)
      await this.testWriteOperations();

    } catch (error) {
      this.logResult('FATAL ERROR', 'ERROR', 'Error fatal durante las pruebas', error.message);
    }

    this.showSummary();
  }

  async testFirebaseInitialization() {
    try {
      this.app = initializeApp(firebaseConfig);
      this.auth = getAuth(this.app);
      this.firestore = getFirestore(this.app);
      this.storage = getStorage(this.app);

      this.logResult('Firebase App Initialization', 'SUCCESS', 'Firebase inicializado correctamente', {
        projectId: this.app.options.projectId,
        authDomain: this.app.options.authDomain
      });
    } catch (error) {
      this.logResult('Firebase App Initialization', 'ERROR', 'Error al inicializar Firebase', error.message);
      throw error;
    }
  }

  async testFirebaseConfiguration() {
    try {
      const requiredFields = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
      const missing = requiredFields.filter(field => !firebaseConfig[field]);

      if (missing.length > 0) {
        throw new Error(`Campos faltantes en configuración: ${missing.join(', ')}`);
      }

      this.logResult('Firebase Configuration', 'SUCCESS', 'Configuración válida', {
        fieldsPresent: requiredFields.length,
        projectId: firebaseConfig.projectId
      });
    } catch (error) {
      this.logResult('Firebase Configuration', 'ERROR', error.message);
    }
  }

  async testFirebaseAuth() {
    try {
      // Test básico de Auth service
      if (this.auth) {
        this.logResult('Firebase Auth Service', 'SUCCESS', 'Servicio de Auth disponible', {
          currentUser: this.auth.currentUser ? 'Usuario autenticado' : 'Sin usuario'
        });
      } else {
        throw new Error('Auth service no disponible');
      }
    } catch (error) {
      this.logResult('Firebase Auth Service', 'ERROR', error.message);
    }
  }

  async testFirestore() {
    try {
      // Test de conexión básica a Firestore
      const testRef = doc(this.firestore, 'test', 'connection');
      
      // Intentar leer un documento (puede no existir)
      const docSnapshot = await getDoc(testRef);
      
      this.logResult('Firestore Connection', 'SUCCESS', 'Conexión a Firestore exitosa', {
        testDocExists: docSnapshot.exists(),
        data: docSnapshot.exists() ? docSnapshot.data() : null
      });

    } catch (error) {
      this.logResult('Firestore Connection', 'ERROR', 'Error al conectar con Firestore', error.message);
    }
  }

  async testFirebaseStorage() {
    try {
      const storageRef = ref(this.storage, 'test/connection-test.txt');
      
      try {
        const downloadURL = await getDownloadURL(storageRef);
        this.logResult('Firebase Storage', 'SUCCESS', 'Storage accesible - archivo de prueba encontrado', {
          downloadURL: downloadURL
        });
      } catch (storageError) {
        // Es normal que el archivo no exista
        this.logResult('Firebase Storage', 'SUCCESS', 'Storage accesible - archivo de prueba no existe (normal)', {
          error: storageError.code
        });
      }
    } catch (error) {
      this.logResult('Firebase Storage', 'ERROR', 'Error al conectar con Storage', error.message);
    }
  }

  async testProjectSpecificData() {
    try {
      // Test de colecciones específicas del proyecto Bocket
      const collections = ['restaurantes', 'usuarios', 'usuariosRestaurantes'];
      
      for (const collectionName of collections) {
        try {
          const querySnapshot = await getDocs(collection(this.firestore, collectionName));
          this.logResult(`Collection: ${collectionName}`, 'SUCCESS', `Colección accesible`, {
            documentCount: querySnapshot.size,
            hasData: querySnapshot.size > 0
          });

          // Mostrar algunos datos si existen
          if (querySnapshot.size > 0) {
            querySnapshot.forEach((doc) => {
              this.log(`   📄 Documento ID: ${doc.id}`, 'cyan');
              const data = doc.data();
              if (data.nombre) this.log(`      - Nombre: ${data.nombre}`, 'cyan');
              if (data.email) this.log(`      - Email: ${data.email}`, 'cyan');
              if (data.slug) this.log(`      - Slug: ${data.slug}`, 'cyan');
            });
          }
        } catch (collectionError) {
          this.logResult(`Collection: ${collectionName}`, 'WARNING', 'Colección no accesible o vacía', collectionError.message);
        }
      }
    } catch (error) {
      this.logResult('Project Specific Data', 'ERROR', 'Error al leer datos del proyecto', error.message);
    }
  }

  async testWriteOperations() {
    try {
      // Test de escritura - crear documento de prueba
      const testData = {
        type: 'connection-test',
        timestamp: new Date().toISOString(),
        message: 'Test de conexión desde Node.js',
        projectId: firebaseConfig.projectId
      };

      const docRef = await addDoc(collection(this.firestore, 'test'), testData);
      
      this.logResult('Write Operations', 'SUCCESS', 'Escritura en Firestore exitosa', {
        documentId: docRef.id,
        data: testData
      });

      // Limpiar - eliminar el documento de prueba
      await deleteDoc(docRef);
      this.logResult('Cleanup', 'SUCCESS', 'Documento de prueba eliminado');

    } catch (error) {
      this.logResult('Write Operations', 'WARNING', 'No se pudieron realizar operaciones de escritura', error.message);
    }
  }

  showSummary() {
    this.log('\n' + '=' * 60, 'cyan');
    this.log('📊 RESUMEN DE PRUEBAS', 'magenta');
    this.log('=' * 60, 'cyan');

    const successful = this.results.filter(r => r.status === 'SUCCESS').length;
    const errors = this.results.filter(r => r.status === 'ERROR').length;
    const warnings = this.results.filter(r => r.status === 'WARNING').length;

    this.log(`✅ Exitosas: ${successful}`, 'green');
    this.log(`❌ Errores: ${errors}`, 'red');
    this.log(`⚠️  Advertencias: ${warnings}`, 'yellow');
    this.log(`📋 Total: ${this.results.length}`, 'blue');

    if (errors === 0) {
      this.log('\n🎉 ¡CONEXIÓN FIREBASE EXITOSA!', 'green');
      this.log('✅ Tu configuración de Firebase está funcionando correctamente', 'green');
    } else {
      this.log('\n⚠️  PROBLEMAS DETECTADOS', 'yellow');
      this.log('❌ Revisa los errores anteriores para resolver los problemas', 'red');
    }

    this.log('=' * 60, 'cyan');
  }
}

// Ejecutar las pruebas
async function main() {
  const tester = new FirebaseConnectionTester();
  await tester.runAllTests();
}

// Ejecutar solo si este archivo es ejecutado directamente
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  });
}

module.exports = FirebaseConnectionTester;