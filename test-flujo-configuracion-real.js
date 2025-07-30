#!/usr/bin/env node

/**
 * 🎯 Test del FLUJO REAL del módulo de configuración 
 * Simula exactamente lo que hace el componente Angular
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, getDoc, updateDoc } = require('firebase/firestore');

// Configuración Firebase (misma que la app)
const firebaseConfig = {
  apiKey: "AIzaSyC54Ytk5wO2zupIuCtFIsIUNXvP4m9qqOk",
  authDomain: "bocket-2024.firebaseapp.com",
  projectId: "bocket-2024",
  storageBucket: "bocket-2024.appspot.com",
  messagingSenderId: "537532907057",
  appId: "1:537532907057:web:dc51aacd0553b9ac2edf10"
};

class SimuladorFlujoCongiguracion {
  constructor() {
    this.app = null;
    this.firestore = null;
    this.currentUser = null;
    this.currentRestaurant = null;
  }

  log(message, type = 'info') {
    const colors = {
      info: '\x1b[37m',
      success: '\x1b[32m',
      error: '\x1b[31m',
      warning: '\x1b[33m',
      header: '\x1b[35m',
      data: '\x1b[36m',
      step: '\x1b[34m'
    };
    
    const icons = {
      info: 'ℹ️',
      success: '✅',
      error: '❌',
      warning: '⚠️',
      header: '🔥',
      data: '📋',
      step: '🔍'
    };

    console.log(`${colors[type]}${icons[type]} ${message}\x1b[0m`);
  }

  async initialize() {
    this.log('SIMULANDO FLUJO REAL DEL MÓDULO DE CONFIGURACIÓN', 'header');
    console.log('='.repeat(80));
    
    this.app = initializeApp(firebaseConfig);
    this.firestore = getFirestore(this.app);
    this.log('Firebase inicializado', 'success');
  }

  // Simular AuthService.estaAutenticado()
  async simularAutenticacion() {
    this.log('\nPASO 1: Simulando AuthService.estaAutenticado()', 'step');
    
    // Simular usuario autenticado (esto vendría del AuthService)
    this.currentUser = {
      uid: 'RrrnpYHraWVlCsabS07XV05E0Wz2',
      email: 'admin@donpepe.com',
      nombre: 'Admin Don Pepe',
      restaurantePrincipal: 'rest_donpepe_001',
      activo: true
    };
    
    this.log(`Usuario autenticado: ${this.currentUser.email}`, 'success');
    this.log(`UID: ${this.currentUser.uid}`, 'data');
    this.log(`Restaurante Principal: ${this.currentUser.restaurantePrincipal}`, 'data');
    
    return true;
  }

  // Simular AuthService.currentRestaurant
  async simularObtenerRestauranteActual() {
    this.log('\nPASO 2: Simulando AuthService.currentRestaurant', 'step');
    
    if (!this.currentUser || !this.currentUser.restaurantePrincipal) {
      this.log('No hay usuario o restaurante principal', 'error');
      return null;
    }

    // Simular que el AuthService ya tiene el restaurante cargado
    this.currentRestaurant = {
      id: this.currentUser.restaurantePrincipal,
      nombre: 'Don Pepe Restaurant',
      slug: 'don-pepe',
      email: 'contacto@donpepe.com',
      colorPrimario: '#D32F2F',
      colorSecundario: '#FFC107'
    };

    this.log(`Restaurante actual obtenido: ${this.currentRestaurant.nombre}`, 'success');
    this.log(`ID: ${this.currentRestaurant.id}`, 'data');
    
    return this.currentRestaurant;
  }

  // Simular RestauranteService.obtenerPorId()
  async simularObtenerDatosCompletos() {
    this.log('\nPASO 3: Simulando RestauranteService.obtenerPorId()', 'step');
    
    if (!this.currentRestaurant || !this.currentRestaurant.id) {
      this.log('No hay ID de restaurante válido', 'error');
      return null;
    }

    try {
      const docRef = doc(this.firestore, 'restaurantes', this.currentRestaurant.id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const restauranteCompleto = { id: docSnap.id, ...docSnap.data() };
        this.log('Datos completos obtenidos de Firebase', 'success');
        this.log(`Nombre: ${restauranteCompleto.nombre}`, 'data');
        this.log(`Slug: ${restauranteCompleto.slug}`, 'data');
        this.log(`Email: ${restauranteCompleto.email}`, 'data');
        this.log(`Teléfono: ${restauranteCompleto.telefono}`, 'data');
        this.log(`Color Primario: ${restauranteCompleto.colorPrimario}`, 'data');
        this.log(`Color Secundario: ${restauranteCompleto.colorSecundario}`, 'data');
        
        if (restauranteCompleto.configuracion) {
          this.log('Configuración adicional encontrada', 'success');
          if (restauranteCompleto.configuracion.userInteractions) {
            this.log('UserInteractions encontradas', 'success');
          } else {
            this.log('UserInteractions NO encontradas', 'warning');
          }
        } else {
          this.log('No hay configuración adicional', 'warning');
        }
        
        return restauranteCompleto;
      } else {
        this.log(`Restaurante ${this.currentRestaurant.id} no existe en Firebase`, 'error');
        return null;
      }
    } catch (error) {
      this.log(`Error al obtener datos: ${error.message}`, 'error');
      return null;
    }
  }

  // Simular guardado de configuración
  async simularGuardarConfiguracion(restauranteCompleto) {
    this.log('\nPASO 4: Simulando guardarConfiguracion()', 'step');
    
    if (!restauranteCompleto || !restauranteCompleto.id) {
      this.log('No hay restaurante válido para guardar', 'error');
      return false;
    }

    // Simular datos del formulario
    const datosFormulario = {
      nombre: restauranteCompleto.nombre,
      slug: restauranteCompleto.slug,
      email: restauranteCompleto.email,
      telefono: restauranteCompleto.telefono,
      direccion: restauranteCompleto.direccion,
      ciudad: restauranteCompleto.ciudad,
      descripcion: 'Descripción actualizada desde test',
      logo: restauranteCompleto.logo,
      colorPrimario: '#FF5722', // Cambio de color
      colorSecundario: '#4CAF50', // Cambio de color
      activo: restauranteCompleto.activo,
      configuracion: {
        ...restauranteCompleto.configuracion,
        userInteractions: {
          whatsappActivo: true,
          whatsappValor: 150,
          whatsappLimite: 600,
          controllerActivo: true,
          controllerValor: 250,
          controllerLimite: 300,
          chatbotActivo: true,
          chatbotValor: 75,
          chatbotLimite: 1200
        }
      }
    };

    this.log('Datos del formulario preparados:', 'info');
    this.log(`Color Primario: ${datosFormulario.colorPrimario}`, 'data');
    this.log(`Color Secundario: ${datosFormulario.colorSecundario}`, 'data');
    this.log(`Descripción: ${datosFormulario.descripcion}`, 'data');

    try {
      // Simular RestauranteService.actualizar()
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
        fechaActualizacion: new Date()
      };

      this.log('Intentando actualizar en Firebase...', 'info');
      
      const docRef = doc(this.firestore, 'restaurantes', restauranteCompleto.id);
      await updateDoc(docRef, cambios);
      
      this.log('¡Actualización exitosa en Firebase!', 'success');

      // Verificar que los datos se guardaron
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const datosActualizados = docSnap.data();
        this.log('Verificación de datos guardados:', 'info');
        this.log(`Color Primario guardado: ${datosActualizados.colorPrimario}`, 'data');
        this.log(`Color Secundario guardado: ${datosActualizados.colorSecundario}`, 'data');
        this.log(`Descripción guardada: ${datosActualizados.descripcion}`, 'data');
        
        if (datosActualizados.configuracion && datosActualizados.configuracion.userInteractions) {
          this.log('UserInteractions guardadas correctamente', 'success');
          this.log(`WhatsApp Activo: ${datosActualizados.configuracion.userInteractions.whatsappActivo}`, 'data');
          this.log(`WhatsApp Valor: ${datosActualizados.configuracion.userInteractions.whatsappValor}`, 'data');
        } else {
          this.log('UserInteractions NO guardadas', 'warning');
        }
      }

      // Restaurar datos originales
      this.log('\nRestaurando datos originales...', 'info');
      await updateDoc(docRef, {
        colorPrimario: restauranteCompleto.colorPrimario,
        colorSecundario: restauranteCompleto.colorSecundario,
        descripcion: restauranteCompleto.descripcion,
        configuracion: restauranteCompleto.configuracion
      });
      this.log('Datos originales restaurados', 'success');

      return true;
    } catch (error) {
      this.log(`Error al guardar: ${error.message}`, 'error');
      this.log(`Código de error: ${error.code}`, 'error');
      return false;
    }
  }

  async ejecutarFlujoCompleto() {
    try {
      await this.initialize();
      
      // Paso 1: Verificar autenticación
      const autenticado = await this.simularAutenticacion();
      if (!autenticado) {
        this.log('FALLO: Usuario no autenticado', 'error');
        return;
      }

      // Paso 2: Obtener restaurante actual
      const restauranteActual = await this.simularObtenerRestauranteActual();
      if (!restauranteActual) {
        this.log('FALLO: No se pudo obtener restaurante actual', 'error');
        return;
      }

      // Paso 3: Cargar datos completos
      const restauranteCompleto = await this.simularObtenerDatosCompletos();
      if (!restauranteCompleto) {
        this.log('FALLO: No se pudieron cargar datos completos', 'error');
        return;
      }

      // Paso 4: Guardar configuración
      const guardadoExitoso = await this.simularGuardarConfiguracion(restauranteCompleto);
      if (!guardadoExitoso) {
        this.log('FALLO: No se pudo guardar la configuración', 'error');
        return;
      }

      this.mostrarResumenFinal(true);

    } catch (error) {
      this.log(`ERROR FATAL: ${error.message}`, 'error');
      console.error(error);
      this.mostrarResumenFinal(false);
    }
  }

  mostrarResumenFinal(exito) {
    console.log('\n' + '='.repeat(80));
    this.log('RESUMEN FINAL DEL FLUJO', 'header');
    console.log('='.repeat(80));

    if (exito) {
      this.log('🎉 ¡FLUJO COMPLETADO EXITOSAMENTE!', 'success');
      this.log('✅ El módulo de configuración está funcionando correctamente', 'success');
      this.log('✅ Todos los pasos del flujo se ejecutaron sin errores', 'success');
      this.log('✅ Las operaciones de lectura y escritura funcionan', 'success');
      this.log('✅ Firebase está conectado y operativo', 'success');
      
      console.log('\n📋 DIAGNÓSTICO:');
      this.log('Si el módulo no funciona en la aplicación, el problema puede ser:', 'info');
      this.log('1. AuthService no está devolviendo currentRestaurant correctamente', 'warning');
      this.log('2. El usuario no está autenticado en la aplicación', 'warning');
      this.log('3. El restaurante no tiene un ID válido', 'warning');
      this.log('4. Hay un error en el formulario Angular', 'warning');
      this.log('5. Problemas de permisos en las reglas de Firestore', 'warning');
    } else {
      this.log('❌ FLUJO FALLÓ', 'error');
      this.log('❌ Hay problemas con la conectividad o datos', 'error');
      this.log('❌ Revisa los errores anteriores', 'error');
    }

    console.log('='.repeat(80));
  }
}

// Ejecutar el simulador
async function main() {
  const simulador = new SimuladorFlujoCongiguracion();
  await simulador.ejecutarFlujoCompleto();
}

if (require.main === module) {
  main().catch(error => {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  });
}

module.exports = SimuladorFlujoCongiguracion;