import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Pedido } from '../../modelos/pedido.model';
import { PedidoService } from '../../servicios/pedido.service';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-pedido-nuevo',
  templateUrl: './pedido-nuevo.component.html',
  styleUrls: ['./pedido-nuevo.component.scss'],
  standalone: false
})
export class PedidoNuevoComponent implements OnInit {

  pedidoForm: FormGroup;
  pedidoId: string | null = null;
  esEdicion = false;
  cargando = false;
  guardando = false;
  error: string | null = null;
  
  // Tipos de pedido según OrderTodelivery interface
  tiposPedido = [
    { value: 'delivery', label: 'Delivery' },
    { value: 'pickUp', label: 'Pickup' },
    { value: 'insideOrder', label: 'Pedido Interno' }
  ];

  // Estados de pedido
  estadosPedido = [
    { value: 'pending', label: 'Pendiente' },
    { value: 'accepted', label: 'Aceptado' },
    { value: 'rejected', label: 'Rechazado' },
    { value: 'inProcess', label: 'En Proceso' },
    { value: 'inDelivery', label: 'En Delivery' },
    { value: 'deliveried', label: 'Entregado' }
  ];
  
  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private pedidoService: PedidoService,
    private toastController: ToastController
  ) {
    // Formulario basado en OrderTodelivery interface
    this.pedidoForm = this.formBuilder.group({
      id: [''], // Se genera automáticamente
      contact: ['', Validators.required], // Número WhatsApp del contacto
      contactNameOrder: [''], // Nombre del contacto (opcional)
      orderType: ['delivery', Validators.required], // Tipo de pedido
      resumeOrder: ['', Validators.required], // Resumen del pedido
      addressToDelivery: [''], // Dirección de entrega
      statusBooking: ['pending', Validators.required] // Estado del pedido
    });
  }

  async ngOnInit() {
    this.pedidoId = this.route.snapshot.paramMap.get('id');
    this.esEdicion = this.pedidoId !== null && this.pedidoId !== 'nuevo';

    if (this.esEdicion && this.pedidoId) {
      await this.cargarPedido(this.pedidoId);
    }

    // Validar dirección si es delivery
    this.pedidoForm.get('orderType')?.valueChanges.subscribe(tipo => {
      const direccionControl = this.pedidoForm.get('addressToDelivery');
      if (tipo === 'delivery') {
        direccionControl?.setValidators([Validators.required]);
      } else {
        direccionControl?.clearValidators();
      }
      direccionControl?.updateValueAndValidity();
    });
  }

  async cargarPedido(id: string) {
    try {
      this.cargando = true;
      const pedido = await this.pedidoService.obtenerPorId(id);
      
      if (pedido) {
        this.pedidoForm.patchValue(pedido);
      } else {
        this.error = 'Pedido no encontrado';
      }
    } catch (error) {
      console.error('Error cargando pedido:', error);
      this.error = 'Error al cargar el pedido';
    } finally {
      this.cargando = false;
    }
  }

  async guardarPedido() {
    if (this.pedidoForm.invalid) {
      this.marcarCamposInvalidos();
      return;
    }

    try {
      this.guardando = true;
      this.error = null;

      const datosPedido = { ...this.pedidoForm.value };

      let pedidoGuardado: Pedido;

      if (this.esEdicion && this.pedidoId) {
        pedidoGuardado = await this.pedidoService.actualizar(this.pedidoId, datosPedido);
        await this.presentToast('Pedido actualizado correctamente', 'success');
      } else {
        pedidoGuardado = await this.pedidoService.crear(datosPedido);
        await this.presentToast('Pedido creado correctamente', 'success');
      }

      console.log('🚀 PedidoNuevoComponent: Navegando a /pedidos después de crear pedido');
      this.router.navigate(['/pedidos']);
      
    } catch (error) {
      console.error('Error guardando pedido:', error);
      this.error = 'Error al guardar el pedido. Intente nuevamente.';
      await this.presentToast('Error al guardar el pedido', 'danger');
    } finally {
      this.guardando = false;
    }
  }

  private generarId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  private marcarCamposInvalidos() {
    Object.keys(this.pedidoForm.controls).forEach(key => {
      const control = this.pedidoForm.get(key);
      if (control && control.invalid) {
        control.markAsTouched();
      }
    });
  }

  getMinDate(): string {
    return new Date().toISOString();
  }

  cancelar() {
    this.router.navigate(['/pedidos']);
  }

  // Validaciones del formulario
  esCampoInvalido(campo: string): boolean {
    const control = this.pedidoForm.get(campo);
    return !!(control && control.invalid && control.touched);
  }

  obtenerMensajeError(campo: string): string {
    const control = this.pedidoForm.get(campo);
    
    if (control?.errors) {
      if (control.errors['required']) {
        return 'Este campo es obligatorio';
      }
      if (control.errors['minlength']) {
        return `Mínimo ${control.errors['minlength'].requiredLength} caracteres`;
      }
    }
    
    return '';
  }

  // Métodos de utilidad
  obtenerTipoLabel(tipo: string): string {
    const labels: Record<string, string> = {
      'delivery': 'Domicilio',
      'pickUp': 'Recoger en tienda',
      'insideOrder': 'Consumo en local'
    };
    return labels[tipo] || tipo;
  }

  obtenerEstadoLabel(estado: string): string {
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