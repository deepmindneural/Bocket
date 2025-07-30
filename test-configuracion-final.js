#!/usr/bin/env node

/**
 * 🎯 TEST FINAL DEL MÓDULO DE CONFIGURACIÓN
 * Prueba completa con la estructura real de Firestore ya completada
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, getDoc, updateDoc } = require('firebase/firestore');

// Configuración Firebase REAL
const firebaseConfig = {
  apiKey: "AIzaSyC54Ytk5wO2zupIuCtFIsIUNXvP4m9qqOk",
  authDomain: "bocket-2024.firebaseapp.com",
  projectId: "bocket-2024",
  storageBucket: "bocket-2024.appspot.com",
  messagingSenderId: "537532907057",
  appId: "1:537532907057:web:dc51aacd0553b9ac2edf10"
};

class TestConfiguracionFinal {
  constructor() {
    this.app = null;
    this.firestore = null;
    this.testResults = [];
  }

  log(message, type = 'info') {
    const colors = {
      info: '\x1b[37m',
      success: '\x1b[32m', 
      error: '\x1b[31m',
      warning: '\x1b[33m',
      header: '\x1b[35m',
      data: '\x1b[36m',
      step: '\x1b[94m'
    };
    console.log(`${colors[type]}${message}\x1b[0m`);
  }

  addResult(test, status, message, data = null) {
    this.testResults.push({ test, status, message, data, timestamp: new Date() });
    const statusIcon = status === 'SUCCESS' ? '✅' : status === 'ERROR' ? '❌' : '⚠️';
    this.log(`${statusIcon} ${test}: ${message}`, status === 'SUCCESS' ? 'success' : status === 'ERROR' ? 'error' : 'warning');
    
    if (data && typeof data === 'object') {
      this.log(`   📋 ${JSON.stringify(data, null, 2)}`, 'data');
    }
  }

  async initialize() {
    this.log('🎯 TEST FINAL - MÓDULO DE CONFIGURACIÓN CON ESTRUCTURA REAL', 'header');
    console.log('='.repeat(80));
    
    this.app = initializeApp(firebaseConfig);
    this.firestore = getFirestore(this.app);
    this.addResult('Firebase Init', 'SUCCESS', 'Conexión establecida');
  }

  // Test 1: Verificar estructura completa
  async testEstructuraCompleta() {
    this.log('\n📋 TEST 1: Verificando estructura completa', 'step');
    
    try {
      const restaurantesRef = collection(this.firestore, 'restaurantes');
      const snapshot = await getDocs(restaurantesRef);
      
      let todosCompletos = true;
      const detalles = [];

      for (const docSnap of snapshot.docs) {
        const restauranteId = docSnap.id;
        const data = docSnap.data();
        
        const camposRequeridos = [
          'nombre', 'slug', 'email', 'telefono', 'direccion', 'ciudad',
          'colorPrimario', 'colorSecundario', 'configuracion'
        ];
        
        const camposFaltantes = camposRequeridos.filter(campo => !data[campo]);
        const tieneUserInteractions = !!(data.configuracion?.userInteractions);
        const tieneWhatsApp = !!(data.configuracion?.whatsapp);
        const tienePedidos = !!(data.configuracion?.pedidos);
        
        const completo = camposFaltantes.length === 0 && tieneUserInteractions && tieneWhatsApp && tienePedidos;
        
        detalles.push({
          id: restauranteId,
          completo,
          camposFaltantes,
          tieneUserInteractions,
          tieneWhatsApp,
          tienePedidos
        });
        
        if (!completo) {
          todosCompletos = false;
        }
        
        this.log(`   🏪 ${restauranteId}: ${completo ? 'COMPLETO' : 'INCOMPLETO'}`, completo ? 'success' : 'error');
        if (camposFaltantes.length > 0) {
          this.log(`      Faltan: ${camposFaltantes.join(', ')}`, 'error');
        }
        if (!tieneUserInteractions) this.log(`      Sin userInteractions`, 'error');
        if (!tieneWhatsApp) this.log(`      Sin config WhatsApp`, 'error');
        if (!tienePedidos) this.log(`      Sin config pedidos`, 'error');
      }

      this.addResult('Estructura Completa', todosCompletos ? 'SUCCESS' : 'ERROR', 
        `${detalles.filter(d => d.completo).length}/${detalles.length} restaurantes completos`);
      
      return detalles;
    } catch (error) {
      this.addResult('Estructura Completa', 'ERROR', error.message);
      return [];
    }
  }

  // Test 2: Simular carga de datos (como en la app)
  async testCargaDatos(restauranteId) {
    this.log(`\n🔄 TEST 2: Simulando carga de datos para ${restauranteId}`, 'step');
    
    try {
      // Paso 1: AuthService.currentRestaurant simulation
      const restauranteBasico = {
        id: restauranteId,
        nombre: 'Restaurante Ejemplo'
      };
      this.addResult('AuthService Current', 'SUCCESS', 'Restaurante básico obtenido');

      // Paso 2: RestauranteService.obtenerPorId() simulation
      const docRef = doc(this.firestore, 'restaurantes', restauranteId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        this.addResult('Cargar Datos Completos', 'ERROR', 'Restaurante no encontrado');
        return null;
      }

      const restauranteCompleto = { id: docSnap.id, ...docSnap.data() };
      this.addResult('Cargar Datos Completos', 'SUCCESS', 'Datos completos obtenidos de Firestore');
      
      // Verificar que tiene toda la estructura necesaria
      const tieneEstructura = !!(
        restauranteCompleto.configuracion &&
        restauranteCompleto.configuracion.userInteractions &&
        restauranteCompleto.configuracion.whatsapp &&
        restauranteCompleto.configuracion.pedidos
      );
      
      if (tieneEstructura) {
        this.addResult('Validar Estructura', 'SUCCESS', 'Estructura completa para configuración');
      } else {
        this.addResult('Validar Estructura', 'ERROR', 'Estructura incompleta');
      }

      return restauranteCompleto;
    } catch (error) {
      this.addResult('Cargar Datos', 'ERROR', error.message);
      return null;
    }
  }

  // Test 3: Simular guardado completo
  async testGuardadoCompleto(restauranteCompleto) {
    this.log(`\n💾 TEST 3: Simulando guardado completo de configuración`, 'step');
    
    try {
      if (!restauranteCompleto) {
        this.addResult('Guardado Completo', 'ERROR', 'Sin datos para guardar');
        return false;
      }

      // Preparar datos como lo haría el formulario Angular
      const datosFormulario = {
        // Campos básicos
        nombre: restauranteCompleto.nombre,
        slug: restauranteCompleto.slug,
        email: restauranteCompleto.email,
        telefono: restauranteCompleto.telefono,
        direccion: restauranteCompleto.direccion,
        ciudad: restauranteCompleto.ciudad,
        descripcion: 'Descripción actualizada desde test final',
        logo: restauranteCompleto.logo,
        
        // Colores (cambiar para probar)
        colorPrimario: '#E91E63',  // Nuevo color
        colorSecundario: '#009688', // Nuevo color
        
        activo: restauranteCompleto.activo,
        
        // Configuración completa
        configuracion: {
          ...restauranteCompleto.configuracion,
          userInteractions: {
            // Valores actualizados
            whatsappActivo: true,
            whatsappValor: 200,
            whatsappLimite: 800,
            controllerActivo: true,
            controllerValor: 300,
            controllerLimite: 400,
            chatbotActivo: false, // Cambiar estado
            chatbotValor: 80,
            chatbotLimite: 1500,
            // Mantener otros valores
            ...restauranteCompleto.configuracion.userInteractions
          },
          whatsapp: {
            numeroBot: '+57 300 555 9999', // Actualizar número
            respuestaAutomatica: false,    // Cambiar configuración
            horarioBot: {
              inicio: '09:00',
              fin: '21:00'
            }
          },
          pedidos: {
            tiempoEntrega: 30,           // Cambiar tiempo
            costoDelivery: 8000,         // Cambiar costo
            montoMinimoDelivery: 35000,  // Cambiar mínimo
            estadosPermitidos: ['pending', 'accepted', 'inProcess', 'deliveried'], // Quitar algunos
            tiposPermitidos: ['delivery', 'pickUp'] // Quitar insideOrder
          }
        }
      };

      this.log('   📝 Datos preparados para actualización', 'info');
      this.log(`   🎨 Colores: ${datosFormulario.colorPrimario} / ${datosFormulario.colorSecundario}`, 'data');
      this.log(`   📱 WhatsApp: ${datosFormulario.configuracion.whatsapp.numeroBot}`, 'data');
      this.log(`   🍽️ Tiempo entrega: ${datosFormulario.configuracion.pedidos.tiempoEntrega} min`, 'data');

      // Realizar actualización en Firestore
      const docRef = doc(this.firestore, 'restaurantes', restauranteCompleto.id);
      
      const cambios = {
        nombre: datosFormulario.nombre,
        slug: datosFormulario.slug,
        email: datosFormulario.email,
        telefono: datosFormulario.telefono,
        direccion: datosFormulario.direccion,
        ciudad: datosFormulario.ciudad,
        descripcion: datosFormulario.descripcion,
        logo: datosFormulario.logo,
        colorPrimario: datosFormulario.colorPrimario,
        colorSecundario: datosFormulario.colorSecundario,
        configuracion: datosFormulario.configuracion,
        activo: datosFormulario.activo,
        fechaActualizacion: new Date(),
        testFinalCompletado: true
      };

      await updateDoc(docRef, cambios);
      this.addResult('Escritura Firestore', 'SUCCESS', 'Datos actualizados en Firebase');

      // Verificar que se guardaron correctamente
      const verificacionDoc = await getDoc(docRef);
      const datosVerificados = verificacionDoc.data();
      
      const verificaciones = [
        { campo: 'colorPrimario', esperado: datosFormulario.colorPrimario, actual: datosVerificados.colorPrimario },
        { campo: 'colorSecundario', esperado: datosFormulario.colorSecundario, actual: datosVerificados.colorSecundario },
        { campo: 'whatsapp.numeroBot', esperado: datosFormulario.configuracion.whatsapp.numeroBot, actual: datosVerificados.configuracion?.whatsapp?.numeroBot },
        { campo: 'pedidos.tiempoEntrega', esperado: datosFormulario.configuracion.pedidos.tiempoEntrega, actual: datosVerificados.configuracion?.pedidos?.tiempoEntrega },
        { campo: 'userInteractions.whatsappValor', esperado: datosFormulario.configuracion.userInteractions.whatsappValor, actual: datosVerificados.configuracion?.userInteractions?.whatsappValor }
      ];

      let todasCorrectas = true;
      verificaciones.forEach(v => {
        if (v.actual === v.esperado) {
          this.log(`   ✅ ${v.campo}: ${v.actual}`, 'success');
        } else {
          this.log(`   ❌ ${v.campo}: esperado ${v.esperado}, obtenido ${v.actual}`, 'error');
          todasCorrectas = false;
        }
      });

      if (todasCorrectas) {
        this.addResult('Verificación Guardado', 'SUCCESS', 'Todos los campos se guardaron correctamente');
      } else {
        this.addResult('Verificación Guardado', 'ERROR', 'Algunos campos no se guardaron correctamente');
      }

      // Restaurar datos originales
      await updateDoc(docRef, {
        colorPrimario: restauranteCompleto.colorPrimario,
        colorSecundario: restauranteCompleto.colorSecundario,
        descripcion: restauranteCompleto.descripcion,
        configuracion: restauranteCompleto.configuracion
      });
      this.addResult('Restauración Datos', 'SUCCESS', 'Datos originales restaurados');

      return todasCorrectas;
    } catch (error) {
      this.addResult('Guardado Completo', 'ERROR', error.message);
      return false;
    }
  }

  // Test 4: Verificar permisos
  async testPermisos() {
    this.log(`\n🔐 TEST 4: Verificando permisos de escritura`, 'step');
    
    try {
      // Crear documento de prueba
      const testRef = doc(this.firestore, 'test', 'configuracion-test');
      await updateDoc(testRef, {
        test: true,
        timestamp: new Date(),
        modulo: 'configuracion'
      }).catch(async () => {
        // Si no existe, crearlo
        const { setDoc } = require('firebase/firestore');
        await setDoc(testRef, {
          test: true,
          timestamp: new Date(),
          modulo: 'configuracion'
        });
      });

      this.addResult('Permisos Escritura', 'SUCCESS', 'Permisos de escritura funcionando');
      return true;
    } catch (error) {
      this.addResult('Permisos Escritura', 'ERROR', `Error de permisos: ${error.message}`);
      return false;
    }
  }

  async ejecutarTestCompleto() {
    try {
      await this.initialize();
      
      // Test 1: Verificar estructura
      const restaurantes = await this.testEstructuraCompleta();
      
      if (restaurantes.length === 0) {
        this.log('\n❌ NO HAY RESTAURANTES PARA PROBAR', 'error');
        return;
      }

      // Usar el primer restaurante completo
      const restauranteCompleto = restaurantes.find(r => r.completo);
      if (!restauranteCompleto) {
        this.log('\n❌ NO HAY RESTAURANTES CON ESTRUCTURA COMPLETA', 'error');
        return;
      }

      this.log(`\n🎯 Usando restaurante: ${restauranteCompleto.id}`, 'step');

      // Test 2: Cargar datos
      const datosCompletos = await this.testCargaDatos(restauranteCompleto.id);
      
      if (datosCompletos) {
        // Test 3: Guardado completo
        await this.testGuardadoCompleto(datosCompletos);
      }

      // Test 4: Permisos
      await this.testPermisos();

      this.mostrarResumenFinal();

    } catch (error) {
      this.log(`\n❌ ERROR FATAL: ${error.message}`, 'error');
      console.error(error);
    }
  }

  mostrarResumenFinal() {
    console.log('\n' + '='.repeat(80));
    this.log('🎯 RESUMEN FINAL - TEST MÓDULO CONFIGURACIÓN', 'header');
    console.log('='.repeat(80));

    const exitosos = this.testResults.filter(r => r.status === 'SUCCESS').length;
    const errores = this.testResults.filter(r => r.status === 'ERROR').length;
    const advertencias = this.testResults.filter(r => r.status === 'WARNING').length;

    this.log(`✅ Tests exitosos: ${exitosos}`, 'success');
    this.log(`❌ Errores: ${errores}`, errores > 0 ? 'error' : 'success');
    this.log(`⚠️ Advertencias: ${advertencias}`, 'warning');
    this.log(`📊 Total tests: ${this.testResults.length}`, 'info');

    if (errores === 0) {
      this.log('\n🎉 ¡MÓDULO DE CONFIGURACIÓN FUNCIONANDO PERFECTAMENTE!', 'success');
      this.log('✅ Estructura de datos completa', 'success');
      this.log('✅ Carga de datos funcionando', 'success');
      this.log('✅ Guardado de configuración funcionando', 'success');
      this.log('✅ Permisos de escritura correctos', 'success');
      this.log('\n🚀 El módulo debería funcionar sin problemas en la aplicación Angular/Ionic', 'success');
    } else {
      this.log('\n⚠️ PROBLEMAS DETECTADOS', 'warning');
      this.log('❌ Revisa los errores anteriores', 'error');
      
      const erroresList = this.testResults.filter(r => r.status === 'ERROR');
      if (erroresList.length > 0) {
        this.log('\n🔍 ERRORES ENCONTRADOS:', 'error');
        erroresList.forEach(err => {
          this.log(`   - ${err.test}: ${err.message}`, 'error');
        });
      }
    }

    console.log('='.repeat(80));
  }
}

// Ejecutar test final
async function main() {
  const tester = new TestConfiguracionFinal();
  await tester.ejecutarTestCompleto();
}

if (require.main === module) {
  main().catch(error => {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  });
}

module.exports = TestConfiguracionFinal;