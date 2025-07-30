import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Reserva } from '../../modelos/reserva.model';
import { ReservaService } from '../../servicios/reserva.service';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-reserva-nueva',
  templateUrl: './reserva-nueva.component.html',
  styleUrls: ['./reserva-nueva.component.scss'],
  standalone: false
})
export class ReservaNuevaComponent implements OnInit {

  reservaForm: FormGroup;
  reservaId: string | null = null;
  esEdicion = false;
  cargando = false;
  guardando = false;
  error: string | null = null;
  minDate: string;
  
  // Estados de reserva según VenueBooking interface
  estadosReserva = [
    { value: 'pending', label: 'Pendiente' },
    { value: 'accepted', label: 'Aceptada' },
    { value: 'rejected', label: 'Rechazada' }
  ];

  estadosReconfirmacion = [
    { value: 'pending', label: 'Pendiente' },
    { value: 'accepted', label: 'Aceptada' },
    { value: 'rejected', label: 'Rechazada' }
  ];

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private reservaService: ReservaService,
    private toastController: ToastController
  ) {
    // Inicializar minDate una sola vez para evitar NG0100
    this.minDate = new Date().toISOString();
    
    // Formulario basado en VenueBooking interface
    this.reservaForm = this.formBuilder.group({
      id: [''], // Se genera automáticamente
      contact: ['', [Validators.required]], // Número WhatsApp del contacto
      contactNameBooking: ['', [Validators.required, Validators.minLength(2)]], // Nombre para la reserva
      peopleBooking: ['', [Validators.required]], // Número de personas (string)
      finalPeopleBooking: ['', [Validators.required, Validators.min(1)]], // Número final de personas
      dateBooking: ['', Validators.required], // Fecha de la reserva
      statusBooking: ['pending', Validators.required], // Estado de la reserva
      detailsBooking: [''], // Detalles opcionales
      reconfirmDate: [''], // Fecha de reconfirmación
      reconfirmStatus: [''] // Estado de reconfirmación
    });
  }

  async ngOnInit() {
    this.reservaId = this.route.snapshot.paramMap.get('id');
    this.esEdicion = this.reservaId !== null && this.reservaId !== 'nueva';

    if (this.esEdicion && this.reservaId) {
      await this.cargarReserva(this.reservaId);
    }

    // Sincronizar finalPeopleBooking con peopleBooking
    this.reservaForm.get('peopleBooking')?.valueChanges.subscribe(valor => {
      if (valor && !isNaN(parseInt(valor))) {
        this.reservaForm.patchValue({ finalPeopleBooking: parseInt(valor) });
      }
    });
  }

  async cargarReserva(id: string) {
    try {
      this.cargando = true;
      const reserva = await this.reservaService.obtenerPorId(id);
      
      if (reserva) {
        this.reservaForm.patchValue(reserva);
      } else {
        this.error = 'Reserva no encontrada';
      }
    } catch (error) {
      console.error('Error cargando reserva:', error);
      this.error = 'Error al cargar la reserva';
    } finally {
      this.cargando = false;
    }
  }



  async guardarReserva() {
    if (this.reservaForm.invalid) {
      this.marcarCamposInvalidos();
      return;
    }

    try {
      this.guardando = true;
      this.error = null;

      const datosReserva = { ...this.reservaForm.value };
      
      // Asegurar que las fechas están en formato correcto
      if (datosReserva.dateBooking) {
        datosReserva.dateBooking = new Date(datosReserva.dateBooking).toISOString();
      }
      
      if (datosReserva.reconfirmDate) {
        datosReserva.reconfirmDate = new Date(datosReserva.reconfirmDate).toISOString();
      }

      let reservaGuardada: Reserva;

      if (this.esEdicion && this.reservaId) {
        reservaGuardada = await this.reservaService.actualizar(this.reservaId, datosReserva);
        await this.presentToast('Reserva actualizada correctamente', 'success');
      } else {
        reservaGuardada = await this.reservaService.crear(datosReserva);
        await this.presentToast('Reserva creada correctamente', 'success');
      }

      this.router.navigate(['/reservas']);
      
    } catch (error) {
      console.error('Error guardando reserva:', error);
      this.error = 'Error al guardar la reserva. Intente nuevamente.';
      await this.presentToast('Error al guardar la reserva', 'danger');
    } finally {
      this.guardando = false;
    }
  }

  private generarId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  private marcarCamposInvalidos() {
    Object.keys(this.reservaForm.controls).forEach(key => {
      const control = this.reservaForm.get(key);
      if (control && control.invalid) {
        control.markAsTouched();
      }
    });
  }

  getMinDate(): string {
    return this.minDate;
  }

  cancelar() {
    this.router.navigate(['/reservas']);
  }

  // Validaciones del formulario
  esCampoInvalido(campo: string): boolean {
    const control = this.reservaForm.get(campo);
    return !!(control && control.invalid && control.touched);
  }

  obtenerMensajeError(campo: string): string {
    const control = this.reservaForm.get(campo);
    
    if (control?.errors) {
      if (control.errors['required']) {
        return 'Este campo es obligatorio';
      }
      if (control.errors['minlength']) {
        return `Mínimo ${control.errors['minlength'].requiredLength} caracteres`;
      }
      if (control.errors['min']) {
        return `El valor mínimo es ${control.errors['min'].min}`;
      }
    }
    
    return '';
  }

  formatearFechaInput(fecha: string): string {
    if (!fecha) return '';
    return new Date(fecha).toISOString().slice(0, 16);
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