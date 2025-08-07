#!/usr/bin/env node

/**
 * 🌟 Script de Verificación - Actualización de Clientes VIP - Bocket CRM
 * 
 * Este script verifica que las actualizaciones de estado VIP de clientes funcionen correctamente
 * 
 * Verifica:
 * 1. Que se puedan encontrar clientes existentes
 * 2. Que se actualicen correctamente los labels
 * 3. Que los datos se reflejen correctamente después de la actualización
 * 
 * Ejecutar con: node verificar-actualizacion-vip.js
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, where, doc, updateDoc, getDoc } = require('firebase/firestore');

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

class VerificadorVIP {
  constructor() {
    this.app = null;
    this.firestore = null;
    this.rutaFormularios = 'clients/worldfood/Formularios';
    this.restauranteId = 'rest_carne_718855'; // ID del restaurante de prueba
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

  // Buscar clientes del restaurante
  async buscarClientes() {
    try {
      log(`\n🔍 Buscando clientes del restaurante: ${this.restauranteId}`, 'cyan');
      
      const formulariosRef = collection(this.firestore, this.rutaFormularios);
      const clientesQuery = query(formulariosRef, 
        where('restauranteId', '==', this.restauranteId)
      );
      
      const snapshot = await getDocs(clientesQuery);
      log(`📊 Total documentos encontrados: ${snapshot.size}`, 'blue');
      
      const clientes = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        const docId = doc.id;
        
        // Solo procesar documentos que parecen ser clientes
        if (data.typeForm === 'cliente' || 
            (data.typeForm && data.typeForm.includes('cliente manual')) ||
            (docId.includes('cliente') && data.nombre)) {
          
          clientes.push({
            id: docId,
            chatId: data.chatId,
            nombre: data.nombre || data['Por favor escribe tu nombre'] || 'Sin nombre',
            email: data.email || data['Email (opcional)'] || '',
            labels: data.labels || data['cliente_tipo_actualizado'] || '',
            typeForm: data.typeForm || 'Sin tipo',
            tipoCliente: data.tipoCliente || data['Tipo de cliente'] || '',
            data: data
          });
        }
      });
      
      log(`👤 Clientes encontrados: ${clientes.length}`, 'green');
      return clientes;
    } catch (error) {
      log(`❌ Error buscando clientes: ${error.message}`, 'red');
      return [];
    }
  }

  // Mostrar información de un cliente
  mostrarInfoCliente(cliente, titulo = 'CLIENTE') {
    log(`\n📋 ${titulo}:`, 'bright');
    log(`   📄 Document ID: ${cliente.id}`, 'white');
    log(`   💬 Chat ID: ${cliente.chatId || 'Sin chatId'}`, 'cyan');
    log(`   📛 Nombre: ${cliente.nombre}`, 'white');
    log(`   📧 Email: ${cliente.email}`, 'white');
    log(`   🏷️  Labels: ${cliente.labels || 'Sin labels'}`, cliente.labels && cliente.labels.includes('vip') ? 'green' : 'yellow');
    log(`   🏷️  TypeForm: ${cliente.typeForm}`, 'blue');
    log(`   👤 Tipo Cliente: ${cliente.tipoCliente}`, 'magenta');
    
    // Detectar si es VIP
    const esVip = (cliente.labels && cliente.labels.includes('vip')) || 
                  (cliente.tipoCliente && cliente.tipoCliente.toLowerCase().includes('vip'));
    log(`   🌟 Es VIP: ${esVip ? 'SÍ' : 'NO'}`, esVip ? 'green' : 'red');
  }

  // Actualizar cliente a VIP
  async actualizarClienteVIP(cliente) {
    try {
      log(`\n🌟 Actualizando cliente a VIP: ${cliente.nombre}`, 'yellow');
      
      const clienteDocRef = doc(this.firestore, this.rutaFormularios, cliente.id);
      
      // Preparar datos de actualización según el tipo de documento
      const datosActualizados = {
        lastUpdate: new Date().toISOString()
      };

      if (cliente.typeForm === 'cliente') {
        // Nuevo formato
        datosActualizados.tipoCliente = 'VIP';
        datosActualizados.labels = 'cliente_vip,premium';
        log('   📝 Usando formato nuevo (typeForm: cliente)', 'blue');
      } else if (cliente.typeForm && cliente.typeForm.includes('cliente manual')) {
        // Formato anterior
        datosActualizados['Tipo de cliente'] = 'VIP';
        datosActualizados.labels = 'cliente_vip,premium';
        log('   📝 Usando formato anterior (cliente manual)', 'blue');
      } else {
        // Enfoque conservador
        datosActualizados.cliente_tipo_actualizado = 'cliente_vip,premium';
        datosActualizados.labels = 'cliente_vip,premium';
        log('   📝 Usando enfoque conservador (otros tipos)', 'blue');
      }

      log('   💾 Datos a actualizar:', 'white');
      Object.entries(datosActualizados).forEach(([key, value]) => {
        log(`      ${key}: ${value}`, 'cyan');
      });

      await updateDoc(clienteDocRef, datosActualizados);
      log('   ✅ Actualización completada en Firebase', 'green');
      
      // Verificar la actualización
      const docActualizado = await getDoc(clienteDocRef);
      if (docActualizado.exists()) {
        const datosVerificacion = docActualizado.data();
        log('   🔍 Verificando actualización...', 'yellow');
        log(`      labels: ${datosVerificacion.labels || 'No encontrado'}`, 'white');
        log(`      tipoCliente: ${datosVerificacion.tipoCliente || 'No encontrado'}`, 'white');
        log(`      cliente_tipo_actualizado: ${datosVerificacion.cliente_tipo_actualizado || 'No encontrado'}`, 'white');
        
        const vipActualizado = (datosVerificacion.labels && datosVerificacion.labels.includes('vip')) ||
                              (datosVerificacion.tipoCliente && datosVerificacion.tipoCliente === 'VIP') ||
                              (datosVerificacion.cliente_tipo_actualizado && datosVerificacion.cliente_tipo_actualizado.includes('vip'));
        
        if (vipActualizado) {
          log('   🎉 ¡ÉXITO! El cliente ahora es VIP', 'green');
          return true;
        } else {
          log('   ❌ ERROR: La actualización no se reflejó correctamente', 'red');
          return false;
        }
      } else {
        log('   ❌ ERROR: No se pudo verificar la actualización', 'red');
        return false;
      }
    } catch (error) {
      log(`   ❌ Error actualizando cliente: ${error.message}`, 'red');
      return false;
    }
  }

  // Método principal
  async ejecutar() {
    log('🌟 VERIFICACIÓN DE ACTUALIZACIÓN VIP', 'bright');
    log('='.repeat(60), 'cyan');
    
    const inicializado = await this.inicializar();
    if (!inicializado) {
      log('❌ No se pudo inicializar. Terminando...', 'red');
      return;
    }

    // Buscar clientes
    const clientes = await this.buscarClientes();
    if (clientes.length === 0) {
      log('❌ No se encontraron clientes para probar', 'red');
      return;
    }

    // Mostrar todos los clientes encontrados
    log('\n📋 CLIENTES ENCONTRADOS:', 'bright');
    clientes.forEach((cliente, index) => {
      this.mostrarInfoCliente(cliente, `CLIENTE #${index + 1}`);
    });

    // Encontrar un cliente que NO sea VIP para convertir
    const clienteParaConvertir = clientes.find(c => 
      !c.labels || !c.labels.includes('vip')
    );

    if (!clienteParaConvertir) {
      log('\n⚠️ Todos los clientes ya son VIP. Convirtiendo el primero de nuevo...', 'yellow');
      const exito = await this.actualizarClienteVIP(clientes[0]);
      if (exito) {
        // Buscar clientes de nuevo para mostrar el resultado
        const clientesActualizados = await this.buscarClientes();
        const clienteActualizado = clientesActualizados.find(c => c.id === clientes[0].id);
        if (clienteActualizado) {
          this.mostrarInfoCliente(clienteActualizado, 'CLIENTE DESPUÉS DE ACTUALIZACIÓN');
        }
      }
    } else {
      log('\n🎯 CONVIRTIENDO CLIENTE A VIP:', 'bright');
      this.mostrarInfoCliente(clienteParaConvertir, 'ANTES DE ACTUALIZACIÓN');
      
      const exito = await this.actualizarClienteVIP(clienteParaConvertir);
      
      if (exito) {
        // Buscar clientes de nuevo para mostrar el resultado
        const clientesActualizados = await this.buscarClientes();
        const clienteActualizado = clientesActualizados.find(c => c.id === clienteParaConvertir.id);
        if (clienteActualizado) {
          this.mostrarInfoCliente(clienteActualizado, 'DESPUÉS DE ACTUALIZACIÓN');
        }
      }
    }

    log('\n🎯 VERIFICACIÓN COMPLETADA', 'bright');
    log('='.repeat(60), 'cyan');
  }
}

// Ejecutar el script
const verificador = new VerificadorVIP();
verificador.ejecutar().catch(error => {
  console.error('❌ Error fatal:', error);
  process.exit(1);
});