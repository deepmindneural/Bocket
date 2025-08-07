#!/usr/bin/env node

/**
 * 🧪 Script de Prueba - Crear Cliente y Convertir a VIP - Bocket CRM
 * 
 * Este script crea un cliente de prueba y luego lo convierte a VIP para verificar
 * que la funcionalidad funcione correctamente
 * 
 * Ejecutar con: node crear-cliente-prueba-vip.js
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, setDoc, getDoc, updateDoc } = require('firebase/firestore');

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

const log = (message, color = 'white') => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

class PruebaClienteVIP {
  constructor() {
    this.app = null;
    this.firestore = null;
    this.rutaFormularios = 'clients/worldfood/Formularios';
    this.restauranteId = 'rest_carne_718855';
  }

  // Inicializar Firebase
  async inicializar() {
    try {
      log('🔥 Inicializando Firebase...', 'yellow');
      this.app = initializeApp(firebaseConfig);
      this.firestore = getFirestore(this.app);
      log('✅ Firebase inicializado correctamente', 'green');
      return true;
    } catch (error) {
      log(`❌ Error inicializando Firebase: ${error.message}`, 'red');
      return false;
    }
  }

  // Crear cliente de prueba
  async crearClientePrueba() {
    try {
      log('\n🆕 Creando cliente de prueba...', 'cyan');
      
      const timestamp = Date.now();
      const chatId = `prueba_${timestamp}`;
      const docId = `${timestamp}_cliente_${chatId}`;
      
      // Datos del cliente (usando formato nuevo)
      const datosCliente = {
        typeForm: 'cliente',
        restauranteId: this.restauranteId,
        chatId: chatId,
        timestamp: timestamp,
        nombre: 'Cliente Prueba VIP',
        email: 'prueba.vip@ejemplo.com',
        tipoCliente: 'Regular',
        labels: 'cliente_regular,manual',
        activo: true,
        fechaCreacion: new Date(),
        source: 'prueba_script'
      };

      log('📋 Datos del cliente a crear:', 'white');
      Object.entries(datosCliente).forEach(([key, value]) => {
        log(`   ${key}: ${value}`, 'cyan');
      });

      const clienteDocRef = doc(this.firestore, this.rutaFormularios, docId);
      await setDoc(clienteDocRef, datosCliente);
      
      log(`✅ Cliente creado exitosamente: ${docId}`, 'green');
      return { docId, chatId, datos: datosCliente };
    } catch (error) {
      log(`❌ Error creando cliente: ${error.message}`, 'red');
      return null;
    }
  }

  // Mostrar información del cliente
  async mostrarInfoCliente(docId, titulo = 'CLIENTE') {
    try {
      const clienteDocRef = doc(this.firestore, this.rutaFormularios, docId);
      const docSnap = await getDoc(clienteDocRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        log(`\n📋 ${titulo}:`, 'bright');
        log(`   📄 Document ID: ${docId}`, 'white');
        log(`   💬 Chat ID: ${data.chatId}`, 'cyan');
        log(`   📛 Nombre: ${data.nombre}`, 'white');
        log(`   📧 Email: ${data.email}`, 'white');
        log(`   🏷️  Labels: ${data.labels || 'Sin labels'}`, data.labels && data.labels.includes('vip') ? 'green' : 'yellow');
        log(`   👤 Tipo Cliente: ${data.tipoCliente}`, 'magenta');
        log(`   ⏰ Timestamp: ${data.timestamp}`, 'white');
        
        // Detectar si es VIP
        const esVip = (data.labels && data.labels.includes('vip')) || 
                      (data.tipoCliente && data.tipoCliente === 'VIP');
        log(`   🌟 Es VIP: ${esVip ? 'SÍ' : 'NO'}`, esVip ? 'green' : 'red');
        
        return data;
      } else {
        log(`❌ Cliente no encontrado: ${docId}`, 'red');
        return null;
      }
    } catch (error) {
      log(`❌ Error obteniendo cliente: ${error.message}`, 'red');
      return null;
    }
  }

  // Convertir cliente a VIP (simulando el método del ClienteService)
  async convertirClienteVIP(docId) {
    try {
      log(`\n🌟 Convirtiendo cliente a VIP...`, 'yellow');
      
      const clienteDocRef = doc(this.firestore, this.rutaFormularios, docId);
      
      // Obtener datos actuales
      const docSnap = await getDoc(clienteDocRef);
      if (!docSnap.exists()) {
        log('❌ Cliente no encontrado para actualizar', 'red');
        return false;
      }

      const datosActuales = docSnap.data();
      const datosActualizados = { ...datosActuales };

      // Actualizar según el tipo de formulario
      datosActualizados.lastUpdate = new Date().toISOString();
      
      if (datosActuales.typeForm === 'cliente') {
        // Formato nuevo
        datosActualizados.tipoCliente = 'VIP';
        datosActualizados.labels = 'cliente_vip,premium';
        log('   📝 Actualizando usando formato nuevo', 'blue');
      } else if (datosActuales.typeForm && datosActuales.typeForm.includes('cliente manual')) {
        // Formato anterior
        datosActualizados['Tipo de cliente'] = 'VIP';
        datosActualizados.labels = 'cliente_vip,premium';
        log('   📝 Actualizando usando formato anterior', 'blue');
      } else {
        // Enfoque conservador
        datosActualizados.cliente_tipo_actualizado = 'cliente_vip,premium';
        datosActualizados.labels = 'cliente_vip,premium';
        log('   📝 Actualizando usando enfoque conservador', 'blue');
      }

      log('   💾 Aplicando actualización...', 'white');
      await setDoc(clienteDocRef, datosActualizados);
      log('   ✅ Actualización completada', 'green');
      
      return true;
    } catch (error) {
      log(`❌ Error convirtiendo a VIP: ${error.message}`, 'red');
      return false;
    }
  }

  // Método principal
  async ejecutar() {
    log('🧪 PRUEBA DE CONVERSIÓN A VIP', 'bright');
    log('='.repeat(50), 'cyan');
    
    const inicializado = await this.inicializar();
    if (!inicializado) {
      log('❌ No se pudo inicializar. Terminando...', 'red');
      return;
    }

    // Crear cliente de prueba
    const cliente = await this.crearClientePrueba();
    if (!cliente) {
      log('❌ No se pudo crear cliente de prueba', 'red');
      return;
    }

    // Mostrar cliente antes de la conversión
    log('\n🔍 CLIENTE ANTES DE CONVERSIÓN:', 'bright');
    await this.mostrarInfoCliente(cliente.docId, 'ANTES DE VIP');

    // Convertir a VIP
    const exitoConversion = await this.convertirClienteVIP(cliente.docId);
    
    if (exitoConversion) {
      // Mostrar cliente después de la conversión
      log('\n🎉 CLIENTE DESPUÉS DE CONVERSIÓN:', 'bright');
      await this.mostrarInfoCliente(cliente.docId, 'DESPUÉS DE VIP');
    }

    log('\n🎯 PRUEBA COMPLETADA', 'bright');
    log('='.repeat(50), 'cyan');
  }
}

// Ejecutar el script
const prueba = new PruebaClienteVIP();
prueba.ejecutar().catch(error => {
  console.error('❌ Error fatal:', error);
  process.exit(1);
});