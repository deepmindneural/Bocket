#!/usr/bin/env node

/**
 * 🏗️ Creador de Estructura CRM Real - Usando Interfaces del Cliente
 * 
 * Este script crea las tablas del CRM usando las interfaces reales proporcionadas
 * Ejecutar con: node create-real-crm-structure.js
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, setDoc, addDoc, serverTimestamp } = require('firebase/firestore');

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyC54Ytk5wO2zupIuCtFIsIUNXvP4m9qqOk",
  authDomain: "bocket-2024.firebaseapp.com",
  projectId: "bocket-2024",
  storageBucket: "bocket-2024.appspot.com",
  messagingSenderId: "537532907057",
  appId: "1:537532907057:web:dc51aacd0553b9ac2edf10"
};

class RealCRMCreator {
  constructor() {
    this.app = null;
    this.firestore = null;
    this.createdTables = [];
    this.errors = [];
  }

  log(message, color = '\x1b[37m') {
    console.log(`${color}${message}\x1b[0m`);
  }

  separator(char = '=', length = 80) {
    this.log(char.repeat(length), '\x1b[36m');
  }

  async initialize() {
    this.log('🏗️ CREADOR DE CRM REAL - INTERFACES DEL CLIENTE', '\x1b[35m');
    this.separator();
    
    this.app = initializeApp(firebaseConfig);
    this.firestore = getFirestore(this.app);
    
    this.log('✅ Firebase inicializado correctamente', '\x1b[32m');
    this.log(`📦 Implementando interfaces reales del cliente`, '\x1b[34m');
  }

  // Módulo CLIENTES usando interface finalUser
  async createClientesModule() {
    this.log('\n👥 CREANDO MÓDULO: CLIENTES (finalUser interface)', '\x1b[34m');
    
    try {
      // Ejemplo de cliente usando interface finalUser
      const cliente1 = {
        id: "573001234567", // El id es el numero del whatsapp
        isGroup: false,
        creation: new Date().toISOString(),
        isEnterprise: false,
        isBusiness: false,
        isMyContact: true,
        isUser: true,
        isWAContact: true,
        isBlocked: false,
        wappLabels: ["cliente_vip", "frecuente"],
        name: "Pedro Martínez García",
        pushname: "Pedro M.",
        sectionHeader: "Clientes VIP",
        shortName: "Pedro",
        sourceType: "chatBot",
        respType: "bot",
        labels: "cliente_vip,frecuente,cumpleanos",
        whatsAppName: "Pedro Martínez",
        isSpam: false,
        email: "pedro.martinez@email.com",
        company: "Empresas ABC S.A.S",
        address: "Calle 72 #10-15, Bogotá",
        image: "https://firebasestorage.googleapis.com/profiles/pedro.jpg",
        lastUpdate: new Date().toISOString(),
        userInteractions: {
          whatsapp: 45,
          controller: 12,
          chatbot: 23,
          api: 8,
          campaing: 3,
          client: 67,
          others: 2,
          wappController: 15,
          ai: 7,
          fee: 125000
        }
      };

      await setDoc(doc(this.firestore, 'clientes', cliente1.id), cliente1);
      this.log('   ✅ Cliente Pedro Martínez creado', '\x1b[32m');

      const cliente2 = {
        id: "573109876543",
        isGroup: false,
        creation: new Date().toISOString(),
        isEnterprise: true,
        isBusiness: true,
        isMyContact: true,
        isUser: true,
        isWAContact: true,
        isBlocked: false,
        wappLabels: ["cliente_corporativo", "eventos"],
        name: "Ana Lucía Rodríguez Silva",
        pushname: "Ana R.",
        sectionHeader: "Clientes Corporativos",
        shortName: "Ana",
        sourceType: "manual",
        respType: "manual",
        labels: "cliente_corporativo,eventos,cenas_trabajo",
        whatsAppName: "Ana Rodríguez",
        isSpam: false,
        email: "ana.rodriguez@empresa.com",
        company: "Corporación XYZ Ltda",
        address: "Carrera 11 #85-42, Bogotá",
        image: "https://firebasestorage.googleapis.com/profiles/ana.jpg",
        lastUpdate: new Date().toISOString(),
        userInteractions: {
          whatsapp: 78,
          controller: 25,
          chatbot: 12,
          api: 15,
          campaing: 8,
          client: 98,
          others: 5,
          wappController: 32,
          ai: 18,
          fee: 285000
        }
      };

      await setDoc(doc(this.firestore, 'clientes', cliente2.id), cliente2);
      this.log('   ✅ Cliente Ana Rodríguez creado', '\x1b[32m');

      this.createdTables.push('clientes');
    } catch (error) {
      this.log(`   ❌ Error creando clientes: ${error.message}`, '\x1b[31m');
      this.errors.push({ table: 'clientes', error: error.message });
    }
  }

  // Módulo RESERVAS usando interface VenueBooking
  async createReservasModule() {
    this.log('\n📅 CREANDO MÓDULO: RESERVAS (VenueBooking interface)', '\x1b[34m');
    
    try {
      const reserva1 = {
        id: "reserva_" + Date.now() + "_1",
        contact: "573001234567", // ID del contacto de whatsapp
        contactNameBooking: "Pedro Martínez García",
        peopleBooking: "4", // string como especifica la interface
        finalPeopleBooking: 4, // number como especifica la interface
        dateBooking: "2025-07-27T19:30:00.000Z",
        statusBooking: "accepted",
        detailsBooking: "Mesa cerca de la ventana, celebración de cumpleaños, necesita silla alta para niño",
        reconfirmDate: "2025-07-26T14:30:00.000Z",
        reconfirmStatus: "accepted"
      };

      await setDoc(doc(this.firestore, 'reservas', reserva1.id), reserva1);
      this.log('   ✅ Reserva de Pedro Martínez creada', '\x1b[32m');

      const reserva2 = {
        id: "reserva_" + Date.now() + "_2",
        contact: "573109876543",
        contactNameBooking: "Ana Lucía Rodríguez Silva",
        peopleBooking: "6",
        finalPeopleBooking: 6,
        dateBooking: "2025-07-28T14:00:00.000Z",
        statusBooking: "pending",
        detailsBooking: "Cena de trabajo corporativa, requiere factura electrónica, menú ejecutivo",
        reconfirmDate: undefined,
        reconfirmStatus: "pending"
      };

      await setDoc(doc(this.firestore, 'reservas', reserva2.id), reserva2);
      this.log('   ✅ Reserva de Ana Rodríguez creada', '\x1b[32m');

      const reserva3 = {
        id: "reserva_" + Date.now() + "_3",
        contact: "573201357924",
        contactNameBooking: "Carlos Eduardo Vargas",
        peopleBooking: "2",
        finalPeopleBooking: 2,
        dateBooking: "2025-07-29T20:15:00.000Z",
        statusBooking: "rejected",
        detailsBooking: "Cena romántica, solicita mesa privada",
        reconfirmDate: undefined,
        reconfirmStatus: "rejected"
      };

      await setDoc(doc(this.firestore, 'reservas', reserva3.id), reserva3);
      this.log('   ✅ Reserva de Carlos Vargas creada', '\x1b[32m');

      this.createdTables.push('reservas');
    } catch (error) {
      this.log(`   ❌ Error creando reservas: ${error.message}`, '\x1b[31m');
      this.errors.push({ table: 'reservas', error: error.message });
    }
  }

  // Módulo PEDIDOS usando interface OrderTodelivery
  async createPedidosModule() {
    this.log('\n🛍️ CREANDO MÓDULO: PEDIDOS (OrderTodelivery interface)', '\x1b[34m');
    
    try {
      const pedido1 = {
        id: "pedido_" + Date.now() + "_1",
        contact: "573001234567",
        orderType: "delivery",
        resumeOrder: "1x Bandeja Paisa ($35.000), 1x Jugo Natural Naranja ($8.000), 1x Arepa con Queso ($5.000). Total: $48.000",
        contactNameOrder: "Pedro Martínez García",
        addressToDelivery: "Calle 72 #10-15, Bogotá - Barrio Rosales, Torre A Apto 502",
        statusBooking: "inDelivery"
      };

      await setDoc(doc(this.firestore, 'pedidos', pedido1.id), pedido1);
      this.log('   ✅ Pedido delivery de Pedro creado', '\x1b[32m');

      const pedido2 = {
        id: "pedido_" + Date.now() + "_2",
        contact: "573109876543",
        orderType: "pickUp",
        resumeOrder: "2x Café Americano ($16.000), 3x Croissant Almendras ($36.000), 1x Cheesecake ($18.000). Total: $70.000",
        contactNameOrder: "Ana Lucía Rodríguez Silva",
        addressToDelivery: "Recoge en tienda - Marina Café & Bistro",
        statusBooking: "accepted"
      };

      await setDoc(doc(this.firestore, 'pedidos', pedido2.id), pedido2);
      this.log('   ✅ Pedido pickup de Ana creado', '\x1b[32m');

      const pedido3 = {
        id: "pedido_" + Date.now() + "_3",
        contact: "573201357924",
        orderType: "insideOrder",
        resumeOrder: "1x Churrasco Argentino ($45.000), 1x Vino Tinto Copa ($22.000), 1x Postre del día ($12.000). Total: $79.000",
        contactNameOrder: "Carlos Eduardo Vargas",
        addressToDelivery: "Mesa 12 - Don Pepe Parrilla",
        statusBooking: "inProcess"
      };

      await setDoc(doc(this.firestore, 'pedidos', pedido3.id), pedido3);
      this.log('   ✅ Pedido mesa de Carlos creado', '\x1b[32m');

      this.createdTables.push('pedidos');
    } catch (error) {
      this.log(`   ❌ Error creando pedidos: ${error.message}`, '\x1b[31m');
      this.errors.push({ table: 'pedidos', error: error.message });
    }
  }

  // Módulo PRODUCTOS (mantenemos estructura similar pero compatible)
  async createProductosModule() {
    this.log('\n🍽️ CREANDO MÓDULO: PRODUCTOS (compatible con pedidos)', '\x1b[34m');
    
    try {
      const producto1 = {
        id: "prod_bandeja_paisa",
        nombre: "Bandeja Paisa",
        descripcion: "Plato típico antioqueño completo",
        categoria: "Platos Principales",
        precio: 35000,
        moneda: "COP",
        disponible: true,
        tiempoPreparacion: 25, // minutos
        ingredientes: ["Frijoles", "Arroz", "Huevo", "Chicharrón", "Chorizo", "Morcilla", "Aguacate", "Arepa"],
        alergenos: ["Huevo", "Lácteos"],
        calorias: 850,
        imagen: "https://firebasestorage.googleapis.com/productos/bandeja-paisa.jpg",
        popularidad: 95,
        ventasDelMes: 145,
        fechaCreacion: serverTimestamp(),
        fechaActualizacion: serverTimestamp(),
        activo: true
      };

      await setDoc(doc(this.firestore, 'productos', producto1.id), producto1);
      this.log('   ✅ Producto Bandeja Paisa creado', '\x1b[32m');

      const producto2 = {
        id: "prod_cafe_americano",
        nombre: "Café Americano",
        descripcion: "Café colombiano de origen premium",
        categoria: "Bebidas Calientes",
        precio: 8000,
        moneda: "COP",
        disponible: true,
        tiempoPreparacion: 5,
        ingredientes: ["Café colombiano premium", "Agua filtrada"],
        alergenos: [],
        calorias: 5,
        imagen: "https://firebasestorage.googleapis.com/productos/cafe-americano.jpg",
        popularidad: 92,
        ventasDelMes: 298,
        fechaCreacion: serverTimestamp(),
        fechaActualizacion: serverTimestamp(),
        activo: true
      };

      await setDoc(doc(this.firestore, 'productos', producto2.id), producto2);
      this.log('   ✅ Producto Café Americano creado', '\x1b[32m');

      const producto3 = {
        id: "prod_churrasco",
        nombre: "Churrasco Argentino",
        descripcion: "Corte premium a la parrilla",
        categoria: "Carnes",
        precio: 45000,
        moneda: "COP",
        disponible: true,
        tiempoPreparacion: 20,
        ingredientes: ["Carne de res premium", "Chimichurri", "Papas", "Ensalada"],
        alergenos: [],
        calorias: 650,
        imagen: "https://firebasestorage.googleapis.com/productos/churrasco.jpg",
        popularidad: 88,
        ventasDelMes: 87,
        fechaCreacion: serverTimestamp(),
        fechaActualizacion: serverTimestamp(),
        activo: true
      };

      await setDoc(doc(this.firestore, 'productos', producto3.id), producto3);
      this.log('   ✅ Producto Churrasco creado', '\x1b[32m');

      this.createdTables.push('productos');
    } catch (error) {
      this.log(`   ❌ Error creando productos: ${error.message}`, '\x1b[31m');
      this.errors.push({ table: 'productos', error: error.message });
    }
  }

  // Módulo REPORTES (basado en interacciones de usuarios)
  async createReportesModule() {
    this.log('\n📊 CREANDO MÓDULO: REPORTES (basado en UserInteractions)', '\x1b[34m');
    
    try {
      const reporte1 = {
        id: "reporte_diario_" + new Date().toISOString().split('T')[0],
        fecha: new Date().toISOString().split('T')[0],
        tipo: "diario",
        metricas: {
          totalClientes: 3,
          clientesNuevos: 1,
          reservasTotal: 3,
          reservasAceptadas: 1,
          reservasPendientes: 1,
          reservasRechazadas: 1,
          pedidosTotal: 3,
          pedidosEnProceso: 1,
          pedidosEntregados: 0,
          pedidosEnDelivery: 1,
          ventasTotal: 197000,
          interaccionesWhatsApp: 123,
          interaccionesChatbot: 35,
          interaccionesController: 37,
          interaccionesAPI: 23,
          interaccionesAI: 25,
          feeTotal: 410000
        },
        clientesMasActivos: [
          { contact: "573109876543", interacciones: 98, fee: 285000 },
          { contact: "573001234567", interacciones: 67, fee: 125000 }
        ],
        productosMasVendidos: [
          { id: "prod_bandeja_paisa", ventas: 145, ingresos: 5075000 },
          { id: "prod_cafe_americano", ventas: 298, ingresos: 2384000 }
        ],
        fechaCreacion: serverTimestamp()
      };

      await setDoc(doc(this.firestore, 'reportes', reporte1.id), reporte1);
      this.log('   ✅ Reporte diario creado', '\x1b[32m');

      this.createdTables.push('reportes');
    } catch (error) {
      this.log(`   ❌ Error creando reportes: ${error.message}`, '\x1b[31m');
      this.errors.push({ table: 'reportes', error: error.message });
    }
  }

  // Crear datos de configuración del sistema
  async createConfigModule() {
    this.log('\n⚙️ CREANDO MÓDULO: CONFIGURACIÓN', '\x1b[34m');
    
    try {
      const config = {
        restaurante: {
          nombre: "Bocket CRM Restaurant",
          telefono: "+57 301 234 5678",
          email: "admin@bocketcrm.com",
          direccion: "Calle Principal #123-45",
          ciudad: "Bogotá",
          pais: "Colombia",
          moneda: "COP",
          zonaHoraria: "America/Bogota"
        },
        whatsapp: {
          enabled: true,
          defaultSourceType: "chatBot",
          defaultRespType: "bot",
          autoLabeling: true,
          spamProtection: true
        },
        reservas: {
          tiempoReconfirmacion: 24, // horas
          estadosPermitidos: ["pending", "accepted", "rejected"],
          reconfirmacionRequerida: true
        },
        pedidos: {
          tiposPermitidos: ["delivery", "pickUp", "insideOrder"],
          estadosPermitidos: ["pending", "accepted", "rejected", "inProcess", "inDelivery", "deliveried"],
          tiempoMaximoDelivery: 60 // minutos
        },
        fechaCreacion: serverTimestamp(),
        fechaActualizacion: serverTimestamp()
      };

      await setDoc(doc(this.firestore, 'configuracion', 'general'), config);
      this.log('   ✅ Configuración general creada', '\x1b[32m');

      this.createdTables.push('configuracion');
    } catch (error) {
      this.log(`   ❌ Error creando configuración: ${error.message}`, '\x1b[31m');
      this.errors.push({ table: 'configuracion', error: error.message });
    }
  }

  showResults() {
    this.separator();
    this.log('📊 RESULTADO - CRM CON INTERFACES REALES DEL CLIENTE', '\x1b[35m');
    this.separator();

    this.log(`✅ Módulos creados exitosamente: ${this.createdTables.length}`, '\x1b[32m');
    for (const table of this.createdTables) {
      this.log(`   📁 ${table}`, '\x1b[36m');
    }

    this.log('\n📋 MAPEO DE INTERFACES:', '\x1b[34m');
    this.log('   👥 clientes → finalUser interface', '\x1b[37m');
    this.log('   📅 reservas → VenueBooking interface', '\x1b[37m');
    this.log('   🛍️ pedidos → OrderTodelivery interface', '\x1b[37m');
    this.log('   🍽️ productos → Compatible con resumeOrder', '\x1b[37m');
    this.log('   📊 reportes → Basado en UserInteractions', '\x1b[37m');

    if (this.errors.length > 0) {
      this.log(`\n❌ Errores encontrados: ${this.errors.length}`, '\x1b[31m');
      for (const error of this.errors) {
        this.log(`   ❌ ${error.table}: ${error.error}`, '\x1b[31m');
      }
    }

    this.log('\n🎉 CRM CON INTERFACES REALES CREADO EXITOSAMENTE', '\x1b[32m');
    this.log('🔥 Firebase Console: https://console.firebase.google.com/project/bocket-2024', '\x1b[34m');
    this.log('✅ Ahora puedes adaptar los servicios Angular para usar estas interfaces', '\x1b[33m');
    
    this.separator();
    this.log(`⏰ Creación completada: ${new Date().toLocaleString('es-CO')}`, '\x1b[90m');
  }

  async createRealCRM() {
    await this.initialize();
    await this.createClientesModule();
    await this.createReservasModule();
    await this.createPedidosModule();
    await this.createProductosModule();
    await this.createReportesModule();
    await this.createConfigModule();
    this.showResults();
  }
}

async function main() {
  const creator = new RealCRMCreator();
  await creator.createRealCRM();
}

if (require.main === module) {
  main().catch(error => {
    console.error('❌ Error fatal creando CRM real:', error);
    process.exit(1);
  });
}

module.exports = RealCRMCreator;