#!/usr/bin/env node

/**
 * 🔍 VERIFICACIÓN REAL Y COMPLETA DE FIRESTORE
 * Análisis exhaustivo de todas las colecciones y documentos existentes
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, getDoc, listCollections } = require('firebase/firestore');

// Configuración Firebase REAL
const firebaseConfig = {
  apiKey: "AIzaSyC54Ytk5wO2zupIuCtFIsIUNXvP4m9qqOk",
  authDomain: "bocket-2024.firebaseapp.com",
  projectId: "bocket-2024",
  storageBucket: "bocket-2024.appspot.com",
  messagingSenderId: "537532907057",
  appId: "1:537532907057:web:dc51aacd0553b9ac2edf10"
};

class VerificadorFirestoreReal {
  constructor() {
    this.app = null;
    this.firestore = null;
    this.estructuraCompleta = {};
  }

  log(message, type = 'info') {
    const colors = {
      info: '\x1b[37m',
      success: '\x1b[32m', 
      error: '\x1b[31m',
      warning: '\x1b[33m',
      header: '\x1b[35m',
      data: '\x1b[36m',
      highlight: '\x1b[93m'
    };
    console.log(`${colors[type]}${message}\x1b[0m`);
  }

  async initialize() {
    this.log('🔍 VERIFICACIÓN COMPLETA DE FIRESTORE - ESTRUCTURA REAL', 'header');
    console.log('='.repeat(80));
    
    this.app = initializeApp(firebaseConfig);
    this.firestore = getFirestore(this.app);
    this.log('✅ Firebase conectado correctamente', 'success');
  }

  async verificarColeccionesRaiz() {
    this.log('\n📁 COLECCIONES EN LA RAÍZ DE FIRESTORE:', 'header');
    
    // Lista de colecciones posibles a verificar
    const coleccionesPosibles = [
      'restaurantes',
      'usuarios', 
      'usuariosRestaurantes',
      'clients',
      'users',
      'configuracion',
      'test'
    ];

    for (const nombreColeccion of coleccionesPosibles) {
      try {
        const coleccionRef = collection(this.firestore, nombreColeccion);
        const snapshot = await getDocs(coleccionRef);
        
        if (snapshot.size > 0) {
          this.log(`✅ ${nombreColeccion}: ${snapshot.size} documentos`, 'success');
          this.estructuraCompleta[nombreColeccion] = {
            documentCount: snapshot.size,
            documents: {}
          };

          // Obtener detalles de cada documento
          snapshot.forEach(doc => {
            const data = doc.data();
            this.estructuraCompleta[nombreColeccion].documents[doc.id] = {
              id: doc.id,
              fields: Object.keys(data),
              sampleData: this.obtenerMuestraData(data)
            };
          });
        } else {
          this.log(`⚠️  ${nombreColeccion}: colección vacía`, 'warning');
        }
      } catch (error) {
        this.log(`❌ ${nombreColeccion}: no existe o sin permisos`, 'error');
      }
    }
  }

  obtenerMuestraData(data, maxFields = 5) {
    const muestra = {};
    const fields = Object.keys(data).slice(0, maxFields);
    
    fields.forEach(field => {
      const value = data[field];
      if (typeof value === 'object' && value !== null) {
        if (value.seconds) {
          muestra[field] = '[Timestamp]';
        } else if (Array.isArray(value)) {
          muestra[field] = `[Array: ${value.length} items]`;
        } else {
          muestra[field] = '[Object]';
        }
      } else {
        muestra[field] = value;
      }
    });
    
    return muestra;
  }

  async analizarRestaurantes() {
    this.log('\n🏪 ANÁLISIS DETALLADO DE RESTAURANTES:', 'header');
    
    try {
      const restaurantesRef = collection(this.firestore, 'restaurantes');
      const snapshot = await getDocs(restaurantesRef);
      
      this.log(`📊 Total restaurantes encontrados: ${snapshot.size}`, 'info');
      
      for (const docSnap of snapshot.docs) {
        const restauranteId = docSnap.id;
        const data = docSnap.data();
        
        this.log(`\n🔍 RESTAURANTE: ${restauranteId}`, 'highlight');
        this.log(`   Nombre: ${data.nombre || 'N/A'}`, 'data');
        this.log(`   Slug: ${data.slug || 'N/A'}`, 'data');
        this.log(`   Email: ${data.email || 'N/A'}`, 'data');
        this.log(`   Teléfono: ${data.telefono || 'N/A'}`, 'data');
        this.log(`   Dirección: ${data.direccion || 'N/A'}`, 'data');
        this.log(`   Ciudad: ${data.ciudad || 'N/A'}`, 'data');
        this.log(`   Color Primario: ${data.colorPrimario || 'N/A'}`, 'data');
        this.log(`   Color Secundario: ${data.colorSecundario || 'N/A'}`, 'data');
        this.log(`   Logo: ${data.logo || 'N/A'}`, 'data');
        this.log(`   Activo: ${data.activo}`, 'data');
        
        // Verificar configuración
        if (data.configuracion) {
          this.log(`   ✅ Tiene configuración adicional`, 'success');
          this.log(`   Campos en configuración: ${Object.keys(data.configuracion).join(', ')}`, 'data');
          
          if (data.configuracion.userInteractions) {
            this.log(`   ✅ Tiene userInteractions`, 'success');
          } else {
            this.log(`   ❌ NO tiene userInteractions`, 'error');
          }
          
          if (data.configuracion.whatsapp) {
            this.log(`   ✅ Tiene configuración WhatsApp`, 'success');
          } else {
            this.log(`   ❌ NO tiene configuración WhatsApp`, 'error');
          }
          
          if (data.configuracion.pedidos) {
            this.log(`   ✅ Tiene configuración de pedidos`, 'success');
          } else {
            this.log(`   ❌ NO tiene configuración de pedidos`, 'error');
          }
        } else {
          this.log(`   ❌ NO tiene configuración adicional`, 'error');
        }
        
        // Verificar subcolecciones del restaurante
        await this.verificarSubcoleccionesRestaurante(restauranteId);
      }
    } catch (error) {
      this.log(`❌ Error analizando restaurantes: ${error.message}`, 'error');
    }
  }

  async verificarSubcoleccionesRestaurante(restauranteId) {
    this.log(`\n   📂 Subcolecciones de ${restauranteId}:`, 'info');
    
    const subcolecciones = ['clientes', 'reservas', 'pedidos', 'productos', 'configuracion', 'mesas'];
    
    for (const subcoleccion of subcolecciones) {
      try {
        const subRef = collection(this.firestore, `restaurantes/${restauranteId}/${subcoleccion}`);
        const subSnapshot = await getDocs(subRef);
        
        if (subSnapshot.size > 0) {
          this.log(`      ✅ ${subcoleccion}: ${subSnapshot.size} documentos`, 'success');
        } else {
          this.log(`      ⚠️  ${subcoleccion}: vacía`, 'warning');
        }
      } catch (error) {
        this.log(`      ❌ ${subcoleccion}: error - ${error.message}`, 'error');
      }
    }
  }

  async verificarUsuarios() {
    this.log('\n👤 ANÁLISIS DE USUARIOS:', 'header');
    
    try {
      const usuariosRef = collection(this.firestore, 'usuarios');
      const snapshot = await getDocs(usuariosRef);
      
      this.log(`📊 Total usuarios: ${snapshot.size}`, 'info');
      
      snapshot.forEach(doc => {
        const data = doc.data();
        this.log(`\n   Usuario ID: ${doc.id}`, 'highlight');
        this.log(`   Email: ${data.email || 'N/A'}`, 'data');
        this.log(`   Nombre: ${data.nombre || 'N/A'}`, 'data');
        this.log(`   UID: ${data.uid || 'N/A'}`, 'data');
        this.log(`   Restaurante Principal: ${data.restaurantePrincipal || 'N/A'}`, 'data');
        this.log(`   Activo: ${data.activo}`, 'data');
      });
    } catch (error) {
      this.log(`❌ Error analizando usuarios: ${error.message}`, 'error');
    }
  }

  async verificarRelacionesUsuarioRestaurante() {
    this.log('\n🔗 ANÁLISIS DE RELACIONES USUARIO-RESTAURANTE:', 'header');
    
    try {
      const relacionesRef = collection(this.firestore, 'usuariosRestaurantes');
      const snapshot = await getDocs(relacionesRef);
      
      this.log(`📊 Total relaciones: ${snapshot.size}`, 'info');
      
      snapshot.forEach(doc => {
        const data = doc.data();
        this.log(`\n   Relación ID: ${doc.id}`, 'highlight');
        this.log(`   Usuario ID: ${data.usuarioId || 'N/A'}`, 'data');
        this.log(`   Restaurante ID: ${data.restauranteId || 'N/A'}`, 'data');
        this.log(`   Rol: ${data.rol || 'N/A'}`, 'data');
        this.log(`   Activo: ${data.activo}`, 'data');
        this.log(`   Permisos: ${data.permisos ? Object.keys(data.permisos).join(', ') : 'N/A'}`, 'data');
      });
    } catch (error) {
      this.log(`❌ Error analizando relaciones: ${error.message}`, 'error');
    }
  }

  async identificarProblemasConfiguracion() {
    this.log('\n⚠️  PROBLEMAS IDENTIFICADOS PARA CONFIGURACIÓN:', 'header');
    
    const problemas = [];
    
    // Verificar si los restaurantes tienen todos los campos necesarios
    try {
      const restaurantesRef = collection(this.firestore, 'restaurantes');
      const snapshot = await getDocs(restaurantesRef);
      
      snapshot.forEach(doc => {
        const data = doc.data();
        const restauranteId = doc.id;
        
        // Campos obligatorios para el módulo de configuración
        const camposRequeridos = ['nombre', 'slug', 'email', 'colorPrimario', 'colorSecundario'];
        
        camposRequeridos.forEach(campo => {
          if (!data[campo]) {
            problemas.push(`❌ Restaurante ${restauranteId}: falta campo '${campo}'`);
          }
        });
        
        // Verificar estructura de configuración
        if (!data.configuracion) {
          problemas.push(`❌ Restaurante ${restauranteId}: falta objeto 'configuracion'`);
        } else {
          if (!data.configuracion.userInteractions) {
            problemas.push(`❌ Restaurante ${restauranteId}: falta 'configuracion.userInteractions'`);
          }
          if (!data.configuracion.whatsapp) {
            problemas.push(`❌ Restaurante ${restauranteId}: falta 'configuracion.whatsapp'`);
          }
          if (!data.configuracion.pedidos) {
            problemas.push(`❌ Restaurante ${restauranteId}: falta 'configuracion.pedidos'`);
          }
        }
      });
    } catch (error) {
      problemas.push(`❌ Error verificando restaurantes: ${error.message}`);
    }
    
    if (problemas.length === 0) {
      this.log('✅ No se encontraron problemas estructurales', 'success');
    } else {
      problemas.forEach(problema => this.log(problema, 'error'));
    }
    
    return problemas;
  }

  async ejecutarVerificacionCompleta() {
    try {
      await this.initialize();
      await this.verificarColeccionesRaiz();
      await this.analizarRestaurantes();
      await this.verificarUsuarios();
      await this.verificarRelacionesUsuarioRestaurante();
      
      const problemas = await this.identificarProblemasConfiguracion();
      
      this.mostrarResumenFinal(problemas);
      
      return this.estructuraCompleta;
    } catch (error) {
      this.log(`❌ ERROR FATAL: ${error.message}`, 'error');
      throw error;
    }
  }

  mostrarResumenFinal(problemas) {
    console.log('\n' + '='.repeat(80));
    this.log('📋 RESUMEN FINAL - ESTADO DE FIRESTORE', 'header');
    console.log('='.repeat(80));
    
    this.log(`📊 Colecciones verificadas: ${Object.keys(this.estructuraCompleta).length}`, 'info');
    
    Object.keys(this.estructuraCompleta).forEach(coleccion => {
      const datos = this.estructuraCompleta[coleccion];
      this.log(`   ${coleccion}: ${datos.documentCount} documentos`, 'data');
    });
    
    this.log(`\n⚠️  Problemas encontrados: ${problemas.length}`, problemas.length > 0 ? 'warning' : 'success');
    
    if (problemas.length === 0) {
      this.log('\n🎉 ¡FIRESTORE ESTÁ CORRECTAMENTE CONFIGURADO!', 'success');
      this.log('✅ El módulo de configuración debería funcionar', 'success');
    } else {
      this.log('\n🔧 ACCIÓN REQUERIDA:', 'warning');
      this.log('Es necesario corregir los problemas identificados', 'warning');
    }
    
    console.log('='.repeat(80));
  }
}

// Ejecutar verificación
async function main() {
  const verificador = new VerificadorFirestoreReal();
  const estructura = await verificador.ejecutarVerificacionCompleta();
  
  // Guardar estructura en archivo para referencia
  const fs = require('fs');
  fs.writeFileSync('firestore-estructura-actual.json', JSON.stringify(estructura, null, 2));
  console.log('\n💾 Estructura guardada en: firestore-estructura-actual.json');
}

if (require.main === module) {
  main().catch(error => {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  });
}

module.exports = VerificadorFirestoreReal;