import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { AuthService } from '../../servicios/auth.service';
import { RestauranteService } from '../../servicios/restaurante.service';
import { Restaurante } from '../../modelos';

interface UserInteractionsConfig {
  whatsappActivo: boolean;
  whatsappValor: number;
  whatsappLimite: number;
  controllerActivo: boolean;
  controllerValor: number;
  controllerLimite: number;
  chatbotActivo: boolean;
  chatbotValor: number;
  chatbotLimite: number;
  apiActivo: boolean;
  apiValor: number;
  apiLimite: number;
  campaingActivo: boolean;
  campaingValor: number;
  campaingLimite: number;
  clientActivo: boolean;
  clientValor: number;
  clientLimite: number;
  othersActivo: boolean;
  othersValor: number;
  othersLimite: number;
  wappControllerActivo: boolean;
  wappControllerValor: number;
  wappControllerLimite: number;
  aiActivo: boolean;
  aiValor: number;
  aiLimite: number;
}

@Component({
  selector: 'app-configuracion-restaurante',
  templateUrl: './configuracion-restaurante.component.html',
  styleUrls: ['./configuracion-restaurante.component.scss'],
  standalone: false
})
export class ConfiguracionRestauranteComponent implements OnInit {
  
  formularioRestaurante!: FormGroup;
  formularioInteracciones!: FormGroup;
  restauranteActual: Restaurante | null = null;
  
  // Estado del componente
  tabActivo: 'general' | 'interacciones' | 'whatsapp' | 'pedidos' = 'general';
  cargando = false;
  guardando = false;
  error: string | null = null;

  // Opciones para formularios
  estadosPedidos = ['pending', 'accepted', 'rejected', 'inProcess', 'inDelivery', 'deliveried'];
  tiposPedidos = ['delivery', 'pickUp', 'insideOrder'];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private restauranteService: RestauranteService
  ) {
    this.inicializarFormularios();
  }

  async ngOnInit() {
    await this.cargarDatosRestaurante();
  }

  inicializarFormularios() {
    // Formulario principal del restaurante
    this.formularioRestaurante = this.fb.group({
      id: [''],
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      slug: ['', [Validators.required, Validators.pattern(/^[a-z0-9-]+$/)]],
      email: ['', [Validators.email]],
      telefono: [''],
      direccion: [''],
      ciudad: [''],
      descripcion: [''],
      logo: [''],
      colorPrimario: ['#8B0000'],
      colorSecundario: ['#FFD700'],
      activo: [true],
      configuracion: this.fb.group({
        // Configuración de WhatsApp
        whatsapp: this.fb.group({
          numeroBot: [''], // Removido Validators.required
          respuestaAutomatica: [true],
          horarioBot: this.fb.group({
            inicio: ['08:00'],
            fin: ['22:00']
          })
        }),
        // Configuración de pedidos
        pedidos: this.fb.group({
          tiempoEntrega: [45, [Validators.min(15), Validators.max(120)]],
          costoDelivery: [5000, Validators.min(0)],
          montoMinimoDelivery: [25000, Validators.min(0)],
          estadosPermitidos: this.fb.array(this.estadosPedidos.map(() => true)),
          tiposPermitidos: this.fb.array(this.tiposPedidos.map(() => true))
        })
      })
    });

    // Formulario específico para UserInteractions
    this.formularioInteracciones = this.fb.group({
      whatsappActivo: [true],
      whatsappValor: [100],
      whatsappLimite: [500],
      controllerActivo: [true],
      controllerValor: [200],
      controllerLimite: [200],
      chatbotActivo: [true],
      chatbotValor: [50],
      chatbotLimite: [1000],
      apiActivo: [false],
      apiValor: [10],
      apiLimite: [1000],
      campaingActivo: [true],
      campaingValor: [300],
      campaingLimite: [100],
      clientActivo: [true],
      clientValor: [150],
      clientLimite: [300],
      othersActivo: [false],
      othersValor: [50],
      othersLimite: [100],
      wappControllerActivo: [true],
      wappControllerValor: [250],
      wappControllerLimite: [150],
      aiActivo: [true],
      aiValor: [400],
      aiLimite: [200]
    });
  }

  async cargarDatosRestaurante() {
    try {
      this.cargando = true;
      this.error = null;

      console.log('🔍 ConfigRestaurante: Iniciando carga de datos...');
      
      // Verificar autenticación
      if (!this.authService.estaAutenticado()) {
        this.error = 'Usuario no autenticado';
        console.error('❌ ConfigRestaurante: Usuario no autenticado');
        return;
      }

      this.restauranteActual = this.authService.currentRestaurant;
      console.log('📋 ConfigRestaurante: Restaurante actual del AuthService:', this.restauranteActual);
      
      if (!this.restauranteActual) {
        this.error = 'No se pudo cargar la información del restaurante desde AuthService';
        console.error('❌ ConfigRestaurante: currentRestaurant es null');
        return;
      }

      if (!this.restauranteActual.id) {
        this.error = 'El restaurante actual no tiene un ID válido';
        console.error('❌ ConfigRestaurante: restaurante sin ID:', this.restauranteActual);
        return;
      }

      console.log('🔍 ConfigRestaurante: Cargando datos completos para ID:', this.restauranteActual.id);
      
      // Cargar datos completos del restaurante
      const restauranteCompleto = await this.restauranteService.obtenerPorId(this.restauranteActual.id);
      console.log('📋 ConfigRestaurante: Datos completos obtenidos:', restauranteCompleto);
      
      if (restauranteCompleto) {
        this.restauranteActual = restauranteCompleto;
        console.log('✅ ConfigRestaurante: Aplicando datos al formulario...');
        this.formularioRestaurante.patchValue(restauranteCompleto);
        
        // Cargar configuración de UserInteractions si existe
        if (restauranteCompleto.configuracion && (restauranteCompleto.configuracion as any).userInteractions) {
          console.log('📋 ConfigRestaurante: Cargando configuración de UserInteractions...');
          this.formularioInteracciones.patchValue((restauranteCompleto.configuracion as any).userInteractions);
        }
        
        console.log('✅ ConfigRestaurante: Datos cargados exitosamente');
      } else {
        this.error = 'No se encontraron datos del restaurante en Firebase';
        console.error('❌ ConfigRestaurante: obtenerPorId retornó null para ID:', this.restauranteActual.id);
      }

    } catch (error) {
      console.error('❌ ConfigRestaurante: Error cargando datos del restaurante:', error);
      this.error = `Error al cargar los datos del restaurante: ${(error as any)?.message || 'Error desconocido'}`;
    } finally {
      this.cargando = false;
    }
  }

  async recargarDatos() {
    await this.cargarDatosRestaurante();
  }

  cambiarTab(tab: 'general' | 'interacciones' | 'whatsapp' | 'pedidos') {
    this.tabActivo = tab;
  }

  // Métodos para UserInteractions
  contarTiposActivos(): number {
    const config = this.formularioInteracciones.value;
    return Object.keys(config).filter(key => key.endsWith('Activo') && config[key]).length;
  }

  calcularCostoEstimado(): number {
    const config = this.formularioInteracciones.value;
    let costoTotal = 0;

    const tipos = ['whatsapp', 'controller', 'chatbot', 'api', 'campaing', 'client', 'others', 'wappController', 'ai'];
    
    tipos.forEach(tipo => {
      if (config[`${tipo}Activo`]) {
        const valor = config[`${tipo}Valor`] || 0;
        const limite = config[`${tipo}Limite`] || 0;
        costoTotal += valor * limite;
      }
    });

    return costoTotal;
  }

  // Métodos para colores
  getContrastColor(hexColor: string): string {
    if (!hexColor) return '#000000';
    
    // Convertir hex a RGB
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);
    
    // Calcular luminancia
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    return luminance > 0.5 ? '#000000' : '#ffffff';
  }

  // Métodos para estados y tipos
  getEstadoLabel(estado: string): string {
    const labels: Record<string, string> = {
      'pending': 'Pendiente',
      'accepted': 'Aceptado',
      'rejected': 'Rechazado',
      'inProcess': 'En Proceso',
      'inDelivery': 'En Delivery',
      'deliveried': 'Entregado'
    };
    return labels[estado] || estado;
  }

  getTipoLabel(tipo: string): string {
    const labels: Record<string, string> = {
      'delivery': 'Domicilio',
      'pickUp': 'Recoger en Tienda',
      'insideOrder': 'Consumo en Local'
    };
    return labels[tipo] || tipo;
  }

  get estadosPermitidosArray(): FormArray {
    return this.formularioRestaurante.get('configuracion.pedidos.estadosPermitidos') as FormArray;
  }

  get tiposPermitidosArray(): FormArray {
    return this.formularioRestaurante.get('configuracion.pedidos.tiposPermitidos') as FormArray;
  }

  async guardarConfiguracion() {
    try {
      this.guardando = true;
      this.error = null;

      console.log('💾 ConfigRestaurante: Iniciando guardado de configuración...');

      // Verificar que tenemos un restaurante válido
      if (!this.restauranteActual?.id) {
        this.error = 'No se puede guardar: no hay restaurante válido seleccionado';
        console.error('❌ ConfigRestaurante: No hay restaurante válido para guardar');
        return;
      }

      if (this.formularioRestaurante.invalid) {
        this.error = 'Por favor completa todos los campos requeridos';
        console.error('❌ ConfigRestaurante: Formulario inválido');
        
        // DEBUG: Mostrar campos inválidos
        this.mostrarCamposInvalidos();
        return;
      }

      const datosRestaurante = this.formularioRestaurante.value;
      console.log('📋 ConfigRestaurante: Datos del formulario:', datosRestaurante);
      
      // Agregar configuración de UserInteractions
      if (!datosRestaurante.configuracion) {
        datosRestaurante.configuracion = {};
      }
      datosRestaurante.configuracion.userInteractions = this.formularioInteracciones.value;

      // Procesar arrays de estados y tipos
      if (!datosRestaurante.configuracion.pedidos) {
        datosRestaurante.configuracion.pedidos = {};
      }
      
      datosRestaurante.configuracion.pedidos.estadosPermitidos = this.estadosPedidos.filter(
        (_, index) => this.estadosPermitidosArray.at(index)?.value
      );
      
      datosRestaurante.configuracion.pedidos.tiposPermitidos = this.tiposPedidos.filter(
        (_, index) => this.tiposPermitidosArray.at(index)?.value
      );

      console.log('💾 ConfigRestaurante: Guardando en Firebase con ID:', this.restauranteActual.id);
      console.log('📋 ConfigRestaurante: Datos a guardar:', datosRestaurante);

      // Guardar en Firebase usando solo los campos que han cambiado
      const cambios = {
        nombre: datosRestaurante.nombre,
        slug: datosRestaurante.slug,
        email: datosRestaurante.email,
        telefono: datosRestaurante.telefono,
        direccion: datosRestaurante.direccion,
        ciudad: datosRestaurante.ciudad,
        descripcion: datosRestaurante.descripcion,
        logo: datosRestaurante.logo,
        colorPrimario: datosRestaurante.colorPrimario,
        colorSecundario: datosRestaurante.colorSecundario,
        configuracion: datosRestaurante.configuracion,
        activo: datosRestaurante.activo
      };

      const restauranteActualizado = await this.restauranteService.actualizar(this.restauranteActual.id, cambios);
      console.log('✅ ConfigRestaurante: Guardado exitoso en Firebase');
      
      // Actualizar tema si cambió - usar el método del RestauranteService
      if (datosRestaurante.colorPrimario || datosRestaurante.colorSecundario) {
        console.log('🎨 ConfigRestaurante: Aplicando tema personalizado...');
        this.restauranteService.aplicarTemaPersonalizado(restauranteActualizado);
      }

      // Actualizar datos locales
      this.restauranteActual = restauranteActualizado;
      this.authService.currentRestaurant = restauranteActualizado;

      // Mostrar mensaje de éxito
      console.log('✅ ConfigRestaurante: Configuración guardada exitosamente');
      this.error = null; // Limpiar cualquier error anterior

    } catch (error) {
      console.error('❌ ConfigRestaurante: Error guardando configuración:', error);
      this.error = `Error al guardar la configuración: ${(error as any)?.message || 'Error desconocido'}`;
    } finally {
      this.guardando = false;
    }
  }

  cancelarCambios() {
    if (this.restauranteActual) {
      this.formularioRestaurante.patchValue(this.restauranteActual);
      if (this.restauranteActual.configuracion && (this.restauranteActual.configuracion as any).userInteractions) {
        this.formularioInteracciones.patchValue((this.restauranteActual.configuracion as any).userInteractions);
      }
    }
  }

  async resetearConfiguracion() {
    if (confirm('¿Estás seguro de que quieres resetear toda la configuración? Esta acción no se puede deshacer.')) {
      this.inicializarFormularios();
      if (this.restauranteActual) {
        this.formularioRestaurante.patchValue({
          id: this.restauranteActual.id,
          nombre: this.restauranteActual.nombre,
          slug: this.restauranteActual.slug
        });
      }
    }
  }

  // Método para formularios dinámicos
  actualizarConfiguracionDinamica(tipo: string, campo: string, valor: any) {
    const control = this.formularioInteracciones.get(`${tipo}${campo}`);
    if (control) {
      control.setValue(valor);
      control.markAsTouched();
    }
  }

  // Método para validación en tiempo real
  validarCampo(campo: string): boolean {
    const control = this.formularioRestaurante.get(campo);
    return control ? control.invalid && control.touched : false;
  }

  obtenerMensajeError(campo: string): string {
    const control = this.formularioRestaurante.get(campo);
    if (control?.errors) {
      if (control.errors['required']) return 'Este campo es requerido';
      if (control.errors['email']) return 'Email inválido';
      if (control.errors['pattern']) return 'Formato inválido';
      if (control.errors['minlength']) return 'Muy corto';
      if (control.errors['min']) return 'Valor muy bajo';
      if (control.errors['max']) return 'Valor muy alto';
    }
    return '';
  }

  // DEBUG: Método para mostrar campos inválidos
  mostrarCamposInvalidos() {
    console.log('🔍 DEBUG: Analizando campos inválidos...');
    
    const formErrors: any[] = [];
    
    // Función recursiva para revisar todos los controles
    const findInvalidControls = (formGroup: FormGroup, path = '') => {
      Object.keys(formGroup.controls).forEach(key => {
        const control = formGroup.get(key);
        const currentPath = path ? `${path}.${key}` : key;
        
        if (control && control.invalid) {
          if (control instanceof FormGroup) {
            // Si es un FormGroup, revisar sus controles
            findInvalidControls(control, currentPath);
          } else if (control instanceof FormArray) {
            // Si es un FormArray, revisar cada control
            control.controls.forEach((arrayControl, index) => {
              if (arrayControl.invalid) {
                formErrors.push({
                  campo: `${currentPath}[${index}]`,
                  errores: arrayControl.errors,
                  valor: arrayControl.value
                });
              }
            });
          } else {
            // Si es un control simple, mostrar el error
            formErrors.push({
              campo: currentPath,
              errores: control.errors,
              valor: control.value
            });
          }
        }
      });
    };
    
    findInvalidControls(this.formularioRestaurante);
    
    if (formErrors.length > 0) {
      console.log('❌ Campos inválidos encontrados:');
      formErrors.forEach(error => {
        console.log(`   Campo: ${error.campo}`);
        console.log(`   Valor: ${error.valor}`);
        console.log(`   Errores:`, error.errores);
        console.log('   ---');
      });
    } else {
      console.log('🤔 No se encontraron campos inválidos específicos');
    }
    
    // También mostrar estado general del formulario
    console.log('📊 Estado del formulario:');
    console.log('   Valid:', this.formularioRestaurante.valid);
    console.log('   Invalid:', this.formularioRestaurante.invalid);
    console.log('   Touched:', this.formularioRestaurante.touched);
    console.log('   Dirty:', this.formularioRestaurante.dirty);
    console.log('   Errors:', this.formularioRestaurante.errors);
  }
}