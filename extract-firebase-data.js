#!/usr/bin/env node

/**
 * 🔍 Extractor de Datos Firebase - Bocket CRM
 * 
 * Este script extrae y muestra todos los datos disponibles en Firebase
 * Ejecutar con: node extract-firebase-data.js
 */

const { initializeApp } = require('firebase/app');
const { getAuth } = require('firebase/auth');
const { getFirestore, collection, getDocs, doc, getDoc, query, orderBy, limit } = require('firebase/firestore');
const { getStorage, ref, listAll, getDownloadURL, getMetadata } = require('firebase/storage');

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

class FirebaseDataExtractor {
  constructor() {
    this.app = null;
    this.firestore = null;
    this.storage = null;
    this.totalCollections = 0;
    this.totalDocuments = 0;
    this.totalFiles = 0;
  }

  log(message, color = 'white') {
    console.log(`${colors[color]}${message}${colors.reset}`);
  }

  separator(char = '=', length = 60) {
    this.log(char.repeat(length), 'cyan');
  }

  async initialize() {
    try {
      this.app = initializeApp(firebaseConfig);
      this.firestore = getFirestore(this.app);
      this.storage = getStorage(this.app);
      
      this.log('🔥 EXTRACTOR DE DATOS FIREBASE INICIALIZADO', 'magenta');
      this.separator();
      this.log(`📦 Proyecto: ${firebaseConfig.projectId}`, 'blue');
      this.log(`🌐 Base de datos: ${firebaseConfig.authDomain}`, 'blue');
      this.log(`📁 Storage: ${firebaseConfig.storageBucket}`, 'blue');
      this.separator();
      
      return true;
    } catch (error) {
      this.log(`❌ Error al inicializar Firebase: ${error.message}`, 'red');
      return false;
    }
  }

  async extractAllData() {
    this.log('\n🔍 INICIANDO EXTRACCIÓN DE DATOS...', 'yellow');
    
    // 1. Extraer datos de Firestore
    await this.extractFirestoreData();
    
    // 2. Extraer archivos de Storage
    await this.extractStorageData();
    
    // 3. Mostrar resumen final
    this.showFinalSummary();
  }

  async extractFirestoreData() {
    this.log('\n📄 DATOS DE FIRESTORE', 'cyan');
    this.separator('-', 40);

    // Lista de colecciones conocidas de Bocket CRM
    const knownCollections = [
      'usuarios',
      'restaurantes', 
      'usuariosRestaurantes',
      'test',
      // Posibles colecciones anidadas por restaurante
      'clientes',
      'reservas',
      'pedidos',
      'productos',
      'reportes'
    ];

    for (const collectionName of knownCollections) {
      await this.extractCollection(collectionName);
    }

    // Intentar encontrar colecciones dinámicas (por ID de restaurante)
    await this.searchDynamicCollections();
  }

  async extractCollection(collectionName, parentPath = '') {
    try {
      const fullPath = parentPath ? `${parentPath}/${collectionName}` : collectionName;
      const collectionRef = collection(this.firestore, fullPath);
      const querySnapshot = await getDocs(collectionRef);

      if (querySnapshot.size > 0) {
        this.totalCollections++;
        this.totalDocuments += querySnapshot.size;

        this.log(`\n📁 Colección: ${fullPath}`, 'green');
        this.log(`   📊 Documentos encontrados: ${querySnapshot.size}`, 'blue');
        
        let docCount = 0;
        querySnapshot.forEach((docSnapshot) => {
          docCount++;
          const data = docSnapshot.data();
          
          this.log(`\n   📄 Documento ${docCount}: ${docSnapshot.id}`, 'yellow');
          
          // Mostrar datos estructurados
          this.displayDocumentData(data, '      ');
          
          // Verificar si hay timestamps
          this.checkTimestamps(data, '      ');
        });

        // Buscar subcolecciones en cada documento
        if (querySnapshot.size > 0) {
          const firstDoc = querySnapshot.docs[0];
          await this.searchSubcollections(firstDoc.ref.path);
        }

      } else if (parentPath === '') {
        // Solo mostrar colecciones vacías en el nivel raíz
        this.log(`\n📁 Colección: ${fullPath}`, 'gray');
        this.log(`   📊 Sin documentos`, 'gray');
      }

    } catch (error) {
      if (!error.message.includes('Missing or insufficient permissions')) {
        this.log(`\n❌ Error accediendo a ${collectionName}: ${error.message}`, 'red');
      }
    }
  }

  displayDocumentData(data, indent = '') {
    for (const [key, value] of Object.entries(data)) {
      if (value === null || value === undefined) {
        this.log(`${indent}${key}: null`, 'gray');
      } else if (typeof value === 'object' && value.constructor === Object) {
        this.log(`${indent}${key}: {objeto}`, 'cyan');
        this.displayDocumentData(value, indent + '   ');
      } else if (Array.isArray(value)) {
        this.log(`${indent}${key}: [${value.length} elementos]`, 'cyan');
        value.forEach((item, index) => {
          if (typeof item === 'object') {
            this.log(`${indent}   [${index}]:`, 'cyan');
            this.displayDocumentData(item, indent + '      ');
          } else {
            this.log(`${indent}   [${index}]: ${item}`, 'white');
          }
        });
      } else if (value && typeof value.toDate === 'function') {
        // Timestamp de Firebase
        this.log(`${indent}${key}: ${value.toDate().toISOString()} (Timestamp)`, 'yellow');
      } else {
        const displayValue = typeof value === 'string' && value.length > 100 
          ? value.substring(0, 100) + '...' 
          : value;
        this.log(`${indent}${key}: ${displayValue}`, 'white');
      }
    }
  }

  checkTimestamps(data, indent = '') {
    const timestampFields = ['fechaCreacion', 'fechaActualizacion', 'fechaUltimoAcceso', 'timestamp'];
    
    for (const field of timestampFields) {
      if (data[field]) {
        if (data[field].toDate) {
          this.log(`${indent}⏰ ${field}: ${data[field].toDate().toLocaleString('es-CO')}`, 'yellow');
        } else if (typeof data[field] === 'string') {
          this.log(`${indent}⏰ ${field}: ${new Date(data[field]).toLocaleString('es-CO')}`, 'yellow');
        }
      }
    }
  }

  async searchSubcollections(documentPath) {
    // Buscar subcolecciones comunes en documentos de restaurante
    const possibleSubcollections = ['clientes', 'reservas', 'pedidos', 'productos'];
    
    for (const subcollection of possibleSubcollections) {
      await this.extractCollection(subcollection, documentPath);
    }
  }

  async searchDynamicCollections() {
    // Buscar colecciones que podrían tener nombres dinámicos (IDs de restaurante)
    this.log(`\n🔍 Buscando colecciones dinámicas...`, 'cyan');
    
    // Patrones comunes de IDs de restaurante
    const restaurantIdPatterns = [
      'rest_',
      'restaurante_',
      'restaurant_'
    ];

    // Esta búsqueda es limitada ya que no podemos listar todas las colecciones
    // En un proyecto real, necesitaríamos Firebase Admin SDK para esto
    this.log(`   ⚠️  Búsqueda de colecciones dinámicas limitada sin Admin SDK`, 'yellow');
  }

  async extractStorageData() {
    this.log('\n📁 ARCHIVOS EN STORAGE', 'cyan');
    this.separator('-', 40);

    try {
      const storageRef = ref(this.storage);
      await this.listStorageContents(storageRef, '');
      
      if (this.totalFiles === 0) {
        this.log('   📊 No se encontraron archivos accesibles', 'gray');
      }
    } catch (error) {
      this.log(`❌ Error accediendo a Storage: ${error.message}`, 'red');
    }
  }

  async listStorageContents(storageRef, path = '') {
    try {
      const result = await listAll(storageRef);
      
      // Listar carpetas
      if (result.prefixes.length > 0) {
        this.log(`\n📂 Carpetas en ${path || 'raíz'}:`, 'blue');
        for (const folderRef of result.prefixes) {
          const folderName = folderRef.name;
          this.log(`   📁 ${folderName}/`, 'cyan');
          
          // Recursivamente listar contenido de carpetas (limitado a 2 niveles por performance)
          if (path.split('/').length < 2) {
            await this.listStorageContents(folderRef, `${path}${folderName}/`);
          }
        }
      }
      
      // Listar archivos
      if (result.items.length > 0) {
        this.log(`\n📄 Archivos en ${path || 'raíz'}:`, 'blue');
        for (const itemRef of result.items) {
          this.totalFiles++;
          await this.displayFileInfo(itemRef);
        }
      }
    } catch (error) {
      if (!error.message.includes('does not exist')) {
        this.log(`❌ Error listando ${path}: ${error.message}`, 'red');
      }
    }
  }

  async displayFileInfo(fileRef) {
    try {
      const metadata = await getMetadata(fileRef);
      const downloadURL = await getDownloadURL(fileRef);
      
      this.log(`   📄 ${fileRef.name}`, 'green');
      this.log(`      📏 Tamaño: ${this.formatBytes(metadata.size)}`, 'white');
      this.log(`      📅 Creado: ${new Date(metadata.timeCreated).toLocaleString('es-CO')}`, 'white');
      this.log(`      🔗 URL: ${downloadURL.substring(0, 80)}...`, 'gray');
      
      if (metadata.customMetadata) {
        this.log(`      🏷️  Metadata personalizada:`, 'cyan');
        for (const [key, value] of Object.entries(metadata.customMetadata)) {
          this.log(`         ${key}: ${value}`, 'white');
        }
      }
    } catch (error) {
      this.log(`   📄 ${fileRef.name} (sin acceso a metadata)`, 'yellow');
    }
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  showFinalSummary() {
    this.separator();
    this.log('📊 RESUMEN COMPLETO DE DATOS', 'magenta');
    this.separator();
    
    this.log(`📁 Colecciones encontradas: ${this.totalCollections}`, 'green');
    this.log(`📄 Documentos totales: ${this.totalDocuments}`, 'green');
    this.log(`🗂️  Archivos en Storage: ${this.totalFiles}`, 'green');
    
    if (this.totalDocuments === 0 && this.totalFiles === 0) {
      this.log(`\n💡 Base de datos nueva - Sin datos existentes`, 'yellow');
      this.log(`✅ Esto es normal para un proyecto recién creado`, 'green');
      this.log(`🚀 Puedes empezar a agregar datos usando la aplicación`, 'blue');
    } else {
      this.log(`\n🎉 Base de datos con contenido encontrado`, 'green');
    }
    
    this.separator();
    this.log(`⏰ Extracción completada: ${new Date().toLocaleString('es-CO')}`, 'gray');
  }
}

// Ejecutar la extracción
async function main() {
  const extractor = new FirebaseDataExtractor();
  
  const initialized = await extractor.initialize();
  if (!initialized) {
    process.exit(1);
  }
  
  await extractor.extractAllData();
}

// Ejecutar solo si este archivo es ejecutado directamente
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  });
}

module.exports = FirebaseDataExtractor;