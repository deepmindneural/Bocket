#!/usr/bin/env node

/**
 * SCRIPT DE VERIFICACIÓN - BASE DE DATOS REAL ÚNICAMENTE
 * 
 * Este script verifica que el sistema Bocket CRM funcione exclusivamente
 * con Firebase/Firestore sin dependencias de datos mock.
 * 
 * Verificaciones:
 * - AuthService elimine toda lógica mock
 * - Servicios CRUD solo usen Firebase
 * - No existan fallbacks a datos de prueba
 * - Guards funcionen correctamente
 */

const fs = require('fs');
const path = require('path');

class VerificadorBDReal {
    constructor() {
        this.baseDir = process.cwd();
        this.srcDir = path.join(this.baseDir, 'src', 'app');
        this.resultados = {
            authService: { sinMock: false, soloFirebase: false },
            servicios: {
                cliente: { sinMock: false, soloFirebase: false },
                reserva: { sinMock: false, soloFirebase: false },
                pedido: { sinMock: false, soloFirebase: false },
                producto: { sinMock: false, soloFirebase: false }
            },
            guards: { funcionan: false },
            configuracion: { firebaseConfig: false }
        };
        this.problemas = [];
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

    leerArchivo(rutaArchivo) {
        try {
            const rutaCompleta = path.join(this.srcDir, rutaArchivo);
            return fs.readFileSync(rutaCompleta, 'utf8');
        } catch (error) {
            this.problemas.push(`No se puede leer: ${rutaArchivo}`);
            return null;
        }
    }

    verificarAuthService() {
        this.log('🔐 === VERIFICANDO AUTHSERVICE (SIN MOCK) ===', 'info');
        
        const contenido = this.leerArchivo('servicios/auth.service.ts');
        if (!contenido) return;

        // Verificar que NO tenga funcionalidad mock
        const patronesMock = [
            'loginConMock',
            'obtenerDatosPrueba',
            'bocket_mock_session',
            'useFirebase = false',
            'setUseFirebase',
            'usuariosMock'
        ];

        let tienePatronMock = false;
        patronesMock.forEach(patron => {
            if (contenido.includes(patron)) {
                this.problemas.push(`AuthService contiene código mock: ${patron}`);
                tienePatronMock = true;
            }
        });

        this.resultados.authService.sinMock = !tienePatronMock;

        // Verificar que use solo Firebase
        const patronesFirebase = [
            'AngularFireAuth',
            'AngularFirestore',
            'signInWithEmailAndPassword',
            'this.auth.signOut'
        ];

        let tieneFirebase = 0;
        patronesFirebase.forEach(patron => {
            if (contenido.includes(patron)) {
                tieneFirebase++;
            }
        });

        this.resultados.authService.soloFirebase = tieneFirebase >= 3;

        if (this.resultados.authService.sinMock && this.resultados.authService.soloFirebase) {
            this.log('   ✅ AuthService configurado para usar solo Firebase', 'success');
        } else {
            this.log('   ❌ AuthService aún tiene código mock o no usa Firebase correctamente', 'error');
        }
    }

    verificarServicioCRUD(nombreServicio, archivo) {
        this.log(`📋 Verificando ${nombreServicio}Service...`, 'info');
        
        const contenido = this.leerArchivo(archivo);
        if (!contenido) return;

        // Verificar que NO tenga datos mock o fallbacks
        const patronesMock = [
            'obtenerDatosPrueba',
            'datosPrueba',
            'datos de prueba',
            'fallback',
            'catch.*return.*mock',
            'simulado',
            'modo de prueba'
        ];

        let tienePatronMock = false;
        patronesMock.forEach(patron => {
            const regex = new RegExp(patron, 'i');
            if (regex.test(contenido)) {
                this.problemas.push(`${nombreServicio}Service contiene fallback mock: ${patron}`);
                tienePatronMock = true;
            }
        });

        this.resultados.servicios[nombreServicio].sinMock = !tienePatronMock;

        // Verificar que use solo Firebase/Firestore
        const patronesFirebase = [
            'this.firestore.collection',
            'getCollectionPath',
            'restauranteActual.id',
            '.get().toPromise()',
            '.set(',
            '.update(',
            '.delete()'
        ];

        let tieneFirebase = 0;
        patronesFirebase.forEach(patron => {
            if (contenido.includes(patron)) {
                tieneFirebase++;
            }
        });

        this.resultados.servicios[nombreServicio].soloFirebase = tieneFirebase >= 5;

        // Verificar que los métodos CRUD no tengan try-catch con fallbacks
        const metodosCRUD = ['obtenerTodos', 'crear', 'actualizar', 'eliminar'];
        let metodosSinFallback = 0;

        metodosCRUD.forEach(metodo => {
            const regex = new RegExp(`${metodo}.*try.*catch.*return.*datos`, 'gs');
            if (!regex.test(contenido)) {
                metodosSinFallback++;
            } else {
                this.problemas.push(`${nombreServicio}Service.${metodo}() tiene fallback mock`);
            }
        });

        const resultado = this.resultados.servicios[nombreServicio];
        if (resultado.sinMock && resultado.soloFirebase && metodosSinFallback >= 3) {
            this.log(`   ✅ ${nombreServicio}Service usa solo Firebase`, 'success');
        } else {
            this.log(`   ❌ ${nombreServicio}Service tiene código mock o fallbacks`, 'error');
        }
    }

    verificarTodosLosServicios() {
        this.log('🛠️ === VERIFICANDO SERVICIOS CRUD ===', 'info');
        
        const servicios = [
            { nombre: 'cliente', archivo: 'servicios/cliente.service.ts' },
            { nombre: 'reserva', archivo: 'servicios/reserva.service.ts' },
            { nombre: 'pedido', archivo: 'servicios/pedido.service.ts' },
            { nombre: 'producto', archivo: 'servicios/producto.service.ts' }
        ];

        servicios.forEach(servicio => {
            this.verificarServicioCRUD(servicio.nombre, servicio.archivo);
        });
    }

    verificarGuards() {
        this.log('🛡️ === VERIFICANDO GUARDS ===', 'info');
        
        const authGuard = this.leerArchivo('guards/auth.guard.ts');
        const tenantGuard = this.leerArchivo('guards/tenant.guard.ts');

        if (authGuard && tenantGuard) {
            // Verificar que los guards usen AuthService sin mock
            const usanAuthService = authGuard.includes('authService.estaAutenticado') &&
                                  !authGuard.includes('mock');
            
            this.resultados.guards.funcionan = usanAuthService;
            
            if (usanAuthService) {
                this.log('   ✅ Guards configurados correctamente', 'success');
            } else {
                this.log('   ❌ Guards tienen problemas de configuración', 'error');
                this.problemas.push('Guards no funcionan correctamente con AuthService');
            }
        } else {
            this.log('   ⚠️ No se encontraron algunos guards', 'warning');
        }
    }

    verificarConfiguracionFirebase() {
        this.log('🔥 === VERIFICANDO CONFIGURACIÓN FIREBASE ===', 'info');
        
        const environment = this.leerArchivo('../environments/environment.ts');
        if (environment) {
            const tieneFirebaseConfig = environment.includes('firebase') && 
                                      environment.includes('apiKey') &&
                                      environment.includes('projectId');
            
            this.resultados.configuracion.firebaseConfig = tieneFirebaseConfig;
            
            if (tieneFirebaseConfig) {
                this.log('   ✅ Configuración de Firebase encontrada', 'success');
            } else {
                this.log('   ❌ Configuración de Firebase incompleta', 'error');
                this.problemas.push('Falta configuración completa de Firebase');
            }
        }
    }

    verificarAppModule() {
        this.log('📦 === VERIFICANDO APP MODULE ===', 'info');
        
        const appModule = this.leerArchivo('app.module.ts');
        if (appModule) {
            const tieneAngularFire = appModule.includes('AngularFireModule') &&
                                   appModule.includes('AngularFirestoreModule') &&
                                   appModule.includes('AngularFireAuthModule');
            
            if (tieneAngularFire) {
                this.log('   ✅ Módulos de Firebase correctamente importados', 'success');
            } else {
                this.log('   ❌ Faltan módulos de Firebase en AppModule', 'error');
                this.problemas.push('AppModule no tiene todos los módulos de Firebase');
            }
        }
    }

    generarReporte() {
        this.log('\n📊 === REPORTE FINAL DE VERIFICACIÓN BD REAL ===', 'info');
        
        let verificacionesExitosas = 0;
        let totalVerificaciones = 0;

        // AuthService
        totalVerificaciones += 2;
        if (this.resultados.authService.sinMock) verificacionesExitosas++;
        if (this.resultados.authService.soloFirebase) verificacionesExitosas++;

        // Servicios CRUD
        Object.keys(this.resultados.servicios).forEach(servicio => {
            totalVerificaciones += 2;
            if (this.resultados.servicios[servicio].sinMock) verificacionesExitosas++;
            if (this.resultados.servicios[servicio].soloFirebase) verificacionesExitosas++;
        });

        // Guards
        totalVerificaciones += 1;
        if (this.resultados.guards.funcionan) verificacionesExitosas++;

        // Configuración
        totalVerificaciones += 1;
        if (this.resultados.configuracion.firebaseConfig) verificacionesExitosas++;

        const porcentajeExito = ((verificacionesExitosas / totalVerificaciones) * 100).toFixed(1);

        this.log(`\n🎯 RESUMEN:`, 'info');
        this.log(`   Verificaciones exitosas: ${verificacionesExitosas}/${totalVerificaciones}`, 'success');
        this.log(`   Porcentaje de éxito: ${porcentajeExito}%`, 'warning');

        if (this.problemas.length > 0) {
            this.log('\n❌ PROBLEMAS ENCONTRADOS:', 'error');
            this.problemas.forEach(problema => {
                this.log(`   • ${problema}`, 'error');
            });
        }

        if (porcentajeExito >= 95) {
            this.log('\n🎉 ¡EXCELENTE! El sistema funciona completamente con base de datos real', 'success');
            this.log('✅ No hay dependencias de datos mock', 'success');
            this.log('✅ Todos los servicios usan Firebase/Firestore', 'success');
        } else if (porcentajeExito >= 80) {
            this.log('\n⚠️ BUENO. La mayoría del sistema usa base de datos real', 'warning');
            this.log('⚠️ Hay algunos elementos mock que deben eliminarse', 'warning');
        } else {
            this.log('\n❌ ATENCIÓN. El sistema aún depende de datos mock', 'error');
            this.log('❌ Se requiere más trabajo para usar solo base de datos real', 'error');
        }

        this.log('\n💡 PRÓXIMOS PASOS:', 'info');
        this.log('1. Configurar credenciales de Firebase para el proyecto', 'info');
        this.log('2. Crear estructura de base de datos en Firestore', 'info');
        this.log('3. Probar CRUD operations contra Firebase real', 'info');
        this.log('4. Configurar reglas de seguridad de Firestore', 'info');
    }

    async ejecutarVerificacion() {
        this.log('🚀 === INICIANDO VERIFICACIÓN DE BASE DE DATOS REAL ===', 'success');
        this.log(`📁 Verificando: ${this.baseDir}`, 'info');
        
        try {
            this.verificarAuthService();
            this.verificarTodosLosServicios();
            this.verificarGuards();
            this.verificarConfiguracionFirebase();
            this.verificarAppModule();
            
            this.generarReporte();
        } catch (error) {
            this.log(`❌ Error crítico durante la verificación: ${error.message}`, 'error');
        }
    }
}

// Ejecutar el script
async function main() {
    console.log('🎯 BOCKET CRM - VERIFICACIÓN BASE DE DATOS REAL');
    console.log('==============================================\n');

    const verificador = new VerificadorBDReal();
    await verificador.ejecutarVerificacion();

    console.log('\n✨ Verificación completada.\n');
}

// Ejecutar si es llamado directamente
if (require.main === module) {
    main().catch(console.error);
}

module.exports = VerificadorBDReal;