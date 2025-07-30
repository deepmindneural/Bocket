#!/usr/bin/env node

/**
 * 🔍 Escaneo Completo Firebase - Buscar TODAS las tablas del CRM
 * 
 * Este script busca exhaustivamente todas las posibles tablas del CRM
 * incluyendo variaciones de nombres, plurales, singulares, idiomas, etc.
 * Ejecutar con: node firebase-complete-scan.js
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

class FirebaseCompleteScan {
  constructor() {
    this.app = null;
    this.firestore = null;
    this.foundCollections = {};
    this.crmTables = {
      users: { found: false, variations: [], data: null },
      restaurants: { found: false, variations: [], data: null },
      userRestaurants: { found: false, variations: [], data: null },
      clients: { found: false, variations: [], data: null },
      customers: { found: false, variations: [], data: null },
      reservations: { found: false, variations: [], data: null },
      bookings: { found: false, variations: [], data: null },
      orders: { found: false, variations: [], data: null },
      pedidos: { found: false, variations: [], data: null },
      products: { found: false, variations: [], data: null },
      menu: { found: false, variations: [], data: null },
      reports: { found: false, variations: [], data: null },
      analytics: { found: false, variations: [], data: null },
      payments: { found: false, variations: [], data: null },
      transactions: { found: false, variations: [], data: null },
      categories: { found: false, variations: [], data: null },
      config: { found: false, variations: [], data: null },
      settings: { found: false, variations: [], data: null }
    };
  }

  log(message, color = '\x1b[37m') {
    console.log(`${color}${message}\x1b[0m`);
  }

  separator(char = '=', length = 80) {
    this.log(char.repeat(length), '\x1b[36m');
  }

  async initialize() {
    this.log('🔍 ESCANEO COMPLETO FIREBASE - BUSCANDO TODAS LAS TABLAS CRM', '\x1b[35m');
    this.separator();
    
    this.app = initializeApp(firebaseConfig);
    this.firestore = getFirestore(this.app);
    
    this.log('✅ Firebase inicializado correctamente', '\x1b[32m');
    this.log(`📦 Proyecto: ${firebaseConfig.projectId}`, '\x1b[34m');
  }

  generateCollectionVariations() {
    // Generar todas las posibles variaciones de nombres para cada tabla del CRM
    const baseNames = {
      users: ['user', 'users', 'usuario', 'usuarios', 'miembros', 'members', 'accounts', 'cuentas'],
      restaurants: ['restaurant', 'restaurants', 'restaurante', 'restaurantes', 'business', 'negocio', 'negocios', 'establishments', 'establecimientos'],
      userRestaurants: ['userRestaurants', 'usuariosRestaurantes', 'user-restaurants', 'user_restaurants', 'permissions', 'permisos', 'roles', 'access', 'acceso'],
      clients: ['client', 'clients', 'cliente', 'clientes', 'customer', 'customers', 'clientela'],
      reservations: ['reservation', 'reservations', 'reserva', 'reservas', 'booking', 'bookings', 'appointments', 'citas'],
      orders: ['order', 'orders', 'pedido', 'pedidos', 'purchase', 'purchases', 'compra', 'compras', 'sales', 'ventas'],
      products: ['product', 'products', 'producto', 'productos', 'item', 'items', 'menu', 'carta', 'catalog', 'catalogo'],
      categories: ['category', 'categories', 'categoria', 'categorias', 'type', 'types', 'tipo', 'tipos'],
      payments: ['payment', 'payments', 'pago', 'pagos', 'transaction', 'transactions', 'transaccion', 'transacciones'],
      reports: ['report', 'reports', 'reporte', 'reportes', 'analytics', 'estadisticas', 'stats', 'metrics', 'metricas'],
      config: ['config', 'configuration', 'configuracion', 'settings', 'opciones', 'options', 'system', 'sistema'],
      notifications: ['notification', 'notifications', 'notificacion', 'notificaciones', 'alerts', 'alertas', 'messages', 'mensajes'],
      inventory: ['inventory', 'inventario', 'stock', 'almacen', 'warehouse'],
      tables: ['table', 'tables', 'mesa', 'mesas', 'seating', 'asientos'],
      staff: ['staff', 'personal', 'employee', 'employees', 'empleado', 'empleados', 'worker', 'workers'],
      reviews: ['review', 'reviews', 'resena', 'resenas', 'rating', 'ratings', 'calificacion', 'calificaciones', 'feedback'],
      promotions: ['promotion', 'promotions', 'promocion', 'promociones', 'discount', 'discounts', 'descuento', 'descuentos'],
      logs: ['log', 'logs', 'audit', 'auditoria', 'history', 'historial', 'activity', 'actividad']
    };

    // Generar variaciones adicionales con prefijos/sufijos
    const prefixes = ['', 'app_', 'crm_', 'bocket_', 'restaurant_', 'rest_', 'sys_', 'data_'];
    const suffixes = ['', '_data', '_info', '_list', '_collection', '_table', '_db'];

    const allVariations = [];

    for (const [category, names] of Object.entries(baseNames)) {
      for (const name of names) {
        for (const prefix of prefixes) {
          for (const suffix of suffixes) {
            const variation = `${prefix}${name}${suffix}`;
            allVariations.push({ category, name: variation });
          }
        }
      }
    }

    return allVariations;
  }

  async scanAllPossibleCollections() {
    this.log('\n🔍 GENERANDO TODAS LAS POSIBLES VARIACIONES DE NOMBRES...', '\x1b[34m');
    
    const variations = this.generateCollectionVariations();
    this.log(`📋 Total de variaciones a probar: ${variations.length}`, '\x1b[33m');

    let foundCount = 0;
    let checkedCount = 0;

    for (const variation of variations) {
      checkedCount++;
      
      // Mostrar progreso cada 50 verificaciones
      if (checkedCount % 50 === 0) {
        this.log(`   📊 Progreso: ${checkedCount}/${variations.length} (${foundCount} encontradas)`, '\x1b[90m');
      }

      try {
        const collectionRef = collection(this.firestore, variation.name);
        const snapshot = await getDocs(collectionRef);
        
        if (snapshot.size > 0) {
          foundCount++;
          this.foundCollections[variation.name] = {
            category: variation.category,
            count: snapshot.size,
            documents: {}
          };

          // Marcar la categoría como encontrada
          if (this.crmTables[variation.category]) {
            this.crmTables[variation.category].found = true;
            this.crmTables[variation.category].variations.push(variation.name);
          }

          this.log(`   ✅ ENCONTRADA: ${variation.name} (${snapshot.size} docs) - Categoría: ${variation.category}`, '\x1b[32m');

          // Extraer algunos datos de muestra
          let docCount = 0;
          for (const docSnapshot of snapshot.docs) {
            if (docCount >= 3) break; // Solo primeros 3 docs por performance
            
            const docData = docSnapshot.data();
            this.foundCollections[variation.name].documents[docSnapshot.id] = docData;
            docCount++;
          }
        }
      } catch (error) {
        // Silencioso para evitar spam de errores
      }
    }

    this.log(`\n📊 Escaneo completado: ${foundCount} colecciones encontradas de ${variations.length} probadas`, '\x1b[34m');
  }

  async scanSubcollections() {
    this.log('\n🔍 BUSCANDO SUBCOLECCIONES EN DOCUMENTOS EXISTENTES...', '\x1b[34m');

    for (const [collectionName, collectionData] of Object.entries(this.foundCollections)) {
      if (Object.keys(collectionData.documents).length > 0) {
        this.log(`\n📁 Buscando subcolecciones en: ${collectionName}`, '\x1b[33m');

        for (const docId of Object.keys(collectionData.documents)) {
          await this.searchSubcollectionsInDocument(collectionName, docId);
        }
      }
    }
  }

  async searchSubcollectionsInDocument(collectionName, docId) {
    const subcollectionNames = [
      // Nombres de subcolecciones comunes en CRM
      'clientes', 'clients', 'customers',
      'reservas', 'reservations', 'bookings',
      'pedidos', 'orders', 'purchases',
      'productos', 'products', 'items', 'menu',
      'pagos', 'payments', 'transactions',
      'reportes', 'reports', 'analytics',
      'configuracion', 'config', 'settings',
      'personal', 'staff', 'employees',
      'mesas', 'tables', 'seating',
      'inventario', 'inventory', 'stock',
      'promociones', 'promotions', 'discounts',
      'resenas', 'reviews', 'ratings',
      'logs', 'history', 'activity',
      'data', 'info', 'details'
    ];

    for (const subcollectionName of subcollectionNames) {
      try {
        const subcollectionRef = collection(this.firestore, collectionName, docId, subcollectionName);
        const snapshot = await getDocs(subcollectionRef);
        
        if (snapshot.size > 0) {
          const fullPath = `${collectionName}/${docId}/${subcollectionName}`;
          this.log(`      📂 SUBCOLECCIÓN: ${fullPath} (${snapshot.size} docs)`, '\x1b[35m');
          
          // Mostrar algunos datos de la subcolección
          let subDocCount = 0;
          for (const subDoc of snapshot.docs) {
            if (subDocCount >= 2) break;
            
            this.log(`         📄 ${subDoc.id}:`, '\x1b[37m');
            const subData = subDoc.data();
            Object.entries(subData).slice(0, 3).forEach(([field, value]) => {
              const displayValue = typeof value === 'object' ? '[objeto]' : String(value).substring(0, 50);
              this.log(`            ${field}: ${displayValue}`, '\x1b[90m');
            });
            subDocCount++;
          }
        }
      } catch (error) {
        // Silencioso
      }
    }
  }

  analyzeCrmStructure() {
    this.log('\n🎯 ANÁLISIS DE ESTRUCTURA CRM COMPLETA', '\x1b[35m');
    this.separator('-', 60);

    let foundTables = 0;
    let totalTables = Object.keys(this.crmTables).length;

    for (const [tableType, tableInfo] of Object.entries(this.crmTables)) {
      this.log(`\n📋 ${tableType.toUpperCase()}:`, '\x1b[34m');
      
      if (tableInfo.found) {
        foundTables++;
        this.log(`   ✅ ENCONTRADA`, '\x1b[32m');
        this.log(`   📁 Variaciones: ${tableInfo.variations.join(', ')}`, '\x1b[36m');
        
        // Mostrar conteo de documentos por variación
        for (const variation of tableInfo.variations) {
          const count = this.foundCollections[variation]?.count || 0;
          this.log(`      ${variation}: ${count} documentos`, '\x1b[37m');
          
          // Mostrar estructura de campos si hay datos
          if (this.foundCollections[variation]?.documents) {
            const sampleDoc = Object.values(this.foundCollections[variation].documents)[0];
            if (sampleDoc) {
              const fields = Object.keys(sampleDoc);
              this.log(`      Campos: ${fields.slice(0, 5).join(', ')}${fields.length > 5 ? '...' : ''}`, '\x1b[90m');
            }
          }
        }
      } else {
        this.log(`   ❌ NO ENCONTRADA`, '\x1b[31m');
      }
    }

    this.log(`\n📊 RESUMEN CRM:`, '\x1b[35m');
    this.log(`   ✅ Tablas encontradas: ${foundTables}/${totalTables}`, foundTables > totalTables/2 ? '\x1b[32m' : '\x1b[33m');
    this.log(`   📁 Total colecciones: ${Object.keys(this.foundCollections).length}`, '\x1b[36m');
    
    if (foundTables >= totalTables * 0.7) {
      this.log(`   🎉 ¡CRM con estructura robusta encontrada!`, '\x1b[32m');
    } else if (foundTables >= totalTables * 0.4) {
      this.log(`   ⚠️  CRM parcialmente implementado`, '\x1b[33m');
    } else {
      this.log(`   ❌ CRM básico o incompleto`, '\x1b[31m');
    }
  }

  showDetailedResults() {
    this.separator();
    this.log('📋 TODAS LAS COLECCIONES ENCONTRADAS', '\x1b[35m');
    this.separator();

    if (Object.keys(this.foundCollections).length === 0) {
      this.log('❌ No se encontraron colecciones con datos', '\x1b[31m');
      return;
    }

    for (const [collectionName, data] of Object.entries(this.foundCollections)) {
      this.log(`\n📁 ${collectionName}`, '\x1b[32m');
      this.log(`   📊 Documentos: ${data.count}`, '\x1b[36m');
      this.log(`   🏷️  Categoría: ${data.category}`, '\x1b[33m');
      
      // Mostrar IDs de documentos
      const docIds = Object.keys(data.documents);
      if (docIds.length > 0) {
        const idsToShow = docIds.slice(0, 5);
        const idsText = idsToShow.join(', ') + (docIds.length > 5 ? `... (+${docIds.length - 5} más)` : '');
        this.log(`   📄 IDs: ${idsText}`, '\x1b[90m');
      }
    }

    this.separator();
    this.log(`⏰ Análisis completado: ${new Date().toLocaleString('es-CO')}`, '\x1b[90m');
  }

  async runCompleteScan() {
    await this.initialize();
    await this.scanAllPossibleCollections();
    await this.scanSubcollections();
    this.analyzeCrmStructure();
    this.showDetailedResults();
  }
}

async function main() {
  const scanner = new FirebaseCompleteScan();
  await scanner.runCompleteScan();
}

if (require.main === module) {
  main().catch(error => {
    console.error('❌ Error fatal en escaneo completo:', error);
    process.exit(1);
  });
}

module.exports = FirebaseCompleteScan;