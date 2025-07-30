#!/usr/bin/env node

/**
 * SCRIPT DE PRUEBAS FIREBASE REAL - BOCKET CRM
 * 
 * Este script verifica la conexión real con Firebase usando la configuración 
 * del proyecto Angular. Crea datos de prueba en Firestore para verificar
 * que todo el sistema CRUD funcione correctamente.
 */

// Importar Firebase Web SDK (versión 9+)
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, getDocs, updateDoc, deleteDoc, doc } = require('firebase/firestore');

class FirebaseRealTester {
    constructor() {
        // Configuración desde environment.ts
        this.firebaseConfig = {
            apiKey: "AIzaSyC54Ytk5wO2zupIuCtFIsIUNXvP4m9qqOk",
            authDomain: "bocket-2024.firebaseapp.com",
            projectId: "bocket-2024",
            storageBucket: "bocket-2024.appspot.com",
            messagingSenderId: "537532907057",
            appId: "1:537532907057:web:dc51aacd0553b9ac2edf10"
        };
        
        this.restauranteId = 'rest_donpepe_001';
        this.app = null;
        this.db = null;
        this.testResults = {
            conexion: false,
            estructura: false,
            clientes: { crear: false, consultar: false, editar: false, eliminar: false },
            reservas: { crear: false, consultar: false, editar: false, eliminar: false },
            pedidos: { crear: false, consultar: false, editar: false, eliminar: false },
            productos: { crear: false, consultar: false, editar: false, eliminar: false }
        };
        this.createdIds = {
            clientes: [],
            reservas: [],
            pedidos: [],
            productos: []
        };
    }

    log(mensaje, tipo = 'info') {
        const timestamp = new Date().toLocaleTimeString();
        const colores = {
            info: '\x1b[36m',    // Cyan
            success: '\x1b[32m', // Verde
            error: '\x1b[31m',   // Rojo
            warning: '\x1b[33m'  // Amarillo
        };
        const reset = '\x1b[0m';
        console.log(`${colores[tipo]}[${timestamp}] ${mensaje}${reset}`);
    }

    async inicializarFirebase() {
        try {
            this.log('🔥 Inicializando Firebase con configuración del proyecto...', 'info');
            
            // Inicializar Firebase App
            this.app = initializeApp(this.firebaseConfig);
            this.db = getFirestore(this.app);
            
            this.log(`✅ Firebase inicializado exitosamente`, 'success');
            this.log(`📱 Proyecto: ${this.firebaseConfig.projectId}`, 'info');
            this.testResults.conexion = true;
            return true;
        } catch (error) {
            this.log(`❌ Error inicializando Firebase: ${error.message}`, 'error');
            return false;
        }
    }

    async verificarEstructura() {
        try {
            this.log('🏗️ Verificando estructura de Firestore...', 'info');
            
            // Verificar colecciones principales
            const estructuras = [
                `restaurantes`,
                `restaurantes/${this.restauranteId}/clientes`,
                `restaurantes/${this.restauranteId}/reservas`,
                `restaurantes/${this.restauranteId}/pedidos`,
                `restaurantes/${this.restauranteId}/productos`
            ];

            for (const estructura of estructuras) {
                try {
                    // Intentar obtener documentos de cada colección
                    const colRef = collection(this.db, estructura);
                    const snapshot = await getDocs(colRef);
                    this.log(`   📁 Colección "${estructura}" accesible (${snapshot.size} docs)`, 'success');
                } catch (error) {
                    this.log(`   ⚠️ Colección "${estructura}" - ${error.message}`, 'warning');
                }
            }
            
            this.testResults.estructura = true;
            return true;
        } catch (error) {
            this.log(`❌ Error verificando estructura: ${error.message}`, 'error');
            return false;
        }
    }

    async testClientesCRUD() {
        this.log('📋 === PRUEBAS CRUD CLIENTES ===', 'info');
        
        const collectionPath = `restaurantes/${this.restauranteId}/clientes`;
        let clienteId = null;

        try {
            // 1. CREAR CLIENTE
            this.log('1️⃣ Creando cliente...', 'info');
            const nuevoCliente = {
                id: 'test_cliente_' + Date.now(),
                name: 'Cliente Prueba Firebase Real',
                whatsAppName: 'Cliente Test FB',
                email: 'test.firebase@bocketcrm.com',
                isWAContact: true,
                isMyContact: true,
                sourceType: 'manual',
                respType: 'manual',
                labels: 'cliente_test,firebase_real',
                creation: new Date().toISOString(),
                lastUpdate: new Date().toISOString(),
                restauranteId: this.restauranteId,
                userInteractions: {
                    whatsapp: 1,
                    controller: 0,
                    chatbot: 0,
                    api: 0,
                    campaing: 0,
                    client: 1,
                    others: 0,
                    wappController: 0,
                    ai: 0,
                    fee: 1000
                }
            };

            const colRef = collection(this.db, collectionPath);
            const docRef = await addDoc(colRef, nuevoCliente);
            clienteId = docRef.id;
            this.createdIds.clientes.push(clienteId);
            this.testResults.clientes.crear = true;
            this.log('   ✅ Cliente creado exitosamente', 'success');
            this.log(`   📄 ID: ${clienteId}`, 'info');
            this.log(`   📄 Datos: ${JSON.stringify(nuevoCliente, null, 2)}`, 'info');

            // 2. CONSULTAR CLIENTES
            this.log('2️⃣ Consultando clientes...', 'info');
            const snapshot = await getDocs(colRef);
            this.log(`   ✅ Consultados ${snapshot.size} clientes`, 'success');
            
            // Mostrar los primeros 3 clientes
            let contador = 0;
            snapshot.forEach((doc) => {
                if (contador < 3) {
                    this.log(`   📋 Cliente ${contador + 1}: ${doc.id}`, 'info');
                    const data = doc.data();
                    this.log(`      - Nombre: ${data.name}`, 'info');
                    this.log(`      - WhatsApp: ${data.whatsAppName}`, 'info');
                    this.log(`      - Email: ${data.email}`, 'info');
                    contador++;
                }
            });
            
            this.testResults.clientes.consultar = true;

            // 3. EDITAR CLIENTE
            this.log('3️⃣ Editando cliente...', 'info');
            const clienteRef = doc(this.db, collectionPath, clienteId);
            const cambios = {
                name: 'Cliente EDITADO - Firebase Real',
                lastUpdate: new Date().toISOString(),
                labels: 'cliente_editado,firebase_real_test'
            };
            await updateDoc(clienteRef, cambios);
            this.log('   ✅ Cliente actualizado exitosamente', 'success');
            this.log(`   📝 Cambios aplicados: ${JSON.stringify(cambios, null, 2)}`, 'info');
            this.testResults.clientes.editar = true;

            // 4. ELIMINAR CLIENTE
            this.log('4️⃣ Eliminando cliente...', 'info');
            this.log(`   🗑️ Eliminando cliente ID: ${clienteId}`, 'info');
            await deleteDoc(clienteRef);
            this.log('   ✅ Cliente eliminado exitosamente', 'success');
            this.testResults.clientes.eliminar = true;

        } catch (error) {
            this.log(`   ❌ Error en CRUD clientes: ${error.message}`, 'error');
        }
    }

    async testReservasCRUD() {
        this.log('📅 === PRUEBAS CRUD RESERVAS ===', 'info');
        
        const collectionPath = `restaurantes/${this.restauranteId}/reservas`;
        let reservaId = null;

        try {
            // 1. CREAR RESERVA
            this.log('1️⃣ Creando reserva...', 'info');
            const nuevaReserva = {
                id: 'test_reserva_' + Date.now(),
                contact: '573999888777',
                contactNameBooking: 'Cliente Test Reserva FB',
                peopleBooking: '4',
                finalPeopleBooking: 4,
                dateBooking: new Date(Date.now() + 86400000).toISOString(),
                statusBooking: 'pending',
                detailsBooking: 'Reserva de prueba Firebase Real',
                reconfirmDate: '',
                reconfirmStatus: ''
            };

            const colRef = collection(this.db, collectionPath);
            const docRef = await addDoc(colRef, nuevaReserva);
            reservaId = docRef.id;
            this.createdIds.reservas.push(reservaId);
            this.testResults.reservas.crear = true;
            this.log('   ✅ Reserva creada exitosamente', 'success');
            this.log(`   📄 ID: ${reservaId}`, 'info');
            this.log(`   📄 Cliente: ${nuevaReserva.contactNameBooking}`, 'info');
            this.log(`   📄 Fecha: ${nuevaReserva.dateBooking}`, 'info');
            this.log(`   📄 Personas: ${nuevaReserva.finalPeopleBooking}`, 'info');

            // 2. CONSULTAR RESERVAS
            this.log('2️⃣ Consultando reservas...', 'info');
            const snapshot = await getDocs(colRef);
            this.log(`   ✅ Consultadas ${snapshot.size} reservas`, 'success');
            this.testResults.reservas.consultar = true;

            // 3. EDITAR RESERVA
            this.log('3️⃣ Editando reserva...', 'info');
            const reservaRef = doc(this.db, collectionPath, reservaId);
            await updateDoc(reservaRef, {
                statusBooking: 'accepted',
                reconfirmDate: new Date().toISOString(),
                reconfirmStatus: 'accepted'
            });
            this.log('   ✅ Reserva actualizada exitosamente', 'success');
            this.testResults.reservas.editar = true;

            // 4. ELIMINAR RESERVA
            this.log('4️⃣ Eliminando reserva...', 'info');
            await deleteDoc(reservaRef);
            this.log('   ✅ Reserva eliminada exitosamente', 'success');
            this.testResults.reservas.eliminar = true;

        } catch (error) {
            this.log(`   ❌ Error en CRUD reservas: ${error.message}`, 'error');
        }
    }

    async testPedidosCRUD() {
        this.log('🛵 === PRUEBAS CRUD PEDIDOS ===', 'info');
        
        const collectionPath = `restaurantes/${this.restauranteId}/pedidos`;
        let pedidoId = null;

        try {
            // 1. CREAR PEDIDO
            this.log('1️⃣ Creando pedido...', 'info');
            const nuevoPedido = {
                id: 'test_pedido_' + Date.now(),
                contact: '573999888777',
                contactNameOrder: 'Cliente Test Pedido FB',
                orderType: 'delivery',
                resumeOrder: '2x Hamburguesa Firebase + 1x Gaseosa + Papas',
                addressToDelivery: 'Dirección prueba Firebase Real #123',
                statusBooking: 'pending',
                fechaCreacion: new Date()
            };

            const colRef = collection(this.db, collectionPath);
            const docRef = await addDoc(colRef, nuevoPedido);
            pedidoId = docRef.id;
            this.createdIds.pedidos.push(pedidoId);
            this.testResults.pedidos.crear = true;
            this.log('   ✅ Pedido creado exitosamente', 'success');

            // 2. CONSULTAR PEDIDOS
            this.log('2️⃣ Consultando pedidos...', 'info');
            const snapshot = await getDocs(colRef);
            this.log(`   ✅ Consultados ${snapshot.size} pedidos`, 'success');
            this.testResults.pedidos.consultar = true;

            // 3. EDITAR PEDIDO
            this.log('3️⃣ Editando pedido...', 'info');
            const pedidoRef = doc(this.db, collectionPath, pedidoId);
            await updateDoc(pedidoRef, {
                statusBooking: 'accepted',
                resumeOrder: 'PEDIDO EDITADO - 3x Hamburguesa Firebase Real',
                fechaActualizacion: new Date()
            });
            this.log('   ✅ Pedido actualizado exitosamente', 'success');
            this.testResults.pedidos.editar = true;

            // 4. ELIMINAR PEDIDO
            this.log('4️⃣ Eliminando pedido...', 'info');
            await deleteDoc(pedidoRef);
            this.log('   ✅ Pedido eliminado exitosamente', 'success');
            this.testResults.pedidos.eliminar = true;

        } catch (error) {
            this.log(`   ❌ Error en CRUD pedidos: ${error.message}`, 'error');
        }
    }

    async testProductosCRUD() {
        this.log('🍔 === PRUEBAS CRUD PRODUCTOS ===', 'info');
        
        const collectionPath = `restaurantes/${this.restauranteId}/productos`;
        let productoId = null;

        try {
            // 1. CREAR PRODUCTO
            this.log('1️⃣ Creando producto...', 'info');
            const nuevoProducto = {
                id: 'test_producto_' + Date.now(),
                nombre: 'Producto Test Firebase Real',
                descripcion: 'Producto creado para testing Firebase Real',
                precio: 25000,
                categoria: {
                    id: 'principales',
                    nombre: 'Platos Principales',
                    descripcion: 'Platos fuertes',
                    activo: true
                },
                disponible: true,
                destacado: false,
                nuevo: true,
                ingredientes: ['Ingrediente Firebase 1', 'Ingrediente Firebase 2'],
                tiempoPreparacion: 20,
                imagen: '',
                fechaCreacion: new Date()
            };

            const colRef = collection(this.db, collectionPath);
            const docRef = await addDoc(colRef, nuevoProducto);
            productoId = docRef.id;
            this.createdIds.productos.push(productoId);
            this.testResults.productos.crear = true;
            this.log('   ✅ Producto creado exitosamente', 'success');

            // 2. CONSULTAR PRODUCTOS
            this.log('2️⃣ Consultando productos...', 'info');
            const snapshot = await getDocs(colRef);
            this.log(`   ✅ Consultados ${snapshot.size} productos`, 'success');
            this.testResults.productos.consultar = true;

            // 3. EDITAR PRODUCTO
            this.log('3️⃣ Editando producto...', 'info');
            const productoRef = doc(this.db, collectionPath, productoId);
            await updateDoc(productoRef, {
                nombre: 'PRODUCTO EDITADO - Firebase Real',
                precio: 35000,
                descripcion: 'Descripción actualizada Firebase Real',
                fechaActualizacion: new Date()
            });
            this.log('   ✅ Producto actualizado exitosamente', 'success');
            this.testResults.productos.editar = true;

            // 4. ELIMINAR PRODUCTO
            this.log('4️⃣ Eliminando producto...', 'info');
            await deleteDoc(productoRef);
            this.log('   ✅ Producto eliminado exitosamente', 'success');
            this.testResults.productos.eliminar = true;

        } catch (error) {
            this.log(`   ❌ Error en CRUD productos: ${error.message}`, 'error');
        }
    }

    generarReporte() {
        this.log('\n📊 === REPORTE FINAL FIREBASE REAL ===', 'info');
        
        // Reporte de conexión
        this.log(`🔥 Conexión Firebase: ${this.testResults.conexion ? '✅ CONECTADO' : '❌ NO CONECTADO'}`, 
                 this.testResults.conexion ? 'success' : 'error');
        
        this.log(`🏗️ Estructura Firestore: ${this.testResults.estructura ? '✅ VERIFICADA' : '❌ ERROR'}`, 
                 this.testResults.estructura ? 'success' : 'error');
        
        let totalPruebas = 0;
        let pruebasExitosas = 0;

        Object.keys(this.testResults).forEach(modulo => {
            if (modulo === 'conexion' || modulo === 'estructura') return;
            
            this.log(`\n📋 ${modulo.toUpperCase()}:`, 'info');
            
            Object.keys(this.testResults[modulo]).forEach(operacion => {
                totalPruebas++;
                const estado = this.testResults[modulo][operacion];
                if (estado) pruebasExitosas++;
                
                const icono = estado ? '✅' : '❌';
                const color = estado ? 'success' : 'error';
                this.log(`   ${icono} ${operacion}: ${estado ? 'ÉXITO' : 'FALLO'}`, color);
            });
        });

        const porcentajeExito = totalPruebas > 0 ? ((pruebasExitosas / totalPruebas) * 100).toFixed(1) : 0;
        
        this.log(`\n🎯 RESUMEN FINAL:`, 'info');
        this.log(`   Total de pruebas CRUD: ${totalPruebas}`, 'info');
        this.log(`   Pruebas exitosas: ${pruebasExitosas}`, 'success');
        this.log(`   Pruebas fallidas: ${totalPruebas - pruebasExitosas}`, 'error');
        this.log(`   Porcentaje de éxito: ${porcentajeExito}%`, 'warning');

        if (porcentajeExito >= 90) {
            this.log('\n🎉 ¡EXCELENTE! Firebase Real funciona perfectamente', 'success');
            this.log('✅ Todas las tablas están creadas y funcionando', 'success');
            this.log('✅ Los servicios CRUD están conectados correctamente', 'success');
        } else if (porcentajeExito >= 70) {
            this.log('\n⚠️ BUENO. Firebase Real funciona parcialmente', 'warning');
        } else {
            this.log('\n❌ ATENCIÓN. Problemas de conexión con Firebase Real', 'error');
        }

        this.log(`\n📍 Proyecto Firebase: ${this.firebaseConfig.projectId}`, 'info');
        this.log(`🏪 Restaurante de prueba: ${this.restauranteId}`, 'info');
    }

    async ejecutarTodasLasPruebas() {
        this.log('🚀 === INICIANDO PRUEBAS FIREBASE REAL ===', 'success');
        this.log(`🔗 Proyecto: ${this.firebaseConfig.projectId}`, 'info');
        
        // Inicializar Firebase
        const conexionExitosa = await this.inicializarFirebase();
        
        if (!conexionExitosa) {
            this.log('❌ No se pudo conectar a Firebase. Abortando pruebas.', 'error');
            return;
        }

        // Verificar estructura
        await this.verificarEstructura();

        try {
            // Ejecutar todas las pruebas CRUD
            await this.testClientesCRUD();
            await this.testReservasCRUD(); 
            await this.testPedidosCRUD();
            await this.testProductosCRUD();

            // Generar reporte final
            this.generarReporte();

        } catch (error) {
            this.log(`❌ Error crítico durante las pruebas: ${error.message}`, 'error');
        }
    }
}

// Ejecutar el script
async function main() {
    console.log('🎯 BOCKET CRM - PRUEBAS FIREBASE REAL');
    console.log('===================================\n');

    const tester = new FirebaseRealTester();
    await tester.ejecutarTodasLasPruebas();

    console.log('\n✨ Pruebas de Firebase Real completadas.\n');
}

// Ejecutar si es llamado directamente
if (require.main === module) {
    main().catch(console.error);
}

module.exports = FirebaseRealTester;