#!/usr/bin/env node

/**
 * 🔍 Análisis Profundo Firebase - Extraer TODOS los datos
 * 
 * Este script extrae y muestra TODOS los datos completos de Firebase
 * Ejecutar con: node firebase-deep-analysis.js
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, getDoc } = require('firebase/firestore');

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyC54Ytk5wO2zupIuCtFIsIUNXvP4m9qqOk",
  authDomain: "bocket-2024.firebaseapp.com",
  projectId: "bocket-2024",
  storageBucket: "bocket-2024.appspot.com",
  messagingSenderId: "537532907057",
  appId: "1:537532907057:web:dc51aacd0553b9ac2edf10"
};

class FirebaseDeepAnalysis {
  constructor() {
    this.app = null;
    this.firestore = null;
    this.allData = {};
    this.totalDocuments = 0;
  }

  log(message, color = '\x1b[37m') {
    console.log(`${color}${message}\x1b[0m`);
  }

  separator(char = '=', length = 80) {
    this.log(char.repeat(length), '\x1b[36m');
  }

  async initialize() {
    this.log('🔍 ANÁLISIS PROFUNDO FIREBASE - EXTRAYENDO TODOS LOS DATOS', '\x1b[35m');
    this.separator();
    
    this.app = initializeApp(firebaseConfig);
    this.firestore = getFirestore(this.app);
    
    this.log('✅ Firebase inicializado correctamente', '\x1b[32m');
    this.log(`📦 Proyecto: ${firebaseConfig.projectId}`, '\x1b[34m');
  }

  formatValue(value, indent = '') {
    if (value === null || value === undefined) {
      return 'null';
    }
    
    if (typeof value === 'object' && value.constructor === Object) {
      let result = '{\n';
      for (const [key, val] of Object.entries(value)) {
        result += `${indent}  ${key}: ${this.formatValue(val, indent + '  ')}\n`;
      }
      result += `${indent}}`;
      return result;
    }
    
    if (Array.isArray(value)) {
      if (value.length === 0) return '[]';
      let result = '[\n';
      value.forEach((item, index) => {
        result += `${indent}  [${index}]: ${this.formatValue(item, indent + '  ')}\n`;
      });
      result += `${indent}]`;
      return result;
    }
    
    if (value && typeof value.toDate === 'function') {
      return `${value.toDate().toISOString()} (Timestamp Firebase)`;
    }
    
    if (typeof value === 'string' && value.length > 200) {
      return `"${value.substring(0, 200)}..." (${value.length} chars total)`;
    }
    
    return typeof value === 'string' ? `"${value}"` : String(value);
  }

  async extractAllCollections() {
    this.log('\n🗂️  EXTRAYENDO TODAS LAS COLECCIONES...', '\x1b[34m');
    
    // Lista exhaustiva de posibles nombres de colecciones
    const possibleCollections = [
      // Nombres en inglés
      'users', 'user', 'clients', 'client', 'restaurants', 'restaurant',
      'orders', 'order', 'products', 'product', 'reservations', 'reservation',
      'reports', 'report', 'analytics', 'settings', 'config', 'configuration',
      
      // Nombres en español (para el CRM)
      'usuarios', 'usuario', 'clientes', 'cliente', 'restaurantes', 'restaurante',
      'pedidos', 'pedido', 'productos', 'producto', 'reservas', 'reserva',
      'reportes', 'reporte', 'usuariosRestaurantes', 'configuracion',
      
      // Nombres del proyecto Bocket
      'bocket', 'bocket-users', 'bocket-restaurants', 'bocket-data',
      'crm', 'crm-data', 'app-data', 'system', 'admin', 'metadata',
      
      // Otros posibles
      'test', 'demo', 'temp', 'samples', 'examples', 'data'
    ];

    this.log(`🔍 Buscando en ${possibleCollections.length} posibles nombres de colecciones...`, '\x1b[33m');

    for (const collectionName of possibleCollections) {
      await this.extractCollection(collectionName);
    }

    // También buscar colecciones con patrones de ID (como restaurantes específicos)
    await this.searchDynamicCollections();
  }

  async extractCollection(collectionName) {
    try {
      const collectionRef = collection(this.firestore, collectionName);
      const snapshot = await getDocs(collectionRef);
      
      if (snapshot.size > 0) {
        this.log(`\n📁 COLECCIÓN ENCONTRADA: ${collectionName}`, '\x1b[32m');
        this.log(`   📊 Total de documentos: ${snapshot.size}`, '\x1b[36m');
        
        this.allData[collectionName] = {
          count: snapshot.size,
          documents: {}
        };
        
        let docIndex = 0;
        for (const docSnapshot of snapshot.docs) {
          docIndex++;
          const docId = docSnapshot.id;
          const docData = docSnapshot.data();
          
          this.allData[collectionName].documents[docId] = docData;
          this.totalDocuments++;
          
          this.log(`\n   📄 DOCUMENTO ${docIndex}/${snapshot.size}: ${docId}`, '\x1b[33m');
          this.separator('-', 60);
          
          // Mostrar todos los campos del documento
          if (Object.keys(docData).length === 0) {
            this.log('      (Documento vacío)', '\x1b[90m');
          } else {
            for (const [field, value] of Object.entries(docData)) {
              this.log(`      ${field}:`, '\x1b[36m');
              const formattedValue = this.formatValue(value, '        ');
              this.log(`        ${formattedValue}`, '\x1b[37m');
            }
          }
          
          // Buscar subcoleeciones en este documento
          await this.searchSubcollections(docSnapshot.ref.path);
        }
      }
    } catch (error) {
      // Solo mostrar errores importantes, no de permisos
      if (!error.message.includes('permission-denied') && !error.message.includes('insufficient permissions')) {
        this.log(`   ❌ Error en ${collectionName}: ${error.message}`, '\x1b[31m');
      }
    }
  }

  async searchSubcollections(documentPath) {
    // Buscar subcoleeciones comunes en documentos
    const commonSubcollections = [
      'clientes', 'clients', 'reservas', 'reservations',
      'pedidos', 'orders', 'productos', 'products',
      'configuracion', 'config', 'data', 'items'
    ];

    for (const subcollectionName of commonSubcollections) {
      try {
        const subcollectionRef = collection(this.firestore, documentPath, subcollectionName);
        const snapshot = await getDocs(subcollectionRef);
        
        if (snapshot.size > 0) {
          this.log(`\n      📂 SUBCOLECCIÓN: ${documentPath}/${subcollectionName}`, '\x1b[35m');
          this.log(`         📊 Documentos: ${snapshot.size}`, '\x1b[36m');
          
          for (const subDoc of snapshot.docs) {
            this.log(`         📄 ${subDoc.id}:`, '\x1b[33m');
            const subData = subDoc.data();
            for (const [field, value] of Object.entries(subData)) {
              this.log(`            ${field}: ${this.formatValue(value, '              ')}`, '\x1b[37m');
            }
          }
        }
      } catch (error) {
        // Silencioso para subcoleeciones
      }
    }
  }

  async searchDynamicCollections() {
    this.log('\n🔍 BUSCANDO COLECCIONES DINÁMICAS (por ID de restaurante)...', '\x1b[34m');
    
    // Si encontramos restaurantes, buscar sus datos específicos
    if (this.allData.restaurants || this.allData.restaurantes) {
      const restaurants = this.allData.restaurants || this.allData.restaurantes;
      
      for (const restaurantId of Object.keys(restaurants.documents)) {
        this.log(`   🔍 Buscando datos para restaurante: ${restaurantId}`, '\x1b[33m');
        
        // Buscar colecciones específicas del restaurante
        const restaurantCollections = [
          `${restaurantId}/clientes`,
          `${restaurantId}/reservas`, 
          `${restaurantId}/pedidos`,
          `${restaurantId}/productos`,
          `restaurants/${restaurantId}/clientes`,
          `restaurantes/${restaurantId}/clientes`
        ];
        
        for (const path of restaurantCollections) {
          await this.extractCollectionByPath(path);
        }
      }
    }
  }

  async extractCollectionByPath(path) {
    try {
      const collectionRef = collection(this.firestore, path);
      const snapshot = await getDocs(collectionRef);
      
      if (snapshot.size > 0) {
        this.log(`   ✅ DATOS ENCONTRADOS en ${path}: ${snapshot.size} docs`, '\x1b[32m');
        
        for (const doc of snapshot.docs) {
          this.log(`      📄 ${doc.id}:`, '\x1b[37m');
          const data = doc.data();
          for (const [field, value] of Object.entries(data)) {
            this.log(`         ${field}: ${this.formatValue(value, '           ')}`, '\x1b[90m');
          }
        }
      }
    } catch (error) {
      // Silencioso
    }
  }

  analyzeForBocketCRM() {
    this.log('\n🎯 ANÁLISIS ESPECÍFICO PARA BOCKET CRM', '\x1b[35m');
    this.separator('-', 60);
    
    // Buscar las 3 tablas principales del CRM
    const expectedTables = {
      users: ['users', 'usuarios', 'usuario'],
      restaurants: ['restaurants', 'restaurantes', 'restaurante'], 
      userRestaurants: ['usuariosRestaurantes', 'userRestaurants', 'user-restaurants']
    };
    
    let foundTables = 0;
    
    for (const [tableName, possibleNames] of Object.entries(expectedTables)) {
      this.log(`\n🔍 Buscando tabla: ${tableName.toUpperCase()}`, '\x1b[34m');
      
      let found = false;
      for (const possibleName of possibleNames) {
        if (this.allData[possibleName]) {
          found = true;
          foundTables++;
          this.log(`   ✅ ENCONTRADA como: ${possibleName}`, '\x1b[32m');
          this.log(`   📊 Documentos: ${this.allData[possibleName].count}`, '\x1b[36m');
          
          // Analizar estructura de datos
          const sampleDoc = Object.values(this.allData[possibleName].documents)[0];
          if (sampleDoc) {
            this.log(`   📋 Campos encontrados:`, '\x1b[33m');
            Object.keys(sampleDoc).forEach(field => {
              this.log(`      - ${field}`, '\x1b[37m');
            });
          }
          break;
        }
      }
      
      if (!found) {
        this.log(`   ❌ NO ENCONTRADA`, '\x1b[31m');
      }
    }
    
    this.log(`\n📊 RESUMEN BOCKET CRM:`, '\x1b[35m');
    this.log(`   ✅ Tablas encontradas: ${foundTables}/3`, foundTables === 3 ? '\x1b[32m' : '\x1b[33m');
    
    if (foundTables === 3) {
      this.log(`   🎉 ¡Base de datos CRM completa!`, '\x1b[32m');
    } else {
      this.log(`   ⚠️  Base de datos CRM incompleta`, '\x1b[33m');
      this.log(`   💡 Tablas faltantes necesarias para el CRM multi-tenant`, '\x1b[37m');
    }
  }

  showCompleteSummary() {
    this.separator();
    this.log('📊 RESUMEN COMPLETO DEL ANÁLISIS', '\x1b[35m');
    this.separator();
    
    this.log(`📁 Colecciones encontradas: ${Object.keys(this.allData).length}`, '\x1b[32m');
    this.log(`📄 Total de documentos: ${this.totalDocuments}`, '\x1b[32m');
    
    if (Object.keys(this.allData).length > 0) {
      this.log(`\n📋 DETALLE POR COLECCIÓN:`, '\x1b[34m');
      for (const [collectionName, data] of Object.entries(this.allData)) {
        this.log(`   📁 ${collectionName}: ${data.count} documentos`, '\x1b[36m');
        
        // Mostrar IDs de documentos
        const docIds = Object.keys(data.documents);
        if (docIds.length <= 5) {
          this.log(`      IDs: ${docIds.join(', ')}`, '\x1b[90m');
        } else {
          this.log(`      IDs: ${docIds.slice(0, 5).join(', ')}... y ${docIds.length - 5} más`, '\x1b[90m');
        }
      }
    }
    
    this.separator();
    this.log(`⏰ Análisis completado: ${new Date().toLocaleString('es-CO')}`, '\x1b[90m');
  }

  async runCompleteAnalysis() {
    await this.initialize();
    await this.extractAllCollections();
    this.analyzeForBocketCRM();
    this.showCompleteSummary();
  }
}

async function main() {
  const analyzer = new FirebaseDeepAnalysis();
  await analyzer.runCompleteAnalysis();
}

if (require.main === module) {
  main().catch(error => {
    console.error('❌ Error fatal en análisis:', error);
    process.exit(1);
  });
}

module.exports = FirebaseDeepAnalysis;