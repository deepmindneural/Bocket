#!/usr/bin/env node

/**
 * 🔥 Script de Verificación - Clients/Formularios - Bocket CRM
 * 
 * Este script verifica y analiza la estructura de Firestore:
 * /clients/{businessId}/Formularios/{timestampMs}_{typeForm}_{chatId}
 * 
 * Estructura:
 * - clients: colección estática del negocio
 * - worldfood: identificador del negocio (variable)
 * - Formularios: colección estática de formularios
 * - Document ID format: {timestamp}_{typeForm}_{chatId}
 * 
 * Ejecutar con: node verificar-clients-formularios.js
 */

const admin = require('firebase-admin');
const { initializeApp } = require('firebase/app');
const { getFirestore, doc, getDoc, collection, getDocs, query, where, orderBy, limit } = require('firebase/firestore');

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
  bright: '\x1b[1m'
};

class ClientsFormulariosVerifier {
  constructor() {
    this.app = null;
    this.firestore = null;
    this.results = [];
    
    // Configuración del negocio a verificar
    this.businessId = 'worldfood'; // Variable - identificador del negocio
    this.collectionsToCheck = ['clients']; // Colección estática
    this.formulariosCollection = 'Formularios'; // Colección estática de formularios
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

  async initialize() {
    try {
      this.app = initializeApp(firebaseConfig);
      this.firestore = getFirestore(this.app);
      
      this.logResult('Firebase Initialization', 'SUCCESS', 'Firebase inicializado correctamente', {
        projectId: firebaseConfig.projectId,
        businessId: this.businessId
      });
    } catch (error) {
      this.logResult('Firebase Initialization', 'ERROR', 'Error al inicializar Firebase', error.message);
      throw error;
    }
  }

  // Función para parsear el ID del documento
  parseDocumentId(docId) {
    try {
      // Formato esperado: {timestamp}_{typeForm}_{chatId}
      // Ejemplo: 1753890525649_Formulario reservas particulares_50762263360
      
      const parts = docId.split('_');
      if (parts.length < 3) {
        return {
          valid: false,
          error: 'Formato de ID incorrecto - debe tener al menos 3 partes separadas por _'
        };
      }

      const timestamp = parts[0];
      const chatId = parts[parts.length - 1]; // Último elemento
      const typeForm = parts.slice(1, -1).join('_'); // Todo lo del medio reunido

      // Validar timestamp
      const timestampNum = parseInt(timestamp);
      const isValidTimestamp = !isNaN(timestampNum) && timestampNum > 0;
      
      // Convertir timestamp a fecha legible
      const date = isValidTimestamp ? new Date(timestampNum) : null;

      return {
        valid: isValidTimestamp,
        timestamp: timestampNum,
        typeForm: typeForm,
        chatId: chatId,
        date: date ? {
          iso: date.toISOString(),
          formatted: date.toLocaleString('es-CO', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          })
        } : null,
        raw: docId
      };
    } catch (error) {
      return {
        valid: false,
        error: error.message,
        raw: docId
      };
    }
  }

  async verifyClientsCollection() {
    try {
      this.log(`\n🔍 Verificando colección: /clients`, 'blue');
      
      const clientsRef = collection(this.firestore, 'clients');
      const snapshot = await getDocs(clientsRef);
      
      this.logResult('Clients Collection', 'SUCCESS', `Colección clients encontrada`, {
        documentCount: snapshot.size,
        businessFound: false
      });

      const businesses = [];
      snapshot.forEach((doc) => {
        businesses.push({
          id: doc.id,
          data: doc.data()
        });
        
        if (doc.id === this.businessId) {
          this.logResult(`Business: ${this.businessId}`, 'SUCCESS', 'Negocio encontrado en clients', {
            businessId: doc.id,
            hasData: Object.keys(doc.data()).length > 0,
            dataKeys: Object.keys(doc.data())
          });
        }
      });

      if (businesses.length > 0) {
        this.log(`   📊 Negocios encontrados:`, 'cyan');
        businesses.forEach(business => {
          const indicator = business.id === this.businessId ? '👉' : '  ';
          this.log(`   ${indicator} ${business.id}`, business.id === this.businessId ? 'yellow' : 'white');
        });
      }

      return businesses;
    } catch (error) {
      this.logResult('Clients Collection', 'ERROR', 'Error al verificar colección clients', error.message);
      return [];
    }
  }

  async verifyFormulariosCollection() {
    try {
      this.log(`\n🔍 Verificando colección: /clients/${this.businessId}/Formularios`, 'blue');
      
      const formulariosRef = collection(this.firestore, `clients/${this.businessId}/${this.formulariosCollection}`);
      const snapshot = await getDocs(formulariosRef);
      
      this.logResult('Formularios Collection', 'SUCCESS', `Colección Formularios encontrada`, {
        path: `clients/${this.businessId}/${this.formulariosCollection}`,
        documentCount: snapshot.size
      });

      const formularios = [];
      snapshot.forEach((doc) => {
        const parsedId = this.parseDocumentId(doc.id);
        const data = doc.data();
        
        formularios.push({
          id: doc.id,
          parsedId: parsedId,
          data: data,
          typeFormInData: data.typeForm || null,
          hasTypeForm: !!data.typeForm,
          createdAt: data.createdAt || data.timestamp || null
        });
      });

      // Mostrar resumen de formularios
      if (formularios.length > 0) {
        this.log(`\n   📋 Formularios encontrados (${formularios.length}):`, 'cyan');
        
        formularios.forEach((form, index) => {
          this.log(`   ${index + 1}. ID: ${form.id}`, 'white');
          
          if (form.parsedId.valid) {
            this.log(`      ⏰ Fecha: ${form.parsedId.date?.formatted || 'No válida'}`, 'green');
            this.log(`      📝 Tipo: ${form.parsedId.typeForm}`, 'green');
            this.log(`      👤 Chat ID: ${form.parsedId.chatId}`, 'green');
          } else {
            this.log(`      ❌ Error parsing ID: ${form.parsedId.error}`, 'red');
          }
          
          if (form.hasTypeForm) {
            this.log(`      🏷️  typeForm en data: ${form.typeFormInData}`, 'cyan');
            
            // Verificar consistencia
            if (form.parsedId.valid && form.parsedId.typeForm !== form.typeFormInData) {
              this.log(`      ⚠️  INCONSISTENCIA: typeForm en ID vs data`, 'yellow');
            }
          }
          
          this.log(`      📊 Campos en data: ${Object.keys(form.data).length}`, 'blue');
          this.log(`      🔑 Keys: ${Object.keys(form.data).slice(0, 5).join(', ')}${Object.keys(form.data).length > 5 ? '...' : ''}`, 'blue');
          this.log('', 'white'); // Línea en blanco
        });

        // Estadísticas por tipo de formulario
        await this.analyzeFormTypes(formularios);
      }

      return formularios;
    } catch (error) {
      this.logResult('Formularios Collection', 'ERROR', 'Error al verificar colección Formularios', error.message);
      return [];
    }
  }

  async analyzeFormTypes(formularios) {
    this.log(`\n📊 Análisis de tipos de formularios:`, 'magenta');
    
    const typeStats = {};
    const validForms = formularios.filter(f => f.parsedId.valid);
    const invalidForms = formularios.filter(f => !f.parsedId.valid);
    
    // Contar por tipo
    validForms.forEach(form => {
      const type = form.parsedId.typeForm;
      if (!typeStats[type]) {
        typeStats[type] = {
          count: 0,
          chatIds: new Set(),
          dates: []
        };
      }
      typeStats[type].count++;
      typeStats[type].chatIds.add(form.parsedId.chatId);
      typeStats[type].dates.push(form.parsedId.date?.iso);
    });
    
    // Mostrar estadísticas
    Object.entries(typeStats).forEach(([type, stats]) => {
      this.log(`   📝 ${type}:`, 'yellow');
      this.log(`      📊 Cantidad: ${stats.count}`, 'white');
      this.log(`      👥 Clientes únicos: ${stats.chatIds.size}`, 'white');
      
      // Fechas más reciente y más antigua
      const sortedDates = stats.dates.filter(d => d).sort();
      if (sortedDates.length > 0) {
        const oldest = new Date(sortedDates[0]).toLocaleDateString('es-CO');
        const newest = new Date(sortedDates[sortedDates.length - 1]).toLocaleDateString('es-CO');
        this.log(`      📅 Rango: ${oldest} - ${newest}`, 'white');
      }
    });
    
    if (invalidForms.length > 0) {
      this.log(`\n   ❌ Formularios con ID inválido: ${invalidForms.length}`, 'red');
      invalidForms.forEach(form => {
        this.log(`      - ${form.id}: ${form.parsedId.error}`, 'red');
      });
    }
  }

  async verifySpecificDocument() {
    try {
      // Ejemplo del documento específico mencionado
      const specificDocId = '1753890525649_Formulario reservas particulares_50762263360';
      
      this.log(`\n🔍 Verificando documento específico: ${specificDocId}`, 'blue');
      
      const docRef = doc(this.firestore, `clients/${this.businessId}/${this.formulariosCollection}/${specificDocId}`);
      const docSnapshot = await getDoc(docRef);
      
      if (docSnapshot.exists()) {
        const data = docSnapshot.data();
        const parsedId = this.parseDocumentId(specificDocId);
        
        this.logResult('Specific Document', 'SUCCESS', 'Documento específico encontrado', {
          id: specificDocId,
          exists: true,
          parsedId: parsedId,
          dataKeys: Object.keys(data),
          typeFormInData: data.typeForm,
          createdAt: data.createdAt || data.timestamp
        });
        
        // Mostrar algunos campos importantes
        this.log(`\n   📄 Contenido del documento:`, 'cyan');
        Object.entries(data).slice(0, 10).forEach(([key, value]) => {
          const displayValue = typeof value === 'string' && value.length > 50 
            ? value.substring(0, 50) + '...' 
            : value;
          this.log(`      ${key}: ${JSON.stringify(displayValue)}`, 'white');
        });
        
        if (Object.keys(data).length > 10) {
          this.log(`      ... y ${Object.keys(data).length - 10} campos más`, 'yellow');
        }
      } else {
        this.logResult('Specific Document', 'WARNING', 'Documento específico no encontrado', {
          id: specificDocId,
          path: `clients/${this.businessId}/${this.formulariosCollection}/${specificDocId}`
        });
      }
    } catch (error) {
      this.logResult('Specific Document', 'ERROR', 'Error al verificar documento específico', error.message);
    }
  }

  async runCompleteVerification() {
    this.log('🔥 INICIANDO VERIFICACIÓN DE CLIENTS/FORMULARIOS', 'magenta');
    this.log('=' * 80, 'cyan');
    this.log(`📦 Proyecto: ${firebaseConfig.projectId}`, 'blue');
    this.log(`🏢 Negocio: ${this.businessId}`, 'blue');
    this.log(`📁 Ruta: /clients/${this.businessId}/${this.formulariosCollection}`, 'blue');
    this.log('=' * 80, 'cyan');

    try {
      // 1. Inicializar Firebase
      await this.initialize();

      // 2. Verificar colección clients
      const businesses = await this.verifyClientsCollection();

      // 3. Verificar colección Formularios
      const formularios = await this.verifyFormulariosCollection();

      // 4. Verificar documento específico
      await this.verifySpecificDocument();

      // 5. Mostrar resumen
      this.showSummary(businesses, formularios);

    } catch (error) {
      this.logResult('FATAL ERROR', 'ERROR', 'Error fatal durante la verificación', error.message);
    }
  }

  showSummary(businesses = [], formularios = []) {
    this.log('\n' + '=' * 80, 'cyan');
    this.log('📊 RESUMEN DE VERIFICACIÓN', 'magenta');
    this.log('=' * 80, 'cyan');

    // Estadísticas generales
    this.log(`🏢 Negocios en /clients: ${businesses.length}`, 'blue');
    this.log(`📝 Formularios en /${this.businessId}/Formularios: ${formularios.length}`, 'blue');
    
    const validFormularios = formularios.filter(f => f.parsedId.valid);
    const invalidFormularios = formularios.filter(f => !f.parsedId.valid);
    
    this.log(`✅ Formularios con ID válido: ${validFormularios.length}`, 'green');
    if (invalidFormularios.length > 0) {
      this.log(`❌ Formularios con ID inválido: ${invalidFormularios.length}`, 'red');
    }

    // Estadísticas de resultados
    const successful = this.results.filter(r => r.status === 'SUCCESS').length;
    const errors = this.results.filter(r => r.status === 'ERROR').length;
    const warnings = this.results.filter(r => r.status === 'WARNING').length;

    this.log(`\n📋 Pruebas realizadas:`, 'cyan');
    this.log(`✅ Exitosas: ${successful}`, 'green');
    this.log(`❌ Errores: ${errors}`, 'red');
    this.log(`⚠️  Advertencias: ${warnings}`, 'yellow');

    if (errors === 0) {
      this.log('\n🎉 ¡VERIFICACIÓN EXITOSA!', 'green');
      this.log('✅ La estructura de clients/formularios está funcionando correctamente', 'green');
    } else {
      this.log('\n⚠️  PROBLEMAS DETECTADOS', 'yellow');
      this.log('❌ Revisa los errores anteriores para resolver los problemas', 'red');
    }

    this.log('=' * 80, 'cyan');
  }
}

// Función principal
async function main() {
  const verifier = new ClientsFormulariosVerifier();
  await verifier.runCompleteVerification();
}

// Ejecutar solo si este archivo es ejecutado directamente
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  });
}

module.exports = ClientsFormulariosVerifier;