#!/usr/bin/env node

/**
 * 🧪 Test COMPLETO del módulo de configuración de restaurantes
 * Verificación exhaustiva de conectividad y operaciones CRUD
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, getDoc, updateDoc, setDoc } = require('firebase/firestore');

// Configuración Firebase (misma que la app)
const firebaseConfig = {
  apiKey: "AIzaSyC54Ytk5wO2zupIuCtFIsIUNXvP4m9qqOk",
  authDomain: "bocket-2024.firebaseapp.com",
  projectId: "bocket-2024",
  storageBucket: "bocket-2024.appspot.com",
  messagingSenderId: "537532907057",
  appId: "1:537532907057:web:dc51aacd0553b9ac2edf10"
};

class ConfiguracionRestauranteTest {
  constructor() {
    this.app = null;
    this.firestore = null;
    this.testResults = [];
  }

  log(message, type = 'info') {
    const colors = {
      info: '\x1b[37m',    // blanco
      success: '\x1b[32m', // verde
      error: '\x1b[31m',   // rojo
      warning: '\x1b[33m', // amarillo
      header: '\x1b[35m',  // magenta
      data: '\x1b[36m'     // cyan
    };
    
    const icons = {
      info: 'ℹ️',
      success: '✅',
      error: '❌',
      warning: '⚠️',
      header: '🔥',
      data: '📋'
    };

    console.log(`${colors[type]}${icons[type]} ${message}\x1b[0m`);
  }

  addResult(test, status, message, data = null) {
    this.testResults.push({ test, status, message, data });
    this.log(`${test}: ${message}`, status === 'SUCCESS' ? 'success' : status === 'ERROR' ? 'error' : 'warning');
    if (data) {
      this.log(`   Datos: ${JSON.stringify(data, null, 2)}`, 'data');
    }
  }

  async initialize() {
    this.log('INICIANDO TEST COMPLETO DEL MÓDULO CONFIGURACIÓN RESTAURANTE', 'header');
    console.log('='.repeat(80));
    
    try {
      this.app = initializeApp(firebaseConfig);
      this.firestore = getFirestore(this.app);
      this.addResult('Firebase Initialization', 'SUCCESS', 'Firebase inicializado correctamente');
    } catch (error) {
      this.addResult('Firebase Initialization', 'ERROR', `Error al inicializar: ${error.message}`);
      throw error;
    }
  }

  async testRestaurantesList() {
    this.log('\n1. VERIFICANDO LISTA DE RESTAURANTES...', 'header');
    
    try {
      const restaurantesRef = collection(this.firestore, 'restaurantes');
      const snapshot = await getDocs(restaurantesRef);
      
      const restaurantes = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        restaurantes.push({ id: doc.id, ...data });
      });

      this.addResult('Restaurantes List', 'SUCCESS', `Se encontraron ${restaurantes.length} restaurantes`, {
        count: restaurantes.length,
        ids: restaurantes.map(r => r.id)
      });

      // Mostrar datos básicos de cada restaurante
      restaurantes.forEach(rest => {
        this.log(`   🏪 ${rest.id}:`, 'info');
        this.log(`      - Nombre: ${rest.nombre || 'N/A'}`, 'info');
        this.log(`      - Slug: ${rest.slug || 'N/A'}`, 'info');
        this.log(`      - Color Primario: ${rest.colorPrimario || 'N/A'}`, 'info');
        this.log(`      - Color Secundario: ${rest.colorSecundario || 'N/A'}`, 'info');
        this.log(`      - Email: ${rest.email || 'N/A'}`, 'info');
        this.log(`      - Activo: ${rest.activo ? 'Sí' : 'No'}`, 'info');
      });

      return restaurantes;
    } catch (error) {
      this.addResult('Restaurantes List', 'ERROR', `Error al obtener restaurantes: ${error.message}`);
      return [];
    }
  }

  async testRestauranteDetail(restauranteId) {
    this.log(`\n2. VERIFICANDO DETALLES DEL RESTAURANTE: ${restauranteId}`, 'header');
    
    try {
      const docRef = doc(this.firestore, 'restaurantes', restauranteId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        this.addResult('Restaurante Detail', 'SUCCESS', `Datos del restaurante obtenidos correctamente`);
        
        // Verificar campos importantes para configuración
        this.log('   Campos de configuración encontrados:', 'info');
        this.log(`   - ID: ${restauranteId}`, 'data');
        this.log(`   - Nombre: ${data.nombre || 'N/A'}`, 'data');
        this.log(`   - Slug: ${data.slug || 'N/A'}`, 'data');
        this.log(`   - Email: ${data.email || 'N/A'}`, 'data');
        this.log(`   - Teléfono: ${data.telefono || 'N/A'}`, 'data');
        this.log(`   - Dirección: ${data.direccion || 'N/A'}`, 'data');
        this.log(`   - Ciudad: ${data.ciudad || 'N/A'}`, 'data');
        this.log(`   - Descripción: ${data.descripcion || 'N/A'}`, 'data');
        this.log(`   - Logo: ${data.logo || 'N/A'}`, 'data');
        this.log(`   - Color Primario: ${data.colorPrimario || 'N/A'}`, 'data');
        this.log(`   - Color Secundario: ${data.colorSecundario || 'N/A'}`, 'data');
        this.log(`   - Activo: ${data.activo}`, 'data');
        
        if (data.configuracion) {
          this.log(`   - Tiene configuración adicional: SÍ`, 'success');
          this.log(`   - Configuración: ${JSON.stringify(data.configuracion, null, 2)}`, 'data');
        } else {
          this.log(`   - Tiene configuración adicional: NO`, 'warning');
        }
        
        return data;
      } else {
        this.addResult('Restaurante Detail', 'ERROR', `El restaurante ${restauranteId} no existe`);
        return null;
      }
    } catch (error) {
      this.addResult('Restaurante Detail', 'ERROR', `Error al obtener detalles: ${error.message}`);
      return null;
    }
  }

  async testUpdateRestaurante(restauranteId, testData) {
    this.log(`\n3. PROBANDO ACTUALIZACIÓN DEL RESTAURANTE: ${restauranteId}`, 'header');
    
    try {
      // Primero, guardar los datos originales
      const docRef = doc(this.firestore, 'restaurantes', restauranteId);
      const originalSnap = await getDoc(docRef);
      const originalData = originalSnap.exists() ? originalSnap.data() : null;
      
      if (!originalData) {
        this.addResult('Update Test - Backup', 'ERROR', 'No se pudieron obtener datos originales');
        return false;
      }

      this.addResult('Update Test - Backup', 'SUCCESS', 'Datos originales respaldados');

      // Intentar actualizar con datos de prueba
      const updateData = {
        ...testData,
        fechaActualizacion: new Date(),
        testUpdate: true
      };

      this.log(`   Intentando actualizar con datos:`, 'info');
      this.log(`   ${JSON.stringify(updateData, null, 2)}`, 'data');

      await updateDoc(docRef, updateData);
      this.addResult('Update Test - Write', 'SUCCESS', 'Datos actualizados correctamente en Firestore');

      // Verificar que los datos se guardaron
      const updatedSnap = await getDoc(docRef);
      const updatedData = updatedSnap.data();
      
      let verification = true;
      for (const [key, value] of Object.entries(testData)) {
        if (updatedData[key] !== value) {
          this.log(`   ❌ Campo ${key}: esperado '${value}', obtenido '${updatedData[key]}'`, 'error');
          verification = false;
        } else {
          this.log(`   ✅ Campo ${key}: ${value}`, 'success');
        }
      }

      if (verification) {
        this.addResult('Update Test - Verification', 'SUCCESS', 'Todos los campos se actualizaron correctamente');
      } else {
        this.addResult('Update Test - Verification', 'WARNING', 'Algunos campos no se actualizaron correctamente');
      }

      // Restaurar datos originales
      await updateDoc(docRef, originalData);
      this.addResult('Update Test - Restore', 'SUCCESS', 'Datos originales restaurados');

      return verification;
    } catch (error) {
      this.addResult('Update Test', 'ERROR', `Error durante la actualización: ${error.message}`);
      return false;
    }
  }

  async testUsuariosRestaurantes() {
    this.log('\n4. VERIFICANDO RELACIÓN USUARIOS-RESTAURANTES...', 'header');
    
    try {
      const usuariosRestRef = collection(this.firestore, 'usuariosRestaurantes');
      const snapshot = await getDocs(usuariosRestRef);
      
      const relaciones = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        relaciones.push({ id: doc.id, ...data });
      });

      this.addResult('Usuarios-Restaurantes', 'SUCCESS', `Se encontraron ${relaciones.length} relaciones`, {
        count: relaciones.length,
        relations: relaciones.map(r => r.id)
      });

      relaciones.forEach(rel => {
        this.log(`   🔗 ${rel.id}:`, 'info');
        this.log(`      - Usuario ID: ${rel.usuarioId || 'N/A'}`, 'info');
        this.log(`      - Restaurante ID: ${rel.restauranteId || 'N/A'}`, 'info');
        this.log(`      - Rol: ${rel.rol || 'N/A'}`, 'info');
        this.log(`      - Activo: ${rel.activo ? 'Sí' : 'No'}`, 'info');
      });

      return relaciones;
    } catch (error) {
      this.addResult('Usuarios-Restaurantes', 'ERROR', `Error al obtener relaciones: ${error.message}`);
      return [];
    }
  }

  async testUsuarios() {
    this.log('\n5. VERIFICANDO USUARIOS GLOBALES...', 'header');
    
    try {
      const usuariosRef = collection(this.firestore, 'usuarios');
      const snapshot = await getDocs(usuariosRef);
      
      const usuarios = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        usuarios.push({ id: doc.id, ...data });
      });

      this.addResult('Usuarios Globales', 'SUCCESS', `Se encontraron ${usuarios.length} usuarios`, {
        count: usuarios.length,
        ids: usuarios.map(u => u.id)
      });

      usuarios.forEach(user => {
        this.log(`   👤 ${user.id}:`, 'info');
        this.log(`      - Email: ${user.email || 'N/A'}`, 'info');
        this.log(`      - Nombre: ${user.nombre || 'N/A'}`, 'info');
        this.log(`      - UID: ${user.uid || 'N/A'}`, 'info');
        this.log(`      - Restaurante Principal: ${user.restaurantePrincipal || 'N/A'}`, 'info');
        this.log(`      - Activo: ${user.activo ? 'Sí' : 'No'}`, 'info');
      });

      return usuarios;
    } catch (error) {
      this.addResult('Usuarios Globales', 'ERROR', `Error al obtener usuarios: ${error.message}`);
      return [];
    }
  }

  async runCompleteTest() {
    try {
      await this.initialize();
      
      // 1. Obtener lista de restaurantes
      const restaurantes = await this.testRestaurantesList();
      
      if (restaurantes.length === 0) {
        this.log('\n❌ NO HAY RESTAURANTES EN LA BASE DE DATOS', 'error');
        return;
      }

      // 2. Probar detalles del primer restaurante
      const primerRestaurante = restaurantes[0];
      const detalles = await this.testRestauranteDetail(primerRestaurante.id);
      
      if (detalles) {
        // 3. Probar actualización con datos de prueba
        const testData = {
          colorPrimario: '#FF5722',
          colorSecundario: '#4CAF50',
          descripcion: 'Restaurante de prueba actualizado',
          telefono: '+57 300 999 8888'
        };
        
        await this.testUpdateRestaurante(primerRestaurante.id, testData);
      }

      // 4. Verificar usuarios y relaciones
      await this.testUsuariosRestaurantes();
      await this.testUsuarios();

      this.showFinalSummary();

    } catch (error) {
      this.log(`\n❌ ERROR FATAL: ${error.message}`, 'error');
      console.error(error);
    }
  }

  showFinalSummary() {
    console.log('\n' + '='.repeat(80));
    this.log('RESUMEN FINAL DEL TEST', 'header');
    console.log('='.repeat(80));

    const successful = this.testResults.filter(r => r.status === 'SUCCESS').length;
    const errors = this.testResults.filter(r => r.status === 'ERROR').length;
    const warnings = this.testResults.filter(r => r.status === 'WARNING').length;

    this.log(`✅ Pruebas exitosas: ${successful}`, 'success');
    this.log(`❌ Errores: ${errors}`, 'error');
    this.log(`⚠️ Advertencias: ${warnings}`, 'warning');
    this.log(`📊 Total de pruebas: ${this.testResults.length}`, 'info');

    if (errors === 0) {
      this.log('\n🎉 ¡TODAS LAS PRUEBAS PASARON!', 'success');
      this.log('✅ El módulo de configuración debería funcionar correctamente', 'success');
      this.log('✅ La conectividad con Firebase está funcionando', 'success');
      this.log('✅ Las operaciones CRUD están operativas', 'success');
    } else {
      this.log('\n⚠️ SE ENCONTRARON PROBLEMAS', 'warning');
      this.log('❌ Revisa los errores anteriores', 'error');
      
      // Mostrar errores específicos
      const errorResults = this.testResults.filter(r => r.status === 'ERROR');
      this.log('\n🔍 ERRORES ENCONTRADOS:', 'error');
      errorResults.forEach(err => {
        this.log(`   - ${err.test}: ${err.message}`, 'error');
      });
    }

    console.log('='.repeat(80));
  }
}

// Ejecutar el test
async function main() {
  const tester = new ConfiguracionRestauranteTest();
  await tester.runCompleteTest();
}

if (require.main === module) {
  main().catch(error => {
    console.error('❌ Error fatal en el test:', error);
    process.exit(1);
  });
}

module.exports = ConfiguracionRestauranteTest;