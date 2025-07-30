import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ClienteService } from '../../../servicios/cliente.service';
import { Cliente } from '../../../modelos';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-formulario-cliente',
  templateUrl: './formulario-cliente.component.html',
  styleUrls: ['./formulario-cliente.component.scss'],
  standalone: false
})
export class FormularioClienteComponent implements OnInit {

  formularioCliente!: FormGroup;
  clienteId: string | null = null;
  esEdicion = false;
  guardando = false;
  cargando = false;
  error: string | null = null;

  // Opciones para selects
  tiposSource = [
    { value: 'chatBot', label: 'Chat Bot' },
    { value: 'manual', label: 'Manual' },
    { value: 'api', label: 'API' }
  ];

  tiposRespuesta = [
    { value: 'manualTemp', label: 'Manual Temporal' },
    { value: 'bot', label: 'Bot Automático' },
    { value: 'manual', label: 'Manual' }
  ];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private clienteService: ClienteService,
    private toastController: ToastController
  ) {
    this.inicializarFormulario();
  }

  async ngOnInit() {
    this.clienteId = this.route.snapshot.paramMap.get('id');
    this.esEdicion = this.clienteId !== null && this.clienteId !== 'nuevo';

    if (this.esEdicion && this.clienteId) {
      await this.cargarCliente(this.clienteId);
    }
  }

  mostrarCamposTecnicos = false;

  inicializarFormulario() {
    this.formularioCliente = this.fb.group({
      // Interface finalUser completa
      id: ['', [Validators.required, Validators.pattern(/^[0-9]{10,15}$/)]], // El numero del whatsapp
      isGroup: [false],
      creation: [''], 
      isEnterprise: [false],
      isBusiness: [false], 
      isMyContact: [true], // Por defecto true para nuevos contactos
      isUser: [true],
      isWAContact: [true], // Por defecto true para WhatsApp
      isBlocked: [false],
      wappLabels: [[]],
      name: ['', [Validators.required, Validators.minLength(2)]], // Nombre del contacto
      pushname: [''], // Nombre público
      sectionHeader: [''],
      shortName: [''],
      sourceType: ['manual', Validators.required], // chatBot | manual | api
      respType: ['manual', Validators.required], // manualTemp | bot | manual  
      labels: [''],
      whatsAppName: [''], // Nombre principal
      isSpam: [false],
      email: ['', [Validators.email]],
      company: [''], // Empresa
      address: [''], // Dirección
      image: [''], // Link imagen perfil
      lastUpdate: [''],
      // UserInteractions como FormGroup
      userInteractions: this.fb.group({
        whatsapp: [0],
        controller: [0],
        chatbot: [0],
        api: [0],
        campaing: [0],
        client: [0],
        others: [0],
        wappController: [0],
        ai: [0],
        fee: [0]
      })
    });
  }

  toggleCamposTecnicos() {
    this.mostrarCamposTecnicos = !this.mostrarCamposTecnicos;
  }

  calcularTotalInteracciones(): number {
    const interactions = this.formularioCliente.get('userInteractions')?.value;
    if (!interactions) return 0;
    
    return (interactions.whatsapp || 0) + 
           (interactions.controller || 0) + 
           (interactions.chatbot || 0) + 
           (interactions.api || 0) + 
           (interactions.campaing || 0) + 
           (interactions.client || 0) + 
           (interactions.others || 0) + 
           (interactions.wappController || 0) + 
           (interactions.ai || 0);
  }

  async cargarCliente(id: string) {
    try {
      this.cargando = true;
      const cliente = await this.clienteService.obtenerPorId(id);
      
      if (cliente) {
        // WhatsApp interface no tiene fechaNacimiento
        this.formularioCliente.patchValue({
          ...cliente
        });
      } else {
        this.error = 'Cliente no encontrado';
      }
    } catch (error) {
      console.error('Error cargando cliente:', error);
      this.error = 'Error al cargar el cliente';
    } finally {
      this.cargando = false;
    }
  }

  async guardarCliente() {
    if (this.formularioCliente.invalid) {
      this.marcarCamposComoTocados();
      return;
    }

    try {
      this.guardando = true;
      this.error = null;

      const datosCliente = { ...this.formularioCliente.value };
      
      // Convertir fecha de nacimiento
      if (datosCliente.fechaNacimiento) {
        datosCliente.fechaNacimiento = new Date(datosCliente.fechaNacimiento);
      }

      // Generar color aleatorio para avatar si es nuevo cliente
      if (!this.esEdicion) {
        datosCliente.colorAvatar = this.generarColorAleatorio();
      }

      let clienteGuardado: Cliente;

      if (this.esEdicion && this.clienteId) {
        clienteGuardado = await this.clienteService.actualizar(this.clienteId, datosCliente);
      } else {
        clienteGuardado = await this.clienteService.crear(datosCliente);
      }

      // Mostrar mensaje de éxito y redirigir
      await this.presentToast(
        this.esEdicion ? 'Cliente actualizado correctamente' : 'Cliente creado correctamente',
        'success'
      );
      this.router.navigate(['/clientes']);
      
    } catch (error) {
      console.error('Error guardando cliente:', error);
      this.error = 'Error al guardar el cliente. Intente nuevamente.';
      await this.presentToast('Error al guardar el cliente', 'danger');
    } finally {
      this.guardando = false;
    }
  }

  cancelar() {
    this.router.navigate(['/clientes']);
  }

  private marcarCamposComoTocados() {
    Object.keys(this.formularioCliente.controls).forEach(key => {
      this.formularioCliente.get(key)?.markAsTouched();
    });
  }

  private generarColorAleatorio(): string {
    const colores = [
      '#6b73ff', '#9c27b0', '#f44336', '#ff9800',
      '#4caf50', '#2196f3', '#ff5722', '#795548',
      '#607d8b', '#e91e63', '#00bcd4', '#cddc39'
    ];
    return colores[Math.floor(Math.random() * colores.length)];
  }

  // Validaciones del formulario
  esCampoInvalido(campo: string): boolean {
    const control = this.formularioCliente.get(campo);
    return !!(control && control.invalid && control.touched);
  }

  obtenerMensajeError(campo: string): string {
    const control = this.formularioCliente.get(campo);
    
    if (control?.errors) {
      if (control.errors['required']) {
        return 'Este campo es obligatorio';
      }
      if (control.errors['email']) {
        return 'Ingrese un email válido';
      }
      if (control.errors['minlength']) {
        return `Mínimo ${control.errors['minlength'].requiredLength} caracteres`;
      }
      if (control.errors['pattern']) {
        if (campo === 'telefono') {
          return 'Ingrese un teléfono válido';
        }
        if (campo === 'cedula') {
          return 'Ingrese una cédula válida (8-11 dígitos)';
        }
      }
    }
    
    return '';
  }

  // Funciones de utilidad
  calcularEdad(): number | null {
    const fechaNacimiento = this.formularioCliente.get('fechaNacimiento')?.value;
    if (!fechaNacimiento) return null;

    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mesActual = hoy.getMonth();
    const mesNacimiento = nacimiento.getMonth();

    if (mesActual < mesNacimiento || (mesActual === mesNacimiento && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }

    return edad;
  }

  formatearTelefono() {
    const telefonoControl = this.formularioCliente.get('telefono');
    if (telefonoControl?.value) {
      let telefono = telefonoControl.value.replace(/\D/g, '');
      
      // Formato para Colombia
      if (telefono.startsWith('57')) {
        telefono = '+57 ' + telefono.substring(2);
      } else if (telefono.length === 10) {
        telefono = '+57 ' + telefono;
      }
      
      telefonoControl.setValue(telefono);
    }
  }

  validarEmail() {
    const emailControl = this.formularioCliente.get('email');
    if (emailControl?.value && emailControl.valid) {
      // Aquí podrías validar si el email ya existe
      console.log('Validando email:', emailControl.value);
    }
  }

  // Métodos para formularios dinámicos mejorados
  async autocompletarDatos() {
    const id = this.formularioCliente.get('id')?.value;
    if (id && id.length >= 10) {
      // Simulación de autocompletado basado en ID
      const nombre = this.formularioCliente.get('name')?.value;
      if (!nombre) {
        // Auto-generar campos basados en el ID de WhatsApp
        this.formularioCliente.patchValue({
          whatsAppName: `Usuario ${id.slice(-4)}`,
          shortName: `User${id.slice(-4)}`,
          sourceType: 'manual',
          respType: 'manual',
          isMyContact: true,
          isWAContact: true,
          isUser: true
        });
      }
    }
  }

  onIdChange() {
    this.autocompletarDatos();
    this.validarNumeroWhatsApp();
  }

  validarNumeroWhatsApp() {
    const id = this.formularioCliente.get('id')?.value;
    const idControl = this.formularioCliente.get('id');
    
    if (id && id.length >= 10) {
      // Verificar si ya existe este número (simulado)
      if (id === '573001234567' && !this.esEdicion) {
        idControl?.setErrors({ 'existe': true });
      }
    }
  }

  actualizarNombresDinamicos() {
    const nombre = this.formularioCliente.get('name')?.value;
    if (nombre && !this.formularioCliente.get('whatsAppName')?.value) {
      const nombreCorto = nombre.split(' ')[0];
      this.formularioCliente.patchValue({
        whatsAppName: nombre,
        shortName: nombreCorto,
        pushname: `${nombreCorto} ${nombre.split(' ')[1]?.[0] || ''}.`
      });
    }
  }

  // Métodos para mejorar UX
  onSourceTypeChange() {
    const sourceType = this.formularioCliente.get('sourceType')?.value;
    
    // Configurar respType automáticamente según sourceType
    if (sourceType === 'chatBot') {
      this.formularioCliente.patchValue({ respType: 'bot' });
    } else if (sourceType === 'api') {
      this.formularioCliente.patchValue({ respType: 'manual' });
    }
  }

  aplicarPresetVIP() {
    this.formularioCliente.patchValue({
      labels: 'cliente_vip,frecuente',
      isEnterprise: true,
      isBusiness: true,
      sourceType: 'manual',
      respType: 'manual'
    });
  }

  aplicarPresetCorporativo() {
    this.formularioCliente.patchValue({
      labels: 'cliente_corporativo,eventos',
      isEnterprise: true,
      isBusiness: true,
      sourceType: 'manual',
      respType: 'manual'
    });
  }

  async presentToast(message: string, color: 'success' | 'danger' | 'warning' = 'success') {
    const toast = await this.toastController.create({
      message: message,
      duration: 3000,
      position: 'top',
      color: color,
      buttons: [
        {
          text: 'Cerrar',
          role: 'cancel'
        }
      ]
    });
    
    await toast.present();
  }
}