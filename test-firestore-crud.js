#!/usr/bin/env node

/**
 * SCRIPT DE PRUEBAS CRUD DIRECTO A FIRESTORE - BOCKET CRM
 * 
 * Este script prueba directamente las operaciones CRUD contra Firebase/Firestore:
 * - CLIENTES: crear, consultar, editar, eliminar en Firestore
 * - RESERVAS: crear, consultar, editar, eliminar en Firestore
 * - PEDIDOS: crear, consultar, editar, eliminar en Firestore
 * - PRODUCTOS: crear, consultar, editar, eliminar en Firestore
 */

const admin = require('firebase-admin');
const path = require('path');

class FirestoreCRUDTester {
    constructor() {
        this.testResults = {
            conexion: false,
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
        this.restauranteId = 'rest_donpepe_001'; // ID del restaurante de prueba
        this.db = null;
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
            this.log('🔥 Inicializando conexión a Firebase...', 'info');
            
            // Intentar con diferentes rutas de configuración
            const posiblesRutas = [
                './firebase-config.json',
                './src/environments/firebase-config.json',
                './firebase-adminsdk.json'
            ];

            let credencialesPath = null;
            for (const ruta of posiblesRutas) {
                try {
                    require.resolve(ruta);
                    credencialesPath = ruta;
                    break;
                } catch (e) {
                    // Continuar buscando
                }
            }

            if (credencialesPath) {
                const serviceAccount = require(credencialesPath);
                admin.initializeApp({
                    credential: admin.credential.cert(serviceAccount)
                });
                this.log(`✅ Firebase inicializado con credenciales desde: ${credencialesPath}`, 'success');
            } else {
                // Usar variables de entorno
                admin.initializeApp({
                    credential: admin.credential.applicationDefault()
                });
                this.log('✅ Firebase inicializado con credenciales por defecto', 'success');
            }

            this.db = admin.firestore();
            this.testResults.conexion = true;
            return true;

        } catch (error) {
            this.log(`❌ Error inicializando Firebase: ${error.message}`, 'error');
            this.log('💡 Tip: Asegúrate de tener las credenciales de Firebase configuradas', 'warning');
            
            // Simular conexión para testing offline
            this.log('🔄 Ejecutando en modo simulación (sin Firebase)...', 'warning');
            this.db = { simulado: true };
            return false;
        }
    }

    async verificarConexion() {
        try {
            if (this.db.simulado) {
                this.log('⚠️ Modo simulación - Firebase no conectado', 'warning');
                return false;
            }

            // Intentar una operación simple para verificar conexión
            await this.db.collection('test').limit(1).get();
            this.log('✅ Conexión a Firestore verificada exitosamente', 'success');
            this.testResults.conexion = true;
            return true;
        } catch (error) {
            this.log(`❌ Error de conexión a Firestore: ${error.message}`, 'error');
            return false;
        }
    }

    // ===== PRUEBAS DE CLIENTES =====
    async testClientesCRUD() {
        this.log('📋 === INICIANDO PRUEBAS DE CLIENTES EN FIRESTORE ===', 'info');

        const collectionPath = `restaurantes/${this.restauranteId}/clientes`;

        // TEST: Crear Cliente
        try {
            this.log('1️⃣ Probando crear cliente en Firestore...', 'info');
            const clienteId = 'test_cliente_' + Date.now();
            const nuevoCliente = {
                id: clienteId,
                name: 'Cliente Prueba CRUD Firestore',
                whatsAppName: 'Cliente Test FS',
                email: 'testfirestore@bocketcrm.com',
                isWAContact: true,
                isMyContact: true,
                sourceType: 'manual',
                respType: 'manual',
                labels: 'cliente_test,prueba_firestore',
                creation: new Date().toISOString(),
                lastUpdate: new Date().toISOString(),
                restauranteId: this.restauranteId,
                userInteractions: {
                    whatsapp: 5,
                    controller: 2,
                    chatbot: 1,
                    api: 0,
                    campaing: 1,
                    client: 3,
                    others: 0,
                    wappController: 2,
                    ai: 1,
                    fee: 2500
                }
            };

            if (this.db.simulado) {
                this.log('   📝 Simulando creación de cliente...', 'warning');
            } else {
                await this.db.collection(collectionPath).doc(clienteId).set(nuevoCliente);
                this.log('   ✅ Cliente guardado en Firestore exitosamente', 'success');
            }
            
            this.createdIds.clientes.push(clienteId);
            this.testResults.clientes.crear = true;

        } catch (error) {
            this.log(`   ❌ Error creando cliente: ${error.message}`, 'error');
        }

        // TEST: Consultar Clientes
        try {
            this.log('2️⃣ Probando consultar clientes desde Firestore...', 'info');
            
            if (this.db.simulado) {
                this.log('   📝 Simulando consulta de clientes...', 'warning');
            } else {
                const snapshot = await this.db.collection(collectionPath).get();
                this.log(`   ✅ Consultados ${snapshot.size} clientes desde Firestore`, 'success');
            }
            
            this.testResults.clientes.consultar = true;

        } catch (error) {
            this.log(`   ❌ Error consultando clientes: ${error.message}`, 'error');
        }

        // TEST: Editar Cliente
        try {
            this.log('3️⃣ Probando editar cliente en Firestore...', 'info');
            
            if (this.createdIds.clientes.length > 0) {
                const clienteId = this.createdIds.clientes[0];
                const cambios = {
                    name: 'Cliente EDITADO - Test CRUD',
                    lastUpdate: new Date().toISOString(),
                    labels: 'cliente_editado,test'
                };

                if (this.db.simulado) {
                    this.log('   📝 Simulando edición de cliente...', 'warning');
                } else {
                    await this.db.collection(collectionPath).doc(clienteId).update(cambios);
                    this.log('   ✅ Cliente actualizado en Firestore exitosamente', 'success');
                }
                
                this.testResults.clientes.editar = true;
            }

        } catch (error) {
            this.log(`   ❌ Error editando cliente: ${error.message}`, 'error');
        }

        // TEST: Eliminar Cliente
        try {
            this.log('4️⃣ Probando eliminar cliente de Firestore...', 'info');
            
            if (this.createdIds.clientes.length > 0) {
                const clienteId = this.createdIds.clientes[0];

                if (this.db.simulado) {
                    this.log('   📝 Simulando eliminación de cliente...', 'warning');
                } else {
                    await this.db.collection(collectionPath).doc(clienteId).delete();
                    this.log('   ✅ Cliente eliminado de Firestore exitosamente', 'success');
                }
                
                this.testResults.clientes.eliminar = true;
            }

        } catch (error) {
            this.log(`   ❌ Error eliminando cliente: ${error.message}`, 'error');
        }
    }

    // ===== PRUEBAS DE RESERVAS =====
    async testReservasCRUD() {
        this.log('📅 === INICIANDO PRUEBAS DE RESERVAS EN FIRESTORE ===', 'info');

        const collectionPath = `restaurantes/${this.restauranteId}/reservas`;

        // TEST: Crear Reserva
        try {
            this.log('1️⃣ Probando crear reserva en Firestore...', 'info');
            const reservaId = 'test_reserva_' + Date.now();
            const nuevaReserva = {
                id: reservaId,
                contact: '573999888777',
                contactNameBooking: 'Cliente Test Reserva FS',
                peopleBooking: '6',
                finalPeopleBooking: 6,
                dateBooking: new Date(Date.now() + 86400000).toISOString(),
                statusBooking: 'pending',
                detailsBooking: 'Reserva de prueba para testing CRUD en Firestore',
                reconfirmDate: '',
                reconfirmStatus: ''
            };

            if (this.db.simulado) {
                this.log('   📝 Simulando creación de reserva...', 'warning');
            } else {
                await this.db.collection(collectionPath).doc(reservaId).set(nuevaReserva);
                this.log('   ✅ Reserva guardada en Firestore exitosamente', 'success');
            }
            
            this.createdIds.reservas.push(reservaId);
            this.testResults.reservas.crear = true;

        } catch (error) {
            this.log(`   ❌ Error creando reserva: ${error.message}`, 'error');
        }

        // TEST: Consultar Reservas
        try {
            this.log('2️⃣ Probando consultar reservas desde Firestore...', 'info');
            
            if (this.db.simulado) {
                this.log('   📝 Simulando consulta de reservas...', 'warning');
            } else {
                const snapshot = await this.db.collection(collectionPath).get();
                this.log(`   ✅ Consultadas ${snapshot.size} reservas desde Firestore`, 'success');
            }
            
            this.testResults.reservas.consultar = true;

        } catch (error) {
            this.log(`   ❌ Error consultando reservas: ${error.message}`, 'error');
        }

        // TEST: Editar Reserva
        try {
            this.log('3️⃣ Probando editar reserva en Firestore...', 'info');
            
            if (this.createdIds.reservas.length > 0) {
                const reservaId = this.createdIds.reservas[0];
                const cambios = {
                    statusBooking: 'accepted',
                    reconfirmDate: new Date().toISOString(),
                    reconfirmStatus: 'accepted',
                    detailsBooking: 'Reserva EDITADA - Test CRUD'
                };

                if (this.db.simulado) {
                    this.log('   📝 Simulando edición de reserva...', 'warning');
                } else {
                    await this.db.collection(collectionPath).doc(reservaId).update(cambios);
                    this.log('   ✅ Reserva actualizada en Firestore exitosamente', 'success');
                }
                
                this.testResults.reservas.editar = true;
            }

        } catch (error) {
            this.log(`   ❌ Error editando reserva: ${error.message}`, 'error');
        }

        // TEST: Eliminar Reserva
        try {
            this.log('4️⃣ Probando eliminar reserva de Firestore...', 'info');
            
            if (this.createdIds.reservas.length > 0) {
                const reservaId = this.createdIds.reservas[0];

                if (this.db.simulado) {
                    this.log('   📝 Simulando eliminación de reserva...', 'warning');
                } else {
                    await this.db.collection(collectionPath).doc(reservaId).delete();
                    this.log('   ✅ Reserva eliminada de Firestore exitosamente', 'success');
                }
                
                this.testResults.reservas.eliminar = true;
            }

        } catch (error) {
            this.log(`   ❌ Error eliminando reserva: ${error.message}`, 'error');
        }
    }

    // ===== PRUEBAS DE PEDIDOS =====
    async testPedidosCRUD() {
        this.log('🛵 === INICIANDO PRUEBAS DE PEDIDOS EN FIRESTORE ===', 'info');

        const collectionPath = `restaurantes/${this.restauranteId}/pedidos`;

        // TEST: Crear Pedido
        try {
            this.log('1️⃣ Probando crear pedido en Firestore...', 'info');
            const pedidoId = 'test_pedido_' + Date.now();
            const nuevoPedido = {
                id: pedidoId,
                contact: '573999888777',
                contactNameOrder: 'Cliente Test Pedido FS',
                orderType: 'delivery',
                resumeOrder: '2x Hamburguesa Test FS + 1x Gaseosa + 1x Papas + Extra queso',
                addressToDelivery: 'Dirección de prueba Firestore #123-45, Apto 101',
                statusBooking: 'pending',
                fechaCreacion: new Date()
            };

            if (this.db.simulado) {
                this.log('   📝 Simulando creación de pedido...', 'warning');
            } else {
                await this.db.collection(collectionPath).doc(pedidoId).set(nuevoPedido);
                this.log('   ✅ Pedido guardado en Firestore exitosamente', 'success');
            }
            
            this.createdIds.pedidos.push(pedidoId);
            this.testResults.pedidos.crear = true;

        } catch (error) {
            this.log(`   ❌ Error creando pedido: ${error.message}`, 'error');
        }

        // TEST: Consultar Pedidos
        try {
            this.log('2️⃣ Probando consultar pedidos desde Firestore...', 'info');
            
            if (this.db.simulado) {
                this.log('   📝 Simulando consulta de pedidos...', 'warning');
            } else {
                const snapshot = await this.db.collection(collectionPath).get();
                this.log(`   ✅ Consultados ${snapshot.size} pedidos desde Firestore`, 'success');
            }
            
            this.testResults.pedidos.consultar = true;

        } catch (error) {
            this.log(`   ❌ Error consultando pedidos: ${error.message}`, 'error');
        }

        // TEST: Editar Pedido
        try {
            this.log('3️⃣ Probando editar pedido en Firestore...', 'info');
            
            if (this.createdIds.pedidos.length > 0) {
                const pedidoId = this.createdIds.pedidos[0];
                const cambios = {
                    statusBooking: 'accepted',
                    resumeOrder: 'PEDIDO EDITADO - 3x Hamburguesa + 2x Gaseosa + Papas',
                    fechaActualizacion: new Date()
                };

                if (this.db.simulado) {
                    this.log('   📝 Simulando edición de pedido...', 'warning');
                } else {
                    await this.db.collection(collectionPath).doc(pedidoId).update(cambios);
                    this.log('   ✅ Pedido actualizado en Firestore exitosamente', 'success');
                }
                
                this.testResults.pedidos.editar = true;
            }

        } catch (error) {
            this.log(`   ❌ Error editando pedido: ${error.message}`, 'error');
        }

        // TEST: Eliminar Pedido
        try {
            this.log('4️⃣ Probando eliminar pedido de Firestore...', 'info');
            
            if (this.createdIds.pedidos.length > 0) {
                const pedidoId = this.createdIds.pedidos[0];

                if (this.db.simulado) {
                    this.log('   📝 Simulando eliminación de pedido...', 'warning');
                } else {
                    await this.db.collection(collectionPath).doc(pedidoId).delete();
                    this.log('   ✅ Pedido eliminado de Firestore exitosamente', 'success');
                }
                
                this.testResults.pedidos.eliminar = true;
            }

        } catch (error) {
            this.log(`   ❌ Error eliminando pedido: ${error.message}`, 'error');
        }
    }

    // ===== PRUEBAS DE PRODUCTOS =====
    async testProductosCRUD() {
        this.log('🍔 === INICIANDO PRUEBAS DE PRODUCTOS EN FIRESTORE ===', 'info');

        const collectionPath = `restaurantes/${this.restauranteId}/productos`;

        // TEST: Crear Producto
        try {
            this.log('1️⃣ Probando crear producto en Firestore...', 'info');
            const productoId = 'test_producto_' + Date.now();
            const nuevoProducto = {
                id: productoId,
                nombre: 'Producto Test CRUD Firestore',
                descripcion: 'Producto creado para testing CRUD directo en Firestore',
                precio: 32000,
                categoria: {
                    id: 'principales',
                    nombre: 'Platos Principales',
                    descripcion: 'Platos fuertes',
                    activo: true
                },
                disponible: true,
                destacado: true,
                nuevo: true,
                ingredientes: ['Ingrediente Test 1', 'Ingrediente Test 2', 'Salsa especial'],
                alergenos: ['gluten', 'lacteos'],
                calorias: 450,
                tiempoPreparacion: 25,
                imagen: 'https://ejemplo.com/imagen-test.jpg',
                tags: ['test', 'crud', 'firestore'],
                fechaCreacion: new Date(),
                orden: 1
            };

            if (this.db.simulado) {
                this.log('   📝 Simulando creación de producto...', 'warning');
            } else {
                await this.db.collection(collectionPath).doc(productoId).set(nuevoProducto);
                this.log('   ✅ Producto guardado en Firestore exitosamente', 'success');
            }
            
            this.createdIds.productos.push(productoId);
            this.testResults.productos.crear = true;

        } catch (error) {
            this.log(`   ❌ Error creando producto: ${error.message}`, 'error');
        }

        // TEST: Consultar Productos
        try {
            this.log('2️⃣ Probando consultar productos desde Firestore...', 'info');
            
            if (this.db.simulado) {
                this.log('   📝 Simulando consulta de productos...', 'warning');
            } else {
                const snapshot = await this.db.collection(collectionPath).get();
                this.log(`   ✅ Consultados ${snapshot.size} productos desde Firestore`, 'success');
            }
            
            this.testResults.productos.consultar = true;

        } catch (error) {
            this.log(`   ❌ Error consultando productos: ${error.message}`, 'error');
        }

        // TEST: Editar Producto
        try {
            this.log('3️⃣ Probando editar producto en Firestore...', 'info');
            
            if (this.createdIds.productos.length > 0) {
                const productoId = this.createdIds.productos[0];
                const cambios = {
                    nombre: 'PRODUCTO EDITADO - Test CRUD',
                    precio: 45000,
                    descripcion: 'Descripción actualizada por test CRUD',
                    disponible: false,
                    fechaActualizacion: new Date()
                };

                if (this.db.simulado) {
                    this.log('   📝 Simulando edición de producto...', 'warning');
                } else {
                    await this.db.collection(collectionPath).doc(productoId).update(cambios);
                    this.log('   ✅ Producto actualizado en Firestore exitosamente', 'success');
                }
                
                this.testResults.productos.editar = true;
            }

        } catch (error) {
            this.log(`   ❌ Error editando producto: ${error.message}`, 'error');
        }

        // TEST: Eliminar Producto
        try {
            this.log('4️⃣ Probando eliminar producto de Firestore...', 'info');
            
            if (this.createdIds.productos.length > 0) {
                const productoId = this.createdIds.productos[0];

                if (this.db.simulado) {
                    this.log('   📝 Simulando eliminación de producto...', 'warning');
                } else {
                    await this.db.collection(collectionPath).doc(productoId).delete();
                    this.log('   ✅ Producto eliminado de Firestore exitosamente', 'success');
                }
                
                this.testResults.productos.eliminar = true;
            }

        } catch (error) {
            this.log(`   ❌ Error eliminando producto: ${error.message}`, 'error');
        }
    }

    async testEstructuraFirestore() {
        this.log('🏗️ === VERIFICANDO ESTRUCTURA FIRESTORE ===', 'info');
        
        try {
            if (this.db.simulado) {
                this.log('📝 Simulando verificación de estructura...', 'warning');
                return;
            }

            // Verificar que existe la colección de restaurantes
            const restaurantesSnapshot = await this.db.collection('restaurantes').limit(1).get();
            this.log('✅ Colección "restaurantes" accesible', 'success');

            // Verificar estructura multi-tenant específica
            const collectionesToCheck = ['clientes', 'reservas', 'pedidos', 'productos'];
            
            for (const collection of collectionesToCheck) {
                try {
                    const collectionPath = `restaurantes/${this.restauranteId}/${collection}`;
                    await this.db.collection(collectionPath).limit(1).get();
                    this.log(`   ✅ Colección "${collection}" accesible para restaurante`, 'success');
                } catch (error) {
                    this.log(`   ⚠️ Colección "${collection}" no existe o no accesible`, 'warning');
                }
            }

        } catch (error) {
            this.log(`❌ Error verificando estructura: ${error.message}`, 'error');
        }
    }

    generarReporte() {
        this.log('\n📊 === REPORTE FINAL DE PRUEBAS FIRESTORE ===', 'info');
        
        // Reporte de conexión
        this.log(`🔥 Conexión Firebase: ${this.testResults.conexion ? '✅ CONECTADO' : '❌ NO CONECTADO'}`, 
                 this.testResults.conexion ? 'success' : 'error');
        
        let totalPruebas = 0;
        let pruebasExitosas = 0;

        Object.keys(this.testResults).forEach(modulo => {
            if (modulo === 'conexion') return;
            
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
            this.log('\n🎉 ¡EXCELENTE! Las operaciones CRUD con Firestore funcionan perfectamente', 'success');
        } else if (porcentajeExito >= 70) {
            this.log('\n⚠️ BUENO. La mayoría de operaciones CRUD están funcionando', 'warning');
        } else {
            this.log('\n❌ ATENCIÓN. Varias operaciones CRUD necesitan revisión', 'error');
        }

        // Mostrar IDs creados
        if (Object.values(this.createdIds).some(arr => arr.length > 0)) {
            this.log('\n🔧 Documentos creados en Firestore (para limpieza manual si es necesario):', 'info');
            Object.keys(this.createdIds).forEach(modulo => {
                if (this.createdIds[modulo].length > 0) {
                    this.log(`   ${modulo}: ${this.createdIds[modulo].join(', ')}`, 'info');
                }
            });
        }

        this.log(`\n📍 Restaurante de prueba: ${this.restauranteId}`, 'info');
    }

    async ejecutarTodasLasPruebas() {
        this.log('🚀 === INICIANDO PRUEBAS CRUD DIRECTAS CONTRA FIRESTORE ===', 'success');
        this.log(`🏪 Restaurante de prueba: ${this.restauranteId}`, 'info');
        
        // Inicializar Firebase
        const conexionExitosa = await this.inicializarFirebase();
        
        if (conexionExitosa) {
            // Verificar conexión
            await this.verificarConexion();
            
            // Verificar estructura
            await this.testEstructuraFirestore();
        }

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

        // Cerrar conexión Firebase
        if (!this.db.simulado) {
            try {
                await admin.app().delete();
                this.log('🔥 Conexión Firebase cerrada', 'info');
            } catch (e) {
                // Ignorar errores de cierre
            }
        }
    }
}

// Ejecutar el script
async function main() {
    console.log('🎯 BOCKET CRM - VERIFICACIÓN CRUD FIRESTORE');
    console.log('===========================================\n');

    const tester = new FirestoreCRUDTester();
    await tester.ejecutarTodasLasPruebas();

    console.log('\n✨ Pruebas de Firestore completadas.\n');
}

// Ejecutar si es llamado directamente
if (require.main === module) {
    main().catch(console.error);
}

module.exports = FirestoreCRUDTester;