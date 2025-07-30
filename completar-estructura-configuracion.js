#!/usr/bin/env node

/**
 * 🔧 COMPLETAR ESTRUCTURA DE CONFIGURACIÓN EN FIRESTORE
 * Crear/actualizar los campos faltantes para que el módulo funcione
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, getDoc, updateDoc, setDoc } = require('firebase/firestore');

// Configuración Firebase REAL
const firebaseConfig = {
  apiKey: "AIzaSyC54Ytk5wO2zupIuCtFIsIUNXvP4m9qqOk",
  authDomain: "bocket-2024.firebaseapp.com",
  projectId: "bocket-2024",
  storageBucket: "bocket-2024.appspot.com",
  messagingSenderId: "537532907057",
  appId: "1:537532907057:web:dc51aacd0553b9ac2edf10"
};

class CompletadorEstructuraConfiguracion {
  constructor() {
    this.app = null;
    this.firestore = null;
    this.cambiosRealizados = [];
  }

  log(message, type = 'info') {
    const colors = {
      info: '\x1b[37m',
      success: '\x1b[32m', 
      error: '\x1b[31m',
      warning: '\x1b[33m',
      header: '\x1b[35m',
      data: '\x1b[36m',
      progress: '\x1b[94m'
    };
    console.log(`${colors[type]}${message}\x1b[0m`);
  }

  async initialize() {
    this.log('🔧 COMPLETANDO ESTRUCTURA DE CONFIGURACIÓN EN FIRESTORE', 'header');
    console.log('='.repeat(80));
    
    this.app = initializeApp(firebaseConfig);
    this.firestore = getFirestore(this.app);
    this.log('✅ Firebase conectado correctamente', 'success');
  }

  // Estructura completa que debe tener cada restaurante
  obtenerEstructuraCompleta() {
    return {
      configuracion: {
        userInteractions: {
          whatsappActivo: true,
          whatsappValor: 100,
          whatsappLimite: 500,
          controllerActivo: true,
          controllerValor: 200,
          controllerLimite: 200,
          chatbotActivo: true,
          chatbotValor: 50,
          chatbotLimite: 1000,
          apiActivo: false,
          apiValor: 10,
          apiLimite: 1000,
          campaingActivo: true,
          campaingValor: 300,
          campaingLimite: 100,
          clientActivo: true,
          clientValor: 150,
          clientLimite: 300,
          othersActivo: false,
          othersValor: 50,
          othersLimite: 100,
          wappControllerActivo: true,
          wappControllerValor: 250,
          wappControllerLimite: 150,
          aiActivo: true,
          aiValor: 400,
          aiLimite: 200
        },
        whatsapp: {
          numeroBot: '',
          respuestaAutomatica: true,
          horarioBot: {
            inicio: '08:00',
            fin: '22:00'
          }
        },
        pedidos: {
          tiempoEntrega: 45,
          costoDelivery: 5000,
          montoMinimoDelivery: 25000,
          estadosPermitidos: ['pending', 'accepted', 'rejected', 'inProcess', 'inDelivery', 'deliveried'],
          tiposPermitidos: ['delivery', 'pickUp', 'insideOrder']
        }
      }
    };
  }

  async completarRestaurante(restauranteId) {
    this.log(`\n🔧 Completando configuración para: ${restauranteId}`, 'progress');
    
    try {
      // Obtener datos actuales
      const docRef = doc(this.firestore, 'restaurantes', restauranteId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        this.log(`❌ Restaurante ${restauranteId} no existe`, 'error');
        return false;
      }

      const datosActuales = docSnap.data();
      this.log(`   📋 Datos actuales: ${Object.keys(datosActuales).join(', ')}`, 'data');

      // Verificar campos obligatorios básicos
      const camposBasicos = ['nombre', 'slug', 'email'];
      const camposFaltantes = camposBasicos.filter(campo => !datosActuales[campo]);
      
      if (camposFaltantes.length > 0) {
        this.log(`   ❌ Faltan campos básicos: ${camposFaltantes.join(', ')}`, 'error');
        return false;
      }

      // Preparar la estructura completa
      const estructuraCompleta = this.obtenerEstructuraCompleta();
      
      // Combinar configuración existente con la nueva
      const configuracionActual = datosActuales.configuracion || {};
      const configuracionCompleta = {
        ...configuracionActual,
        ...estructuraCompleta.configuracion
      };

      // Si ya existe userInteractions, preservar los valores actuales
      if (configuracionActual.userInteractions) {
        this.log(`   ✅ UserInteractions existentes encontradas, preservando valores`, 'success');
        configuracionCompleta.userInteractions = {
          ...estructuraCompleta.configuracion.userInteractions,
          ...configuracionActual.userInteractions
        };
      } else {
        this.log(`   🆕 Creando UserInteractions nuevas`, 'progress');
      }

      // Si ya existe configuración de WhatsApp, preservarla
      if (configuracionActual.whatsapp) {
        this.log(`   ✅ Configuración WhatsApp existente encontrada, preservando`, 'success');
        configuracionCompleta.whatsapp = {
          ...estructuraCompleta.configuracion.whatsapp,
          ...configuracionActual.whatsapp
        };
      } else {
        this.log(`   🆕 Creando configuración WhatsApp nueva`, 'progress');
      }

      // Si ya existe configuración de pedidos, preservarla
      if (configuracionActual.pedidos) {
        this.log(`   ✅ Configuración de pedidos existente encontrada, preservando`, 'success');
        configuracionCompleta.pedidos = {
          ...estructuraCompleta.configuracion.pedidos,
          ...configuracionActual.pedidos
        };
      } else {
        this.log(`   🆕 Creando configuración de pedidos nueva`, 'progress');
      }

      // Asegurar que campos obligatorios existen
      const camposObligatorios = {
        telefono: datosActuales.telefono || '+57 300 000 0000',
        direccion: datosActuales.direccion || 'Dirección por definir',
        ciudad: datosActuales.ciudad || 'Ciudad por definir',
        descripcion: datosActuales.descripcion || 'Descripción por definir',
        logo: datosActuales.logo || 'assets/logo.png',
        colorPrimario: datosActuales.colorPrimario || '#004aad',
        colorSecundario: datosActuales.colorSecundario || '#d636a0',
        activo: datosActuales.activo !== undefined ? datosActuales.activo : true
      };

      // Preparar actualización
      const actualizacion = {
        ...camposObligatorios,
        configuracion: configuracionCompleta,
        fechaActualizacion: new Date(),
        estructuraCompletada: true,
        fechaCompletacion: new Date()
      };

      this.log(`   📝 Actualizando documento en Firestore...`, 'progress');
      
      // Realizar la actualización
      await updateDoc(docRef, actualizacion);
      
      this.log(`   ✅ Restaurante ${restauranteId} actualizado exitosamente`, 'success');
      
      // Registrar cambios
      this.cambiosRealizados.push({
        restauranteId,
        cambiosAplicados: Object.keys(actualizacion),
        timestamp: new Date()
      });

      return true;
    } catch (error) {
      this.log(`   ❌ Error actualizando ${restauranteId}: ${error.message}`, 'error');
      return false;
    }
  }

  async verificarActualizacion(restauranteId) {
    this.log(`\n🔍 Verificando actualización de: ${restauranteId}`, 'progress');
    
    try {
      const docRef = doc(this.firestore, 'restaurantes', restauranteId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        this.log(`   ❌ Restaurante no encontrado`, 'error');
        return false;
      }

      const datos = docSnap.data();
      
      // Verificar estructura
      const verificaciones = [
        { campo: 'configuracion', existe: !!datos.configuracion },
        { campo: 'configuracion.userInteractions', existe: !!(datos.configuracion?.userInteractions) },
        { campo: 'configuracion.whatsapp', existe: !!(datos.configuracion?.whatsapp) },
        { campo: 'configuracion.pedidos', existe: !!(datos.configuracion?.pedidos) },
        { campo: 'telefono', existe: !!datos.telefono },
        { campo: 'direccion', existe: !!datos.direccion },
        { campo: 'ciudad', existe: !!datos.ciudad },
        { campo: 'colorPrimario', existe: !!datos.colorPrimario },
        { campo: 'colorSecundario', existe: !!datos.colorSecundario }
      ];

      let todosPresentes = true;
      verificaciones.forEach(verificacion => {
        if (verificacion.existe) {
          this.log(`   ✅ ${verificacion.campo}: presente`, 'success');
        } else {
          this.log(`   ❌ ${verificacion.campo}: faltante`, 'error');
          todosPresentes = false;
        }
      });

      if (todosPresentes) {
        this.log(`   🎉 Estructura completa verificada para ${restauranteId}`, 'success');
      } else {
        this.log(`   ⚠️  Estructura incompleta para ${restauranteId}`, 'warning');
      }

      return todosPresentes;
    } catch (error) {
      this.log(`   ❌ Error verificando: ${error.message}`, 'error');
      return false;
    }
  }

  async ejecutarCompletacion() {
    try {
      await this.initialize();
      
      // Obtener todos los restaurantes
      this.log('\n📋 Obteniendo lista de restaurantes...', 'progress');
      const restaurantesRef = collection(this.firestore, 'restaurantes');
      const snapshot = await getDocs(restaurantesRef);
      
      this.log(`📊 Encontrados ${snapshot.size} restaurantes`, 'info');
      
      let completados = 0;
      let errores = 0;

      // Procesar cada restaurante
      for (const docSnap of snapshot.docs) {
        const restauranteId = docSnap.id;
        const exito = await this.completarRestaurante(restauranteId);
        
        if (exito) {
          completados++;
          // Verificar que la actualización funcionó
          await this.verificarActualizacion(restauranteId);
        } else {
          errores++;
        }
      }

      this.mostrarResumenFinal(completados, errores);
      
      return { completados, errores, cambios: this.cambiosRealizados };
    } catch (error) {
      this.log(`❌ ERROR FATAL: ${error.message}`, 'error');
      throw error;
    }
  }

  mostrarResumenFinal(completados, errores) {
    console.log('\n' + '='.repeat(80));
    this.log('📊 RESUMEN FINAL - COMPLETACIÓN DE ESTRUCTURA', 'header');
    console.log('='.repeat(80));
    
    this.log(`✅ Restaurantes completados: ${completados}`, 'success');
    this.log(`❌ Errores: ${errores}`, errores > 0 ? 'error' : 'success');
    this.log(`📋 Total cambios realizados: ${this.cambiosRealizados.length}`, 'info');
    
    if (this.cambiosRealizados.length > 0) {
      this.log('\n🔧 CAMBIOS APLICADOS:', 'info');
      this.cambiosRealizados.forEach(cambio => {
        this.log(`   ${cambio.restauranteId}: ${cambio.cambiosAplicados.length} campos actualizados`, 'data');
      });
    }
    
    if (errores === 0) {
      this.log('\n🎉 ¡ESTRUCTURA COMPLETADA EXITOSAMENTE!', 'success');
      this.log('✅ El módulo de configuración ahora debería funcionar', 'success');
      this.log('✅ Todos los restaurantes tienen la estructura necesaria', 'success');
    } else {
      this.log('\n⚠️  COMPLETACIÓN PARCIAL', 'warning');
      this.log('Algunos restaurantes no pudieron ser actualizados', 'warning');
    }
    
    console.log('='.repeat(80));
  }
}

// Ejecutar completación
async function main() {
  const completador = new CompletadorEstructuraConfiguracion();
  const resultado = await completador.ejecutarCompletacion();
  
  // Guardar log de cambios
  const fs = require('fs');
  fs.writeFileSync('cambios-estructura-configuracion.json', JSON.stringify(resultado, null, 2));
  console.log('\n💾 Log de cambios guardado en: cambios-estructura-configuracion.json');
}

if (require.main === module) {
  main().catch(error => {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  });
}

module.exports = CompletadorEstructuraConfiguracion;